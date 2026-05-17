import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Staff } from '../staff/staff.entity';
import { Admin } from '../admin/admin.entity';
import { Provider } from '../providers/providers.entity';

export enum ApplicationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('provider_applications')
export class ProviderApplication {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'business_name', nullable: false })
  business_name!: string;

  @Column({ name: 'owner_name', nullable: true })
  owner_name!: string;

  @Column({ name: 'contact_email', nullable: true })
  contact_email!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ nullable: true })
  village!: string;

  @Column({ nullable: true })
  commune!: string;

  @Column({ nullable: true })
  district!: string;

  @Column({ name: 'city_province', nullable: true })
  city_province!: string;

  @Column({ name: 'primary_vegetable', nullable: true })
  primary_vegetable!: string;

  @Column({ name: 'farm_category', nullable: true })
  farm_category!: string;

  @Column({ name: 'id_document_path', nullable: true })
  id_document_path!: string;

  @Column({ name: 'profile_photo_path', nullable: true })
  profile_photo_path!: string;

  @Column({ name: 'farm_angle1_path', nullable: true })
  farm_angle1_path!: string;

  @Column({ name: 'farm_angle2_path', nullable: true })
  farm_angle2_path!: string;

  @Column({ name: 'farm_angle3_path', nullable: true })
  farm_angle3_path!: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date;

  @Column({
    name: 'application_status',
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.DRAFT,
  })
  application_status!: ApplicationStatus;

  @Column({ name: 'submitted_at', type: 'timestamp', nullable: true })
  submitted_at!: Date | null;

  @ManyToOne(() => Staff, (staff) => staff.reviewed_applications, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'staff_reviewed_by' })
  staff_reviewed_by!: Staff | null;

  @ManyToOne(() => Admin, (admin) => admin.reviewed_applications, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'admin_reviewed_by' })
  admin_reviewed_by!: Admin | null;

  @OneToOne(() => Provider, (provider) => provider.application)
  provider!: Provider;
}
