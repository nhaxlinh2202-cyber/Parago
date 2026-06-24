import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super();
    this.$use(async (params, next) => {
      let retries = 0;
      const maxRetries = 3;
      while (retries <= maxRetries) {
        try {
          return await next(params);
        } catch (error: any) {
          // P2024: Connection timeout, P1017: Connection closed
          if (error.code === 'P2024' || error.code === 'P1017') {
            retries++;
            if (retries > maxRetries) {
              this.logger.error(`Prisma error ${error.code}, max retries reached: ${error.message}`);
              throw error;
            }
            this.logger.warn(`Prisma error ${error.code}, retrying ${retries}/${maxRetries} in 1s...`);
            await delay(1000);
          } else {
            throw error;
          }
        }
      }
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
