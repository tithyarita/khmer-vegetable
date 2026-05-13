import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
} from 'typeorm';
import { Admin } from '../admin/admin.entity';
import { Staff } from '../staff/staff.entity';
import { Customer } from '../customer/customer.entity';
import { Provider } from '../providers/providers.entity';

export enum UserRole {
  ADMIN = 'admin',
  STAFF = 'staff',
  CUSTOMER = 'customer',
  PROVIDER = 'provider',
}
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

  @Column({ default: UserRole.CUSTOMER })
  role!: UserRole;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @OneToOne(() => Admin, (admin) => admin.user)
  admin!: Admin;

  @OneToOne(() => Staff, (staff) => staff.user)
  staff!: Staff;

  @OneToOne(() => Customer, (customer) => customer.user)
  customer!: Customer;

  @OneToOne(() => Provider, (provider) => provider.user)
  provider!: Provider;
}
