import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';

export enum FarmCategory {
  LEAFY_AQUATIC = 'leafy-aquatic',
  FRUIT_GOURDS = 'fruit-gourds',
  ROOT_TUBERS = 'root-tubers',
  KHMER_HERBS = 'khmer-herbs',
  FLOWERS_SHOOTS = 'flowers-shoots',
  MUSHROOMS = 'mushrooms',
  ORGANIC_PRODUCE = 'organic-produce',
  SEEDS_SEEDLINGS = 'seeds-seedlings',
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
