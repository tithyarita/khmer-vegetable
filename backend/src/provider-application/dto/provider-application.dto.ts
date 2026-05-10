import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';

export enum FarmCategory {
  ORGANIC_VEGETABLES = 'organic-vegetables',
  SEASONAL_FRUITS = 'seasonal-fruits',
  DAIRY_CHEESE = 'dairy-cheese',
  HONEY_BEESWAX = 'honey-beeswax',
  HERBS_MICROGREENS = 'herbs-microgreens',
  ROOT_VEGETABLES = 'root-vegetables',
  OTHER = 'other',
}

export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty()
  business_name!: string;

  @IsString()
  @IsNotEmpty()
  owner_name!: string;

  @IsEmail()
  @IsNotEmpty()
  contact_email!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  // Address breakdown
  @IsOptional()
  @IsString()
  village?: string;

  @IsOptional()
  @IsString()
  commune?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  city_province?: string;

  @IsOptional()
  @IsString()
  primary_vegetable?: string;

  @IsOptional()
  @IsEnum(FarmCategory)
  farm_category?: FarmCategory;
}
