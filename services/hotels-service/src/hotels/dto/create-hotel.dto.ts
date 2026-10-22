import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsEmail,
  IsArray,
  IsOptional,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHotelDto {
  @ApiProperty({
    example: 'Hotel Cartagena Luxury Resort & Spa',
    description: 'Nombre comercial del hotel o sede',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del hotel es obligatorio' })
  name: string;

  @ApiProperty({
    example: 'Exclusivo resort frente al mar Caribe con acceso directo a la playa, alta cocina y spa de clase mundial.',
    description: 'Descripción detallada de las instalaciones y propuesta de valor',
  })
  @IsString()
  @IsNotEmpty({ message: 'La descripción del hotel es obligatoria' })
  description: string;

  @ApiProperty({
    example: 5,
    description: 'Categoría del hotel (1 a 5 estrellas)',
    minimum: 1,
    maximum: 5,
  })
  @IsInt({ message: 'Las estrellas deben ser un número entero' })
  @Min(1, { message: 'El hotel debe tener al menos 1 estrella' })
  @Max(5, { message: 'El hotel no puede tener más de 5 estrellas' })
  stars: number;

  @ApiProperty({
    example: 'Bocagrande, Carrera 1 # 12-118',
    description: 'Dirección física del hotel',
  })
  @IsString()
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  address: string;

  @ApiProperty({
    example: 'Cartagena',
    description: 'Ciudad donde se ubica el hotel',
  })
  @IsString()
  @IsNotEmpty({ message: 'La ciudad es obligatoria' })
  city: string;

  @ApiProperty({
    example: 'Colombia',
    description: 'País donde se ubica el hotel',
    default: 'Colombia',
    required: false,
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({
    example: 10.4042,
    description: 'Coordenada geográfica: Latitud',
    required: false,
  })
  @IsNumber({}, { message: 'La latitud debe ser un valor numérico decimal' })
  @IsOptional()
  latitude?: number;

  @ApiProperty({
    example: -75.5562,
    description: 'Coordenada geográfica: Longitud',
    required: false,
  })
  @IsNumber({}, { message: 'La longitud debe ser un valor numérico decimal' })
  @IsOptional()
  longitude?: number;

  @ApiProperty({
    example: '+57 (605) 650 1234',
    description: 'Teléfono o línea de atención directa del hotel',
  })
  @IsString()
  @IsNotEmpty({ message: 'El teléfono de contacto es obligatorio' })
  phone: string;

  @ApiProperty({
    example: 'reservas@cartagenaluxury.com',
    description: 'Correo electrónico de reservas y contacto',
  })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;

  @ApiProperty({
    example: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Galería de fotos del hotel (URLs)',
    type: [String],
    required: false,
  })
  @IsArray({ message: 'Las fotos deben ser una lista de enlaces (URLs)' })
  @IsOptional()
  images?: string[];

  @ApiProperty({
    example: ['WiFi', 'Piscina', 'Spa', 'Gimnasio', 'Restaurante', 'Parqueadero', 'Pet-friendly'],
    description: 'Amenidades y comodidades del hotel',
    type: [String],
  })
  @IsArray({ message: 'Las amenidades deben ser un arreglo de cadenas' })
  @IsNotEmpty({ message: 'Debe ingresar al menos una amenidad' })
  amenities: string[];

  @ApiProperty({
    example: '15:00',
    description: 'Hora de Check-in (formato HH:mm)',
    required: false,
    default: '15:00',
  })
  @IsString()
  @IsOptional()
  checkInTime?: string;

  @ApiProperty({
    example: '11:00',
    description: 'Hora de Check-out (formato HH:mm)',
    required: false,
    default: '11:00',
  })
  @IsString()
  @IsOptional()
  checkOutTime?: string;

  @ApiProperty({
    example: 'Cancelación gratuita hasta 48 horas antes de la llegada.',
    description: 'Política y condiciones de cancelación',
  })
  @IsString()
  @IsNotEmpty({ message: 'La política de cancelación es obligatoria' })
  cancellationPolicy: string;

  @ApiProperty({
    example: true,
    description: 'Indica si admite mascotas',
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  petFriendly?: boolean;

  @ApiProperty({
    example: true,
    description: 'Estado inicial del hotel',
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
