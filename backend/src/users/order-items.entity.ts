import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { orders } from './orders.entity';
import { Product } from '../product/product.entity';

@Entity('order_items')
export class orderItems {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('int')
  quantity!: number;

  @Column('decimal', { precision: 12, scale: 2 })
  price!: number;

  @ManyToOne(() => orders, (order) => order.order_items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order!: orders;

  @ManyToOne(() => Product, (product) => product.order_items)
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}
