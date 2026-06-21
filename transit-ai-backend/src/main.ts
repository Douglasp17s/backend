import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';
import { validarVariablesEntorno } from './config/validacion-env';

// Serialización de BigInt para JSON (Prisma usa BigInt para IDs)
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
(BigInt.prototype as any).toJSON = function () {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return this.toString();
};

async function bootstrap() {
  // Validar variables de entorno al inicio
  validarVariablesEntorno();
  const app = await NestFactory.create(AppModule);

  // Configurar CORS restringido a origen especificado
  const origenPermitido = process.env.FRONTEND_URL || 'http://localhost:3000';
  app.enableCors({
    origin: origenPermitido,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  app.useWebSocketAdapter(new IoAdapter(app));

  const port = process.env.PORT ?? 4000;
  await app.listen(port);

  console.log(`🚍 Transit AI Backend corriendo en: http://localhost:${port}`);
  console.log(`🔌 WebSocket /viajes   → ws://localhost:${port}/viajes`);
  console.log(`🔌 WebSocket /incidentes → ws://localhost:${port}/incidentes`);
  console.log(
    `🔌 WebSocket /notificaciones → ws://localhost:${port}/notificaciones`,
  );
}

bootstrap();
