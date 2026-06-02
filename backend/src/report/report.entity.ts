import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn()
  report_id!: number;

  @Column({ type: 'varchar', length: 50, nullable: true, unique: true })
  report_code?: string;

  @Column()
  provider_id!: number;

  @Column()
  provider_name!: string;

  // @Column({ nullable: true })
  // order_id?: number;

  @Column('int')
  total_orders!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total_revenue!: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  admin_profit!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}