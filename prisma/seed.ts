import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('demo1234', 10);

  await prisma.user.upsert({
    where: { email: 'demo@france-os.com' },
    update: {},
    create: {
      email: 'demo@france-os.com',
      name: 'Demo User',
      passwordHash,
      role: 'ADMIN',
      plan: 'BUSINESS',
      locale: 'en',
    },
  });

  console.log('✅ Seeded demo user: demo@france-os.com / demo1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
