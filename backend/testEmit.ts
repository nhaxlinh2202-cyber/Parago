import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const n = await prisma.notification.create({
    data: {
      userId: 'f2202528-ec2b-42eb-bf60-f13a23d7740b', // Connected user ID from logs
      title: 'Yêu cầu được chấp nhận! 🎉',
      message: 'Tài xế Nguyễn Văn A đã chấp nhận yêu cầu ghép xe của bạn',
      type: 'RIDE_ACCEPTED',
      link: '/rides'
    }
  });
  console.log('Emitted notification: ', n);
}

run().catch(console.error).finally(() => prisma.$disconnect());
