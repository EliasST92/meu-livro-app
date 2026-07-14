import Link from 'next/link';
import { BookOpen, Feather, Focus, Sparkles, FileText, ArrowRight, Check, X, Crown, Palette, Brain, Shield, Zap, Star, Clock, PenTool, Download, Users, Quote, ChevronRight, Heart } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Meu Livro — Seu estúdio de escrita profissional',
  description: 'Planeje, escreva e publique seu livro com ferramentas profissionais. Editor imersivo, planejamento inteligente e exportação para editoras. Comece grátis.',
  openGraph: {
    title: 'Meu Livro — Transforme suas ideias em livros publicados',
    description: 'A plataforma completa para escritores que levam a sério o ofício de contar histórias.',
  },
};

const testimonials = [
  { name: 'Marina Costa', role: 'Autora de ficção', quote: 'Finalmente encontrei um lugar onde consigo organizar meus personagens, capítulos e ideias sem me perder. O editor é lindo e me mantém focada.' },
  { name: 'Rafael Mendes', role: 'Romancista independente', quote: 'Exportei meu primeiro livro direto para a Amazon KDP. O PDF saiu perfeito, com formatação profissional. Economizei horas e dinheiro.' },
  { name: 'Juliana Alves', role: 'Escritora de fantasia', quote: 'A Muse IA é genial. Quando travo em um capítulo, ela me dá sugestões que realmente fazem sentido com a minha história. Virou minha parceira de escrita.' },
];

const freeFeatures = [
  { text: '1 projeto de livro', included: true },
  { text: 'Editor de texto essencial', included: true },
  { text: '3 fontes de escrita', included: true },
  { text: 'Fundo claro e escuro', included: true },
  { text: 'Exportação PDF (A4)', included: true },
  { text: 'Marca d\'água no PDF', included: true },
  { text: 'Fichas de personagem', included: false },
  { text: 'Planejamento e timeline', included: false },
  { text: 'Muse IA (assistente)', included: false },
  { text: 'Fundos texturizados', included: false },
  { text: 'PDF para gráfica', included: false },
];

const premiumFeatures = [
  { text: 'Projetos ilimitados', included: true },
  { text: 'Editor completo', included: true },
  { text: '12+ fontes profissionais', included: true },
  { text: '8+ fundos texturizados', included: true },
  { text: 'Exportação PDF avançada', included: true },
  { text: 'Sem marca d\'água', included: true },
  { text: 'Fichas de personagem', included: true },
  { text: 'Planejamento e timeline', included: true },
  { text: 'Muse IA (assistente)', included: true },
  { text: 'PDF para gráfica (A4, A5, 14x21)', included: true },
  { text: 'Suporte prioritário', included: true },
];

const steps = [
  { icon: PenTool, title: 'Crie seu projeto', desc: 'Dê um título, escreva a sinopse e comece a estruturar seus capítulos em segundos.' },
  { icon: Brain, title: 'Planeje com inteligência', desc: 'Fichas de personagens, timeline de atos e notas de universo — tudo conectado ao manuscrito.' },
  { icon: Focus, title: 'Escreva sem distrações', desc: 'Editor imersivo com auto-save, personalização visual e contador de palavras em tempo real.' },
  { icon: Download, title: 'Exporte e publique', desc: 'PDF profissional pronto para Amazon KDP, Wattpad ou gráfica. Sem complicação.' },
];

export default function VendasPage() {
  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#26232b]">
      {/* Header */}
      <header className="sticky top-3 z-40 mx-auto flex max-w-[1160px] items-center justify-between rounded-xl bg-white/85 px-5 py-3 shadow-[var(--shadow-md)] backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-violet-700 text-white">
            <BookOpen size={19} />
          </span>
          Meu Livro
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          <a href="#como-funciona" className="rounded-lg px-4 py-2 text-sm hover:bg-violet-50">Como funciona</a>
          <a href="#recursos" className="rounded-lg px-4 py-2 text-sm hover:bg-violet-50">Recursos</a>
          <a href="#depoimentos" className="rounded-lg px-4 py-2 text-sm hover:bg-violet-50">Depoimentos</a>
          <a href="#planos" className="rounded-lg px-4 py-2 text-sm hover:bg-violet-50">Planos</a>
        </nav>
        <div className="flex gap-2">
          <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-semibold hover:bg-violet-50">Entrar</Link>
          <Link href="/registro" className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-violet-800">Começar grátis</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-50/60 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-[1160px] px-6 pb-16 pt-20 md:pb-24 md:pt-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-800">
              <Sparkles size={16} /> Mais de 10.000 palavras escritas toda semana
            </span>
            <h1 className="mt-8 font-display text-5xl font-bold leading-[1.08] tracking-tight md:text-7xl">
              Sua história merece{' '}
              <span className="bg-gradient-to-r from-violet-700 to-violet-500 bg-clip-text text-transparent">
                ser escrita.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-stone-600 md:text-xl">
              Chega de arquivos espalhados, bloqueio criativo e formatação manual.
              O <strong>Meu Livro</strong> é o estúdio completo para você planejar, escrever e publicar
              seu livro — do primeiro rascunho ao PDF pronto para editoras.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/registro"
                className="inline-flex items-center gap-2 rounded-xl bg-violet-700 px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-violet-800 hover:shadow-xl"
              >
                Começar a escrever — é grátis <ArrowRight size={20} />
              </Link>
            </div>
            <p className="mt-4 flex items-center justify-center gap-2 text-sm text-stone-500">
              <Shield size={15} className="text-emerald-600" />
              Sem cartão de crédito. Seus manuscritos são 100% privados.
            </p>
          </div>

          {/* Editor Preview */}
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="rounded-[2rem] bg-violet-950 p-4 shadow-2xl md:p-6">
              <div className="flex items-center gap-2 pb-4">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs text-violet-300">Meu Livro — Editor</span>
              </div>
              <div className="rounded-2xl bg-[#f5efe3] p-6 shadow-inner md:p-10">
                <div className="mb-6 flex items-center justify-between text-xs text-stone-400">
                  <span className="flex items-center gap-2"><Clock size={12} /> Salvo automaticamente</span>
                  <span>CAPÍTULO 12</span>
                </div>
                <h2 className="font-serif text-2xl font-semibold text-stone-800 md:text-3xl">O último mapa</h2>
                <p className="mt-6 font-serif text-base leading-8 text-stone-700 md:text-lg md:leading-9">
                  A chave era mais pesada do que Lia imaginava. Não pelo metal, mas por tudo o que prometia abrir.
                  Do outro lado da porta, o silêncio tinha a forma de uma resposta que ela sempre soube, mas nunca
                  teve coragem de pronunciar.
                </p>
                <p className="mt-4 font-serif text-base leading-8 text-stone-700 md:text-lg md:leading-9">
                  &ldquo;Você não precisa abrir&rdquo;, disse a voz atrás dela. Mas Lia já tinha virado a chave.
                </p>
                <div className="mt-10 flex items-center justify-between border-t border-stone-300 pt-4 text-xs text-stone-500">
                  <span>3.847 palavras</span>
                  <span className="flex items-center gap-1"><Zap size={12} className="text-violet-600" /> 127% da meta diária</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credibility Bar */}
      <section className="border-y border-stone-200 bg-white py-8">
        <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-center gap-8 px-6 text-center text-sm text-stone-500 md:gap-16">
          <div className="flex items-center gap-2"><Shield size={18} className="text-emerald-600" /> Dados criptografados</div>
          <div className="flex items-center gap-2"><Zap size={18} className="text-violet-600" /> Auto-save em tempo real</div>
          <div className="flex items-center gap-2"><Users size={18} className="text-blue-600" /> Comunidade de escritores</div>
          <div className="flex items-center gap-2"><Star size={18} className="text-amber-500" /> 4.9/5 de satisfação</div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="bg-[#faf8f5] py-20 md:py-28">
        <div className="mx-auto max-w-[900px] px-6 text-center">
          <p className="text-sm font-bold uppercase tracking-[.2em] text-stone-400">Você se identifica?</p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Escrever um livro não deveria ser tão difícil.
          </h2>
          <div className="mt-12 grid gap-6 text-left md:grid-cols-3">
            {[
              { emoji: '😤', title: 'Arquivos espalhados', desc: 'Word, Google Docs, blocos de notas... sua história vive em 10 lugares diferentes.' },
              { emoji: '😶', title: 'Bloqueio criativo', desc: 'Você senta para escrever e a tela em branco vence. Todo dia a mesma batalha.' },
              { emoji: '😵', title: 'Formatação impossível', desc: 'Quando finalmente termina, descobre que formatar para publicar é outro pesadelo.' },
            ].map((item) => (
              <article key={item.title} className="rounded-2xl bg-white p-6 shadow-md">
                <span className="text-3xl">{item.emoji}</span>
                <h3 className="mt-4 font-display text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{item.desc}</p>
              </article>
            ))}
          </div>
          <p className="mt-10 text-lg text-stone-600">
            O <strong className="text-violet-700">Meu Livro</strong> resolve tudo isso em um só lugar.
          </p>
        </div>
      </section>

      {/* How it Works */}
      <section id="como-funciona" className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-[1160px] px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[.2em] text-violet-700">Simples e direto</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">Como funciona</h2>
            <p className="mx-auto mt-4 max-w-xl text-stone-600">Em 4 passos, você sai da ideia ao livro publicado.</p>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.title} className="relative text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-violet-100 text-violet-700">
                  <step.icon size={28} />
                </div>
                <span className="mt-4 block text-xs font-bold text-violet-400">PASSO {i + 1}</span>
                <h3 className="mt-2 font-display text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Deep Dive */}
      <section id="recursos" className="bg-[#faf8f5] py-20 md:py-28">
        <div className="mx-auto max-w-[1160px] px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[.2em] text-violet-700">Tudo que você precisa</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">Recursos que fazem a diferença</h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Focus, title: 'Editor imersivo', desc: 'Tela limpa, sem distrações. Personalize o fundo (pergaminho, sépia, escuro) e escolha entre 12+ fontes profissionais.', badge: null },
              { icon: Feather, title: 'Fichas de personagens', desc: 'Nome, avatar, biografia, arquétipo, objetivo e conflito. Tudo organizado e acessível durante a escrita.', badge: 'Premium' },
              { icon: Clock, title: 'Auto-save inteligente', desc: 'Cada palavra é salva automaticamente. Nunca mais perca um parágrafo por esquecer de salvar.', badge: null },
              { icon: Brain, title: 'Muse IA — Assistente criativa', desc: 'Travou? Peça sugestões de enredo, diálogos ou desenvolvimento de personagens. A IA conhece sua história.', badge: 'Premium' },
              { icon: FileText, title: 'PDF profissional', desc: 'Exportação com sumário automático, numeração, cabeçalhos. Formatos A4, A5 e 14x21cm para gráfica.', badge: 'Premium' },
              { icon: Palette, title: 'Personalização total', desc: 'Fundo de papel envelhecido, pergaminho, folha de caderno. Fontes serifadas, cursivas e monoespaçadas.', badge: 'Premium' },
            ].map((f) => (
              <article key={f.title} className="relative rounded-2xl bg-white p-7 shadow-md transition hover:-translate-y-1 hover:shadow-lg">
                {f.badge && (
                  <span className="absolute right-4 top-4 rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-bold uppercase text-violet-700">
                    {f.badge}
                  </span>
                )}
                <f.icon className="text-violet-700" size={24} />
                <h3 className="mt-5 font-display text-lg font-bold">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* AI Highlight */}
      <section className="bg-violet-950 py-20 text-white md:py-28">
        <div className="mx-auto grid max-w-[1160px] items-center gap-12 px-6 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
              <Brain size={16} /> Inteligência Artificial
            </span>
            <h2 className="mt-6 font-display text-3xl font-bold tracking-tight md:text-5xl">
              Conheça a <span className="text-violet-300">Muse IA</span>
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-violet-200">
              Sua parceira de escrita que entende o contexto da sua história.
              Peça ideias de enredo, desenvolva personagens, supere bloqueios criativos
              — tudo baseado nos seus capítulos e notas.
            </p>
            <ul className="mt-8 space-y-3 text-violet-100">
              {[
                'Sugestões de plot e reviravoltas',
                'Desenvolvimento de arcos de personagem',
                'Resolução de bloqueio criativo',
                'Diálogos e cenas contextualizadas',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <Check size={18} className="text-emerald-400" /> {item}
                </li>
              ))}
            </ul>
            <Link
              href="/registro"
              className="mt-10 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bold text-violet-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-violet-50"
            >
              Experimente grátis <ArrowRight size={18} />
            </Link>
          </div>
          <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm md:p-8">
            <div className="space-y-4">
              <div className="rounded-xl bg-white/10 p-4">
                <p className="text-xs font-semibold text-violet-300">Você perguntou:</p>
                <p className="mt-2 text-sm text-violet-100">&ldquo;Como posso criar tensão no reencontro entre Lia e o antagonista no capítulo 15?&rdquo;</p>
              </div>
              <div className="rounded-xl bg-violet-700/40 p-4">
                <p className="text-xs font-semibold text-violet-300">Muse IA sugeriu:</p>
                <p className="mt-2 text-sm leading-relaxed text-violet-100">
                  &ldquo;Considere revelar o reencontro de forma indireta — Lia reconhece o perfume antes de ver o rosto.
                  Isso cria uma camada sensorial que amplifica a tensão. Você pode intercalar flashbacks curtos
                  do capítulo 3 para contrastar quem ele era com quem se tornou.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="depoimentos" className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-[1160px] px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[.2em] text-violet-700">Quem usa, aprova</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Histórias reais de quem já escreve com o Meu Livro
            </h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <article key={t.name} className="rounded-2xl bg-[#faf8f5] p-7 shadow-sm">
                <Quote size={24} className="text-violet-300" />
                <p className="mt-4 text-sm leading-relaxed text-stone-700">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-violet-100 font-display text-sm font-bold text-violet-700">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{t.name}</p>
                    <p className="text-xs text-stone-500">{t.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="planos" className="bg-[#faf8f5] py-20 md:py-28">
        <div className="mx-auto max-w-[1100px] px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[.2em] text-violet-700">Planos simples</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Comece grátis. Evolua quando estiver pronto.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-stone-600">
              Sem surpresas, sem letras miúdas. Cancele quando quiser.
            </p>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {/* Free Plan */}
            <div className="rounded-2xl bg-white p-8 shadow-md md:p-10">
              <h3 className="text-xl font-bold">Gratuito</h3>
              <p className="mt-1 text-sm text-stone-500">Para começar sua jornada</p>
              <p className="mt-6 text-5xl font-bold">R$ 0</p>
              <p className="mt-1 text-sm text-stone-500">Para sempre</p>
              <Link
                href="/registro"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-100 px-6 py-3.5 font-semibold text-stone-700 transition hover:bg-stone-200"
              >
                Começar grátis
              </Link>
              <ul className="mt-8 space-y-3">
                {freeFeatures.map((f) => (
                  <li key={f.text} className={`flex items-center gap-3 text-sm ${f.included ? 'text-stone-700' : 'text-stone-400'}`}>
                    {f.included ? <Check size={16} className="text-emerald-600" /> : <X size={16} className="text-stone-300" />}
                    {f.text}
                  </li>
                ))}
              </ul>
            </div>

            {/* Premium Plan */}
            <div className="relative overflow-hidden rounded-2xl bg-violet-800 p-8 text-white shadow-2xl md:p-10">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-violet-600/30" />
              <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-violet-600/20" />
              <div className="relative">
                <div className="flex items-center gap-2">
                  <Crown size={20} className="text-amber-300" />
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">MAIS POPULAR</span>
                </div>
                <h3 className="mt-4 text-xl font-bold">Premium</h3>
                <p className="mt-1 text-sm text-violet-200">Tudo para escritores sérios</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-5xl font-bold">R$ 12</span>
                  <span className="text-lg text-violet-200">/mês</span>
                </div>
                <p className="mt-1 text-sm text-violet-200">Cancele a qualquer momento</p>
                <Link
                  href="/registro"
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bold text-violet-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-violet-50"
                >
                  <Crown size={18} /> Assinar Premium
                </Link>
                <ul className="mt-8 space-y-3">
                  {premiumFeatures.map((f) => (
                    <li key={f.text} className="flex items-center gap-3 text-sm text-violet-100">
                      <Check size={16} className="text-emerald-400" /> {f.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-[800px] px-6 text-center">
          <Heart size={40} className="mx-auto text-violet-300" />
          <h2 className="mt-6 font-display text-3xl font-bold tracking-tight md:text-5xl">
            Sua história está esperando por você.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-stone-600">
            Milhares de escritores já deram o primeiro passo. O próximo capítulo da sua vida
            como autor começa agora — e começa grátis.
          </p>
          <Link
            href="/registro"
            className="mt-10 inline-flex items-center gap-2 rounded-xl bg-violet-700 px-10 py-4 text-lg font-bold text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-violet-800"
          >
            Criar minha conta grátis <ArrowRight size={20} />
          </Link>
          <p className="mt-4 text-sm text-stone-500">Leva menos de 30 segundos. Sem cartão de crédito.</p>
        </div>
      </section>

      {/* FAQ Minimal */}
      <section className="border-t border-stone-200 bg-[#faf8f5] py-20">
        <div className="mx-auto max-w-[800px] px-6">
          <h2 className="text-center font-display text-2xl font-bold">Perguntas frequentes</h2>
          <div className="mt-10 space-y-6">
            {[
              { q: 'Posso usar o Meu Livro de graça?', a: 'Sim! O plano gratuito permite criar 1 projeto de livro completo, usar o editor essencial e exportar em PDF. Você pode escrever sem limite de tempo.' },
              { q: 'Meus manuscritos ficam privados?', a: 'Absolutamente. Cada conta é isolada. Ninguém — nem mesmo nossa equipe — tem acesso aos seus textos. Seus dados são criptografados.' },
              { q: 'Posso cancelar o Premium a qualquer momento?', a: 'Sim. Sem multas, sem burocracia. Ao cancelar, você continua com acesso até o fim do período pago e depois volta ao plano gratuito.' },
              { q: 'O PDF serve para publicar na Amazon KDP?', a: 'Sim! O PDF Premium é formatado com margens corretas para gráfica e plataformas como Amazon KDP, nos tamanhos A4, A5 e 14x21cm (formato bolso).' },
              { q: 'Funciona no celular?', a: 'Sim. O Meu Livro é totalmente responsivo e funciona em computadores, tablets e smartphones. Em breve, teremos um app dedicado na Play Store.' },
            ].map((faq) => (
              <details key={faq.q} className="group rounded-xl bg-white p-5 shadow-sm">
                <summary className="flex cursor-pointer items-center justify-between font-display font-semibold">
                  {faq.q}
                  <ChevronRight size={18} className="text-stone-400 transition group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-10">
        <div className="mx-auto flex max-w-[1160px] flex-col items-center justify-between gap-4 px-6 text-sm text-stone-500 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-violet-700 text-white">
              <BookOpen size={14} />
            </span>
            <span className="font-display font-bold text-stone-700">Meu Livro</span>
          </div>
          <p>© 2026 Meu Livro. Feito com {' '}<Heart size={12} className="inline text-red-400" />{' '} para escritores.</p>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-violet-700">Entrar</Link>
            <Link href="/registro" className="hover:text-violet-700">Criar conta</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
