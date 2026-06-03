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
  DELIVERING = 'delivering',
  COMPLETED = 'completed',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
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

  // RELATIONS
  @ManyToOne(() => Provider, { eager: true })
  @JoinColumn({ name: 'provider_id' })
  provider!: Provider;

  @ManyToOne(() => Customer, (customer) => customer.orders)
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;
  @OneToMany(() => orderItems, (item) => item.order)
  order_items!: orderItems[];

  // ORDER INFO
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @Column('decimal')
  total!: number;

  @Column({ default: 1 })
  item!: number;

  @CreateDateColumn()
  created_at!: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at!: Date;

  // PAYMENT
  @Column({ nullable: true })
  payment_method!: string;

  @Column({ type: 'text', nullable: true })
  payment_proof!: string | null;

  @Column({ type: 'decimal', default: 0 })
  payment_amount!: number;

  @Column({ nullable: true })
  transaction_id!: string;

  @Column({ type: 'timestamp', nullable: true })
  paid_at!: Date;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  payment_status!: PaymentStatus;

  @Column({ type: 'text', nullable: true })
  payment_note!: string;
}
