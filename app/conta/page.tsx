export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ContaClient } from '@/components/conta-client';

export default async function ContaPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');
  return <ContaClient />;
}
