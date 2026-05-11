import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Provider } from '../providers/providers.entity';

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

  @ManyToOne(() => Provider, { eager: true })
  @JoinColumn({ name: 'provider_id' })
  provider!: Provider;

  @Column()
  status!: string;

  @Column('decimal')
  total!: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @Column({ nullable: true })
  completed_at!: Date;

  @Column({ default: 1 })
  item!: number;
}
