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

  @Column({ type: 'simple-json', nullable: true })
  banks?: { name: string; account: string; qr: string }[];

  @Column({ nullable: true })
  qr_image?: string;

  @Column({ type: 'varchar', nullable: true })
  avatar?: string;

  @Column({ type: 'varchar', nullable: true })
  farm_image?: string;

  @CreateDateColumn()
  created_at!: Date;

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
}