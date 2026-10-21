import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import configuration from './config/configuration';
import { HealthModule } from './health/health.module';
import { ProxyModule } from './proxy/proxy.module';
import { ReverseProxyMiddleware } from './proxy/proxy.middleware';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    // Variables de configuración globales
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Token JWT centralizado
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
      }),
    }),

    // Rate Limiting global (Protección anti-DDoS / fuerza bruta)
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('throttler.ttl') * 1000,
          limit: configService.get<number>('throttler.limit'),
        },
      ],
    }),

    HealthModule,
    ProxyModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 1. Logger HTTP para todas las peticiones
    consumer.apply(LoggingMiddleware).forRoutes('*');

    // 2. Enrutamiento del proxy inverso para todas las rutas /api/*
    consumer
      .apply(ReverseProxyMiddleware)
      .forRoutes({ path: 'api/*', method: RequestMethod.ALL });
  }
}
