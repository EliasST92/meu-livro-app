import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CommunityFeed } from '@/components/community-feed';
import { AppNavigation } from '@/components/app-navigation';

export const dynamic = 'force-dynamic';

export default async function ComunidadePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');
  return (
    <>
      <AppNavigation />
      <CommunityFeed userName={session.user.name ?? 'Autor'} />
    </>
  );
}
