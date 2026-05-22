import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsDate,
  IsEnum,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../orders.entity';

export class CreateOrderItemDto {
  @IsNumber()
  @IsNotEmpty()
  product_id: number;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;
}

export class CreateOrderDto {
  @IsString()
  @IsOptional()
  order_code?: string;

  @IsNumber()
  @IsNotEmpty()
  customer_id: number;

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  @IsOptional()
  items?: CreateOrderItemDto[];
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
