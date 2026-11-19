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

// Handler serverless para Vercel Functions que espera el fin de la respuesta
const handler = (req: any, res: any) => {
  // Endpoint de diagnóstico rápido sin dependencias
  if (req.url && (req.url.endsWith('/ping') || req.url.includes('ping'))) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('PONG');
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    res.on('finish', resolve);
    res.on('close', resolve);
    res.on('error', reject);

    ensureNest()
      .then(() => {
        if (req.url && !req.url.startsWith('/api')) {
          req.url = '/api' + req.url;
        }
        expressApp(req, res);
      })
      .catch((err: any) => {
        console.error('Error inicializando NestJS en handler:', err);
        if (!res.headersSent) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              error: 'Backend Initialization Error',
              message: err?.message || String(err),
              stack: err?.stack || null,
            }),
          );
        }
        resolve(null);
      });
  });
};

export default handler;
// @ts-ignore
module.exports = handler;
// @ts-ignore
module.exports.default = handler;
