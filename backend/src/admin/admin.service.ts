import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SystemRole } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // --- USERS ---
  async getUsers(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    
    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, email: true, university: true,
          verified: true, systemRole: true, isBanned: true,
          createdAt: true, avatarUrl: true,
        }
      }),
      this.prisma.user.count({ where: whereClause })
    ]);

    return { data: users, total, page, limit };
  }

  async verifyUser(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { verified: true },
      select: { id: true, name: true, verified: true }
    });
  }

  async banUser(id: string, reason: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isBanned: true, banReason: reason },
      select: { id: true, name: true, isBanned: true, banReason: true }
    });
  }

  async unbanUser(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isBanned: false, banReason: null },
      select: { id: true, name: true, isBanned: true }
    });
  }

  async changeUserRole(id: string, role: SystemRole | null) {
    return this.prisma.user.update({
      where: { id },
      data: { systemRole: role },
      select: { id: true, name: true, systemRole: true }
    });
  }

  // --- RIDES ---
  async getRides(page = 1, limit = 10, status?: string) {
    const skip = (page - 1) * limit;
    
    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    const [rides, total] = await Promise.all([
      this.prisma.ride.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { driver: { select: { id: true, name: true, email: true } } }
      }),
      this.prisma.ride.count({ where: whereClause })
    ]);

    return { data: rides, total, page, limit };
  }

  async cancelRide(id: string) {
    return this.prisma.ride.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  // --- SOS ALERTS ---
  async getActiveSOS() {
    return this.prisma.sOSAlert.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      include: {
        triggeredByUser: { select: { id: true, name: true, phone: true } },
        ride: { select: { pickupLocation: true, destinationLocation: true, driver: { select: { name: true, phone: true } } } }
      }
    });
  }

  async resolveSOS(id: string, status: 'RESOLVED' | 'FALSE_ALARM', adminId: string) {
    return this.prisma.sOSAlert.update({
      where: { id },
      data: { 
        status, 
        resolvedAt: new Date(),
        resolvedByAdminId: adminId
      }
    });
  }

  // --- STATS ---
  async getDashboardStats() {
    const [totalUsers, activeRides, newUsersToday] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.ride.count({ where: { status: 'ACTIVE' } }),
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0,0,0,0))
          }
        }
      })
    ]);

    return {
      totalUsers,
      activeRides,
      newUsersToday,
      // More complex stats like revenue by month require raw SQL or grouping.
      // We will provide a simple mock for the charts for now as requested.
      revenue: 37480000 // mock from frontend
    };
  }
}
