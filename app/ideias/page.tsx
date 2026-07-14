export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { IdeiasClient } from '@/components/ideias-client';

export default async function IdeiasPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const books = await prisma.book.findMany({
    where: { userId: session.user.id },
    select: { id: true, title: true, genre: true },
    orderBy: { updatedAt: 'desc' },
  });

  return <IdeiasClient books={books} isPremium={!!session.user.isPremium} />;
}
