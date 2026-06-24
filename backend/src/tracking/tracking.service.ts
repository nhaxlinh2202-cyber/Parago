import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Redis from 'ioredis';

export interface LocationUpdate {
  userId: string;
  rideId: string;
  lat: number;
  lng: number;
  timestamp: number;
}

@Injectable()
export class TrackingService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TrackingService.name);
  private redisClient: Redis;

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error('REDIS_URL is not set in environment variables. Redis is strictly required for Live Tracking.');
    }

    this.redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3, // Fail fast if it cannot connect
      retryStrategy(times) {
        if (times > 3) {
          return null; // Stop retrying, let it fail
        }
        return Math.min(times * 50, 2000);
      }
    });

    this.redisClient.on('error', (err) => {
      this.logger.error('CRITICAL: Redis connection error:', err);
      // We don't swallow the error. In production, this would trigger alerts.
    });

    this.redisClient.on('connect', () => {
      this.logger.log('Successfully connected to Redis for live tracking');
    });
  }

  onModuleDestroy() {
    if (this.redisClient) {
      this.redisClient.disconnect();
    }
  }

  async setLocation(userId: string, rideId: string, lat: number, lng: number) {
    if (!this.redisClient || this.redisClient.status !== 'ready') {
      this.logger.warn('Redis is not ready, location update dropped.');
      return;
    }

    const key = `tracking:ride:${rideId}:user:${userId}`;
    const payload = JSON.stringify({ userId, rideId, lat, lng, timestamp: Date.now() });

    // 30 seconds TTL
    await this.redisClient.setex(key, 30, payload);
  }

  async getRideLocations(rideId: string): Promise<LocationUpdate[]> {
    if (!this.redisClient || this.redisClient.status !== 'ready') {
      return [];
    }

    const keys = await this.redisClient.keys(`tracking:ride:${rideId}:user:*`);
    if (keys.length === 0) return [];
    
    const values = await this.redisClient.mget(keys);
    return values.filter(v => v).map(v => JSON.parse(v!));
  }

  // SOS Logic: Save to DB
  async triggerSOS(rideId: string, userId: string, lat: number, lng: number) {
    this.logger.warn(`SOS Triggered: Ride ${rideId}, User ${userId} at [${lat}, ${lng}]`);
    return this.prisma.sOSAlert.create({
      data: {
        rideId,
        triggeredByUserId: userId,
        lat,
        lng,
        status: 'ACTIVE',
      },
      include: {
        triggeredByUser: { select: { id: true, name: true, phone: true } },
        ride: { select: { vehicleName: true, pickupLocation: true, destinationLocation: true } }
      }
    });
  }

  async getActiveSOSAlerts() {
    return this.prisma.sOSAlert.findMany({
      where: { status: 'ACTIVE' },
      include: {
        triggeredByUser: { select: { id: true, name: true, phone: true } },
        ride: {
          select: {
            driver: { select: { id: true, name: true, phone: true } },
            vehicleName: true,
            vehicleType: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
