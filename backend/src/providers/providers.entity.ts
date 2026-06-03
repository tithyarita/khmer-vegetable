import {
  Entity,
  Column,
  OneToOne,
  ManyToOne,
  OneToMany,
  JoinColumn,
  PrimaryColumn,
  CreateDateColumn,
} from 'typeorm';

import { users } from '../users/users.entity';
import { ProviderApplication } from '../provider-application/provider-application.entity';
import { Admin } from '../admin/admin.entity';
import { Product } from '../product/product.entity';
import { orders } from '../users/orders.entity';
import { Review } from '../review/review.entity';
import { ProviderBank } from './provider_bank.entity';

@Entity('providers')
export class Provider {
  @PrimaryColumn({ name: 'user_id' })
  user_id!: number;

  @Column({ nullable: true })
  provider_name?: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  status!: string;

  @Column({ nullable: true })
  farm_name?: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  story?: string;

  @Column({ nullable: true })
  id_number?: string;

  @Column({ name: 'qr_image', nullable: true })
  qr_image?: string;

  @Column({ type: 'varchar', nullable: true })
  avatar?: string;

  @Column({ type: 'varchar', nullable: true })
  farm_image?: string;

  @CreateDateColumn()
  created_at!: Date;

  @Column({ name: 'application_id', nullable: true })
  application_id?: number;

  @Column({ name: 'createdByAdminUserId', nullable: true })
  createdByAdminUserId?: number;

  // ── Relations ──────────────────────────────────────────────────────────────

  @OneToOne(() => users, (user) => user.provider)
  @JoinColumn({ name: 'user_id' })
  user!: users;

  @OneToOne(() => ProviderApplication, (app) => app.provider, {
    nullable: true,
  })
  @JoinColumn({ name: 'application_id' })
  application?: ProviderApplication;

  @ManyToOne(() => Admin, (admin) => admin.created_providers, {
    nullable: true,
  })
  @JoinColumn({ name: 'createdByAdminUserId' })
  createdByAdmin?: Admin;

  @OneToMany(() => Product, (product) => product.provider)
  products!: Product[];

  @OneToMany(() => orders, (order) => order.provider)
  orders!: orders[];

  @OneToMany(() => ProviderBank, (bank) => bank.provider, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  banks!: ProviderBank[];

}
