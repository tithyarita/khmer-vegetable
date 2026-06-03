import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { users } from '../users/users.entity';

@Entity('page_navigation')
export class PageNavigation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 500 })
  page_url!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  page_name?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  referrer?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  session_id?: string;

  @ManyToOne(() => users, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: users;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  user_agent?: string;

  @CreateDateColumn({ type: 'timestamp' })
  visited_at!: Date;
}
