import 'reflect-metadata';
import * as http from 'http';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, INestApplication } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';

const express = require('express');
const expressApp = express();

let nestPromise: Promise<INestApplication> | null = null;

async function bootstrap(): Promise<INestApplication> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

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
  logger.log('DataChance CO Backend NestJS inicializado con éxito');
  return app;
}

function ensureNest(): Promise<INestApplication> {
  if (!nestPromise) {
    nestPromise = bootstrap();
  }
  return nestPromise;
}

// Iniciar NestJS inmediatamente en segundo plano
ensureNest().catch((err) => {
  console.error('Error durante la inicialización de NestJS:', err);
});

// Servidor HTTP local (en desarrollo / local no-Vercel)
if (!process.env.VERCEL) {
  const server = http.createServer(expressApp);
  const port = Number(process.env.PORT) || 3001;

  server.listen(port, '0.0.0.0', () => {
    const logger = new Logger('Bootstrap');
    logger.log(`DataChance CO Backend escuchando en http://0.0.0.0:${port}`);
    logger.log(`API disponible con prefijo /api`);
  });
}

// Handler serverless para Vercel Functions
const handler = async (req: any, res: any) => {
  try {
    await ensureNest();
    if (req.url && !req.url.startsWith('/api')) {
      req.url = '/api' + req.url;
    }
    return expressApp(req, res);
  } catch (err: any) {
    console.error('Error crítico en handler serverless:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'Backend Initialization Error',
          message: err?.message || String(err),
          stack: err?.stack || null,
        }),
      );
    }
  }
};

export default handler;
// @ts-ignore
module.exports = handler;
// @ts-ignore
module.exports.default = handler;
