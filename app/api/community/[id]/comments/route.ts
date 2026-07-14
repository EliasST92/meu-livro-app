import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

    const comments = await prisma.communityComment.findMany({
      where: { postId: params.id },
      orderBy: { createdAt: 'asc' },
      take: 50,
      include: { user: { select: { id: true, name: true, image: true } } },
    });

    return NextResponse.json({
      comments: comments.map((c) => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt.toISOString(),
        author: { id: c.user.id, name: c.user.name ?? 'Autor', image: c.user.image },
      })),
    });
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    return NextResponse.json({ error: 'Falha.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const content = String(body.content ?? '').trim();
    if (!content) return NextResponse.json({ error: 'Escreva um comentário.' }, { status: 400 });
    if (content.length > 1000) return NextResponse.json({ error: 'Comentário muito longo.' }, { status: 400 });

    const comment = await prisma.communityComment.create({
      data: { userId: session.user.id, postId: params.id, content },
      include: { user: { select: { id: true, name: true, image: true } } },
    });

    return NextResponse.json({
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        author: { id: comment.user.id, name: comment.user.name ?? 'Autor', image: comment.user.image },
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao comentar:', error);
    return NextResponse.json({ error: 'Falha ao comentar.' }, { status: 500 });
  }
}
