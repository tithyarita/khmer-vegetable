import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  
} from 'typeorm';
import { users } from '../users/users.entity';
import { Product } from '../product/product.entity';

@Entity('cart')
export class Cart {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  quantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_price!: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;

  // Relationships
  @ManyToOne(() => users, user => user.carts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: users;

  @ManyToOne(() => Product, product => product.carts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;
}
