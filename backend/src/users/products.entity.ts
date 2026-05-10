import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('products')
export class products {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  product_code!: string;

  @Column()
  product_name!: string;

  @Column('decimal')
  price!: number;

  @Column()
  image!: string;
}
