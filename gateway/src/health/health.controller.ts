import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Public } from '../common/decorators/public.decorator';
import { firstValueFrom } from 'rxjs';

@ApiTags('Gateway Health & Monitoreo')
@Controller('health')
export class HealthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Estado general del API Gateway',
    description: 'Retorna el estado de operatividad del Gateway, uptime y mapa de servicios configurados.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Gateway en línea y saludable',
  })
  getHealth() {
    return {
      status: 'UP',
      gateway: 'hotel_api_gateway',
      environment: this.configService.get<string>('environment'),
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      routes: {
        auth: `${this.configService.get<string>('services.auth')}/api/auth`,
        hotels: `${this.configService.get<string>('services.hotels')}/api/hotels`,
        rooms: `${this.configService.get<string>('services.rooms')}/api/rooms`,
        availability: `${this.configService.get<string>('services.availability')}/api/availability`,
        bookings: `${this.configService.get<string>('services.bookings')}/api/bookings`,
        payments: `${this.configService.get<string>('services.payments')}/api/payments`,
      },
    };
  }

  @Public()
  @Get('services')
  @ApiOperation({
    summary: 'Monitoreo de conectividad con microservicios',
    description: 'Verifica la disponibilidad en tiempo real de los microservicios downstream registrados.',
  })
  async checkServices() {
    const services = [
      {
        name: 'auth-service',
        url: this.configService.get<string>('services.auth'),
        healthCheckPath: '/api/docs',
      },
      {
        name: 'hotels-service',
        url: this.configService.get<string>('services.hotels'),
        healthCheckPath: '/api/docs',
      },
    ];

    const results = await Promise.all(
      services.map(async (svc) => {
        const start = Date.now();
        try {
          const res = await firstValueFrom(
            this.httpService.get(`${svc.url}${svc.healthCheckPath}`, {
              timeout: 3000,
            }),
          );
          return {
            service: svc.name,
            targetUrl: svc.url,
            status: 'ONLINE',
            latencyMs: Date.now() - start,
            httpStatus: res.status,
          };
        } catch (error) {
          return {
            service: svc.name,
            targetUrl: svc.url,
            status: 'OFFLINE',
            latencyMs: Date.now() - start,
            error: error.message,
          };
        }
      }),
    );

    return {
      timestamp: new Date().toISOString(),
      services: results,
    };
  }
}
