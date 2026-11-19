import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';

let appPromise: Promise<INestApplication> | null = null;
let expressInstance: any = null;

async function bootstrap(): Promise<INestApplication> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

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
  expressInstance = app.getHttpAdapter().getInstance();
  logger.log('DataChance CO Backend NestJS inicializado con éxito');
  return app;
}

// Serverless Handler para Vercel
const handler = async (req: any, res: any) => {
  try {
    if (!appPromise) {
      appPromise = bootstrap();
    }
    await appPromise;

    if (req.url && !req.url.startsWith('/api')) {
      req.url = '/api' + req.url;
    }

    return expressInstance(req, res);
  } catch (err: any) {
    console.error('SERVERLESS HANDLER ERROR:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'Backend Serverless Error',
          message: err?.message || String(err),
          stack: err?.stack,
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

// Para desarrollo local fuera de Vercel
if (!process.env.VERCEL) {
  bootstrap().then((app) => {
    const port = Number(process.env.PORT) || 3001;
    app.listen(port, '0.0.0.0', () => {
      const logger = new Logger('Bootstrap');
      logger.log(`DataChance CO Backend escuchando en http://localhost:${port}`);
      logger.log(`API disponible con prefijo /api`);
    });
  });
}
