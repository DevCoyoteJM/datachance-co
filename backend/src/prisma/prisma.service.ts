import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

// Detección automática del binario Query Engine para Vercel Linux / AWS Lambda y Windows local
function configurePrismaEngine() {
  const isWin = process.platform === 'win32';
  const engineNames = isWin
    ? ['query_engine-windows.dll.node']
    : [
        'libquery_engine-rhel-openssl-3.0.x.so.node',
        'libquery_engine-rhel-openssl-1.0.x.so.node',
      ];
  for (const name of engineNames) {
    const searchDirs = [
      __dirname,
      process.cwd(),
      path.join(process.cwd(), 'dist'),
      path.join(process.cwd(), 'backend', 'dist'),
      path.join(process.cwd(), 'backend'),
      path.join(process.cwd(), 'node_modules', '.prisma', 'client'),
      path.join('/tmp', 'prisma-engines'),
    ];
    for (const dir of searchDirs) {
      const fullPath = path.join(dir, name);
      if (fs.existsSync(fullPath)) {
        process.env.PRISMA_QUERY_ENGINE_LIBRARY = fullPath;
        return fullPath;
      }
    }
  }
  return null;
}

configurePrismaEngine();

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
