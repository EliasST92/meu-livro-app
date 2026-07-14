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
      return NextResponse.json(
        { error: 'A Muse IA está disponível no plano Premium.' },
        { status: 403 }
      );

    const body = await request.json().catch(() => ({}));
    const book = await prisma.book.findFirst({
      where: { id: String(body?.bookId ?? ''), userId: session.user.id },
      include: {
        chapters: { orderBy: { order: 'desc' }, take: 3, select: { title: true, content: true } },
        characters: { take: 10, select: { name: true, archetype: true, goal: true, conflict: true, biography: true } },
        worldNotes: { take: 5, select: { title: true, content: true } },
        structureTimeline: { orderBy: { order: 'asc' }, select: { act: true, description: true } },
      },
    });
    if (!book)
      return NextResponse.json({ error: 'Livro não encontrado.' }, { status: 404 });

    const prompt = String(body?.prompt ?? '').trim().slice(0, 3000);
    if (!prompt)
      return NextResponse.json({ error: 'Descreva o que você precisa desenvolver.' }, { status: 400 });

    // Build conversation history
    const history = Array.isArray(body?.history) ? body.history.slice(-12) : [];
    const historyMessages = history
      .filter((m: { role?: string; content?: string }) => m?.role && m?.content)
      .map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
        content: String(m.content).slice(0, 3000),
      }));

    // Build rich context
    const charContext = book.characters.length > 0
      ? book.characters.map((c) => {
          const parts = [c.name];
          if (c.archetype) parts.push(`Arquétipo: ${c.archetype}`);
          if (c.goal) parts.push(`Objetivo: ${c.goal}`);
          if (c.conflict) parts.push(`Conflito: ${c.conflict}`);
          if (c.biography) parts.push(`Bio: ${c.biography.slice(0, 300)}`);
          return parts.join(' | ');
        }).join('\n')
      : 'Nenhuma personagem definida ainda.';

    const worldContext = book.worldNotes.length > 0
      ? book.worldNotes.map((n) => `${n.title}: ${n.content.slice(0, 300)}`).join('\n')
      : '';

    const timelineContext = book.structureTimeline.length > 0
      ? book.structureTimeline.map((t) => `${t.act}: ${t.description}`).join('\n')
      : '';

    const chaptersContext = book.chapters
      .map((c) => `${c.title}: ${c.content.slice(0, 1500)}`)
      .join('\n---\n');

    const systemContent = `Você é a Muse, uma parceira criativa e escritora experiente. Você ADORA histórias e ajuda romancistas brasileiros a escreverem livros incríveis.

VOCÊ CONHECE PROFUNDAMENTE ESTE LIVRO:
Título: ${book.title}
Gênero: ${book.genre ?? 'Não definido'}
Sinopse: ${book.synopsis ?? 'Ainda não escrita'}

PERSONAGENS:
${charContext}

${worldContext ? `UNIVERSO/NOTAS:\n${worldContext}\n` : ''}${timelineContext ? `ESTRUTURA/TIMELINE:\n${timelineContext}\n` : ''}\nTRECHOS RECENTES DOS CAPÍTULOS:\n${chaptersContext}

COMO VOCÊ DEVE SE COMPORTAR:
1. Você tem memória da conversa. Continue exatamente de onde pararam.
2. Analise o que o autor já escreveu antes de sugerir. Suas ideias devem ser coerentes com a história.
3. Seja específica e útil: não dê conselhos genéricos de escrita. Fale sobre ESTA história, ESTES personagens.
4. Varie entre: sugestões de enredo, desenvolvimento de personagens, diálogos, descrições de cena, resolução de bloqueios, reviravoltas.
5. Quando o autor pedir ajuda com um trecho, escreva PROSA LITERÁRIA de verdade, no tom do livro dele.
6. Faça perguntas provocativas para o autor pensar: "E se o protagonista descobrisse que...?"
7. Se o autor mandar só "oi" ou algo vago, analise o estado atual do livro e sugira o próximo passo.

FORMATAÇÃO:
- NUNCA use asteriscos (**), negrito, itálico ou markdown.
- Texto corrido e natural, como conversa entre amigos escritores.
- Use travessão (—) para listas quando necessário.
- SEMPRE termine com um trecho narrativo pronto para uso, separado por "---TRECHO---".
  Esse trecho deve ser prosa literária (3 a 8 frases) na voz do livro do autor.`;

    const allMessages = [
      { role: 'system' as const, content: systemContent },
      ...historyMessages.slice(0, -1),
      { role: 'user' as const, content: prompt },
    ];

    const upstream = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ABACUSAI_API_KEY ?? ''}`,
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        stream: true,
        max_tokens: 1500,
        messages: allMessages,
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const errorText = await upstream.text().catch(() => '');
      console.error('Falha da IA', upstream.status, errorText);
      return NextResponse.json(
        { error: 'A Muse IA não conseguiu responder agora. Tente novamente.' },
        { status: 502 }
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = upstream.body?.getReader?.();
        if (!reader) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ status: 'error', message: 'Fluxo indisponível.' })}\n\n`)
          );
          controller.close();
          return;
        }
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
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ status: 'completed' })}\n\n`)
                );
                continue;
              }
              try {
                const parsed = JSON.parse(raw);
                const content = parsed?.choices?.[0]?.delta?.content ?? '';
                if (content)
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ status: 'delta', content })}\n\n`)
                  );
              } catch {
                continue;
              }
            }
          }
        } catch (error) {
          console.error('Erro no streaming', error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ status: 'error', message: 'A conexão com a Muse foi interrompida.' })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Não foi possível iniciar a Muse IA.' }, { status: 500 });
  }
}
