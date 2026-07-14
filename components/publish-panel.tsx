'use client';
import { useState } from 'react';
import { Globe, ExternalLink, Loader2, Check, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export function PublishPanel({
  bookId,
  initialPublished,
  initialSalesLink,
}: {
  bookId: string;
  initialPublished: boolean;
  initialSalesLink: string | null;
}) {
  const [isPublished, setIsPublished] = useState(initialPublished);
  const [salesLink, setSalesLink] = useState(initialSalesLink ?? '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/books/' + bookId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPublished,
          salesLink: salesLink.trim() || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error ?? 'Erro ao salvar.');
      }
      toast.success(isPublished ? 'Livro publicado na Vitrine!' : 'Livro removido da Vitrine.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
          Publicação na Vitrine
        </label>
        <p className="mt-1 text-xs text-stone-400">
          Publique uma amostra do seu livro na Vitrine pública. Qualquer pessoa poderá ler os primeiros capítulos.
        </p>
      </div>

      {/* Toggle */}
      <button
        onClick={() => setIsPublished(!isPublished)}
        className={'flex w-full items-center justify-between rounded-xl p-4 transition ' + (isPublished ? 'bg-emerald-50 ring-2 ring-emerald-500' : 'bg-stone-50 hover:bg-stone-100')}
      >
        <div className="flex items-center gap-3">
          <Globe size={20} className={isPublished ? 'text-emerald-600' : 'text-stone-400'} />
          <div className="text-left">
            <p className={'text-sm font-bold ' + (isPublished ? 'text-emerald-700' : 'text-stone-600')}>
              {isPublished ? 'Publicado na Vitrine' : 'Não publicado'}
            </p>
            <p className="text-xs text-stone-400">
              {isPublished ? 'Visível para todos os visitantes' : 'Apenas você pode ver'}
            </p>
          </div>
        </div>
        <div className={'flex h-6 w-11 items-center rounded-full transition ' + (isPublished ? 'bg-emerald-500' : 'bg-stone-300')}>
          <div className={'h-5 w-5 rounded-full bg-white shadow transition-transform ' + (isPublished ? 'translate-x-5' : 'translate-x-0.5')} />
        </div>
      </button>

      {/* Sales link */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
          Link de vendas (opcional)
        </label>
        <p className="mt-1 text-xs text-stone-400">
          Adicione o link do seu livro em uma plataforma de vendas (Amazon, Hotmart, etc.). Ele aparecerá abaixo da amostra na Vitrine.
        </p>
        <div className="mt-2 flex items-center gap-2">
          <ExternalLink size={16} className="shrink-0 text-stone-400" />
          <input
            value={salesLink}
            onChange={(e) => setSalesLink(e.target.value)}
            placeholder="https://amazon.com.br/seu-livro"
            className="w-full rounded-lg bg-stone-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* Preview link */}
      {isPublished && (
        <div className="rounded-xl bg-violet-50 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-violet-700">
            <BookOpen size={14} /> Página da amostra
          </div>
          <p className="mt-1 text-xs text-stone-500">
            Sua amostra estará disponível em <span className="font-mono font-bold">/vitrine/{bookId}</span>
          </p>
        </div>
      )}

      {/* Save button */}
      <button
        onClick={save}
        disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-3 text-sm font-bold text-white hover:bg-violet-800 disabled:opacity-50"
      >
        {saving ? <Loader2 className="animate-spin" size={17} /> : <Check size={17} />}
        Salvar configurações
      </button>
    </div>
  );
}
