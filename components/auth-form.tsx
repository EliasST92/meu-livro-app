'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BookOpen, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function AuthForm({ mode, googleEnabled }: { mode: 'login' | 'registro'; googleEnabled: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (mode === 'registro') {
        const response = await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data?.error ?? 'Não foi possível criar sua conta.');
      }
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) throw new Error('E-mail ou senha incorretos.');
      router.replace('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Ocorreu um erro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <a href="/" className="mb-10 flex items-center justify-center gap-2 font-display text-xl font-bold">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-700 text-white">
          <BookOpen size={21} />
        </span>
        Meu Livro
      </a>

      <div className="rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {mode === 'login' ? 'Bem-vindo de volta' : 'Comece sua história'}
        </h1>
        <p className="mt-2 text-stone-500">
          {mode === 'login' ? 'Continue de onde sua imaginação parou.' : 'Crie seu espaço de escrita gratuito.'}
        </p>

        <form onSubmit={submit} className="mt-7 space-y-4">
          {mode === 'registro' && (
            <label className="block text-sm font-semibold">
              Nome
              <input
                value={name}
                onChange={(e) => setName(e?.target?.value ?? '')}
                required
                className="mt-2 w-full rounded-xl bg-stone-100 px-4 py-3 outline-none ring-violet-500 focus:ring-2"
                placeholder="Como devemos chamar você?"
              />
            </label>
          )}
          <label className="block text-sm font-semibold">
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e?.target?.value ?? '')}
              required
              className="mt-2 w-full rounded-xl bg-stone-100 px-4 py-3 outline-none ring-violet-500 focus:ring-2"
              placeholder="voce@email.com"
            />
          </label>
          <label className="block text-sm font-semibold">
            Senha
            <div className="relative mt-2">
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e?.target?.value ?? '')}
                minLength={8}
                required
                className="w-full rounded-xl bg-stone-100 px-4 py-3 pr-12 outline-none ring-violet-500 focus:ring-2"
                placeholder="Mínimo de 8 caracteres"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-3 top-3 text-stone-500"
                aria-label="Mostrar senha"
              >
                {show ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </label>
          <button
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-3 font-bold text-white hover:bg-violet-800 disabled:opacity-60"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {mode === 'login' ? 'Entrar' : 'Criar conta grátis'}
          </button>
        </form>

        {googleEnabled && (
          <>
            <div className="my-5 flex items-center gap-3 text-xs text-stone-400">
              <span className="h-px flex-1 bg-stone-200" />OU<span className="h-px flex-1 bg-stone-200" />
            </div>
            <button
              onClick={() => signIn('google', { redirect: true, callbackUrl: '/dashboard' })}
              className="w-full rounded-xl bg-stone-100 px-4 py-3 font-semibold hover:bg-stone-200"
            >
              Continuar com Google
            </button>
          </>
        )}

        <p className="mt-6 text-center text-sm text-stone-500">
          {mode === 'login' ? 'Ainda não tem conta? ' : 'Já tem uma conta? '}
          <a className="font-bold text-violet-700" href={mode === 'login' ? '/registro' : '/login'}>
            {mode === 'login' ? 'Criar conta' : 'Entrar'}
          </a>
        </p>
      </div>

      <p className="mt-5 text-center text-xs text-stone-500">
        Seus textos são privados e nunca são usados sem sua permissão.
      </p>
    </div>
  );
}
