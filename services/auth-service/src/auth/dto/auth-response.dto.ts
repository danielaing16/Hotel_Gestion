import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../enums/role.enum';

export class UserProfileDto {
  @ApiProperty({ example: 'd9b2d63d-a233-4123-847e-8c5e93348123' })
  id: string;

  @ApiProperty({ example: 'juan.perez@example.com' })
  email: string;

  @ApiProperty({ example: 'Juan' })
  firstName: string;

  @ApiProperty({ example: 'Pérez' })
  lastName: string;

  @ApiProperty({ example: '+57 300 1234567', required: false })
  phone?: string;

  @ApiProperty({ enum: Role, example: Role.GUEST })
  role: Role;

  @ApiProperty({ example: true })
  isActive: boolean;
}

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token de acceso JWT',
  })
  access_token: string;

  @ApiProperty({
    example: 'Bearer',
    description: 'Tipo de token',
  })
  token_type: string;

  @ApiProperty({
    example: '24h',
    description: 'Tiempo de expiración del token',
  })
  expires_in: string;

  @ApiProperty({ type: UserProfileDto })
  user: UserProfileDto;
}
