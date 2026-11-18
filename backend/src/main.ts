import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, INestApplication } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';

const express = require('express');
const server = express();
let nestApp: INestApplication | null = null;
let initError: any = null;

export async function createNestServer(expressInstance: any): Promise<INestApplication> {
  if (nestApp) return nestApp;
  if (initError) throw initError;

  try {
    const adapter = new ExpressAdapter(expressInstance);
    const app = await NestFactory.create(AppModule, adapter);

    // Prefijo global para todas las rutas de la API (/api/...)
    app.setGlobalPrefix('api');

    // Habilitar CORS para permitir peticiones desde el frontend
    app.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    // Validación global de DTOs
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
    nestApp = app;
    return app;
  } catch (err) {
    initError = err;
    console.error('Error fatal al inicializar NestJS:', err);
    throw err;
  }
}

// Handler exportado para Vercel Serverless Functions
export default async function handler(req: any, res: any) {
  try {
    await createNestServer(server);
    if (req.url && !req.url.startsWith('/api')) {
      req.url = '/api' + req.url;
    }
    return server(req, res);
  } catch (err: any) {
    console.error('SERVERLESS HANDLER ERROR:', err);
    return res.status(500).json({
      error: 'NestJS Bootstrap Error on Vercel',
      message: err?.message || String(err),
      stack: err?.stack,
      envCheck: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasDirectUrl: !!process.env.DIRECT_URL,
        nodeEnv: process.env.NODE_ENV,
        databaseUrlLength: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0,
      },
    });
  }
}

export { handler };

// Para ejecución local fuera de Vercel
if (!process.env.VERCEL) {
  async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await createNestServer(server);
    const PORT = process.env.PORT || 3001;
    await app.listen(PORT);
    logger.log(`DataChance CO Backend escuchando en http://localhost:${PORT}`);
    logger.log(`API disponible en http://localhost:${PORT}/api`);
  }
  bootstrap();
}
