import { Controller, Get, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import { AdminService } from '../admin.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { SystemRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly adminService: AdminService) {}

  @Roles('ADMIN', 'MODERATOR')
  @Get()
  async getUsers(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string
  ) {
    return this.adminService.getUsers(Number(page) || 1, Number(limit) || 10, search);
  }

  @Roles('ADMIN', 'MODERATOR')
  @Patch(':id/verify')
  async verifyUser(@Param('id') id: string) {
    return this.adminService.verifyUser(id);
  }

  @Roles('ADMIN', 'MODERATOR')
  @Patch(':id/ban')
  async banUser(@Param('id') id: string, @Body('reason') reason: string) {
    return this.adminService.banUser(id, reason);
  }

  @Roles('ADMIN', 'MODERATOR')
  @Patch(':id/unban')
  async unbanUser(@Param('id') id: string) {
    return this.adminService.unbanUser(id);
  }

  @Roles('ADMIN')
  @Patch(':id/role')
  async changeRole(@Param('id') id: string, @Body('role') role: SystemRole | null) {
    return this.adminService.changeUserRole(id, role);
  }
}
