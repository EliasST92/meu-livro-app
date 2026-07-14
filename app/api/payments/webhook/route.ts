import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/*
 * Formato real do webhook Cakto (descoberto via logs de produção):
 * {
 *   "secret": "<webhook_secret>",
 *   "event": "purchase_approved",
 *   "data": {
 *     "id": "uuid",
 *     "refId": "...",
 *     "customer": { "name": "...", "email": "...", "phone": "..." },
 *     "offer": { "id": "...", "name": "...", "price": 10 }
 *   }
 * }
 *
 * Eventos: purchase_approved, subscription_created, subscription_renewed,
 *          subscription_canceled, refund, chargeback, purchase_refused,
 *          subscription_renewal_refused
 */

export async function POST(request: Request) {
  try {
    const raw = await request.text();

    let body: Record<string, unknown> = {};
    try {
      body = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      console.error('Webhook Cakto - JSON inválido');
      return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 });
    }

    // 1) Validar secret que vem DENTRO do body
    const secret = process.env.CACTUS_WEBHOOK_SECRET ?? '';
    const bodySecret = String(body.secret ?? '');

    if (!secret || secret.startsWith('CONFIGURE_')) {
      console.error('Webhook Cakto - CACTUS_WEBHOOK_SECRET não configurado');
      return NextResponse.json({ error: 'Configuração ausente.' }, { status: 500 });
    }

    if (bodySecret !== secret) {
      console.error('Webhook Cakto - Secret inválido');
      return NextResponse.json({ error: 'Secret inválido.' }, { status: 401 });
    }

    // 2) Extrair dados do evento
    const eventType = String(body.event ?? '');
    const data = (body.data ?? {}) as Record<string, unknown>;
    const customer = (data.customer ?? {}) as Record<string, unknown>;
    const customerEmail = String(customer.email ?? '').toLowerCase().trim();
    const externalId = String(data.id ?? body.id ?? '');

    console.log('Webhook Cakto - Evento:', eventType, '| Email:', customerEmail, '| ExternalId:', externalId);

    if (!eventType) {
      console.warn('Webhook Cakto - Evento sem tipo, ignorando');
      return NextResponse.json({ received: true });
    }

    // 3) Encontrar usuário pelo email do customer
    let userId = '';

    // Primeiro, tentar por payment existente
    if (externalId) {
      const existingPayment = await prisma.payment.findUnique({
        where: { externalId },
        select: { userId: true },
      });
      if (existingPayment) {
        userId = existingPayment.userId;
      }
    }

    // Se não achou, buscar pelo email
    if (!userId && customerEmail) {
      const user = await prisma.user.findUnique({
        where: { email: customerEmail },
        select: { id: true },
      });
      if (user) {
        userId = user.id;
      }
    }

    if (!userId) {
      console.warn('Webhook Cakto - Usuário não encontrado para email:', customerEmail);
      // Retornar 200 para não reenviar, mas logar
      return NextResponse.json({ received: true, warning: 'Usuário não encontrado' });
    }

    // 4) Processar evento
    await processEvent(eventType, externalId, userId, data);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erro no webhook Cakto:', error);
    return NextResponse.json({ error: 'Falha no processamento.' }, { status: 500 });
  }
}

// Eventos que ativam premium
const ACTIVATE_EVENTS = [
  'purchase_approved',
  'subscription_created',
  'subscription_renewed',
];

// Eventos que desativam premium
const DEACTIVATE_EVENTS = [
  'subscription_canceled',
  'refund',
  'chargeback',
  'subscription_renewal_refused',
];

// Eventos informativos (não alteram premium)
const INFO_EVENTS = [
  'purchase_refused',
];

async function processEvent(
  eventType: string,
  externalId: string,
  userId: string,
  data: Record<string, unknown>
) {
  const activate = ACTIVATE_EVENTS.includes(eventType);
  const deactivate = DEACTIVATE_EVENTS.includes(eventType);

  console.log('Webhook Cakto - Processando:', { eventType, externalId, userId, activate, deactivate });

  const offer = (data.offer ?? {}) as Record<string, unknown>;
  const amountCents = Math.round(Number(offer.price ?? 12) * 100);

  // Upsert payment record
  if (externalId) {
    await prisma.payment.upsert({
      where: { externalId },
      update: {
        status: activate ? 'PAID' : deactivate ? 'CANCELLED' : 'PENDING',
        eventType,
      },
      create: {
        externalId,
        userId,
        status: activate ? 'PAID' : deactivate ? 'CANCELLED' : 'PENDING',
        eventType,
        amountCents,
      },
    });
  }

  // Atualizar status premium do usuário
  if (activate) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isPremium: true,
        premiumExpiresAt: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000), // +32 dias
      },
    });
    console.log('Webhook Cakto - Premium ATIVADO para:', userId);
  } else if (deactivate) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isPremium: false,
        premiumExpiresAt: null,
      },
    });
    console.log('Webhook Cakto - Premium DESATIVADO para:', userId);
  } else {
    console.log('Webhook Cakto - Evento informativo:', eventType, '- Nenhuma ação no premium');
  }
}
