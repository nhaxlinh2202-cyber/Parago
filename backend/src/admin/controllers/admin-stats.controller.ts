import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminService } from '../admin.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/stats')
export class AdminStatsController {
  constructor(private readonly adminService: AdminService) {}

  @Roles('ADMIN', 'MODERATOR')
  @Get()
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }
}
