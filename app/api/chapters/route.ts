import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// POST - criar capítulo
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const bookId = String(body?.bookId ?? '');

    const book = await prisma.book.findFirst({
      where: { id: bookId, userId: session.user.id },
      include: { chapters: { orderBy: { order: 'desc' }, take: 1, select: { order: true } } },
    });
    if (!book)
      return NextResponse.json({ error: 'Livro não encontrado.' }, { status: 404 });

    const nextOrder = (book.chapters?.[0]?.order ?? 0) + 1;
    const chapter = await prisma.chapter.create({
      data: { bookId, order: nextOrder, title: `Capítulo ${nextOrder}` },
    });

    return NextResponse.json({ chapter }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao criar capítulo.' }, { status: 500 });
  }
}

// PATCH - atualizar capítulo
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const chapterId = String(body?.id ?? '');

    const chapter = await prisma.chapter.findFirst({
      where: { id: chapterId, book: { userId: session.user.id } },
    });
    if (!chapter)
      return NextResponse.json({ error: 'Capítulo não encontrado.' }, { status: 404 });

    const content = typeof body?.content === 'string' ? body.content : undefined;
    const title = typeof body?.title === 'string' ? body.title.trim().slice(0, 200) : undefined;
    const wordCount = content !== undefined ? (content.trim().match(/\S+/g) ?? []).length : undefined;

    const updated = await prisma.chapter.update({
      where: { id: chapter.id },
      data: {
        ...(content !== undefined ? { content } : {}),
        ...(title ? { title } : {}),
        ...(wordCount !== undefined ? { wordCount } : {}),
      },
    });

    return NextResponse.json({ chapter: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Falha ao salvar capítulo.' }, { status: 500 });
  }
}

// DELETE - excluir capítulo
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const chapterId = String(body?.id ?? '');

    const chapter = await prisma.chapter.findFirst({
      where: { id: chapterId, book: { userId: session.user.id } },
      include: { book: { select: { _count: { select: { chapters: true } } } } },
    });
    if (!chapter)
      return NextResponse.json({ error: 'Capítulo não encontrado.' }, { status: 404 });

    if ((chapter.book._count.chapters ?? 0) <= 1)
      return NextResponse.json({ error: 'O livro precisa ter pelo menos 1 capítulo.' }, { status: 400 });

    await prisma.chapter.delete({ where: { id: chapter.id } });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Falha ao excluir capítulo.' }, { status: 500 });
  }
}
