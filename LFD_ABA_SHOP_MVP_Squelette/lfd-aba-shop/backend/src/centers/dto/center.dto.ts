import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export enum DeviseDto { FCFA = 'FCFA', NGN = 'NGN' }

export class CreateCenterDto {
  @IsString() nom: string;
  @IsString() adresse: string;
  @IsString() pays: string;
  @IsEnum(DeviseDto) devise: DeviseDto;
  @IsOptional() @IsString() responsable?: string;
}

export class UpdateCenterDto {
  @IsOptional() @IsString() nom?: string;
  @IsOptional() @IsString() adresse?: string;
  @IsOptional() @IsString() responsable?: string;
  @IsOptional() @IsBoolean() actif?: boolean;
}
