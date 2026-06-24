import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MapsModule } from './maps/maps.module';
import { TrackingModule } from './tracking/tracking.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { AdminModule } from './admin/admin.module';
import { RidesModule } from './rides/rides.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    PrismaModule, 
    UsersModule, 
    AuthModule,
    MapsModule,
    TrackingModule,
    ChatbotModule,
    AdminModule,
    RidesModule,
    MessagesModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule {}
