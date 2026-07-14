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
      },
    });
    if (!book)
      return NextResponse.json({ error: 'Livro não encontrado.' }, { status: 404 });

    const chaptersText = book.chapters
      .map((c) => 'CAPÍTULO ' + c.order + ' (' + c.title + '): ' + c.content.slice(0, 2000))
      .join('\n---\n');

    const systemPrompt = `Você é um analista literário especializado em estrutura narrativa. Analise o manuscrito e retorne EXCLUSIVAMENTE um JSON válido (sem texto extra, sem markdown, sem comentários) no formato:

{"chapters": [{"order": 1, "title": "...", "tension": 5, "label": "Apresentação"}], "analysis": "Análise geral do ritmo"}

Regras:
- "tension" é de 1 a 10 (1 = calmo/introdutório, 10 = clímax máximo)
- "label" é uma palavra-chave: Abertura, Desenvolvimento, Tensão, Clímax, Resolução, Queda, Revira, Conflito, etc.
- "analysis" é um parágrafo em português analisando o ritmo: onde estão os clímaxes, onde o ritmo cai, sugestões.
- Retorne APENAS o JSON. Nada antes, nada depois.`;

    const upstream = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + (process.env.ABACUSAI_API_KEY ?? ''),
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: chaptersText },
        ],
      }),
    });

    if (!upstream.ok) {
      console.error('Arc API error', upstream.status);
      return NextResponse.json({ error: 'Falha na análise.' }, { status: 502 });
    }

    const data = await upstream.json().catch(() => ({}));
    const raw = data?.choices?.[0]?.message?.content ?? '';

    // Extract JSON from response
    let parsed;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch?.[0] ?? raw);
    } catch {
      return NextResponse.json({ error: 'Resposta inválida da IA.' }, { status: 502 });
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro na análise do arco.' }, { status: 500 });
  }
}
