import { IsArray, IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { RoleDto } from './create-user.dto';

export class UpdateUserDto {
  @IsOptional() @IsString() nomComplet?: string;
  @IsOptional() @IsEnum(RoleDto) role?: RoleDto;
  @IsOptional() @IsArray() centreIds?: string[];
  @IsOptional() @IsBoolean() statut?: boolean;
}
