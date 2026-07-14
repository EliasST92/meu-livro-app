import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });

    const existing = await prisma.communityLike.findUnique({
      where: { userId_postId: { userId: session.user.id, postId: params.id } },
    });

    if (existing) {
      await prisma.communityLike.delete({ where: { id: existing.id } });
      return NextResponse.json({ liked: false });
    }

    await prisma.communityLike.create({
      data: { userId: session.user.id, postId: params.id },
    });
    return NextResponse.json({ liked: true });
  } catch (error) {
    console.error('Erro no like:', error);
    return NextResponse.json({ error: 'Falha.' }, { status: 500 });
  }
}
