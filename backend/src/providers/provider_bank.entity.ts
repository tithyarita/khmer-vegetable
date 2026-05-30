import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Provider } from './providers.entity';

export enum BankType {
  ABA = 'aba',
  VISA = 'visa',
  MASTERCARD = 'mastercard',
}

@Entity('provider_banks')
export class ProviderBank {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  provider_id!: number;

  @Column({ type: 'enum', enum: BankType, default: BankType.ABA })
  type!: BankType;

  @Column({ default: '' })
  name!: string;

  @Column({ default: '' })
  account!: string;

  @Column({ default: '' })
  holder_name!: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  qr!: string | null;

  @ManyToOne(() => Provider, (provider) => provider.banks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'provider_id', referencedColumnName: 'user_id' })
  provider!: Provider;
}
