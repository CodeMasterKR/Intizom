import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import cookieParser = require('cookie-parser');
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Serve uploaded files as static assets
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT') ?? 4000;
  const frontendUrl = config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';

  // ─── Middleware ──────────────────────────────────────────────────────────
  app.use(cookieParser());

  // ─── CORS ────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // ─── Prefix ──────────────────────────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ─── Validation ──────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ─── Exception filter ────────────────────────────────────────────────────
  app.useGlobalFilters(new AllExceptionsFilter());

  // ─── Swagger ─────────────────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Intizom API')
    .setDescription('Odatlar, vazifalar va maqsadlar boshqaruvi API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Autentifikatsiya')
    .addTag('Users', 'Foydalanuvchilar')
    .addTag('Habits', 'Odatlar')
    .addTag('Tasks', 'Vazifalar')
    .addTag('Goals', 'Maqsadlar')
    .addTag('Analytics', 'Statistika')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      defaultModelsExpandDepth: 2,
    },
  });

  await app.listen(port);
  Logger.log(`🚀 Server: http://localhost:${port}/api`, 'Bootstrap');
  Logger.log(`📚 Swagger: http://localhost:${port}/api/docs`, 'Bootstrap');
}

bootstrap();
