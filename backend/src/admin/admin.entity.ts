import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { users } from '../users/users.entity';
import { ProviderApplication } from '../provider-application/provider-application.entity';
import { Provider } from '../providers/providers.entity';

@Entity('admins')
export class Admin {
  @PrimaryColumn({ name: 'user_id' })
  user_id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  imageUrl!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  status!: string;

  @OneToOne(() => users, (user) => user.admin)
  @JoinColumn({ name: 'user_id' })
  user!: users;

  @OneToMany(() => ProviderApplication, (app) => app.admin_reviewed_by, { nullable: true })
  reviewed_applications!: ProviderApplication[];

  @OneToMany(() => Provider, (provider) => provider.createdByAdmin, { nullable: true })
  created_providers!: Provider[];
}
