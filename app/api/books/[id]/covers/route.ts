import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getFileUrl } from '@/lib/s3';

export const dynamic = 'force-dynamic';

// GET - retorna URLs das capas
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

    const book = await prisma.book.findFirst({
      where: { id: params.id, userId: session.user.id },
      select: {
        coverStoragePath: true,
        coverContentType: true,
        coverIsPublic: true,
        backCoverStoragePath: true,
        backCoverContentType: true,
        backCoverIsPublic: true,
      },
    });
    if (!book) return NextResponse.json({ error: 'Livro não encontrado.' }, { status: 404 });

    let coverUrl = '';
    let backCoverUrl = '';

    if (book.coverStoragePath) {
      coverUrl = await getFileUrl(book.coverStoragePath, book.coverContentType ?? 'image/jpeg', book.coverIsPublic);
    }
    if (book.backCoverStoragePath) {
      backCoverUrl = await getFileUrl(book.backCoverStoragePath, book.backCoverContentType ?? 'image/jpeg', book.backCoverIsPublic);
    }

    return NextResponse.json({ coverUrl, backCoverUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao buscar capas.' }, { status: 500 });
  }
}

// PATCH - salvar referência da capa/contracapa
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

    const book = await prisma.book.findFirst({
      where: { id: params.id, userId: session.user.id },
      select: { id: true },
    });
    if (!book) return NextResponse.json({ error: 'Livro não encontrado.' }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const { type, cloud_storage_path, contentType } = body;

    if (type !== 'cover' && type !== 'backCover') {
      return NextResponse.json({ error: 'Tipo inválido.' }, { status: 400 });
    }

    if (type === 'cover') {
      await prisma.book.update({
        where: { id: book.id },
        data: {
          coverStoragePath: cloud_storage_path ?? null,
          coverContentType: contentType ?? null,
          coverIsPublic: true,
        },
      });
    } else {
      await prisma.book.update({
        where: { id: book.id },
        data: {
          backCoverStoragePath: cloud_storage_path ?? null,
          backCoverContentType: contentType ?? null,
          backCoverIsPublic: true,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao salvar capa.' }, { status: 500 });
  }
}
