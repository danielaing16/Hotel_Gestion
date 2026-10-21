import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('ApiGatewayBootstrap');
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para integración con Frontend Web y Móvil
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
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

  // Configuración de Swagger / OpenAPI para el API Gateway
  const config = new DocumentBuilder()
    .setTitle('🚪 Hotel Cloud Microservices - API Gateway')
    .setDescription(
      `Punto de entrada unificado y enrutador central para el ecosistema de microservicios de reservas hoteleras.
      
### Enrutamiento de Microservicios:
- **Autenticación & Usuarios:** \`/api/auth/*\` ➡️ \`auth-service:3001\`
- **Hoteles:** \`/api/hotels/*\` ➡️ \`hotels-service:3002\`
- **Habitaciones:** \`/api/rooms/*\` ➡️ \`rooms-service:3003\`
- **Disponibilidad & Locks:** \`/api/availability/*\` ➡️ \`availability-service:3004\`
- **Reservas (Saga):** \`/api/bookings/*\` ➡️ \`booking-service:3005\`
- **Pagos & Webhooks:** \`/api/payments/*\` ➡️ \`payment-service:3006\`
- **Monitoreo & Salud:** \`/health\` y \`/health/services\`
      `,
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description:
          'Ingresa tu token JWT obtenido en /api/auth/login para acceder a rutas protegidas',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'Hotel API Gateway Docs',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`=======================================================`);
  logger.log(`🚪 API Gateway activo y escuchando en: http://localhost:${port}`);
  logger.log(`📖 Documentación Swagger UI en: http://localhost:${port}/docs`);
  logger.log(`🩺 Health Check disponible en: http://localhost:${port}/health`);
  logger.log(`=======================================================`);
}

bootstrap();
