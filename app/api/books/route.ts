import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createSchema = z.object({
  title: z.string().trim().min(2).max(150),
  genre: z.string().trim().max(50).optional(),
  synopsis: z.string().max(5000).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: 'Faça login novamente.' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const parsed = createSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: 'Informe um título válido.' }, { status: 400 });

    if (!session.user.isPremium) {
      const count = await prisma.book.count({ where: { userId: session.user.id } });
      if (count >= 1)
        return NextResponse.json(
          { error: 'O plano gratuito permite 1 livro ativo. Conheça o Premium para criar projetos ilimitados.' },
          { status: 403 }
        );
    }

    const book = await prisma.book.create({
      data: {
        userId: session.user.id,
        title: parsed.data.title,
        genre: parsed.data.genre || null,
        synopsis: parsed.data.synopsis || null,
        chapters: { create: { order: 1, title: 'Capítulo 1' } },
      },
    });

    return NextResponse.json({ book }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar livro', error);
    return NextResponse.json({ error: 'Não foi possível criar o livro.' }, { status: 500 });
  }
}
