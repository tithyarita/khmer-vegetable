import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Admin } from '../admin/admin.entity';
import { Staff } from '../staff/staff.entity';
import { Customer } from '../customer/customer.entity';
import { Provider } from '../providers/providers.entity';
import { Cart } from '../cart/cart.entity'
import { Favorite } from '../favorite/favorite.entity'

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

  @Column({ nullable: true })
  avatar?: string;

  @Column({ type: 'varchar', nullable: true })
  reset_token!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  reset_token_expires!: Date | null;

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

  @OneToMany(() => Cart, (cart) => cart.user)
  carts!: Cart[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites!: Favorite[];

}
