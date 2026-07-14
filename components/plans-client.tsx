'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Check, Crown, Loader2, ShieldCheck, Sparkles, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export function PlansClient() {
  const { data: session } = useSession() || {};
  const [loading, setLoading] = useState(false);

  const checkout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/payments/checkout', { method: 'POST' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error ?? 'Não foi possível abrir o pagamento.');
      const url = String(data?.checkoutUrl ?? '');
      if (!url.startsWith('http')) throw new Error('O endereço de pagamento recebido é inválido.');
      window.location.assign(url);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Falha ao iniciar pagamento.');
    } finally {
      setLoading(false);
    }
  };

  const premium = session?.user?.isPremium ?? false;

  return (
    <main className="min-h-screen bg-[#f7f5f1] px-5 py-10">
      <div className="mx-auto max-w-[1000px]">
        <a href="/dashboard" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold hover:bg-white">
          <ArrowLeft size={17} />Voltar à biblioteca
        </a>

        <header className="mt-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1.5 text-sm font-bold text-violet-800">
            <Crown size={16} /> Planos Meu Livro
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold tracking-tight md:text-5xl">
            A história é sua. O espaço também.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-stone-500">
            Comece sem custo e ative todas as ferramentas quando seu universo pedir mais espaço.
          </p>
        </header>

        <section className="mt-12 grid gap-6 md:grid-cols-2">
          {/* Free Plan */}
          <article className="rounded-2xl bg-white p-8 shadow-md">
            <h2 className="text-xl font-bold">Gratuito</h2>
            <p className="mt-4 text-4xl font-bold">R$ 0</p>
            <p className="mt-2 text-sm text-stone-500">Para começar sua primeira história.</p>
            <ul className="mt-8 space-y-4">
              {[
                '1 livro ativo',
                '3 fontes essenciais',
                'Temas claro e escuro',
                'Exportação PDF A4 com assinatura',
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm">
                  <Check className="shrink-0 text-emerald-600" size={19} />{item}
                </li>
              ))}
            </ul>
          </article>

          {/* Premium Plan */}
          <article className="relative overflow-hidden rounded-2xl bg-[#292331] p-8 text-white shadow-2xl">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-violet-600/40 blur-3xl" />
            <div className="relative">
              <span className="rounded-full bg-violet-500 px-3 py-1 text-xs font-bold">EXPERIÊNCIA COMPLETA</span>
              <h2 className="mt-5 text-xl font-bold">Premium</h2>
              <p className="mt-4 text-4xl font-bold">
                R$ 12<span className="text-base font-normal text-stone-400">/mês</span>
              </p>
              <p className="mt-2 text-sm text-stone-400">Cancele quando quiser.</p>
              <ul className="mt-8 space-y-4">
                {[
                  'Livros e capítulos ilimitados',
                  'Personagens, timeline e universo',
                  '12+ fontes e 8+ fundos',
                  'Muse IA para desbloquear ideias',
                  'Análise de consistência e arco dramático',
                  'PDF A4, A5 e 14×21 cm sem marca',
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm">
                    <Sparkles className="shrink-0 text-violet-300" size={19} />{item}
                  </li>
                ))}
              </ul>
              <button
                onClick={checkout}
                disabled={loading || premium}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 font-bold text-violet-800 hover:bg-violet-50 disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Crown size={18} />}
                {premium ? 'Seu Premium está ativo' : 'Ativar Premium'}
              </button>
            </div>
          </article>
        </section>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-stone-500">
          <ShieldCheck size={18} className="text-emerald-600" />
          Pagamento seguro. Seus manuscritos permanecem privados.
        </div>
      </div>
    </main>
  );
}
