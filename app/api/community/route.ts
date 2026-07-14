import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

    const cursor = req.nextUrl.searchParams.get('cursor') ?? undefined;
    const take = 20;

    const posts = await prisma.communityPost.findMany({
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, image: true } },
        _count: { select: { likes: true, comments: true } },
        likes: { where: { userId: session.user.id }, select: { id: true } },
      },
    });

    const hasMore = posts.length > take;
    const items = hasMore ? posts.slice(0, take) : posts;

    return NextResponse.json({
      posts: items.map((p) => ({
        id: p.id,
        content: p.content,
        imageUrl: p.imageUrl,
        createdAt: p.createdAt.toISOString(),
        author: { id: p.user.id, name: p.user.name ?? 'Autor', image: p.user.image },
        likesCount: p._count.likes,
        commentsCount: p._count.comments,
        liked: p.likes.length > 0,
        isOwner: p.userId === session.user.id,
      })),
      nextCursor: hasMore ? items[items.length - 1].id : null,
    });
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    return NextResponse.json({ error: 'Falha ao carregar.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const content = String(body.content ?? '').trim();
    const imageUrl = body.imageUrl ? String(body.imageUrl).trim() : null;

    if (!content && !imageUrl) {
      return NextResponse.json({ error: 'Escreva algo ou adicione uma imagem.' }, { status: 400 });
    }
    if (content.length > 5000) {
      return NextResponse.json({ error: 'Texto muito longo (máx 5.000 caracteres).' }, { status: 400 });
    }

    const post = await prisma.communityPost.create({
      data: { userId: session.user.id, content, imageUrl },
      include: { user: { select: { id: true, name: true, image: true } } },
    });

    return NextResponse.json({
      post: {
        id: post.id,
        content: post.content,
        imageUrl: post.imageUrl,
        createdAt: post.createdAt.toISOString(),
        author: { id: post.user.id, name: post.user.name ?? 'Autor', image: post.user.image },
        likesCount: 0,
        commentsCount: 0,
        liked: false,
        isOwner: true,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar post:', error);
    return NextResponse.json({ error: 'Falha ao publicar.' }, { status: 500 });
  }
}
