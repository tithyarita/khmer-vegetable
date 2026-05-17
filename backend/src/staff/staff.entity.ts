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

@Entity('staff')
export class Staff {
  @PrimaryColumn({ name: 'user_id' })
  user_id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  status!: string;

  @OneToOne(() => users, (user) => user.staff)
  @JoinColumn({ name: 'user_id' })
  user!: users;

  @OneToMany(() => ProviderApplication, (app) => app.staff_reviewed_by)
  reviewed_applications!: ProviderApplication[];
}
