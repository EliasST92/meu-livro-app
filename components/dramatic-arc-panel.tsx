'use client';
import { useState } from 'react';
import { Activity, Loader2, LockKeyhole } from 'lucide-react';
import { toast } from 'sonner';

type ArcData = {
  chapters: { order: number; title: string; tension: number; label: string }[];
  analysis: string;
};

const TENSION_COLORS = [
  '#94a3b8', '#94a3b8', '#60a5fa', '#60a5fa', '#a78bfa',
  '#a78bfa', '#f59e0b', '#f59e0b', '#ef4444', '#ef4444',
];

export function DramaticArcPanel({ bookId, isPremium }: { bookId: string; isPremium: boolean }) {
  const [data, setData] = useState<ArcData | null>(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    setData(null);
    try {
      const res = await fetch('/api/dramatic-arc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error ?? 'Falha na análise.');
      }
      const result = await res.json();
      setData(result);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro na análise.');
    } finally {
      setLoading(false);
    }
  };

  if (!isPremium) return (
    <div className="rounded-xl bg-violet-50 p-5 text-center">
      <LockKeyhole className="mx-auto text-violet-700" />
      <h3 className="mt-3 font-bold">Arco Dramático é Premium</h3>
      <p className="mt-1 text-sm text-stone-500">Visualize o ritmo da sua história e identifique clímaxes.</p>
    </div>
  );

  const maxTension = data ? Math.max(...data.chapters.map(c => c.tension), 1) : 10;

  return (
    <div className="flex h-full flex-col">
      <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Arco Dramático</label>
      <p className="mt-2 text-xs text-stone-400">
        A IA analisa cada capítulo e mapeia o nível de tensão, revelando o ritmo narrativo da sua história.
      </p>

      <button
        onClick={analyze}
        disabled={loading}
        className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-3 text-sm font-bold text-white hover:bg-violet-800 disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" size={17} /> : <Activity size={17} />}
        {loading ? 'Analisando ritmo...' : 'Analisar Arco Dramático'}
      </button>

      {data && (
        <div className="mt-5 flex-1 overflow-y-auto">
          {/* Bar chart */}
          <div className="rounded-xl bg-stone-50 p-4">
            <div className="flex items-end gap-1" style={{ height: 160 }}>
              {data.chapters.map((ch) => {
                const height = (ch.tension / maxTension) * 140 + 20;
                const color = TENSION_COLORS[Math.min(ch.tension - 1, 9)] ?? '#94a3b8';
                return (
                  <div key={ch.order} className="group relative flex flex-1 flex-col items-center">
                    <div
                      className="w-full rounded-t-md transition-all hover:opacity-80"
                      style={{ height, backgroundColor: color, minWidth: 12 }}
                    />
                    <span className="mt-1 text-[8px] font-bold text-stone-400">{ch.order}</span>
                    {/* Tooltip */}
                    <div className="pointer-events-none absolute -top-16 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-stone-900 px-3 py-2 text-xs text-white shadow-lg group-hover:block">
                      <p className="font-bold">{ch.title}</p>
                      <p>Tensão: {ch.tension}/10 — {ch.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex justify-between text-[9px] text-stone-400">
              <span>Início</span>
              <span>Meio</span>
              <span>Fim</span>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 space-y-1.5">
            {data.chapters.map((ch) => {
              const color = TENSION_COLORS[Math.min(ch.tension - 1, 9)] ?? '#94a3b8';
              return (
                <div key={ch.order} className="flex items-center gap-2 text-xs">
                  <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />
                  <span className="font-semibold text-stone-700">Cap. {ch.order}</span>
                  <span className="text-stone-400">{ch.title}</span>
                  <span className="ml-auto rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold">{ch.label}</span>
                </div>
              );
            })}
          </div>

          {/* Analysis */}
          <div className="mt-4 rounded-xl bg-violet-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-violet-600">Análise do Ritmo</p>
            <p className="mt-2 text-sm leading-relaxed text-stone-700">{data.analysis}</p>
          </div>
        </div>
      )}
    </div>
  );
}
