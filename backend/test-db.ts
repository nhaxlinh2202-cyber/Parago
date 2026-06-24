import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("DATABASE_URL:", process.env.DATABASE_URL);
  console.log("DIRECT_URL:", process.env.DIRECT_URL);
  
  try {
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users in DB.`);
    users.forEach(u => console.log(`- ${u.name} (${u.email})`));
  } catch (e) {
    console.error("Failed to query DB", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
