import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('order_history')
export class orderHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  order_code!: string;

  @Column()
  customer_id!: number;

  @Column()
  product_id!: number;

  @Column()
  quantity!: string;

  @Column('decimal')
  price!: number;

  @Column('decimal')
  total!: number;

  @Column()
  status!: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @Column({ nullable: true })
  completed_at!: Date;
}
