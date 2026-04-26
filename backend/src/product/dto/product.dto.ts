import { Type } from 'class-transformer';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class ProductDto {
  @IsString()
  name!: string;

  @Type(() => Number)
  @IsNumber()
  price!: number;

  @Type(() => Number)
  @IsNumber()
  stock!: number;

  @IsString()
  category!: string;

  @IsString()
  description!: string;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  discount?: number;
}
