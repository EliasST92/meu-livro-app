import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';

const schema=z.object({name:z.string().trim().min(2).max(80),email:z.string().email().transform(v=>v.toLowerCase()),password:z.string().min(8).max(100)});
export async function POST(request:Request){try{const body=await request.json().catch(()=>({}));const parsed=schema.safeParse(body);if(!parsed.success)return NextResponse.json({error:'Revise os dados informados.'},{status:400});const exists=await prisma.user.findUnique({where:{email:parsed.data.email}});if(exists)return NextResponse.json({error:'Este e-mail já possui uma conta.'},{status:409});const passwordHash=await bcrypt.hash(parsed.data.password,12);await prisma.user.create({data:{name:parsed.data.name,email:parsed.data.email,passwordHash}});return NextResponse.json({success:true},{status:201});}catch(error){console.error('Erro no cadastro',error);return NextResponse.json({error:'Não foi possível criar sua conta.'},{status:500});}}
