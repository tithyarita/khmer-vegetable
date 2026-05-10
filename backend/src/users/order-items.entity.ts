import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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
}
