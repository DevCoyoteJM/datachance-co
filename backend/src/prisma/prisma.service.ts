import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    if (!process.env.DATABASE_URL) {
      this.logger.warn('ADVERTENCIA: DATABASE_URL no está definida en process.env');
    }
    try {
      await this.$connect();
      this.logger.log('Conexión a Neon PostgreSQL inicializada con éxito');
    } catch (err: any) {
      this.logger.error('Error conectando a Prisma en startup:', err?.message || err);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
