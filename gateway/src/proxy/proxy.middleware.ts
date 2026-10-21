import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ReverseProxyMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ReverseProxyMiddleware.name);
  private authProxy: any;
  private hotelsProxy: any;
  private roomsProxy: any;
  private availabilityProxy: any;
  private bookingsProxy: any;
  private paymentsProxy: any;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.initProxies();
  }

  private initProxies() {
    const authTarget =
      this.configService.get<string>('services.auth') || 'http://auth-service:3001';
    const hotelsTarget =
      this.configService.get<string>('services.hotels') || 'http://hotels-service:3002';
    const roomsTarget =
      this.configService.get<string>('services.rooms') || 'http://rooms-service:3003';
    const availTarget =
      this.configService.get<string>('services.availability') || 'http://availability-service:3004';
    const bookingsTarget =
      this.configService.get<string>('services.bookings') || 'http://booking-service:3005';
    const paymentsTarget =
      this.configService.get<string>('services.payments') || 'http://payment-service:3006';

    this.authProxy = this.createServiceProxy('AuthService', authTarget);
    this.hotelsProxy = this.createServiceProxy('HotelsService', hotelsTarget);
    this.roomsProxy = this.createServiceProxy('RoomsService', roomsTarget);
    this.availabilityProxy = this.createServiceProxy('AvailabilityService', availTarget);
    this.bookingsProxy = this.createServiceProxy('BookingsService', bookingsTarget);
    this.paymentsProxy = this.createServiceProxy('PaymentsService', paymentsTarget);
  }

  private createServiceProxy(serviceName: string, target: string) {
    return createProxyMiddleware({
      target,
      changeOrigin: true,
      onProxyReq: (proxyReq, req: any) => {
        // Enriquecer cabeceras si el usuario tiene sesión válida
        if (req.user) {
          if (req.user.sub || req.user.id) {
            proxyReq.setHeader('x-user-id', req.user.sub || req.user.id);
          }
          if (req.user.email) {
            proxyReq.setHeader('x-user-email', req.user.email);
          }
          if (req.user.role) {
            proxyReq.setHeader('x-user-role', req.user.role);
          }
        }

        // Re-transmitir el cuerpo de la petición si ya fue parseado por Express en NestJS
        if (req.body && Object.keys(req.body).length > 0) {
          const bodyData = JSON.stringify(req.body);
          proxyReq.setHeader('Content-Type', 'application/json');
          proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        }
      },
      onError: (err: any, req: Request, res: any) => {
        this.logger.error(
          `[${serviceName}] Error de comunicación hacia ${target}${req.url}: ${err.message}`,
        );
        if (!res.headersSent) {
          res.status(503).json({
            statusCode: 503,
            timestamp: new Date().toISOString(),
            error: 'Service Unavailable',
            service: serviceName,
            message: `El microservicio downstream '${serviceName}' no se encuentra disponible temporalmente. Intente nuevamente en unos instantes.`,
          });
        }
      },
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Si viene cabecera Authorization: Bearer <token>, intentar validarla y decodificarla
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const secret = this.configService.get<string>('jwt.secret');
        const payload = this.jwtService.verify(token, { secret });
        (req as any).user = payload;
      } catch (e) {
        // Token inválido o expirado; se deja pasar para que el downstream o guard decida
      }
    }

    const url = req.originalUrl || req.url;

    if (url.startsWith('/api/auth')) {
      return this.authProxy(req, res, next);
    }
    if (url.startsWith('/api/hotels')) {
      return this.hotelsProxy(req, res, next);
    }
    if (url.startsWith('/api/rooms')) {
      return this.roomsProxy(req, res, next);
    }
    if (url.startsWith('/api/availability')) {
      return this.availabilityProxy(req, res, next);
    }
    if (url.startsWith('/api/bookings')) {
      return this.bookingsProxy(req, res, next);
    }
    if (url.startsWith('/api/payments')) {
      return this.paymentsProxy(req, res, next);
    }

    next();
  }
}
