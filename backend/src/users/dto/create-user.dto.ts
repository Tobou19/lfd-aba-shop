import { IsArray, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export enum RoleDto {
  DIRECTION = 'DIRECTION',
  GESTIONNAIRE = 'GESTIONNAIRE',
  CAISSIER = 'CAISSIER',
}

export class CreateUserDto {
  @IsString() nomComplet: string;

  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() telephone?: string;

  // Mot de passe fourni en clair uniquement à la création : il est haché
  // immédiatement dans le service, jamais journalisé, jamais renvoyé.
  @IsString() @MinLength(8) motDePasse: string;

  @IsEnum(RoleDto) role: RoleDto;

  @IsArray() centreIds: string[];
}
