import { IsString, IsNumber, IsNotEmpty, IsOptional, IsDate } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  order_code: string;

  @IsNumber()
  @IsNotEmpty()
  customer_id: number;

  @IsNumber()
  @IsNotEmpty()
  provider_id: number;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsNumber()
  @IsNotEmpty()
  total: number;
}

export class UpdateOrderDto {
  @IsString()
  @IsOptional()
  order_code?: string;

  @IsNumber()
  @IsOptional()
  customer_id?: number;

  @IsNumber()
  @IsOptional()
  provider_id?: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  total?: number;

  @IsDate()
  @IsOptional()
  completed_at?: Date;
}
