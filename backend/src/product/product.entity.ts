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
import { orderItems } from '../users/order-items.entity';
import { Cart } from '../cart/cart.entity';
import { Favorite } from '../favorite/favorite.entity';
import { Review } from '../review/review.entity';
@Entity('product')
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  stock!: number;

  @Column({ default: 'In Stock' })
  status!: string;

  @Column()
  category!: string;

  @Column()
  imageUrl!: string;

  @Column()
  discount!: number;

  @Column('decimal', { precision: 15, scale: 2 })
  price!: number;

  @Column({ nullable: true })
  description!: string;

  @CreateDateColumn({ type: 'timestamp', name: 'added_date' })
  addedDate!: Date;

  @ManyToOne(() => Provider, (provider) => provider.products)
  @JoinColumn({ name: 'provider_id' })
  provider!: Provider;

  @OneToMany(() => orderItems, (item) => item.product)
  order_items!: orderItems[];

  @OneToMany(() => Cart, (cart) => cart.product)
  carts!: Cart[];

  @OneToMany(() => Favorite, (favorite) => favorite.product)
  favorites!: Favorite[];

  @OneToMany(() => Review, (review) => review.product)
  reviews!: Review[];
}
