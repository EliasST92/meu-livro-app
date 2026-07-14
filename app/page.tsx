import Link from 'next/link';
import { BookOpen, Feather, Focus, ShieldCheck, Sparkles, FileText, ArrowRight, Check, Globe, Pen, Eye } from 'lucide-react';

const features = [
  { icon: Focus, title: 'Escrita sem distrações', text: 'Um editor sereno, rápido e personalizável para manter você dentro da história.' },
  { icon: Feather, title: 'Planejamento que inspira', text: 'Personagens, universo e estrutura conectados ao manuscrito em um só lugar.' },
  { icon: FileText, title: 'Livro pronto para o mundo', text: 'Exporte seu original em PDF com acabamento editorial e formatos profissionais.' },
];
export default function HomePage() {
  return <main className="min-h-screen bg-[#fbfaf7] text-[#26232b]">
    <header className="sticky top-3 z-40 mx-auto flex max-w-[1160px] items-center justify-between rounded-xl bg-white/85 px-5 py-3 shadow-[var(--shadow-md)] backdrop-blur-xl">
      <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold"><span className="grid h-9 w-9 place-items-center rounded-lg bg-violet-700 text-white"><BookOpen size={19}/></span>Meu Livro</Link>
      <nav className="hidden items-center gap-2 md:flex"><a href="#recursos" className="rounded-lg px-4 py-2 text-sm hover:bg-violet-50">Recursos</a><a href="#planos" className="rounded-lg px-4 py-2 text-sm hover:bg-violet-50">Planos</a><Link href="/vitrine" className="rounded-lg px-4 py-2 text-sm hover:bg-violet-50">Vitrine</Link></nav>
      <div className="flex gap-2"><Link href="/login" className="rounded-lg px-4 py-2 text-sm font-semibold hover:bg-violet-50">Entrar</Link><Link href="/registro" className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-violet-800">Começar grátis</Link></div>
    </header>
    <section className="mx-auto grid min-h-[720px] max-w-[1160px] items-center gap-12 px-6 py-20 lg:grid-cols-[1.05fr_.95fr]">
      <div><span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1.5 text-sm font-semibold text-violet-800"><Sparkles size={15}/> Seu universo começa aqui</span><h1 className="mt-7 max-w-3xl font-display text-5xl font-bold leading-[1.08] tracking-tight md:text-7xl">Da primeira ideia ao seu <span className="text-violet-700">livro.</span></h1><p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-600">Planeje personagens, organize cada capítulo e escreva com foco. Tudo o que sua história precisa, em um estúdio editorial só seu.</p><div className="mt-9 flex flex-wrap gap-3"><Link href="/registro" className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-6 py-3.5 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-violet-800">Começar meu livro <ArrowRight size={18}/></Link><a href="#recursos" className="rounded-xl bg-white px-6 py-3.5 font-semibold shadow-md hover:bg-stone-50">Conhecer recursos</a></div><div className="mt-7 flex items-center gap-2 text-sm text-stone-500"><ShieldCheck size={17} className="text-emerald-600"/> Seus manuscritos são privados e protegidos.</div></div>
      <div className="relative rounded-[2rem] bg-violet-950 p-5 shadow-2xl"><div className="rounded-2xl bg-[#f5efe3] p-7 shadow-inner"><div className="mb-8 flex items-center justify-between text-xs text-stone-500"><span>CAPÍTULO 7</span><span>Salvo agora</span></div><h2 className="font-serif text-3xl">A porta entre os mundos</h2><p className="mt-6 font-serif text-lg leading-9 text-stone-700">A chave era mais pesada do que Lia imaginava. Não pelo metal, mas por tudo o que prometia abrir.</p><p className="mt-4 font-serif text-lg leading-9 text-stone-700">Do outro lado da porta, o silêncio tinha a forma de uma resposta.</p><div className="mt-12 flex justify-between border-t border-stone-300 pt-4 text-xs text-stone-500"><span>1.842 palavras</span><span>74% da meta diária</span></div></div></div>
    </section>
    <section id="recursos" className="bg-white py-24"><div className="mx-auto max-w-[1160px] px-6"><p className="text-sm font-bold uppercase tracking-[.2em] text-violet-700">Feito para histórias longas</p><h2 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight">Menos ferramentas soltas. Mais tempo escrevendo.</h2><div className="mt-12 grid gap-5 md:grid-cols-3">{features.map(({icon:Icon,title,text}) => <article key={title} className="rounded-2xl bg-[#f8f6f2] p-7 shadow-[var(--shadow-sm)] transition hover:-translate-y-1 hover:shadow-lg"><Icon className="text-violet-700"/><h3 className="mt-6 font-display text-xl font-bold">{title}</h3><p className="mt-3 leading-relaxed text-stone-600">{text}</p></article>)}</div></div></section>
    <section id="planos" className="mx-auto max-w-[1000px] px-6 py-24"><div className="text-center"><h2 className="font-display text-4xl font-bold tracking-tight">Comece grátis. Cresça com sua história.</h2></div><div className="mt-12 grid gap-6 md:grid-cols-2"><div className="rounded-2xl bg-white p-8 shadow-md"><h3 className="text-xl font-bold">Gratuito</h3><p className="mt-3 text-4xl font-bold">R$ 0</p><ul className="mt-7 space-y-3 text-stone-600">{['1 projeto ativo','Editor essencial','PDF básico'].map(x=><li key={x} className="flex gap-2"><Check className="text-emerald-600" size={18}/>{x}</li>)}</ul></div><div className="rounded-2xl bg-violet-800 p-8 text-white shadow-xl"><span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">MAIS COMPLETO</span><h3 className="mt-4 text-xl font-bold">Premium</h3><p className="mt-3 text-4xl font-bold">R$ 12<span className="text-base font-normal text-violet-200">/mês</span></p><ul className="mt-7 space-y-3 text-violet-100">{['Projetos ilimitados','Planejamento completo + IA','PDF profissional sem marca'].map(x=><li key={x} className="flex gap-2"><Check size={18}/>{x}</li>)}</ul></div></div></section>
    {/* Vitrine highlight section */}
    <section className="bg-gradient-to-b from-violet-950 to-violet-900 py-24 text-white">
      <div className="mx-auto max-w-[1160px] px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-violet-200 backdrop-blur">
              <Globe size={15} /> Vitrine Pública
            </span>
            <h2 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              Veja o que nossos autores estão publicando
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-violet-200">
              Histórias de verdade, escritas por pessoas como você. Explore amostras gratuitas, descubra novos talentos e inspire-se para começar a sua.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/vitrine" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-violet-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-violet-50">
                <Eye size={18} /> Explorar a Vitrine
              </Link>
              <Link href="/registro" className="inline-flex items-center gap-2 rounded-xl border-2 border-white/25 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10">
                <Pen size={18} /> Publicar meu livro
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                <div className="mb-3 h-32 rounded-xl bg-gradient-to-br from-pink-400/30 to-violet-400/30" />
                <p className="font-display text-sm font-bold">A Última Flor de Inverno</p>
                <p className="mt-1 text-xs text-violet-300">Romance · por Ana C.</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                <div className="mb-3 h-24 rounded-xl bg-gradient-to-br from-cyan-400/30 to-blue-400/30" />
                <p className="font-display text-sm font-bold">Código Estrela</p>
                <p className="mt-1 text-xs text-violet-300">Ficção Científica · por Leo M.</p>
              </div>
            </div>
            <div className="mt-8 space-y-4">
              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                <div className="mb-3 h-28 rounded-xl bg-gradient-to-br from-amber-400/30 to-red-400/30" />
                <p className="font-display text-sm font-bold">Sombras de Ouro</p>
                <p className="mt-1 text-xs text-violet-300">Suspense · por Rafael T.</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
                <div className="mb-3 h-36 rounded-xl bg-gradient-to-br from-emerald-400/30 to-teal-400/30" />
                <p className="font-display text-sm font-bold">O Jardim dos Segredos</p>
                <p className="mt-1 text-xs text-violet-300">Fantasia · por Carla S.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <footer className="border-t border-stone-200 bg-white py-10">
      <div className="mx-auto max-w-[1160px] px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 font-display text-lg font-bold text-stone-700">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-700 text-white"><BookOpen size={16} /></span>
            Meu Livro
          </div>
          <div className="flex items-center gap-6 text-sm text-stone-500">
            <Link href="/vitrine" className="font-semibold text-violet-700 hover:text-violet-900">Vitrine</Link>
            <a href="#recursos" className="hover:text-stone-700">Recursos</a>
            <a href="#planos" className="hover:text-stone-700">Planos</a>
            <Link href="/login" className="hover:text-stone-700">Entrar</Link>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-stone-400">© 2026 Meu Livro. Feito com amor para quem ama escrever.</p>
      </div>
    </footer>
  </main>;
}
