import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  provider_name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  status!: string;
}
