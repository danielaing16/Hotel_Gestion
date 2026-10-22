import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthHeaderMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthHeaderMiddleware.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    // 1. Verificar si el Gateway ya inyectó cabeceras enriquecidas
    const xUserId = (req.headers['x-user-id'] as string) || (req.headers['x-userid'] as string);
    const xUserRole = (req.headers['x-user-role'] as string) || (req.headers['x-userrole'] as string);
    const xUserEmail = (req.headers['x-user-email'] as string) || (req.headers['x-useremail'] as string);

    if (xUserId || xUserRole) {
      (req as any).user = {
        id: xUserId,
        role: xUserRole,
        email: xUserEmail,
      };
      return next();
    }

    // 2. Soporte fallback si la petición llega directamente con Bearer token
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const secret = this.configService.get<string>('JWT_SECRET', 'super_secret_jwt_key_hotel_2026_dev');
        const payload = this.jwtService.verify(token, { secret });
        (req as any).user = {
          id: payload.sub || payload.id,
          role: payload.role,
          email: payload.email,
        };
      } catch (err) {
        this.logger.debug(`Token JWT no válido en hotels-service: ${err.message}`);
      }
    }

    next();
  }
}
