import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('HotelsServiceBootstrap');
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Validaciones globales de DTOs con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Documentación Interactiva OpenAPI / Swagger
  const config = new DocumentBuilder()
    .setTitle('🏨 Sistema Hotelero - Microservicio de Gestión de Hoteles (Hotels Service)')
    .setDescription(
      'Documentación OpenAPI del núcleo del catálogo de sedes hoteleras: comodidades, georreferenciación, políticas de check-in/out, filtros de búsqueda y administración con RBAC.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description:
          'Ingresa tu token JWT con rol HOTEL_ADMIN obtenido desde el Gateway o Auth Service',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Hotels Service API Docs',
  });

  const port = process.env.PORT || 3002;
  await app.listen(port);

  logger.log(`🚀 Microservicio Hotels Service ejecutándose en: http://localhost:${port}`);
  logger.log(`📖 Documentación Swagger UI disponible en: http://localhost:${port}/api/docs`);
}

bootstrap();
