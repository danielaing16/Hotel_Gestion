import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('AuthServiceBootstrap');
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para integración con Frontend y Gateway
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Validaciones globales automáticas con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuración de Swagger / OpenAPI
  const config = new DocumentBuilder()
    .setTitle('🏨 Sistema Hotelero - Microservicio de Usuarios y Autenticación')
    .setDescription(
      'Documentación interactiva de la API de gestión de usuarios, inicio de sesión seguro, emisión y validación de tokens JWT y control de acceso basado en roles (RBAC).',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa tu token JWT obtenido en el endpoint /api/auth/login',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Auth Service API Docs',
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`🚀 Microservicio Auth Service ejecutándose en: http://localhost:${port}`);
  logger.log(`📖 Documentación Swagger UI disponible en: http://localhost:${port}/api/docs`);
}

bootstrap();
