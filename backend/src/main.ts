import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

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

  const PORT = process.env.PORT ?? 3000;
  await app.listen(PORT);
  logger.log(`DataChance CO Backend escuchando en el puerto ${PORT}`);
  logger.log(`API disponible en http://localhost:${PORT}/api`);
}

bootstrap();
