import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';

const express = require('express');
const server = express();
let isInitialized = false;

async function bootstrap() {
  if (isInitialized) return server;

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  // Prefijo global para todas las rutas de la API (/api/...)
  app.setGlobalPrefix('api');

  // Habilitar CORS para peticiones desde el frontend
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
  isInitialized = true;
  return server;
}

// Serverless Handler para Vercel
const handler = async (req: any, res: any) => {
  try {
    await bootstrap();
    if (req.url && !req.url.startsWith('/api')) {
      req.url = '/api' + req.url;
    }
    return server(req, res);
  } catch (err: any) {
    console.error('SERVERLESS BOOTSTRAP ERROR:', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Backend Bootstrap Error',
        message: err?.message || String(err),
        stack: err?.stack,
        env: {
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          hasDirectUrl: !!process.env.DIRECT_URL,
        },
      });
    }
  }
};

export default handler;
// @ts-ignore
module.exports = handler;
// @ts-ignore
module.exports.default = handler;

// Para ejecución local independiente fuera de Vercel
if (!process.env.VERCEL) {
  bootstrap().then(() => {
    const port = process.env.PORT || 3001;
    server.listen(port, () => {
      const logger = new Logger('Bootstrap');
      logger.log(`DataChance CO Backend escuchando en puerto ${port}`);
      logger.log(`API disponible con prefijo /api`);
    });
  });
}
