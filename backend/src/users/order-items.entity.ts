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

  @Column()
  order_id!: number;

  @Column()
  product_id!: number;

  @Column()
  quantity!: string;

  @Column('decimal')
  price!: number;

  @ManyToOne(() => orders, (order) => order.order_items)
  @JoinColumn({ name: 'order_id' })
  order!: orders;

  @ManyToOne(() => Product, (product) => product.order_items)
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}
