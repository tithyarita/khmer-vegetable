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
<<<<<<< HEAD
import { Review } from '../review/review.entity';
import { ProviderBank } from './provider_bank.entity';
=======
>>>>>>> f17bc122b0513db18c3dfe6f40d3e0f7955e389c

@Entity('providers')
export class Provider {
  @PrimaryColumn({ name: 'user_id' })
  user_id!: number;

  @OneToOne(() => users, (user) => user.provider)
  @JoinColumn({ name: 'user_id' })
  user!: users;

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

<<<<<<< HEAD
  @Column({ name: 'qr_image', nullable: true })
=======
  @Column({ type: 'simple-json', nullable: true })
  banks?: { name: string; account: string; qr: string }[];

  @Column({ nullable: true })
>>>>>>> f17bc122b0513db18c3dfe6f40d3e0f7955e389c
  qr_image?: string;

  @Column({ type: 'varchar', nullable: true })
  avatar?: string;

  @Column({ type: 'varchar', nullable: true })
  farm_image?: string;

  @CreateDateColumn()
  created_at!: Date;

<<<<<<< HEAD
  @Column({ name: 'application_id', nullable: true })
  application_id?: number;

  @Column({ name: 'created_by_admin', nullable: true })
  created_by_admin?: number;

  // ── Relations ──────────────────────────────────────────────────────────────

  @OneToOne(() => users, (user) => user.provider)
  @JoinColumn({ name: 'user_id' })
  user!: users;

=======
>>>>>>> f17bc122b0513db18c3dfe6f40d3e0f7955e389c
  @OneToOne(() => ProviderApplication, (app) => app.provider, {
    nullable: true,
  })
  @JoinColumn({ name: 'application_id' })
  application?: ProviderApplication;

  @ManyToOne(() => Admin, (admin) => admin.created_providers, {
    nullable: true,
  })
  createdByAdmin?: Admin;

  @OneToMany(() => Product, (product) => product.provider)
  products!: Product[];

  @OneToMany(() => orders, (order) => order.provider)
  orders!: orders[];
<<<<<<< HEAD

  @OneToMany(() => ProviderBank, (bank) => bank.provider, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  banks!: ProviderBank[];

  @OneToMany(() => Review, (review) => review.provider)
  reviews!: Review[];
}
=======
}
>>>>>>> f17bc122b0513db18c3dfe6f40d3e0f7955e389c
