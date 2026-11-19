import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';

let nestApp: INestApplication | null = null;
let expressServer: any = null;

async function bootstrap(): Promise<INestApplication> {
  if (nestApp) return nestApp;

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

  nestApp = app;
  expressServer = app.getHttpAdapter().getInstance();

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`DataChance CO Backend escuchando en el puerto ${port}`);
  logger.log(`API disponible con prefijo /api`);
  return app;
}

// Iniciar bootstrap inmediatamente tanto para standalone como para Fluid Compute
const bootstrapPromise = bootstrap().catch((err) => {
  console.error('Error fatal durante bootstrap de NestJS:', err);
  throw err;
});

// Handler exportado en caso de invocación directa como Serverless Function
const handler = async (req: any, res: any) => {
  try {
    await bootstrapPromise;
    if (req.url && !req.url.startsWith('/api')) {
      req.url = '/api' + req.url;
    }
    return expressServer(req, res);
  } catch (err: any) {
    console.error('SERVERLESS BOOTSTRAP HANDLER ERROR:', err);
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
