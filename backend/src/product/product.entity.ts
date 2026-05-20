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

  @Column('decimal')
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
}
