import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Feather, Search } from 'lucide-react';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const GENRE_COLORS: Record<string, string> = {
  Romance: 'bg-pink-100 text-pink-800',
  Fantasia: 'bg-purple-100 text-purple-800',
  'Ficção Científica': 'bg-cyan-100 text-cyan-800',
  Suspense: 'bg-amber-100 text-amber-800',
  Terror: 'bg-red-100 text-red-800',
  Aventura: 'bg-emerald-100 text-emerald-800',
  Drama: 'bg-blue-100 text-blue-800',
  Histórico: 'bg-yellow-100 text-yellow-800',
  Policial: 'bg-slate-100 text-slate-800',
  Comédia: 'bg-orange-100 text-orange-800',
  Infantil: 'bg-lime-100 text-lime-800',
  Juvenil: 'bg-teal-100 text-teal-800',
  Poesia: 'bg-rose-100 text-rose-800',
  Conto: 'bg-indigo-100 text-indigo-800',
  Crônica: 'bg-violet-100 text-violet-800',
};

function getCoverUrl(path: string): string {
  const bucket = process.env.AWS_BUCKET_NAME ?? '';
  const region = process.env.AWS_REGION ?? '';
  return `https://${bucket}.s3.${region}.amazonaws.com/${path}`;
}

export default async function VitrinePage() {
  const books = await prisma.book.findMany({
    where: { isPublished: true },
    orderBy: { updatedAt: 'desc' },
    include: {
      user: { select: { name: true } },
      chapters: { select: { wordCount: true } },
    },
  });

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#26232b]">
      <header className="sticky top-3 z-40 mx-auto flex max-w-[1160px] items-center justify-between rounded-xl bg-white/85 px-5 py-3 shadow-md backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-violet-700 text-white">
            <BookOpen size={19} />
          </span>
          Meu Livro
        </Link>
        <div className="flex gap-2">
          <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-semibold hover:bg-violet-50">
            Entrar
          </Link>
          <Link href="/registro" className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-violet-800">
            Começar grátis
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-[1160px] px-6 py-16 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1.5 text-sm font-semibold text-violet-800">
          <Feather size={15} /> Vitrine de Obras
        </span>
        <h1 className="mt-5 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Histórias escritas por nossos autores
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-stone-500">
          Explore amostras publicadas pela comunidade. Cada livro é uma janela para um novo universo.
        </p>
      </section>

      <section className="mx-auto max-w-[1160px] px-6 pb-24">
        {books.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Search className="text-stone-300" size={48} />
            <h2 className="mt-4 text-xl font-bold text-stone-400">Nenhuma obra publicada ainda</h2>
            <p className="mt-2 text-sm text-stone-400">
              Os autores podem publicar amostras de seus livros pelo editor.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => {
              const totalWords = book.chapters.reduce((a, c) => a + (c?.wordCount ?? 0), 0);
              const genreClass = GENRE_COLORS[book.genre ?? ''] ?? 'bg-stone-100 text-stone-700';
              const hasCover = book.coverStoragePath && book.coverIsPublic;
              const coverUrl = hasCover ? getCoverUrl(book.coverStoragePath as string) : null;
              return (
                <Link
                  key={book.id}
                  href={'/vitrine/' + book.id}
                  className="group overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative aspect-[3/4] bg-gradient-to-br from-violet-100 to-stone-100">
                    {coverUrl ? (
                      <Image
                        src={coverUrl}
                        alt={'Capa de ' + book.title}
                        fill
                        className="object-cover transition group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center p-6">
                        <BookOpen className="text-violet-300" size={48} />
                        <p className="mt-4 text-center font-serif text-xl font-bold text-stone-400">
                          {book.title}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    {book.genre && (
                      <span className={'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ' + genreClass}>
                        {book.genre}
                      </span>
                    )}
                    <h3 className="mt-2 font-display text-lg font-bold leading-snug">{book.title}</h3>
                    {book.synopsis && (
                      <p className="mt-1 line-clamp-2 text-sm text-stone-500">{book.synopsis}</p>
                    )}
                    <div className="mt-3 flex items-center justify-between text-xs text-stone-400">
                      <span>por {book.user?.name ?? 'Anônimo'}</span>
                      <span>{totalWords.toLocaleString('pt-BR')} palavras</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <footer className="border-t border-stone-200 py-8">
        <div className="mx-auto flex max-w-[1160px] items-center justify-between px-6 text-sm text-stone-500">
          <span>© 2026 Meu Livro</span>
          <Link href="/">Voltar ao início</Link>
        </div>
      </footer>
    </main>
  );
}
