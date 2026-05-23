import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  user_id!: number;

  @Column()
  first_name!: string;

  @Column()
  last_name!: string;

  @Column()
  street!: string;

  @Column()
  city!: string;

  @Column()
  state!: string;

  @Column()
  zip!: string;

  @Column()
  country!: string;

  @Column()
  phone!: string;

  @Column()
  email!: string;
}
