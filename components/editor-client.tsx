'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Activity, ArrowLeft, ChevronLeft, Download, Feather,
  Globe, Menu, Palette, Plus, Save, Shield, Sparkles, Users, X,
  Loader2, Eye, Minus as MinusIcon, Plus as PlusIcon,
  BookImage, Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { PlanningPanel } from '@/components/planning-panel';
import { IdeaAssistant } from '@/components/idea-assistant';
import { BookPreview } from '@/components/book-preview';
import { CoverPanel } from '@/components/cover-panel';
import { ConsistencyPanel } from '@/components/consistency-panel';
import { DramaticArcPanel } from '@/components/dramatic-arc-panel';
import { PublishPanel } from '@/components/publish-panel';
import dynamic from 'next/dynamic';

const RichEditor = dynamic(() => import('@/components/rich-editor').then((m) => m.RichEditor), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-xl bg-stone-200/50" />,
});

type Chapter = {
  id: string; title: string; content: string; wordCount: number; order: number;
};
type Character = {
  id: string; name: string; archetype: string | null;
  biography: string | null; goal: string | null; conflict: string | null;
};
type Note = { id: string; title: string; content: string };
type Timeline = { id: string; act: string; description: string; order: number };
type Book = {
  id: string; title: string; synopsis: string | null;
  genre: string | null; isPublished: boolean; salesLink: string | null;
  chapters: Chapter[]; characters: Character[]; notes: Note[]; timeline: Timeline[];
};

const themes = [
  { id: 'paper', name: 'Papel', bg: '#f4efe4', text: '#312d29' },
  { id: 'white', name: 'Claro', bg: '#ffffff', text: '#27242a' },
  { id: 'night', name: 'Noite', bg: '#1d1b22', text: '#e7e3ed' },
  { id: 'sepia', name: 'Sépia', bg: '#e7d3ae', text: '#473820' },
  { id: 'cream', name: 'Creme', bg: '#fff8df', text: '#3e372a' },
  { id: 'parchment', name: 'Pergaminho', bg: '#dac49c', text: '#40311d' },
  { id: 'notebook', name: 'Caderno', bg: '#eef4f1', text: '#26332f' },
  { id: 'slate', name: 'Grafite', bg: '#2b3039', text: '#e9edf2' },
  { id: 'rose', name: 'Rosé', bg: '#f5e8e4', text: '#44302f' },
];

const fonts = [
  { id: 'serif', name: 'Clássica', css: 'Georgia, serif' },
  { id: 'sans', name: 'Moderna', css: 'var(--font-sans)' },
  { id: 'mono', name: 'Máquina', css: 'var(--font-mono)' },
  { id: 'book', name: 'Editorial', css: 'Palatino, serif' },
  { id: 'script', name: 'Manuscrita', css: 'cursive' },
  { id: 'baskerville', name: 'Baskerville', css: 'Baskerville, Georgia, serif' },
  { id: 'garamond', name: 'Garamond', css: 'Garamond, Georgia, serif' },
  { id: 'times', name: 'Romance', css: 'Times New Roman, serif' },
  { id: 'trebuchet', name: 'Humanista', css: 'Trebuchet MS, sans-serif' },
  { id: 'courier', name: 'Datilografia', css: 'Courier New, monospace' },
  { id: 'verdana', name: 'Leitura', css: 'Verdana, sans-serif' },
  { id: 'lucida', name: 'Lucida', css: 'Lucida Sans, sans-serif' },
];

const FONT_SIZES = [14, 16, 18, 20, 22, 24, 28];
const LINE_HEIGHTS = [
  { value: 1.5, label: 'Compacta' },
  { value: 1.8, label: 'Normal' },
  { value: 2.0, label: 'Confortável' },
  { value: 2.4, label: 'Espaçosa' },
];
const PARAGRAPH_SPACINGS = [
  { value: 0, label: 'Sem' },
  { value: 8, label: 'Pequeno' },
  { value: 16, label: 'Médio' },
  { value: 24, label: 'Grande' },
];
const MAX_WIDTHS = [
  { value: 580, label: 'Estreita' },
  { value: 700, label: 'Normal' },
  { value: 860, label: 'Larga' },
  { value: 1000, label: 'Completa' },
];

type ToolId = 'planning' | 'ideas' | 'style' | 'covers' | 'consistency' | 'arc' | 'publish';

const TOOLS: { id: ToolId; icon: typeof Users; label: string; premium?: boolean }[] = [
  { id: 'planning', icon: Users, label: 'Planejar' },
  { id: 'ideas', icon: Sparkles, label: 'Muse IA', premium: true },
  { id: 'consistency', icon: Shield, label: 'Consistência', premium: true },
  { id: 'arc', icon: Activity, label: 'Arco Dramático', premium: true },
  { id: 'style', icon: Palette, label: 'Estilo' },
  { id: 'covers', icon: BookImage, label: 'Capas' },
  { id: 'publish', icon: Globe, label: 'Publicar' },
];

export function EditorClient({
  book, isPremium, userName,
}: {
  book: Book; isPremium: boolean; userName?: string;
}) {
  const chapters = book?.chapters ?? [];
  const [chapterList, setChapterList] = useState(chapters);
  const [activeId, setActiveId] = useState(chapters?.[0]?.id ?? '');
  const active = chapterList.find((c) => c?.id === activeId) ?? chapterList?.[0];
  const [title, setTitle] = useState(active?.title ?? '');
  const [content, setContent] = useState(active?.content ?? '');
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'dirty'>('saved');
  const [leftOpen, setLeftOpen] = useState(true);
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [theme, setTheme] = useState(themes[0]);
  const [font, setFont] = useState(fonts[0]);
  const [exporting, setExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const hydrated = useRef(false);

  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(2.0);
  const [paragraphSpacing, setParagraphSpacing] = useState(16);
  const [maxWidth, setMaxWidth] = useState(700);
  const [textIndent, setTextIndent] = useState(0);

  const [words, setWords] = useState(() => (content.trim().match(/\S+/g) ?? []).length);

  // Auto-save
  useEffect(() => {
    if (!hydrated.current) { hydrated.current = true; return; }
    setSaveState('dirty');
    const timer = window.setTimeout(async () => {
      setSaveState('saving');
      try {
        const response = await fetch('/api/chapters', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: activeId, title, content }),
        });
        if (!response.ok) throw new Error('Falha ao salvar');
        setChapterList((prev) =>
          prev.map((c) => c?.id === activeId ? { ...c, title, content, wordCount: words } : c)
        );
        setSaveState('saved');
      } catch (error) {
        console.error(error);
        setSaveState('dirty');
        toast.error('Não conseguimos salvar agora.');
      }
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [content, title, activeId, words]);

  const choose = (chapter: Chapter) => {
    setActiveId(chapter?.id ?? '');
    setTitle(chapter?.title ?? '');
    setContent(chapter?.content ?? '');
    setSaveState('saved');
    if (window.innerWidth < 768) setLeftOpen(false);
  };

  const deleteChapter = async (chapterId: string) => {
    if (chapterList.length <= 1) { toast.error('O livro precisa ter pelo menos 1 capítulo.'); return; }
    if (!confirm('Tem certeza que deseja excluir este capítulo? Esta ação não pode ser desfeita.')) return;
    try {
      const res = await fetch('/api/chapters', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: chapterId }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d?.error ?? 'Erro ao excluir.'); }
      const updated = chapterList.filter((c) => c.id !== chapterId);
      setChapterList(updated);
      if (activeId === chapterId && updated.length > 0) choose(updated[0]);
      toast.success('Capítulo excluído.');
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Erro ao excluir capítulo.'); }
  };

  const addChapter = async () => {
    try {
      const response = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: book.id }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error ?? 'Erro ao criar capítulo.');
      setChapterList((prev) => [...(prev ?? []), data?.chapter]);
      choose(data?.chapter);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Erro ao criar capítulo.');
    }
  };

  const exportPdf = async () => {
    setExporting(true);
    try {
      const response = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId: book.id, format: isPremium ? 'A5' : 'A4' }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error ?? 'Não foi possível iniciar a exportação.');
      for (let i = 0; i < 150; i++) {
        await new Promise((resolve) => window.setTimeout(resolve, 2000));
        const statusRes = await fetch('/api/pdf/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requestId: data?.requestId }),
        });
        const status = await statusRes.json().catch(() => ({}));
        if (status?.status === 'SUCCESS') {
          const binary = window.atob(status?.pdfBase64 ?? '');
          const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
          const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = `${book.title.replace(/[^a-zA-Z0-9\u00C0-\u024F -]/g, '')}.pdf`;
          anchor.click();
          URL.revokeObjectURL(url);
          toast.success('PDF exportado com sucesso.');
          return;
        }
        if (status?.status === 'FAILED') throw new Error(status?.error ?? 'A exportação falhou.');
      }
      throw new Error('A exportação demorou mais do que o esperado.');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Falha ao exportar.');
    } finally {
      setExporting(false);
    }
  };

  const addIdea = (text: string) => {
    // Content is now HTML, so wrap the idea text in a paragraph
    const ideaHtml = `<p>${text.replace(/\n/g, '<br />')}</p>`;
    setContent((prev) => {
      if (!prev || prev === '<p></p>') return ideaHtml;
      return prev + ideaHtml;
    });
  };

  const adjustFontSize = (delta: number) => {
    const idx = FONT_SIZES.indexOf(fontSize);
    const newIdx = idx + delta;
    if (newIdx >= 0 && newIdx < FONT_SIZES.length) setFontSize(FONT_SIZES[newIdx]);
  };

  const toggleTool = (id: ToolId) => {
    setActiveTool((prev) => prev === id ? null : id);
  };

  // Close panel on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeTool) setActiveTool(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTool]);

  // Style panel content
  const StyleContent = () => (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Fundo</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {themes.map((item, i) => (
            <button key={item.id} disabled={!isPremium && i > 1} onClick={() => setTheme(item)}
              title={item.name}
              className={`h-9 w-9 rounded-full shadow-md ${theme.id === item.id ? 'ring-2 ring-violet-600 ring-offset-2' : ''} disabled:opacity-30`}
              style={{ background: item.bg }} />
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Tipografia</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {fonts.map((item, i) => (
            <button key={item.id} disabled={!isPremium && i > 2} onClick={() => setFont(item)}
              className={`rounded-lg bg-stone-100 px-3 py-2 text-sm ${font.id === item.id ? 'ring-2 ring-violet-600' : ''} disabled:opacity-30`}
              style={{ fontFamily: item.css }}>{item.name}</button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Tamanho da fonte</p>
        <div className="mt-2 flex items-center gap-3">
          <button onClick={() => adjustFontSize(-1)} className="rounded-lg bg-stone-100 p-2 hover:bg-stone-200"><MinusIcon size={14} /></button>
          <input type="range" min={14} max={28} step={2} value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))} className="flex-1 accent-violet-600" />
          <span className="min-w-[28px] text-center text-sm font-bold text-stone-700">{fontSize}</span>
          <button onClick={() => adjustFontSize(1)} className="rounded-lg bg-stone-100 p-2 hover:bg-stone-200"><PlusIcon size={14} /></button>
        </div>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Entrelinhas</p>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {LINE_HEIGHTS.map((lh) => (
            <button key={lh.value} onClick={() => setLineHeight(lh.value)}
              className={`rounded-lg px-2 py-2.5 text-xs font-semibold ${lineHeight === lh.value ? 'bg-violet-100 text-violet-700 ring-2 ring-violet-500' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
              {lh.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Espaço entre parágrafos</p>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {PARAGRAPH_SPACINGS.map((ps) => (
            <button key={ps.value} onClick={() => setParagraphSpacing(ps.value)}
              className={`rounded-lg px-2 py-2.5 text-xs font-semibold ${paragraphSpacing === ps.value ? 'bg-violet-100 text-violet-700 ring-2 ring-violet-500' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
              {ps.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Recuo do parágrafo</p>
        <div className="mt-2 flex items-center gap-3">
          <input type="range" min={0} max={60} step={10} value={textIndent}
            onChange={(e) => setTextIndent(Number(e.target.value))} className="flex-1 accent-violet-600" />
          <span className="min-w-[36px] text-center text-xs font-bold text-stone-700">{textIndent}px</span>
        </div>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Largura da página</p>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          {MAX_WIDTHS.map((mw) => (
            <button key={mw.value} onClick={() => setMaxWidth(mw.value)}
              className={`rounded-lg px-2 py-2.5 text-xs font-semibold ${maxWidth === mw.value ? 'bg-violet-100 text-violet-700 ring-2 ring-violet-500' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
              {mw.label}
            </button>
          ))}
        </div>
      </div>
      {!isPremium && (
        <p className="text-xs text-violet-700">Ative o Premium para liberar todos os ambientes e controles.</p>
      )}
    </div>
  );

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-stone-100">
        {/* Left sidebar - chapters */}
        <aside className={`${leftOpen ? 'w-[260px]' : 'w-0'} absolute inset-y-0 left-0 z-30 overflow-hidden bg-[#24212a] text-white shadow-xl transition-all duration-300 md:relative`}>
          <div className="flex h-full w-[260px] flex-col p-4">
            <div className="flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-bold hover:bg-white/10">
                <ArrowLeft size={17} />Biblioteca
              </Link>
              <button onClick={() => setLeftOpen(false)} className="rounded-lg p-2 hover:bg-white/10"><ChevronLeft size={18} /></button>
            </div>
            <div className="mt-5 px-2">
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-violet-300">Manuscrito</p>
              <h1 className="mt-2 truncate font-display text-lg font-bold">{book.title}</h1>
            </div>
            <div className="mt-6 flex-1 space-y-1 overflow-y-auto">
              {chapterList.map((chapter) => (
                <div key={chapter.id} className="group relative">
                  <button onClick={() => choose(chapter)}
                    className={`w-full rounded-xl px-3 py-3 text-left transition ${activeId === chapter.id ? 'bg-white text-stone-900' : 'text-stone-300 hover:bg-white/10'}`}>
                    <span className="block text-[10px] font-bold uppercase text-violet-400">Capítulo {chapter.order}</span>
                    <span className="mt-1 block truncate text-sm font-semibold">{chapter.title}</span>
                    <span className="mt-1 block text-[10px] opacity-50">{chapter.wordCount.toLocaleString('pt-BR')} palavras</span>
                  </button>
                  {chapterList.length > 1 && (
                    <button onClick={(e) => { e.stopPropagation(); deleteChapter(chapter.id); }}
                      className="absolute right-2 top-2 rounded-lg p-1.5 text-stone-500 opacity-0 transition hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100"
                      title="Excluir capítulo"><Trash2 size={14} /></button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addChapter} className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-3 py-3 text-sm font-bold hover:bg-violet-500">
              <Plus size={17} />Novo capítulo
            </button>
          </div>
        </aside>

        {/* Main editor */}
        <main className="relative flex min-w-0 flex-1 flex-col">
          {/* Toolbar */}
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-stone-200 bg-white px-3 md:px-5">
            <div className="flex items-center gap-2">
              <button onClick={() => setLeftOpen((v) => !v)} className="rounded-lg p-2 hover:bg-stone-100" aria-label="Capítulos">
                {leftOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
              </button>
              <span className="hidden items-center gap-2 text-xs text-stone-500 sm:flex">
                {saveState === 'saving' ? <><Save className="animate-pulse" size={14} />Salvando...</>
                  : saveState === 'saved' ? <><Save size={14} />Salvo</>
                  : <><span className="h-2 w-2 rounded-full bg-amber-500" />Pendências</>}
              </span>
            </div>

            <div className="hidden items-center gap-1 md:flex">
              <button onClick={() => adjustFontSize(-1)} className="rounded p-1.5 hover:bg-stone-100" title="Diminuir fonte"><MinusIcon size={14} /></button>
              <span className="min-w-[32px] text-center text-xs font-semibold text-stone-600">{fontSize}</span>
              <button onClick={() => adjustFontSize(1)} className="rounded p-1.5 hover:bg-stone-100" title="Aumentar fonte"><PlusIcon size={14} /></button>
            </div>

            <div className="flex items-center gap-1">
              <button onClick={() => setShowPreview(true)} className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold hover:bg-stone-100" title="Prévia">
                <Eye size={18} /><span className="hidden sm:inline">Prévia</span>
              </button>
              <button onClick={exportPdf} disabled={exporting}
                className="flex items-center gap-1.5 rounded-lg bg-violet-700 px-3 py-2 text-sm font-bold text-white hover:bg-violet-800 disabled:opacity-50">
                {exporting ? <Loader2 className="animate-spin" size={17} /> : <Download size={17} />}
                <span className="hidden sm:inline">Exportar</span>
              </button>
            </div>
          </header>

          {/* Writing area */}
          <section className="flex-1 overflow-y-auto px-4 py-8 transition-colors md:px-10 md:py-12" style={{ background: theme.bg, color: theme.text }}>
            <div className="mx-auto" style={{ maxWidth: `${maxWidth}px` }}>
              <input value={title} onChange={(e) => setTitle(e?.target?.value ?? '')}
                className="w-full bg-transparent font-display text-3xl font-bold tracking-tight outline-none md:text-4xl" style={{ color: theme.text }} />
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs opacity-50">
                <span className="flex items-center gap-1"><Feather size={14} />{words.toLocaleString('pt-BR')} palavras</span>
                <span>·</span>
                <span>{Math.max(1, Math.ceil(words / 220))} min</span>
                <span>·</span>
                <span style={{ fontFamily: font.css }}>{font.name}</span>
                <span>·</span>
                <span>{fontSize}px</span>
              </div>

              <div className="mt-10 min-h-[calc(100vh-260px)]">
                <RichEditor
                  content={content}
                  onChange={setContent}
                  onWordCount={setWords}
                  fontFamily={font.css}
                  fontSize={fontSize}
                  lineHeight={lineHeight}
                  textColor={theme.text}
                  bgColor={theme.bg}
                  paragraphSpacing={paragraphSpacing}
                  textIndent={textIndent}
                  maxWidth={maxWidth}
                />
              </div>
            </div>
          </section>
        </main>

        {/* Right toolbar - vertical icon buttons */}
        <div className="flex h-full shrink-0 flex-col items-center gap-2 border-l border-stone-200 bg-white px-1.5 py-4">
          {TOOLS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => toggleTool(id)}
              title={label}
              className={`relative flex h-11 w-11 items-center justify-center rounded-xl transition-all
                ${activeTool === id
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                  : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800'}`}
            >
              <Icon size={20} />
            </button>
          ))}
        </div>

        {/* Floating tool panel (popup) */}
        {activeTool && (
          <>
            {/* Backdrop for mobile */}
            <div className="fixed inset-0 z-40 bg-black/20 md:hidden" onClick={() => setActiveTool(null)} />
            <div className="fixed bottom-0 right-[52px] top-0 z-40 flex w-[380px] max-w-[calc(100vw-60px)] flex-col bg-white shadow-2xl md:absolute md:right-[52px]">
              {/* Panel header */}
              <div className="flex h-14 items-center justify-between border-b border-stone-200 px-5">
                <h2 className="font-display text-base font-bold">
                  {TOOLS.find((t) => t.id === activeTool)?.label}
                </h2>
                <button onClick={() => setActiveTool(null)} className="rounded-lg p-1.5 hover:bg-stone-100">
                  <X size={18} />
                </button>
              </div>
              {/* Panel content */}
              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                {activeTool === 'planning' && (
                  <PlanningPanel bookId={book.id} isPremium={isPremium}
                    initialCharacters={book.characters} initialNotes={book.notes} initialTimeline={book.timeline} />
                )}
                {activeTool === 'ideas' && (
                  <IdeaAssistant bookId={book.id} isPremium={isPremium} onUse={addIdea} />
                )}
                {activeTool === 'style' && <StyleContent />}
                {activeTool === 'covers' && <CoverPanel bookId={book.id} />}
                {activeTool === 'consistency' && <ConsistencyPanel bookId={book.id} isPremium={isPremium} />}
                {activeTool === 'arc' && <DramaticArcPanel bookId={book.id} isPremium={isPremium} />}
                {activeTool === 'publish' && <PublishPanel bookId={book.id} initialPublished={book.isPublished} initialSalesLink={book.salesLink} />}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Book Preview Modal */}
      {showPreview && (
        <BookPreview
          bookTitle={book.title}
          authorName={userName ?? 'Autor'}
          chapters={chapterList.map((c) => ({ title: c.title, content: c.content, order: c.order }))}
          bookId={book.id}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}
