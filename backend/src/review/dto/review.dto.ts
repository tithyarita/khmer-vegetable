import { Type } from 'class-transformer';
import { IsString, IsNumber, IsNotEmpty, Min, Max } from 'class-validator';

export class ReviewDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsString()
  @IsNotEmpty()
  feedback!: string;

  @IsNumber()
  productId!: number;
}
