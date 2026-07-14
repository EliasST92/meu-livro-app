import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getFileUrl } from '@/lib/s3';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const books = await prisma.book.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        genre: true,
        synopsis: true,
        sampleContent: true,
        coverStoragePath: true,
        coverContentType: true,
        coverIsPublic: true,
        user: { select: { name: true } },
        chapters: { select: { wordCount: true } },
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    const result = await Promise.all(
      books.map(async (book: any) => {
        let coverUrl = '';
        if (book.coverStoragePath) {
          try {
            coverUrl = await getFileUrl(
              book.coverStoragePath,
              book.coverContentType ?? 'image/jpeg',
              book.coverIsPublic
            );
          } catch { /* ignore */ }
        }
        return {
          id: book.id,
          title: book.title,
          genre: book.genre ?? 'Ficção',
          synopsis: book.synopsis ?? '',
          sampleContent: book.sampleContent ?? '',
          authorName: book.user?.name ?? 'Autor Anônimo',
          wordCount: book.chapters.reduce((sum, c) => sum + c.wordCount, 0),
          coverUrl,
        };
      })
    );

    return NextResponse.json({ books: result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Falha ao buscar livros.' }, { status: 500 });
  }
}
