// report.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Report {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('decimal', { precision: 12, scale: 2 })
  totalRevenue!: number;

  @Column('decimal', { precision: 12, scale: 2 })
  adminProfit!: number;

  @Column({ type: 'enum', enum: ['day', 'week', 'month', 'year'] })
  period!: string;

  @Column({ type: 'date' })
  periodDate!: Date;

  @Column({ nullable: true })
  providerUserId!: number;
}
