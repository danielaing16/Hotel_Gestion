import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface RequestUser {
  id: string;
  role: string;
  email?: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RequestUser | null => {
    const request = ctx.switchToHttp().getRequest();

    if (request.user) {
      return request.user;
    }

    // Extraer de las cabeceras inyectadas por el API Gateway
    const id = (request.headers['x-user-id'] as string) || (request.headers['x-userid'] as string);
    const role = (request.headers['x-user-role'] as string) || (request.headers['x-userrole'] as string);
    const email = (request.headers['x-user-email'] as string) || (request.headers['x-useremail'] as string);

    if (id || role) {
      return {
        id: id || 'anonymous',
        role: role || 'GUEST',
        email,
      };
    }

    return null;
  },
);
