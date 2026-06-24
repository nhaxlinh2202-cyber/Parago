import { Controller, Get, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AdminService } from '../admin.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/sos-alerts')
export class AdminSOSController {
  constructor(private readonly adminService: AdminService) {}

  @Roles('ADMIN', 'MODERATOR')
  @Get()
  async getActiveSOS() {
    return this.adminService.getActiveSOS();
  }

  @Roles('ADMIN', 'MODERATOR')
  @Patch(':id/resolve')
  async resolveSOS(
    @Param('id') id: string,
    @Body('status') status: 'RESOLVED' | 'FALSE_ALARM',
    @Request() req: any
  ) {
    return this.adminService.resolveSOS(id, status, req.user.id);
  }
}
