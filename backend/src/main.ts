import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, INestApplication } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import express, { Express } from 'express';

const server: Express = express();
let nestApp: INestApplication | null = null;

export async function createNestServer(expressInstance: Express): Promise<INestApplication> {
  if (nestApp) return nestApp;

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
}

// Handler exportado para Vercel Serverless Functions
export default async function handler(req: any, res: any) {
  await createNestServer(server);
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }
  return server(req, res);
}

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
