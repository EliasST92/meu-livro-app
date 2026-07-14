import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// PATCH - atualizar livro
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

    const owned = await prisma.book.findFirst({
      where: { id: params?.id, userId: session.user.id },
    });
    if (!owned)
      return NextResponse.json({ error: 'Livro não encontrado.' }, { status: 404 });

    const body = await request.json().catch(() => ({}));
    const title = typeof body?.title === 'string' ? body.title.trim().slice(0, 150) : undefined;
    const synopsis = typeof body?.synopsis === 'string' ? body.synopsis.slice(0, 5000) : undefined;
    const genre = typeof body?.genre === 'string' ? body.genre.trim().slice(0, 50) : undefined;
    const targetWordCount = typeof body?.targetWordCount === 'number' ? Math.max(1000, Math.min(body.targetWordCount, 500000)) : undefined;
    const isPublished = typeof body?.isPublished === 'boolean' ? body.isPublished : undefined;
    const sampleContent = typeof body?.sampleContent === 'string' ? body.sampleContent.slice(0, 10000) : undefined;
    const salesLink = typeof body?.salesLink === 'string' ? body.salesLink.trim().slice(0, 500) : (body?.salesLink === null ? null : undefined);

    const book = await prisma.book.update({
      where: { id: owned.id },
      data: {
        ...(title ? { title } : {}),
        ...(synopsis !== undefined ? { synopsis } : {}),
        ...(genre !== undefined ? { genre } : {}),
        ...(targetWordCount !== undefined ? { targetWordCount } : {}),
        ...(isPublished !== undefined ? { isPublished } : {}),
        ...(sampleContent !== undefined ? { sampleContent } : {}),
        ...(salesLink !== undefined ? { salesLink } : {}),
      },
    });

    return NextResponse.json({ book });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Não foi possível atualizar o livro.' }, { status: 500 });
  }
}

// DELETE - excluir livro
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

    const owned = await prisma.book.findFirst({
      where: { id: params?.id, userId: session.user.id },
      select: { id: true },
    });
    if (!owned)
      return NextResponse.json({ error: 'Livro não encontrado.' }, { status: 404 });

    await prisma.book.delete({ where: { id: owned.id } });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Não foi possível excluir o livro.' }, { status: 500 });
  }
}
