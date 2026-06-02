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

  /* --------------------------------
      RELATIONSHIPS
  -------------------------------- */

  @ManyToOne(() => Provider, { eager: true })
  @JoinColumn({ name: 'provider_id' })
  provider!: Provider;

<<<<<<< HEAD
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status!: OrderStatus;

  @Column('decimal')
  total!: number;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  created_at!: Date;

  @Column({ nullable: true })
  completed_at!: Date;

  @Column('double', { default: 1 })
  item!: number;

=======
>>>>>>> 2fb6047838160a94c8fb43b16c0756965e350c44
  @ManyToOne(() => Customer, (customer) => customer.orders)
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;

  @OneToMany(() => orderItems, (item) => item.order, { cascade: true })
  order_items!: orderItems[];

  /* --------------------------------
      ORDER
  -------------------------------- */

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

  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
  })
  created_at!: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  completed_at!: Date;

  /* --------------------------------
      PAYMENT
  -------------------------------- */

  @Column({
    nullable: true,
  })
  payment_method!: string;

  // uploaded screenshot image
  @Column({
    type: 'text',
    nullable: true,
  })
  payment_proof!: string;

  // amount customer paid
  @Column({
    type: 'decimal',
    default: 0,
  })
  payment_amount!: number;

  // transaction number
  @Column({
    nullable: true,
  })
  transaction_id!: string;

  // payment date
  @Column({
    type: 'timestamp',
    nullable: true,
  })
  paid_at!: Date;

  // provider verification
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  payment_status!: PaymentStatus;

  // provider note
  @Column({
    type: 'text',
    nullable: true,
  })
  payment_note!: string;
}
