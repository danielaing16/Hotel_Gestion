import { IsOptional, IsString, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class HotelQueryDto {
  @ApiPropertyOptional({
    description: 'Búsqueda por texto en nombre o descripción',
    example: 'Cartagena',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ciudad específica',
    example: 'Cartagena',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por categoría exacta de estrellas (1 a 5)',
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  stars?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por categoría mínima de estrellas (ej. 4 estrellas o más)',
    example: 4,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  minStars?: number;

  @ApiPropertyOptional({
    description: 'Filtrar hoteles que admitan mascotas',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === '1')
  @IsBoolean()
  petFriendly?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por amenidad requerida (ej. Piscina, Spa, WiFi)',
    example: 'Piscina',
  })
  @IsOptional()
  @IsString()
  amenity?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado activo (por defecto sólo activos)',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === '1')
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Número de página para paginación',
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de elementos por página',
    default: 12,
    example: 12,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 12;
}
