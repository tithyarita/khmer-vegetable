import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Provider } from '../providers/providers.entity'; // Make sure this path points to your Provider entity correctly

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'provider_id' })
  provider_id!: number;

  @Column({ name: 'customer_id' })
  customer_id!: number;

  @Column({ name: 'rating_stars' })
  rating_stars!: number;

  @Column({ name: 'feedback_text', nullable: true })
  feedback_text!: string;

  @Column({ nullable: true })
  customer_name?: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  // ── Add this relation property right here ──────────────────────────────────
  @ManyToOne(() => Provider, (provider) => provider.reviews)
  @JoinColumn({ name: 'provider_id' }) // Maps the provider_id column as the foreign key
  provider!: Provider;
}
