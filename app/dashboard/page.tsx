import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { AppNavigation } from '@/components/app-navigation';
import { DashboardClient } from '@/components/dashboard-client';
export const dynamic='force-dynamic';
export default async function DashboardPage(){const session=await getServerSession(authOptions);if(!session?.user?.id)redirect('/login');const books=await prisma.book.findMany({where:{userId:session.user.id},orderBy:{updatedAt:'desc'},include:{chapters:{select:{wordCount:true}}}});const mapped=books.map((b)=>({id:b.id,title:b.title,synopsis:b.synopsis,genre:b.genre,updatedAt:b.updatedAt.toISOString(),wordCount:b.chapters.reduce((a,c)=>a+(c?.wordCount??0),0),chapters:b.chapters.length,targetWordCount:b.targetWordCount}));const total=mapped.reduce((a,b)=>a+b.wordCount,0);return <><AppNavigation/><DashboardClient books={mapped} name={session.user.name??'Autor'} isPremium={session.user.isPremium} totalWords={total}/></>}
