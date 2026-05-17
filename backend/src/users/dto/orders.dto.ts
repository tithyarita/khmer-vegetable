
import { IsString, IsNumber, IsNotEmpty, IsOptional, IsDate, IsEnum } from 'class-validator';
import { OrderStatus } from '../orders.entity';

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

  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;

  @IsNumber()
  @IsNotEmpty()
  total: number;

  @IsNumber()
  @IsOptional()
  item?: number;
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

  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsNumber()
  @IsOptional()
  total?: number;

  @IsNumber()
  @IsOptional()
  item?: number;

  @IsDate()
  @IsOptional()
  completed_at?: Date;
}
