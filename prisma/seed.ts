import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Pczq13!!~~', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'jseprodi@gmail.com' },
    update: {},
    create: {
      email: 'jseprodi@gmail.com',
      name: 'jseprodi',
      password: hashedPassword,
    },
  });

  console.log({ user });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }); 