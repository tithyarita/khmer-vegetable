import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  stock!: number;

  @Column()
  category!: string;

  @Column()
  imageUrl!: string;

  @Column()
  discount!: number;

  @Column('decimal')
  price!: number;

  @Column({ nullable: true })
  description!: string;

  @CreateDateColumn({ type: 'timestamp', name: 'added_date' })
  addedDate!: Date;
}
