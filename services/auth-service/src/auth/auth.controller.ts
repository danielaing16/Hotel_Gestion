import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, UserProfileDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { Role } from './enums/role.enum';

@ApiTags('Autenticación & Usuarios')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Registrar un nuevo usuario (Huésped o Administrador)',
    description: 'Crea un usuario nuevo con contraseña encriptada (bcrypt) y retorna token JWT inmediato.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuario registrado exitosamente',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'El correo electrónico ya se encuentra registrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos',
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return await this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description: 'Valida credenciales de acceso y retorna el token de autenticación JWT.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Inicio de sesión exitoso',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Credenciales inválidas',
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return await this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obtener perfil del usuario autenticado',
    description: 'Ruta protegida por JWT. Devuelve los datos del usuario extraídos del token validado.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Perfil del usuario obtenido con éxito',
    type: UserProfileDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token ausente, inválido o expirado',
  })
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  @Get('validate-token')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Validar token JWT (Uso para API Gateway y otros microservicios)',
    description: 'Endpoint ligero para verificar validez y roles del token sin acceder a la base de datos de usuarios.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token válido',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token inválido o expirado',
  })
  async validateToken(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Encabezado Authorization con formato Bearer requerido');
    }
    const token = authHeader.split(' ')[1];
    return await this.authService.validateToken(token);
  }

  @Get('admin-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HOTEL_ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Demostración de Control de Acceso basado en Roles (RBAC)',
    description: 'Solo accesible para usuarios que tengan el rol HOTEL_ADMIN.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Acceso autorizado como Administrador',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'No posee el rol HOTEL_ADMIN requerido',
  })
  adminOnlyEndpoint(@CurrentUser() user: any) {
    return {
      message: 'Bienvenido al panel exclusivo de administración hotelera',
      adminUser: user,
      timestamp: new Date().toISOString(),
    };
  }
}
