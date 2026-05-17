import {
  Entity,
  Column,
  OneToOne,
  ManyToOne,
  OneToMany,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { users } from '../users/users.entity';
import { ProviderApplication } from '../provider-application/provider-application.entity';
import { Admin } from '../admin/admin.entity';
import { Product } from '../product/product.entity';
@Entity('providers')
export class Provider {
  @PrimaryColumn({ name: 'user_id' })
  user_id!: number;

  @Column()
  provider_name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  status!: string;

  @OneToOne(() => users, (user) => user.provider)
  @JoinColumn({ name: 'user_id' })
  user!: users;

  @OneToOne(() => ProviderApplication, (app) => app.provider, { nullable: true })
  @JoinColumn({ name: 'application_id' })
  application!: ProviderApplication;

  @ManyToOne(() => Admin, (admin) => admin.created_providers, { nullable: true })
  @JoinColumn({ name: 'created_by_admin' })
  createdByAdmin!: Admin;

  @OneToMany(() => Product, (product) => product.provider)
  products!: Product[];
}
