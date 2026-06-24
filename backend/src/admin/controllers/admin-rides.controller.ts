import { Controller, Get, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { AdminService } from '../admin.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/rides')
export class AdminRidesController {
  constructor(private readonly adminService: AdminService) {}

  @Roles('ADMIN', 'MODERATOR')
  @Get()
  async getRides(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('status') status: string
  ) {
    return this.adminService.getRides(Number(page) || 1, Number(limit) || 10, status);
  }

  @Roles('ADMIN', 'MODERATOR')
  @Patch(':id/cancel')
  async cancelRide(@Param('id') id: string) {
    return this.adminService.cancelRide(id);
  }
}
