const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  console.log("User found:", user?.id);
  
  if (user) {
    // We can try to call ChatbotService manually or just print user.
    console.log("We have a user to test with.");
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
