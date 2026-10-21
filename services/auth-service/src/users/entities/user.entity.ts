import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../auth/enums/role.enum';

@Entity('users')
export class User {
  @ApiProperty({
    example: 'd9b2d63d-a233-4123-847e-8c5e93348123',
    description: 'Identificador único (UUID) del usuario',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'juan.perez@example.com',
    description: 'Correo electrónico único del usuario',
  })
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del usuario',
  })
  @Column()
  firstName: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido del usuario',
  })
  @Column()
  lastName: string;

  @ApiProperty({
    example: '+57 300 1234567',
    description: 'Teléfono de contacto',
    required: false,
  })
  @Column({ nullable: true })
  phone?: string;

  @ApiProperty({
    enum: Role,
    example: Role.GUEST,
    description: 'Rol del usuario en el sistema',
  })
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.GUEST,
  })
  role: Role;

  @ApiProperty({
    example: true,
    description: 'Estado de la cuenta del usuario',
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    example: '2026-10-21T16:30:00.000Z',
    description: 'Fecha de registro',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    example: '2026-10-21T16:30:00.000Z',
    description: 'Fecha de última actualización',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
