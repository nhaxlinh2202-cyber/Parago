import { Module } from '@nestjs/common';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminRidesController } from './controllers/admin-rides.controller';
import { AdminSOSController } from './controllers/admin-sos.controller';
import { AdminStatsController } from './controllers/admin-stats.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    AdminUsersController,
    AdminRidesController,
    AdminSOSController,
    AdminStatsController,
  ],
  providers: [AdminService],
})
export class AdminModule {}
