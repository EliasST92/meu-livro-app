import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: { id: string; isPremium: boolean; role: string } & DefaultSession['user'];
  }
  interface User { isPremium?: boolean; role?: string }
}
declare module 'next-auth/jwt' {
  interface JWT { id?: string; isPremium?: boolean; role?: string }
}
