import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { NotificationsService } from './src/notifications/notifications.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const notificationsService = app.get(NotificationsService);
  
  const userId = 'f2202528-ec2b-42eb-bf60-f13a23d7740b';
  console.log(`Sending test notification to ${userId}...`);
  
  await notificationsService.createNotification(
    userId,
    'Yêu cầu được chấp nhận! 🎉',
    'Tài xế Nguyễn Văn A đã chấp nhận yêu cầu ghép xe của bạn',
    'RIDE_ACCEPTED',
    '/rides'
  );
  
  console.log('Notification sent successfully!');
  await app.close();
}

bootstrap();
