import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { HotelsService } from './hotels.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { HotelQueryDto } from './dto/hotel-query.dto';
import { PaginatedHotelsResponseDto } from './dto/hotel-response.dto';
import { Hotel } from './entities/hotel.entity';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Hoteles & Sedes (Catálogo Central)')
@Controller('api/hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Listar hoteles con filtros y paginación (Lectura Pública)',
    description:
      'Permite a huéspedes y al público general buscar hoteles filtrando por ciudad, nombre, estrellas y admisión de mascotas.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Catálogo de hoteles obtenido con éxito',
    type: PaginatedHotelsResponseDto,
  })
  async findAll(@Query() query: HotelQueryDto): Promise<PaginatedHotelsResponseDto> {
    return await this.hotelsService.findAll(query);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.HOTEL_ADMIN)
  @Get('admin/my-hotels')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Consultar hoteles creados por el administrador actual (HOTEL_ADMIN)',
    description: 'Retorna los hoteles registrados por el ID del usuario en sesión.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de hoteles del administrador',
    type: [Hotel],
  })
  async findMyHotels(@CurrentUser() user: RequestUser): Promise<Hotel[]> {
    return await this.hotelsService.findByAdmin(user?.id);
  }

  @Public()
  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Consultar un hotel por su slug amigable',
    description: 'Permite cargar el detalle del hotel a partir de una URL legible.',
  })
  @ApiParam({ name: 'slug', description: 'Slug del hotel', example: 'cartagena-luxury-beach-spa-resort' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Detalle del hotel',
    type: Hotel,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Hotel no encontrado',
  })
  async findBySlug(@Param('slug') slug: string): Promise<Hotel> {
    return await this.hotelsService.findBySlug(slug);
  }

  @Public()
  @Get(':id')
  @ApiOperation({
    summary: 'Consultar detalle completo de un hotel por UUID (Lectura Pública)',
    description:
      'Obtiene toda la información comercial, comodidades, coordenadas y políticas de un hotel específico.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID del hotel',
    example: 'a4b88950-84a8-4c91-9457-41480f779d71',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Detalle del hotel obtenido exitosamente',
    type: Hotel,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Hotel no encontrado',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Hotel> {
    return await this.hotelsService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.HOTEL_ADMIN)
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Registrar un nuevo hotel (Solo HOTEL_ADMIN)',
    description:
      'Crea una nueva sede hotelera en el catálogo. Requiere rol administrativo HOTEL_ADMIN inyectado por el Gateway en cabecera x-user-role o Bearer token.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Hotel creado y registrado exitosamente',
    type: Hotel,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Acceso denegado: Se requiere rol HOTEL_ADMIN',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada incompletos o con formato erróneo',
  })
  async create(
    @Body() createHotelDto: CreateHotelDto,
    @CurrentUser() user: RequestUser,
  ): Promise<Hotel> {
    return await this.hotelsService.create(createHotelDto, user?.id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.HOTEL_ADMIN)
  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Actualizar completamente la información de un hotel (Solo HOTEL_ADMIN)',
    description: 'Reemplaza y actualiza los campos comerciales y operativos del hotel.',
  })
  @ApiParam({ name: 'id', description: 'UUID del hotel a modificar' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hotel actualizado exitosamente',
    type: Hotel,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Acceso denegado',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Hotel no encontrado',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateHotelDto: UpdateHotelDto,
    @CurrentUser() user: RequestUser,
  ): Promise<Hotel> {
    return await this.hotelsService.update(id, updateHotelDto, user);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.HOTEL_ADMIN)
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Actualizar parcialmente datos de un hotel (Solo HOTEL_ADMIN)',
    description: 'Modifica uno o más campos específicos de un hotel.',
  })
  @ApiParam({ name: 'id', description: 'UUID del hotel a modificar' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hotel modificado exitosamente',
    type: Hotel,
  })
  async patch(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateHotelDto: UpdateHotelDto,
    @CurrentUser() user: RequestUser,
  ): Promise<Hotel> {
    return await this.hotelsService.update(id, updateHotelDto, user);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.HOTEL_ADMIN)
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Desactivar o eliminar un hotel (Solo HOTEL_ADMIN)',
    description:
      'Por defecto realiza un soft-delete (isActive: false) para no romper la integridad referencial con habitaciones y reservas existentes.',
  })
  @ApiParam({ name: 'id', description: 'UUID del hotel a desactivar' })
  @ApiQuery({
    name: 'force',
    required: false,
    description: 'Si es true, borra permanentemente de la base de datos',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hotel desactivado exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Acceso denegado',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Hotel no encontrado',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('force') force: string,
    @CurrentUser() user: RequestUser,
  ) {
    const isForce = force === 'true' || force === '1';
    return await this.hotelsService.remove(id, isForce, user);
  }

  @Post('seed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Poblar catálogo con hoteles iniciales de demostración',
    description: 'Inserta sedes hoteleras con fotos, amenidades y datos realistas.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Semilla ejecutada con éxito',
  })
  async seed(@CurrentUser() user: RequestUser) {
    return await this.hotelsService.seed(user?.id);
  }
}
