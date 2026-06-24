import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log(users.map(u => ({ id: u.id, name: u.name })));
}

main().finally(() => prisma.$disconnect());
