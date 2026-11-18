import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  async health() {
    let dbStatus = 'disconnected';
    let lotteryCount = 0;
    try {
      lotteryCount = await this.prisma.lottery.count();
      dbStatus = 'connected';
    } catch (err: any) {
      dbStatus = `error: ${err.message}`;
    }

    return {
      status: 'ok',
      service: 'DataChance CO API',
      database: dbStatus,
      lotteryCount,
      timestamp: new Date().toISOString(),
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasDirectUrl: !!process.env.DIRECT_URL,
        nodeEnv: process.env.NODE_ENV,
      },
    };
  }
}
