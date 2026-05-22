import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Provider } from '../providers/providers.entity';
import { Customer } from '../customer/customer.entity';
import { orderItems } from './order-items.entity';

export enum OrderStatus {
  PENDING = 'pending',
  SHIPPED = 'shipped',
  DELIVERING = 'delivering',
  COMPLETED = 'completed',
}
@Entity('orders')
export class orders {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  order_code!: string;

  @Column()
  customer_id!: number;

  @Column()
  provider_id!: number;

  @ManyToOne(() => Provider, { eager: true })
  @JoinColumn({ name: 'provider_id' })
  provider!: Provider;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status!: OrderStatus;

  @Column('decimal')
  total!: number;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  created_at!: Date;

  @Column({ nullable: true })
  completed_at!: Date;

  @Column({ default: 1 })
  item!: number;

  @ManyToOne(() => Customer, (customer) => customer.orders)
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;

  @OneToMany(() => orderItems, (item) => item.order, { cascade: true })
  order_items!: orderItems[];
}
