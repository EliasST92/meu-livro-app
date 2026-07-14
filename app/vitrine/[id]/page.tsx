import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, ArrowLeft, Feather, Clock } from 'lucide-react';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

function getCoverUrl(path: string): string {
  const bucket = process.env.AWS_BUCKET_NAME ?? '';
  const region = process.env.AWS_REGION ?? '';
  return 'https://' + bucket + '.s3.' + region + '.amazonaws.com/' + path;
}

export default async function BookSamplePage({ params }: { params: { id: string } }) {
  const book = await prisma.book.findFirst({
    where: { id: params.id, isPublished: true },
    include: {
      user: { select: { name: true } },
      chapters: {
        orderBy: { order: 'asc' },
        take: 3,
        select: { title: true, content: true, order: true, wordCount: true },
      },
    },
  });

  if (!book) notFound();

  const sampleText = book.sampleContent
    ? book.sampleContent
    : book.chapters.map((c) => c.content.slice(0, 2000)).join('\n\n---\n\n');
  const totalWords = book.chapters.reduce((a, c) => a + (c?.wordCount ?? 0), 0);
  const readTime = Math.max(1, Math.ceil(totalWords / 220));
  const hasCover = book.coverStoragePath && book.coverIsPublic;
  const coverUrl = hasCover ? getCoverUrl(book.coverStoragePath as string) : null;

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

      <div className="mx-auto max-w-[800px] px-6 py-12">
        <Link
          href="/vitrine"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900"
        >
          <ArrowLeft size={16} /> Voltar à Vitrine
        </Link>

        <div className="mt-4 flex flex-col items-start gap-8 md:flex-row">
          <div className="w-full shrink-0 md:w-[220px]">
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gradient-to-br from-violet-100 to-stone-100 shadow-lg">
              {coverUrl ? (
                <Image
                  src={coverUrl}
                  alt={'Capa de ' + book.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-6">
                  <BookOpen className="text-violet-300" size={36} />
                  <p className="mt-3 text-center font-serif text-lg font-bold text-stone-400">
                    {book.title}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1">
            {book.genre && (
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold uppercase text-violet-700">
                {book.genre}
              </span>
            )}
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
              {book.title}
            </h1>
            <p className="mt-2 text-lg text-stone-500">
              por {book.user?.name ?? 'Anônimo'}
            </p>
            {book.synopsis && (
              <p className="mt-4 leading-relaxed text-stone-600">{book.synopsis}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-stone-400">
              <span className="flex items-center gap-1.5">
                <Feather size={14} /> {totalWords.toLocaleString('pt-BR')} palavras
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} /> ~{readTime} min de leitura
              </span>
            </div>
          </div>
        </div>

        <article className="mt-12 rounded-2xl bg-white p-8 shadow-md md:p-12">
          <h2 className="mb-6 font-display text-xl font-bold text-stone-700">Amostra</h2>
          <div className="font-serif text-lg leading-[1.9] text-stone-700">
            {sampleText.split('\n').map((line, i) => {
              if (line.trim() === '---') return <hr key={i} className="my-8 border-stone-200" />;
              if (line.trim()) return <p key={i} className="mb-4">{line}</p>;
              return null;
            })}
          </div>
          {book.salesLink && (
            <div className="mt-8 rounded-xl bg-emerald-50 p-6 text-center">
              <p className="font-semibold text-emerald-800">Adquira o livro completo</p>
              <p className="mt-1 text-sm text-stone-500">O autor disponibilizou este livro para venda.</p>
              <a
                href={book.salesLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700"
              >
                Comprar livro completo
              </a>
            </div>
          )}

          <div className="mt-6 rounded-xl bg-violet-50 p-6 text-center">
            <p className="font-semibold text-violet-800">Gostou do que leu?</p>
            <p className="mt-1 text-sm text-stone-500">
              Crie sua conta grátis e comece a escrever sua própria história.
            </p>
            <Link
              href="/registro"
              className="mt-4 inline-block rounded-lg bg-violet-700 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-violet-800"
            >
              Começar grátis
            </Link>
          </div>
        </article>
      </div>

      <footer className="mt-12 border-t border-stone-200 py-8">
        <div className="mx-auto flex max-w-[1160px] items-center justify-between px-6 text-sm text-stone-500">
          <span>© 2026 Meu Livro</span>
          <Link href="/">Voltar ao início</Link>
        </div>
      </footer>
    </main>
  );
}
