import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('provider_application')
export class ProviderApplication {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  applicant_name!: string;

  @Column()
  phone!: string;

  @Column()
  farm_name!: string;

  @Column()
  location!: string;

  @Column()
  product_type!: string;

  @Column()
  application_status!: string;
}
