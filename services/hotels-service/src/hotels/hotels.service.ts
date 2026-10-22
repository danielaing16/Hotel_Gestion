import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Hotel } from './entities/hotel.entity';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { HotelQueryDto } from './dto/hotel-query.dto';
import { PaginatedHotelsResponseDto } from './dto/hotel-response.dto';
import { INITIAL_HOTELS_SEED } from './seed/hotels.seed';
import { RequestUser } from '../common/decorators/current-user.decorator';

@Injectable()
export class HotelsService implements OnModuleInit {
  private readonly logger = new Logger(HotelsService.name);

  constructor(
    @InjectRepository(Hotel)
    private readonly hotelRepository: Repository<Hotel>,
  ) {}

  async onModuleInit() {
    try {
      const count = await this.hotelRepository.count();
      if (count === 0) {
        this.logger.log('Base de datos de hoteles vacía. Inicializando catálogo con datos seed...');
        await this.seed();
        this.logger.log('✨ Hoteles semilla insertados exitosamente.');
      }
    } catch (err) {
      this.logger.warn(`No se pudo verificar o sembrar datos iniciales: ${err.message}`);
    }
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar tildes
      .replace(/[^a-z0-9]+/g, '-') // Caracteres especiales por guión
      .replace(/^-+|-+$/g, '') // Quitar guiones al inicio y fin
      .substring(0, 80);
  }

  async create(createHotelDto: CreateHotelDto, adminUserId?: string): Promise<Hotel> {
    const baseSlug = this.generateSlug(createHotelDto.name);
    let uniqueSlug = baseSlug;
    let counter = 1;

    // Garantizar unicidad del slug
    while (await this.hotelRepository.findOne({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const hotel = this.hotelRepository.create({
      ...createHotelDto,
      slug: uniqueSlug,
      adminUserId: adminUserId || null,
      country: createHotelDto.country || 'Colombia',
      checkInTime: createHotelDto.checkInTime || '15:00',
      checkOutTime: createHotelDto.checkOutTime || '11:00',
      petFriendly: createHotelDto.petFriendly ?? false,
      isActive: createHotelDto.isActive ?? true,
      images: createHotelDto.images && createHotelDto.images.length > 0 ? createHotelDto.images : [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
      ],
    });

    try {
      const saved = await this.hotelRepository.save(hotel);
      this.logger.log(`Hotel creado exitosamente: "${saved.name}" (ID: ${saved.id})`);
      return saved;
    } catch (error) {
      this.logger.error(`Error al persistir hotel: ${error.message}`);
      throw new ConflictException(`No se pudo crear el hotel: ${error.message}`);
    }
  }

  async findAll(query: HotelQueryDto): Promise<PaginatedHotelsResponseDto> {
    const qb: SelectQueryBuilder<Hotel> = this.hotelRepository.createQueryBuilder('hotel');

    // Filtro por estado activo (por defecto sólo activos salvo que se indique lo contrario)
    if (query.isActive !== undefined) {
      qb.andWhere('hotel.isActive = :isActive', { isActive: query.isActive });
    } else {
      qb.andWhere('hotel.isActive = :isActive', { isActive: true });
    }

    // Filtro por texto en nombre o descripción
    if (query.search) {
      qb.andWhere(
        '(LOWER(hotel.name) LIKE :search OR LOWER(hotel.description) LIKE :search)',
        { search: `%${query.search.toLowerCase()}%` },
      );
    }

    // Filtro por ciudad
    if (query.city) {
      qb.andWhere('LOWER(hotel.city) LIKE :city', {
        city: `%${query.city.toLowerCase()}%`,
      });
    }

    // Filtro por estrellas exactas
    if (query.stars) {
      qb.andWhere('hotel.stars = :stars', { stars: query.stars });
    }

    // Filtro por estrellas mínimas
    if (query.minStars) {
      qb.andWhere('hotel.stars >= :minStars', { minStars: query.minStars });
    }

    // Filtro por admisión de mascotas
    if (query.petFriendly !== undefined) {
      qb.andWhere('hotel.petFriendly = :petFriendly', {
        petFriendly: query.petFriendly,
      });
    }

    // Filtro por amenidad específica
    if (query.amenity) {
      qb.andWhere('LOWER(hotel.amenities) LIKE :amenity', {
        amenity: `%${query.amenity.toLowerCase()}%`,
      });
    }

    // Ordenar por estrellas descendente y nombre ascendente
    qb.orderBy('hotel.stars', 'DESC');
    qb.addOrderBy('hotel.name', 'ASC');

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 12;
    const skip = (page - 1) * limit;

    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string): Promise<Hotel> {
    const hotel = await this.hotelRepository.findOne({
      where: { id },
    });

    if (!hotel) {
      throw new NotFoundException(`Hotel con identificador '${id}' no encontrado`);
    }

    return hotel;
  }

  async findBySlug(slug: string): Promise<Hotel> {
    const hotel = await this.hotelRepository.findOne({
      where: { slug },
    });

    if (!hotel) {
      throw new NotFoundException(`Hotel con slug '${slug}' no encontrado`);
    }

    return hotel;
  }

  async findByAdmin(adminUserId: string): Promise<Hotel[]> {
    return await this.hotelRepository.find({
      where: { adminUserId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    updateHotelDto: UpdateHotelDto,
    _user?: RequestUser,
  ): Promise<Hotel> {
    const hotel = await this.findOne(id);

    // Si se modifica el nombre, recalcular slug
    if (updateHotelDto.name && updateHotelDto.name !== hotel.name) {
      const baseSlug = this.generateSlug(updateHotelDto.name);
      let uniqueSlug = baseSlug;
      let counter = 1;

      while (
        await this.hotelRepository.findOne({
          where: { slug: uniqueSlug },
        })
      ) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      hotel.slug = uniqueSlug;
    }

    Object.assign(hotel, updateHotelDto);
    return await this.hotelRepository.save(hotel);
  }

  async remove(
    id: string,
    force = false,
    _user?: RequestUser,
  ): Promise<{ message: string; id: string }> {
    const hotel = await this.findOne(id);

    if (force) {
      await this.hotelRepository.remove(hotel);
      return {
        message: `Hotel '${hotel.name}' eliminado permanentemente`,
        id,
      };
    }

    // Desactivación lógica (Soft-delete)
    hotel.isActive = false;
    await this.hotelRepository.save(hotel);

    return {
      message: `Hotel '${hotel.name}' desactivado exitosamente (Soft Delete)`,
      id,
    };
  }

  async seed(adminUserId?: string): Promise<{ message: string; count: number }> {
    let createdCount = 0;

    for (const item of INITIAL_HOTELS_SEED) {
      const exists = await this.hotelRepository.findOne({
        where: { slug: item.slug },
      });

      if (!exists) {
        const hotel = this.hotelRepository.create({
          ...item,
          adminUserId: adminUserId || null,
        });
        await this.hotelRepository.save(hotel);
        createdCount++;
      }
    }

    return {
      message: `Proceso de seed completado. ${createdCount} nuevos hoteles insertados.`,
      count: createdCount,
    };
  }
}
