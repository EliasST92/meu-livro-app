'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Sparkles } from 'lucide-react';
import { IdeaAssistant } from '@/components/idea-assistant';
import { toast } from 'sonner';

type Book = { id: string; title: string; genre: string | null };

export function IdeiasClient({ books, isPremium }: { books: Book[]; isPremium: boolean }) {
  const [selectedBookId, setSelectedBookId] = useState<string | null>(
    books.length === 1 ? books[0].id : null
  );

  const selectedBook = books.find((b) => b.id === selectedBookId);

  const handleUseIdea = (text: string) => {
    // Copy to clipboard since we're not inside the editor
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Trecho copiado! Cole no editor do seu livro.');
    }).catch(() => {
      toast.error('Não foi possível copiar.');
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 px-5 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-stone-600 hover:bg-stone-100">
            <ArrowLeft size={17} /> Biblioteca
          </Link>
          <div className="flex items-center gap-2 font-display font-bold text-violet-700">
            <Sparkles size={20} /> Ideias com IA
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-8">
        {books.length === 0 ? (
          <div className="mt-20 text-center">
            <BookOpen size={48} className="mx-auto text-stone-300" />
            <h2 className="mt-4 font-display text-xl font-bold text-stone-700">Nenhum livro encontrado</h2>
            <p className="mt-2 text-sm text-stone-500">Crie um livro primeiro para usar o assistente de ideias.</p>
            <Link href="/dashboard" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white hover:bg-violet-700">
              Ir para a Biblioteca
            </Link>
          </div>
        ) : !selectedBookId ? (
          <div>
            <h1 className="font-display text-2xl font-bold text-stone-800">Escolha um livro</h1>
            <p className="mt-1 text-sm text-stone-500">Selecione o livro para o qual deseja gerar ideias com a Muse IA.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {books.map((book) => (
                <button
                  key={book.id}
                  onClick={() => setSelectedBookId(book.id)}
                  className="group rounded-2xl border border-stone-200 bg-white p-5 text-left shadow-sm transition hover:border-violet-300 hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-600">
                      <BookOpen size={18} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-base font-bold text-stone-800 group-hover:text-violet-700">
                        {book.title}
                      </h3>
                      {book.genre && (
                        <span className="mt-1 inline-block rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                          {book.genre}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6 flex items-center gap-3">
              <button
                onClick={() => setSelectedBookId(null)}
                className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-800"
                title="Trocar livro"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="font-display text-xl font-bold text-stone-800">
                  Muse IA — {selectedBook?.title}
                </h1>
                <p className="text-xs text-stone-500">
                  Converse com a IA para gerar ideias, cenas e trechos narrativos.
                  Os trechos gerados serão copiados para a área de transferência.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <IdeaAssistant bookId={selectedBookId} isPremium={isPremium} onUse={handleUseIdea} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
