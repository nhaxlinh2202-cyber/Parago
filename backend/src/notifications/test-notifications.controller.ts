import { Controller, Post, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationType } from '@prisma/client';

@Controller('test-notifications')
export class TestNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async testEmit(@Body() body: { userId: string, type: NotificationType }) {
    await this.notificationsService.createNotification(
      body.userId,
      'Test Title',
      'Test Message',
      body.type,
      '/test'
    );
    return { success: true };
  }
}
