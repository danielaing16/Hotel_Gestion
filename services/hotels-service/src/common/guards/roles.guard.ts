import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no hay roles requeridos, se permite el acceso público
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userRole =
      request.user?.role ||
      (request.headers['x-user-role'] as string) ||
      (request.headers['x-userrole'] as string);

    if (!userRole) {
      throw new UnauthorizedException(
        'Acceso no autorizado: Se requiere token de sesión con rol administrativo',
      );
    }

    const hasRole = requiredRoles.includes(userRole as Role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Acceso denegado: Se requiere uno de los roles autorizados [${requiredRoles.join(', ')}]. Tu rol actual es '${userRole}'.`,
      );
    }

    return true;
  }
}
