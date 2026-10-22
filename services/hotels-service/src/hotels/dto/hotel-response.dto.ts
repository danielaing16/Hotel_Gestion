import { ApiProperty } from '@nestjs/swagger';
import { Hotel } from '../entities/hotel.entity';

export class PaginatedHotelsResponseDto {
  @ApiProperty({ type: [Hotel], description: 'Listado de hoteles' })
  data: Hotel[];

  @ApiProperty({ example: 45, description: 'Total de hoteles que coinciden con los filtros' })
  total: number;

  @ApiProperty({ example: 1, description: 'Página actual' })
  page: number;

  @ApiProperty({ example: 12, description: 'Cantidad máxima por página' })
  limit: number;

  @ApiProperty({ example: 4, description: 'Total de páginas disponibles' })
  totalPages: number;
}
