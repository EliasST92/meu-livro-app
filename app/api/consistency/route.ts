import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isPremium: true },
    });
    if (!user?.isPremium)
      return NextResponse.json({ error: 'Função disponível apenas no plano Premium.' }, { status: 403 });

    const body = await request.json().catch(() => ({}));
    const book = await prisma.book.findFirst({
      where: { id: String(body?.bookId ?? ''), userId: session.user.id },
      include: {
        chapters: { orderBy: { order: 'asc' }, select: { title: true, content: true, order: true } },
        characters: { select: { name: true, archetype: true, goal: true, conflict: true, biography: true } },
        worldNotes: { select: { title: true, content: true } },
        structureTimeline: { orderBy: { order: 'asc' }, select: { act: true, description: true } },
      },
    });
    if (!book)
      return NextResponse.json({ error: 'Livro não encontrado.' }, { status: 404 });

    const charContext = book.characters.length > 0
      ? book.characters.map((c) => {
          const parts = [c.name];
          if (c.archetype) parts.push('Arquétipo: ' + c.archetype);
          if (c.goal) parts.push('Objetivo: ' + c.goal);
          if (c.conflict) parts.push('Conflito: ' + c.conflict);
          if (c.biography) parts.push('Bio: ' + c.biography.slice(0, 500));
          return parts.join(' | ');
        }).join('\n')
      : 'Nenhuma personagem definida.';

    const worldContext = book.worldNotes.length > 0
      ? book.worldNotes.map((n) => n.title + ': ' + n.content.slice(0, 500)).join('\n')
      : '';

    const timelineContext = book.structureTimeline.length > 0
      ? book.structureTimeline.map((t) => t.act + ': ' + t.description).join('\n')
      : '';

    const chaptersText = book.chapters
      .map((c) => 'CAPÍTULO ' + c.order + ' - ' + c.title + ':\n' + c.content.slice(0, 4000))
      .join('\n\n---\n\n');

    const systemPrompt = `Você é um editor literário meticuloso e especialista em revisão de continuidade. Analise o manuscrito abaixo comparando com a "Bíblia do Mundo" (fichas de personagens, notas do universo e timeline).

PROCURE POR:
1. CONTRADIÇÕES DE LOCAL: personagem aparece em dois lugares ao mesmo tempo
2. CONTRADIÇÕES DE OBJETO: personagem usa algo que não tem ou não foi mencionado
3. CONTRADIÇÕES DE PERSONALIDADE: ações incoerentes com o arquétipo/objetivo do personagem
4. FUROS NA TIMELINE: eventos que não seguem a ordem lógica
5. PERSONAGENS FANTASMA: mencionados no texto mas ausentes das fichas
6. REGRAS DO UNIVERSO VIOLADAS: contradições com as notas do mundo

BÍBLIA DO MUNDO:

PERSONAGENS:
${charContext}

${worldContext ? 'NOTAS DO UNIVERSO:\n' + worldContext + '\n\n' : ''}${timelineContext ? 'TIMELINE/ESTRUTURA:\n' + timelineContext + '\n\n' : ''}
MANUSCRITO:
${chaptersText}

RESPONDA EM PORTUGUÊS. Para cada problema encontrado, use este formato:

⚠️ [TIPO] Capítulo X: Descrição do problema
Sugestão: Como corrigir

Se não encontrar problemas, elogie a consistência e dê dicas preventivas.
NUNCA use markdown (asteriscos, negrito). Texto corrido e natural.`;

    const upstream = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + (process.env.ABACUSAI_API_KEY ?? ''),
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        stream: true,
        max_tokens: 2000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Faça a revisão de continuidade completa deste manuscrito.' },
        ],
      }),
    });

    if (!upstream.ok || !upstream.body) {
      console.error('Consistency API error', upstream.status);
      return NextResponse.json({ error: 'Falha na análise.' }, { status: 502 });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstream.body?.getReader?.();
        if (!reader) { controller.close(); return; }
        let partial = '';
        try {
          while (true) {
            const chunk = await reader.read();
            if (chunk.done) break;
            partial += decoder.decode(chunk.value, { stream: true });
            const lines = partial.split('\n');
            partial = lines.pop() ?? '';
            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const raw = line.slice(6);
              if (raw === '[DONE]') {
                controller.enqueue(encoder.encode('data: {"status":"completed"}\n\n'));
                continue;
              }
              try {
                const parsed = JSON.parse(raw);
                const content = parsed?.choices?.[0]?.delta?.content ?? '';
                if (content)
                  controller.enqueue(encoder.encode('data: ' + JSON.stringify({ status: 'delta', content }) + '\n\n'));
              } catch { continue; }
            }
          }
        } catch (e) {
          console.error(e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive' },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro na análise de consistência.' }, { status: 500 });
  }
}
