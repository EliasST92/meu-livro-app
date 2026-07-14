import { PrismaAdapter } from '@next-auth/prisma-adapter';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

const googleEnabled = !(process.env.GOOGLE_CLIENT_ID ?? '').startsWith('CONFIGURE_');

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'E-mail e senha',
      credentials: { email: { label: 'E-mail', type: 'email' }, password: { label: 'Senha', type: 'password' } },
      async authorize(credentials) {
        const email = credentials?.email?.trim?.()?.toLowerCase?.() ?? '';
        const password = credentials?.password ?? '';
        if (!email || !password) return null;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name, image: user.image, isPremium: user.isPremium, role: user.role };
      },
    }),
    ...(googleEnabled ? [GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
    })] : []),
  ],
  cookies: {
    state: { name: 'next-auth.state', options: { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' } },
    pkceCodeVerifier: { name: 'next-auth.pkce.code_verifier', options: { httpOnly: true, sameSite: 'lax', path: '/', secure: process.env.NODE_ENV === 'production' } },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      if (user) {
        token.isPremium = Boolean((user as { isPremium?: boolean })?.isPremium);
        token.role = (user as { role?: string })?.role ?? 'USER';
      } else if (token?.id) {
        const current = await prisma.user.findUnique({ where: { id: String(token.id) }, select: { isPremium: true, role: true } });
        token.isPremium = current?.isPremium ?? false;
        token.role = current?.role ?? 'USER';
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = String(token?.id ?? '');
        session.user.isPremium = Boolean(token?.isPremium);
        session.user.role = String(token?.role ?? 'USER');
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url?.startsWith?.('/')) return `${baseUrl}${url}`;
      try { if (new URL(url).origin === baseUrl) return url; } catch { return baseUrl; }
      return baseUrl;
    },
  },
};
