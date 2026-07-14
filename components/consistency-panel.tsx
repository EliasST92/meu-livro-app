'use client';
import { useState, useRef, useEffect } from 'react';
import { Shield, Loader2, AlertTriangle, CheckCircle, LockKeyhole } from 'lucide-react';
import { toast } from 'sonner';

export function ConsistencyPanel({ bookId, isPremium }: { bookId: string; isPremium: boolean }) {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [result]);

  const analyze = async () => {
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/consistency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error ?? 'Falha na análise.');
      }
      const reader = res.body?.getReader?.();
      if (!reader) throw new Error('Fluxo indisponível.');
      const decoder = new TextDecoder();
      let partial = '';
      let full = '';
      while (true) {
        const chunk = await reader.read();
        if (chunk?.done) break;
        partial += decoder.decode(chunk?.value, { stream: true });
        const lines = partial.split('\n');
        partial = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data?.status === 'delta') {
              full += String(data?.content ?? '');
              setResult(full);
            }
          } catch { continue; }
        }
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro na análise.');
    } finally {
      setLoading(false);
    }
  };

  if (!isPremium) return (
    <div className="rounded-xl bg-violet-50 p-5 text-center">
      <LockKeyhole className="mx-auto text-violet-700" />
      <h3 className="mt-3 font-bold">Motor de Consistência é Premium</h3>
      <p className="mt-1 text-sm text-stone-500">A IA analisa seu texto contra fichas de personagens e notas do universo.</p>
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Motor de Consistência</label>
      </div>
      <p className="mt-2 text-xs text-stone-400">
        A IA compara seu manuscrito com a Bíblia do Mundo (personagens, notas, timeline) e aponta contradições, furos e inconsistências.
      </p>

      <button
        onClick={analyze}
        disabled={loading}
        className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-3 text-sm font-bold text-white hover:bg-amber-700 disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" size={17} /> : <Shield size={17} />}
        {loading ? 'Analisando manuscrito...' : 'Executar Revisão de Continuidade'}
      </button>

      {result && (
        <div ref={scrollRef} className="mt-4 flex-1 overflow-y-auto rounded-xl bg-stone-50 p-4" style={{ maxHeight: 'calc(100vh - 400px)' }}>
          {result.split('\n').map((line, i) => {
            if (line.includes('⚠️')) return (
              <div key={i} className="mb-3 flex items-start gap-2 rounded-lg bg-amber-50 p-3">
                <AlertTriangle className="mt-0.5 shrink-0 text-amber-600" size={16} />
                <p className="text-sm leading-relaxed text-stone-700">{line.replace('⚠️', '').trim()}</p>
              </div>
            );
            if (line.startsWith('Sugestão:')) return (
              <p key={i} className="mb-3 ml-7 text-xs italic text-violet-700">{line}</p>
            );
            if (line.trim()) return <p key={i} className="mb-2 text-sm leading-relaxed text-stone-600">{line}</p>;
            return null;
          })}
          {!loading && !result.includes('⚠️') && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 p-3">
              <CheckCircle className="text-emerald-600" size={16} />
              <p className="text-sm font-semibold text-emerald-700">Nenhuma inconsistência grave encontrada!</p>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="mt-4 flex items-center gap-2 text-xs text-amber-600">
          <Loader2 className="animate-spin" size={12} /> Analisando todos os capítulos...
        </div>
      )}
    </div>
  );
}
