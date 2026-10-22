import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('hotels')
export class Hotel {
  @ApiProperty({
    example: 'a4b88950-84a8-4c91-9457-41480f779d71',
    description: 'Identificador único (UUID) del hotel',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Hotel Cartagena Luxury Resort & Spa',
    description: 'Nombre comercial del hotel o sede',
  })
  @Column()
  name: string;

  @ApiProperty({
    example: 'hotel-cartagena-luxury-resort-spa',
    description: 'Identificador amigable para URLs (slug)',
  })
  @Column({ unique: true })
  @Index()
  slug: string;

  @ApiProperty({
    example: 'Exclusivo resort frente al mar Caribe con acceso directo a la playa, alta cocina y spa de clase mundial.',
    description: 'Descripción detallada de las instalaciones y propuesta de valor',
  })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({
    example: 5,
    description: 'Categoría del hotel (1 a 5 estrellas)',
    minimum: 1,
    maximum: 5,
  })
  @Column({ type: 'int', default: 4 })
  @Index()
  stars: number;

  @ApiProperty({
    example: 'Bocagrande, Carrera 1 # 12-118',
    description: 'Dirección física del hotel',
  })
  @Column()
  address: string;

  @ApiProperty({
    example: 'Cartagena',
    description: 'Ciudad donde se ubica el hotel',
  })
  @Column()
  @Index()
  city: string;

  @ApiProperty({
    example: 'Colombia',
    description: 'País donde se ubica el hotel',
  })
  @Column({ default: 'Colombia' })
  country: string;

  @ApiProperty({
    example: 10.4042,
    description: 'Coordenada geográfica: Latitud',
    required: false,
  })
  @Column({ type: 'float', nullable: true })
  latitude?: number;

  @ApiProperty({
    example: -75.5562,
    description: 'Coordenada geográfica: Longitud',
    required: false,
  })
  @Column({ type: 'float', nullable: true })
  longitude?: number;

  @ApiProperty({
    example: '+57 (605) 650 1234',
    description: 'Teléfono o línea de atención directa del hotel',
  })
  @Column()
  phone: string;

  @ApiProperty({
    example: 'reservas@cartagenaluxury.com',
    description: 'Correo electrónico de reservas y contacto',
  })
  @Column()
  email: string;

  @ApiProperty({
    example: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    ],
    description: 'Galería de fotos del hotel',
    type: [String],
  })
  @Column('simple-array', { nullable: true })
  images: string[];

  @ApiProperty({
    example: ['WiFi', 'Piscina', 'Spa', 'Gimnasio', 'Restaurante', 'Parqueadero', 'Pet-friendly'],
    description: 'Amenidades y comodidades ofrecidas en el hotel',
    type: [String],
  })
  @Column('simple-array')
  amenities: string[];

  @ApiProperty({
    example: '15:00',
    description: 'Hora oficial de inicio de Check-in (formato HH:mm)',
    default: '15:00',
  })
  @Column({ default: '15:00' })
  checkInTime: string;

  @ApiProperty({
    example: '11:00',
    description: 'Hora oficial de Check-out (formato HH:mm)',
    default: '11:00',
  })
  @Column({ default: '11:00' })
  checkOutTime: string;

  @ApiProperty({
    example: 'Cancelación gratuita hasta 48 horas antes de la llegada. Pasado este tiempo se cobrará la primera noche.',
    description: 'Política y condiciones de cancelación',
  })
  @Column({ type: 'text' })
  cancellationPolicy: string;

  @ApiProperty({
    example: true,
    description: 'Indica si el establecimiento admite mascotas',
    default: false,
  })
  @Column({ default: false })
  petFriendly: boolean;

  @ApiProperty({
    example: 'd9b2d63d-a233-4123-847e-8c5e93348123',
    description: 'UUID del usuario administrador (HOTEL_ADMIN) que registró o gestiona el hotel',
    required: false,
  })
  @Column({ nullable: true })
  @Index()
  adminUserId?: string;

  @ApiProperty({
    example: true,
    description: 'Estado de operación del hotel (activo o desactivado)',
    default: true,
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    example: '2026-10-21T18:00:00.000Z',
    description: 'Fecha de creación en la base de datos',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2026-10-21T18:00:00.000Z',
    description: 'Fecha de última actualización',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
