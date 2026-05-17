import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { users } from '../users/users.entity';
import { orders } from '../users/orders.entity';

export enum CustomerStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

@Entity('customers')
export class Customer {
  @PrimaryColumn({ name: 'user_id' })
  user_id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({
    type: 'enum',
    enum: CustomerStatus,
    default: CustomerStatus.ACTIVE,
  })
  status!: CustomerStatus;

  @OneToOne(() => users, (user) => user.customer)
  @JoinColumn({ name: 'user_id' })
  user!: users;

  @OneToMany(() => orders, (order) => order.customer)
  orders!: orders[];
}
