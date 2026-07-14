import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
async function main() {
  const testHash = await bcrypt.hash('johndoe123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: { passwordHash: testHash, role: 'ADMIN', name: 'Autor Teste' },
    create: { email: 'john@doe.com', passwordHash: testHash, role: 'ADMIN', name: 'Autor Teste' },
  });
  // Admin account
  const adminHash = await bcrypt.hash('MeuLivro@2026!', 12);
  await prisma.user.upsert({
    where: { email: 'admin@meulivro.app' },
    update: { passwordHash: adminHash, role: 'ADMIN', name: 'Administrador', isPremium: true },
    create: { email: 'admin@meulivro.app', passwordHash: adminHash, role: 'ADMIN', name: 'Administrador', isPremium: true },
  });
  const existing = await prisma.book.findFirst({ where: { userId: user.id, title: 'A Cidade de Vidro' } });
  if (!existing) {
    await prisma.book.create({
      data: {
        userId: user.id,
        title: 'A Cidade de Vidro',
        synopsis: 'Uma arquiteta descobre que os reflexos da cidade guardam memórias proibidas.',
        targetWordCount: 65000,
        chapters: { create: [
          { order: 1, title: 'O reflexo impossível', content: 'A chuva desenhava caminhos no vidro quando Helena viu a primeira lembrança que não era sua.\n\nEla encostou a palma na janela. Do outro lado, a cidade respirou.', wordCount: 27 },
          { order: 2, title: 'Mapas de memória', content: '', wordCount: 0 },
          { order: 3, title: 'A torre sem sombra', content: '', wordCount: 0 },
        ] },
        characters: { create: [{ name: 'Helena Vale', archetype: 'Exploradora', biography: 'Arquiteta especializada em restauro urbano.', goal: 'Descobrir a origem das memórias nos reflexos.', conflict: 'Cada descoberta apaga uma lembrança pessoal.' }] },
        worldNotes: { create: [{ title: 'Regras dos reflexos', content: 'Vidros antigos armazenam emoções intensas. Apenas Helena consegue atravessar essas memórias.' }] },
        structureTimeline: { create: [
          { order: 1, act: 'Ato I', description: 'Helena testemunha uma memória impossível e aceita investigar.' },
          { order: 2, act: 'Ato II', description: 'As memórias revelam uma conspiração ligada à fundação da cidade.' },
          { order: 3, act: 'Ato III', description: 'Helena precisa escolher entre a verdade coletiva e suas próprias lembranças.' },
        ] },
      },
    });
  }
}
main().catch((error) => { console.error(error); process.exit(1); }).finally(async () => prisma.$disconnect());
