import { AuthForm } from '@/components/auth-form';
export default function RegisterPage(){const enabled=!(process.env.GOOGLE_CLIENT_ID??'').startsWith('CONFIGURE_');return <main className="grid min-h-screen place-items-center bg-[#f5f1eb] px-5 py-12"><AuthForm mode="registro" googleEnabled={enabled}/></main>}
