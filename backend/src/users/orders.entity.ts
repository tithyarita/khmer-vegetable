import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('orders')
export class orders {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  order_code!: string;

  @Column()
  customer_id!: number;

  @Column()
  status!: string;

  @Column('decimal')
  total!: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @Column({ nullable: true })
  completed_at!: Date;
}
