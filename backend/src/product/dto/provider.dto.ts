import { IsOptional, IsString, MinLength } from 'class-validator';
export class UpdateProviderDto {
  @IsString()
  user_id!: string;
  @IsString()
  provider_name?: string;

  @IsString()
  farm_name?: string;

  @IsString()
  location?: string;

  @IsString()
  story?: string;

  @IsString()
  @MinLength(0)
  id_number?: string;

  @IsString()
  avatar?: string;

  @IsString()
  farm_image?: string;

  @IsString()
  qr_image?: string;

  @IsOptional()
  banks?: {
    name: string;
    account: string;
    qr: string;
  }[];
}
