import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  await prisma.notification.deleteMany();
  console.log('Cleared Notification table');
}

run().catch(console.error).finally(() => prisma.$disconnect());
