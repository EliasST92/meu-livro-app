'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import {
  BookOpen, Plus, MoreVertical, Target, Type, Clock3,
  Crown, ArrowRight, Loader2, Pencil, Trash2, X,
} from 'lucide-react';
import { toast } from 'sonner';

const WordChart = dynamic(() => import('@/components/word-chart'), {
  ssr: false,
  loading: () => <div className="h-44 animate-pulse rounded-xl bg-stone-100" />,
});

const GENRES = [
  'Romance', 'Fantasia', 'Ficção Científica', 'Suspense', 'Terror',
  'Aventura', 'Drama', 'Histórico', 'Policial', 'Comédia',
  'Infantil', 'Juvenil', 'Poesia', 'Conto', 'Crônica', 'Outro',
];

type Book = {
  id: string;
  title: string;
  genre: string | null;
  synopsis: string | null;
  updatedAt: string;
  wordCount: number;
  chapters: number;
  targetWordCount: number;
};

export function DashboardClient({
  books: initialBooks,
  name,
  isPremium,
  totalWords,
}: {
  books: Book[];
  name: string;
  isPremium: boolean;
  totalWords: number;
}) {
  const router = useRouter();
  const [books, setBooks] = useState(initialBooks);
  const [dialog, setDialog] = useState(false);
  const [editDialog, setEditDialog] = useState<Book | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<Book | null>(null);
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [loading, setLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, genre: genre || undefined, synopsis: synopsis || undefined }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error ?? 'Não foi possível criar o livro.');
      router.push(`/livros/${data?.book?.id}`);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Erro ao criar livro.');
    } finally {
      setLoading(false);
    }
  };

  const updateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDialog) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/books/${editDialog.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, genre: genre || null, synopsis: synopsis || null }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error ?? 'Falha ao atualizar.');
      setBooks((prev) =>
        prev.map((b) =>
          b.id === editDialog.id ? { ...b, title, genre, synopsis } : b
        )
      );
      setEditDialog(null);
      toast.success('Livro atualizado!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar.');
    } finally {
      setLoading(false);
    }
  };

  const deleteBook = async () => {
    if (!deleteDialog) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/books/${deleteDialog.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error ?? 'Falha ao excluir.');
      }
      setBooks((prev) => prev.filter((b) => b.id !== deleteDialog.id));
      setDeleteDialog(null);
      toast.success('Livro excluído.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir.');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (book: Book) => {
    setTitle(book.title);
    setGenre(book.genre ?? '');
    setSynopsis(book.synopsis ?? '');
    setEditDialog(book);
    setOpenMenu(null);
  };

  const openDelete = (book: Book) => {
    setDeleteDialog(book);
    setOpenMenu(null);
  };

  const openCreate = () => {
    setTitle('');
    setGenre('');
    setSynopsis('');
    setDialog(true);
  };

  return (
    <div className="min-h-screen bg-[#f7f5f1] lg:pl-[288px]">
      <main className="mx-auto max-w-[1200px] px-5 py-8 lg:px-8 lg:py-12">
        {/* Header */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold text-violet-700">Seu estúdio de escrita</p>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
              Olá, {name?.split?.(' ')?.[0] ?? 'Autor'}.
            </h1>
            <p className="mt-2 text-stone-500">
              Cada página escrita é uma história mais perto do mundo.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-3 font-bold text-white shadow-lg hover:bg-violet-800"
          >
            <Plus size={19} />
            Novo livro
          </button>
        </div>

        {/* Premium banner */}
        {!isPremium && (
          <section className="mt-8 flex flex-col justify-between gap-5 rounded-2xl bg-violet-800 p-6 text-white shadow-lg md:flex-row md:items-center">
            <div className="flex gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/15">
                <Crown />
              </span>
              <div>
                <h2 className="font-display text-xl font-bold">
                  Dê espaço para todas as suas histórias
                </h2>
                <p className="mt-1 text-sm text-violet-200">
                  Projetos ilimitados, planejamento completo, IA e PDFs profissionais.
                </p>
              </div>
            </div>
            <Link
              href="/planos"
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-violet-800"
            >
              Conhecer Premium <ArrowRight size={17} />
            </Link>
          </section>
        )}

        {/* Stats */}
        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <span className="flex items-center gap-2 text-sm text-stone-500">
              <Type size={17} />Palavras escritas
            </span>
            <strong className="mt-3 block font-mono text-3xl">
              {totalWords.toLocaleString('pt-BR')}
            </strong>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <span className="flex items-center gap-2 text-sm text-stone-500">
              <BookOpen size={17} />Livros ativos
            </span>
            <strong className="mt-3 block font-mono text-3xl">{books?.length ?? 0}</strong>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <span className="flex items-center gap-2 text-sm text-stone-500">
              <Target size={17} />Ritmo desta semana
            </span>
            <strong className="mt-3 block font-mono text-3xl">
              +{Math.min(totalWords, 2450).toLocaleString('pt-BR')}
            </strong>
          </div>
        </section>

        {/* Books grid */}
        <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_340px]">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold">Seus livros</h2>
            </div>
            {books.length === 0 ? (
              <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                <BookOpen className="mx-auto text-violet-500" size={40} />
                <h3 className="mt-4 text-xl font-bold">Sua estante está esperando</h3>
                <p className="mt-2 text-stone-500">
                  Crie seu primeiro livro e escreva a primeira cena.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {books.map((book) => (
                  <div
                    key={book.id}
                    className="group relative rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <Link href={`/livros/${book.id}`} className="flex gap-4">
                      <div className="grid h-28 w-20 shrink-0 place-items-center rounded bg-gradient-to-br from-violet-200 to-violet-700 text-white shadow-md">
                        <BookOpen />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-violet-700">
                          {book.genre ?? 'Ficção'}
                        </span>
                        <h3 className="mt-2 truncate font-display text-xl font-bold group-hover:text-violet-700">
                          {book.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm text-stone-500">
                          {book.synopsis ?? 'Uma nova história começa aqui.'}
                        </p>
                      </div>
                    </Link>

                    {/* 3-dot menu */}
                    <div className="absolute right-4 top-4" ref={openMenu === book.id ? menuRef : undefined}>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpenMenu(openMenu === book.id ? null : book.id);
                        }}
                        className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
                      >
                        <MoreVertical size={18} />
                      </button>
                      {openMenu === book.id && (
                        <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-xl bg-white py-2 shadow-xl ring-1 ring-stone-200">
                          <button
                            onClick={(e) => { e.stopPropagation(); openEdit(book); }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50"
                          >
                            <Pencil size={15} /> Editar detalhes
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); openDelete(book); }}
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={15} /> Excluir livro
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Progress */}
                    <div className="mt-5">
                      <div className="flex justify-between text-xs text-stone-500">
                        <span>{book.wordCount.toLocaleString('pt-BR')} palavras</span>
                        <span>
                          {Math.round(
                            (book.wordCount / Math.max(book.targetWordCount, 1)) * 100
                          )}
                          %
                        </span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100">
                        <div
                          className="h-full rounded-full bg-violet-600"
                          style={{
                            width: `${Math.min(100, (book.wordCount / Math.max(book.targetWordCount, 1)) * 100)}%`,
                          }}
                        />
                      </div>
                      <p className="mt-3 flex items-center gap-1 text-xs text-stone-400">
                        <Clock3 size={13} />
                        {book.chapters} capítulo{book.chapters !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-bold">Seu ritmo</h2>
            <p className="mt-1 text-sm text-stone-500">Progresso acumulado nesta semana</p>
            <WordChart total={totalWords} />
            <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
              Continue assim: consistência vale mais do que pressa.
            </p>
          </aside>
        </section>
      </main>

      {/* CREATE DIALOG */}
      {dialog && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-5" role="dialog">
          <form onSubmit={create} className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl">
            <h2 className="font-display text-2xl font-bold">Comece um novo livro</h2>
            <p className="mt-2 text-sm text-stone-500">Tudo pode ser alterado depois.</p>

            <label className="mt-5 block text-sm font-bold">
              Título
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e?.target?.value ?? '')}
                required
                minLength={2}
                className="mt-2 w-full rounded-xl bg-stone-100 px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="Ex.: O último verão"
              />
            </label>

            <label className="mt-4 block text-sm font-bold">
              Gênero
              <select
                value={genre}
                onChange={(e) => setGenre(e?.target?.value ?? '')}
                className="mt-2 w-full rounded-xl bg-stone-100 px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">Selecione o gênero</option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </label>

            <label className="mt-4 block text-sm font-bold">
              Sinopse (opcional)
              <textarea
                value={synopsis}
                onChange={(e) => setSynopsis(e?.target?.value ?? '')}
                className="mt-2 min-h-20 w-full rounded-xl bg-stone-100 p-4 text-sm outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="Sobre o que é sua história?"
              />
            </label>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDialog(false)}
                className="rounded-xl px-4 py-2.5 font-semibold hover:bg-stone-100"
              >
                Cancelar
              </button>
              <button
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 font-bold text-white"
              >
                {loading && <Loader2 size={17} className="animate-spin" />}
                Criar livro
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT DIALOG */}
      {editDialog && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-5" role="dialog">
          <form onSubmit={updateBook} className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold">Editar livro</h2>
              <button type="button" onClick={() => setEditDialog(null)}>
                <X size={20} />
              </button>
            </div>

            <label className="mt-5 block text-sm font-bold">
              Título
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e?.target?.value ?? '')}
                required
                minLength={2}
                className="mt-2 w-full rounded-xl bg-stone-100 px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500"
              />
            </label>

            <label className="mt-4 block text-sm font-bold">
              Gênero
              <select
                value={genre}
                onChange={(e) => setGenre(e?.target?.value ?? '')}
                className="mt-2 w-full rounded-xl bg-stone-100 px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">Selecione o gênero</option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </label>

            <label className="mt-4 block text-sm font-bold">
              Sinopse
              <textarea
                value={synopsis}
                onChange={(e) => setSynopsis(e?.target?.value ?? '')}
                className="mt-2 min-h-24 w-full rounded-xl bg-stone-100 p-4 text-sm outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="Sobre o que é sua história?"
              />
            </label>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditDialog(null)}
                className="rounded-xl px-4 py-2.5 font-semibold hover:bg-stone-100"
              >
                Cancelar
              </button>
              <button
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 font-bold text-white"
              >
                {loading && <Loader2 size={17} className="animate-spin" />}
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteDialog && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-5" role="dialog">
          <div className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-2xl">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-100">
              <Trash2 className="text-red-600" size={24} />
            </div>
            <h2 className="mt-4 text-center font-display text-xl font-bold">Excluir livro?</h2>
            <p className="mt-2 text-center text-sm text-stone-500">
              <strong>&ldquo;{deleteDialog.title}&rdquo;</strong> e todos os seus capítulos, personagens e
              planejamento serão excluídos permanentemente.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteDialog(null)}
                className="flex-1 rounded-xl bg-stone-100 px-4 py-2.5 font-semibold hover:bg-stone-200"
              >
                Cancelar
              </button>
              <button
                onClick={deleteBook}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 font-bold text-white hover:bg-red-700"
              >
                {loading && <Loader2 size={17} className="animate-spin" />}
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
