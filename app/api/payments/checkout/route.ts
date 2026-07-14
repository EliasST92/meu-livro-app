import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: 'Faça login novamente.' }, { status: 401 });
    }

    if (session.user.isPremium) {
      return NextResponse.json({ error: 'Seu plano Premium já está ativo.' }, { status: 409 });
    }

    // A Cakto usa checkout por link direto.
    // O CAKTO_CHECKOUT_URL é o link de checkout do produto/oferta criado no painel Cakto.
    // Formato: https://pay.cakto.com.br/{offerCode}
    const checkoutBase = (process.env.CAKTO_CHECKOUT_URL ?? '').trim();

    if (!checkoutBase || checkoutBase.startsWith('CONFIGURE_')) {
      return NextResponse.json(
        { error: 'O link de pagamento ainda não foi configurado. Entre em contato com o suporte.' },
        { status: 503 }
      );
    }

    // Pré-preencher dados do cliente no checkout Cakto
    const params = new URLSearchParams();
    if (session.user.email) params.set('email', session.user.email);
    if (session.user.email) params.set('confirmEmail', session.user.email);
    if (session.user.name) params.set('name', session.user.name);

    const separator = checkoutBase.includes('?') ? '&' : '?';
    const checkoutUrl = `${checkoutBase}${separator}${params.toString()}`;

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error('Erro no checkout:', error);
    return NextResponse.json(
      { error: 'Não foi possível iniciar o checkout.' },
      { status: 500 }
    );
  }
}
