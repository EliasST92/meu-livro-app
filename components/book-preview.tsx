'use client';
import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';

type Chapter = { title: string; content: string; order: number };

function splitIntoPages(chapters: Chapter[], bookTitle: string, authorName: string): string[] {
  const pages: string[] = [];
  // Cover
  pages.push(`__COVER__${bookTitle}__BY__${authorName}`);
  // TOC
  let toc = 'SUMÁRIO\n\n';
  chapters.forEach((ch) => { toc += `Capítulo ${ch.order} — ${ch.title}\n`; });
  pages.push(toc);
  // Chapter pages
  for (const chapter of chapters) {
    const fullText = `${chapter.title}\n\n${chapter.content}`;
    const paragraphs = fullText.split('\n');
    let currentPage = '';
    let lineCount = 0;
    const LINES_PER_PAGE = 18;
    for (const para of paragraphs) {
      const words = para.split(' ');
      let line = '';
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (test.length > 45) {
          currentPage += (currentPage ? '\n' : '') + line;
          lineCount++;
          line = word;
          if (lineCount >= LINES_PER_PAGE) { pages.push(currentPage); currentPage = ''; lineCount = 0; }
        } else { line = test; }
      }
      if (line) { currentPage += (currentPage ? '\n' : '') + line; lineCount++; }
      if (para === '') { currentPage += '\n'; lineCount++; }
      if (lineCount >= LINES_PER_PAGE) { pages.push(currentPage); currentPage = ''; lineCount = 0; }
    }
    if (currentPage.trim()) pages.push(currentPage);
  }
  // Back cover
  pages.push('__BACKCOVER__');
  if (pages.length % 2 !== 0) pages.splice(pages.length - 1, 0, '');
  return pages;
}

export function BookPreview({
  bookTitle, authorName, chapters, bookId, onClose,
}: {
  bookTitle: string; authorName: string; chapters: Chapter[]; bookId: string; onClose: () => void;
}) {
  const allPages = splitIntoPages(chapters, bookTitle, authorName);
  const [spread, setSpread] = useState(0);
  const [coverUrl, setCoverUrl] = useState('');
  const [backCoverUrl, setBackCoverUrl] = useState('');
  const totalSpreads = Math.ceil(allPages.length / 2);

  useEffect(() => {
    fetch(`/api/books/${bookId}/covers`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.coverUrl) setCoverUrl(data.coverUrl);
        if (data?.backCoverUrl) setBackCoverUrl(data.backCoverUrl);
      })
      .catch(() => {});
  }, [bookId]);

  const goNext = useCallback(() => setSpread((s) => Math.min(s + 1, totalSpreads - 1)), [totalSpreads]);
  const goPrev = useCallback(() => setSpread((s) => Math.max(s - 1, 0)), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev, onClose]);

  const leftIdx = spread * 2;
  const rightIdx = spread * 2 + 1;
  const leftPage = allPages[leftIdx] ?? '';
  const rightPage = rightIdx < allPages.length ? allPages[rightIdx] : null;

  const renderPage = (pageContent: string, pageNum: number) => {
    if (pageContent.startsWith('__COVER__')) {
      const parts = pageContent.replace('__COVER__', '').split('__BY__');
      if (coverUrl) {
        return (
          <div className="relative flex h-full flex-col items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverUrl} alt="Capa" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10 text-center text-white">
              <div className="mb-4 mx-auto h-1 w-16 bg-amber-400" />
              <h1 className="font-serif text-2xl font-bold leading-tight drop-shadow-lg md:text-3xl">{parts[0]}</h1>
              <div className="mt-4 h-px w-24 mx-auto bg-white/50" />
              <p className="mt-4 text-sm tracking-widest opacity-90 drop-shadow">{parts[1]}</p>
            </div>
          </div>
        );
      }
      return (
        <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-violet-900 to-violet-700 p-8 text-white">
          <div className="mb-4 h-1 w-16 bg-amber-400" />
          <h1 className="text-center font-serif text-2xl font-bold leading-tight md:text-3xl">{parts[0]}</h1>
          <div className="mt-4 h-px w-24 bg-white/30" />
          <p className="mt-4 text-sm tracking-widest opacity-80">{parts[1]}</p>
          <div className="mt-auto text-xs opacity-50">Meu Livro</div>
        </div>
      );
    }
    if (pageContent === '__BACKCOVER__') {
      if (backCoverUrl) {
        return (
          <div className="relative flex h-full items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={backCoverUrl} alt="Contracapa" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative z-10 text-center text-white">
              <BookOpen size={32} className="mx-auto opacity-80" />
              <p className="mt-3 text-sm opacity-80">Criado com Meu Livro</p>
            </div>
          </div>
        );
      }
      return (
        <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-violet-800 to-violet-950 p-8 text-white">
          <BookOpen size={40} className="opacity-50" />
          <p className="mt-4 text-center text-sm opacity-60">Criado com Meu Livro</p>
        </div>
      );
    }
    const isToc = pageContent.startsWith('SUMÁRIO');
    return (
      <div className="flex h-full flex-col bg-[#f8f4ec] p-5 md:p-8">
        <div className="flex-1 overflow-hidden">
          {isToc ? (
            <div>
              <h2 className="mb-4 text-center font-serif text-lg font-bold text-stone-800">Sumário</h2>
              {pageContent.split('\n').slice(2).filter(Boolean).map((line, i) => (
                <p key={i} className="border-b border-stone-200 py-1.5 font-serif text-sm text-stone-600">{line}</p>
              ))}
            </div>
          ) : (
            <p className="whitespace-pre-wrap font-serif text-[13px] leading-[1.8] text-stone-800">{pageContent}</p>
          )}
        </div>
        <div className="mt-2 text-center text-xs text-stone-400">{pageNum}</div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-5xl">
        <button onClick={onClose}
          className="absolute -top-12 right-0 flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20">
          <X size={16} /> Fechar prévia
        </button>

        <div className="relative">
          <div className="absolute inset-0 rounded-xl bg-stone-900/30 blur-xl" />
          <div className="relative flex overflow-hidden rounded-xl shadow-2xl" style={{ aspectRatio: '2/1.4' }}>
            {/* Left page */}
            <div className="relative w-1/2 border-r border-stone-300">
              {renderPage(leftPage, leftIdx + 1)}
              <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-black/10 to-transparent" />
            </div>
            {/* Right page */}
            <div className="relative w-1/2">
              {rightPage !== null ? renderPage(rightPage, rightIdx + 1) : (
                <div className="flex h-full items-center justify-center bg-[#f8f4ec]"><p className="text-sm text-stone-300">Fim</p></div>
              )}
              <div className="absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/10 to-transparent" />
            </div>
            <div className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 bg-gradient-to-r from-stone-400/30 via-stone-500/20 to-stone-400/30" />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4">
          <button onClick={goPrev} disabled={spread === 0}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm text-white disabled:opacity-30">
            <ChevronLeft size={18} /> Anterior
          </button>
          <span className="text-sm text-white/60">
            Páginas {leftIdx + 1}–{Math.min(rightIdx + 1, allPages.length)} de {allPages.length}
          </span>
          <button onClick={goNext} disabled={spread >= totalSpreads - 1}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm text-white disabled:opacity-30">
            Próxima <ChevronRight size={18} />
          </button>
        </div>

        <p className="mt-3 text-center text-xs text-white/40">Use as setas do teclado para navegar · Esc para fechar</p>
      </div>
    </div>
  );
}
