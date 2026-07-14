export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

// GET - fetch account info
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      isPremium: true,
      premiumExpiresAt: true,
      createdAt: true,
      _count: { select: { books: true } },
    },
  });

  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    isPremium: user.isPremium,
    premiumExpiresAt: user.premiumExpiresAt,
    createdAt: user.createdAt,
    bookCount: user._count.books,
  });
}

// PATCH - update account
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  try {
    const body = await request.json();
    const { name, email, currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

    const updateData: Record<string, string> = {};

    // Update name
    if (name && typeof name === 'string' && name.trim()) {
      updateData.name = name.trim().slice(0, 100);
    }

    // Update email
    if (email && typeof email === 'string' && email.trim()) {
      const trimmedEmail = email.trim().toLowerCase();
      if (trimmedEmail !== user.email) {
        const existing = await prisma.user.findUnique({ where: { email: trimmedEmail } });
        if (existing) return NextResponse.json({ error: 'Este e-mail já está em uso.' }, { status: 409 });
        updateData.email = trimmedEmail;
      }
    }

    // Update password
    if (newPassword && typeof newPassword === 'string') {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Informe a senha atual para alterar a senha.' }, { status: 400 });
      }
      const valid = await bcrypt.compare(currentPassword, user.passwordHash ?? '');
      if (!valid) return NextResponse.json({ error: 'Senha atual incorreta.' }, { status: 400 });
      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' }, { status: 400 });
      }
      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Nenhum dado para atualizar.' }, { status: 400 });
    }

    await prisma.user.update({ where: { id: session.user.id }, data: updateData });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Account update error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar conta.' }, { status: 500 });
  }
}

// DELETE - delete account
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ error: 'Informe sua senha para confirmar a exclusão.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

    const valid = await bcrypt.compare(password, user.passwordHash ?? '');
    if (!valid) return NextResponse.json({ error: 'Senha incorreta.' }, { status: 400 });

    // Delete all user data in order
    await prisma.$transaction([
      prisma.communityLike.deleteMany({ where: { userId: session.user.id } }),
      prisma.communityComment.deleteMany({ where: { userId: session.user.id } }),
      prisma.communityPost.deleteMany({ where: { userId: session.user.id } }),
      prisma.payment.deleteMany({ where: { userId: session.user.id } }),
      prisma.chapter.deleteMany({ where: { book: { userId: session.user.id } } }),
      prisma.character.deleteMany({ where: { book: { userId: session.user.id } } }),
      prisma.worldNote.deleteMany({ where: { book: { userId: session.user.id } } }),
      prisma.structureTimeline.deleteMany({ where: { book: { userId: session.user.id } } }),
      prisma.book.deleteMany({ where: { userId: session.user.id } }),
      prisma.user.delete({ where: { id: session.user.id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Account delete error:', error);
    return NextResponse.json({ error: 'Erro ao excluir conta.' }, { status: 500 });
  }
}
