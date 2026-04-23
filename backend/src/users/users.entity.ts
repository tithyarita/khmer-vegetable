import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
export class users {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  phone!: string;

  @Column({ default: 'customer' })
  role!: string;
}
