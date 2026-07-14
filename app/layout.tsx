import type { Metadata } from 'next';
import { DM_Sans, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { ChunkLoadErrorHandler } from '@/components/chunk-load-error-handler';
import { Providers } from '@/components/providers';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' });
const jakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-display' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? 'http://localhost:3000'),
  title: { default: 'Meu Livro — Escreva sua história', template: '%s | Meu Livro' },
  description: 'Planeje, escreva e exporte seu livro com foco, organização e acabamento profissional.',
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' },
  openGraph: { title: 'Meu Livro', description: 'Seu estúdio de escrita, do primeiro rascunho ao livro pronto.', images: ['/og-image.png'], locale: 'pt_BR', type: 'website' },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR" suppressHydrationWarning><head><script src="https://apps.abacus.ai/chatllm/appllm-lib.js"></script></head><body className={`${dmSans.variable} ${jakartaSans.variable} ${jetbrainsMono.variable} font-sans`}><Providers><ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>{children}<Toaster richColors /><ChunkLoadErrorHandler /></ThemeProvider></Providers></body></html>;
}
