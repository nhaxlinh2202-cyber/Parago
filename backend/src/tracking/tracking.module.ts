import { Module } from '@nestjs/common';
import { TrackingGateway } from './tracking.gateway';
import { TrackingService } from './tracking.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [],
  providers: [TrackingGateway, TrackingService],
  exports: [TrackingService],
})
export class TrackingModule {}
