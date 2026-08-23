import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
  @IsString() nomComplet: string;
  @IsString() telephone: string;
  @IsOptional() @IsEmail() email?: string;
  @IsString() centreHabituelId: string;
  @IsOptional() @IsString() photoProfilUrl?: string;
}

export class UpdateCustomerDto {
  @IsOptional() @IsString() nomComplet?: string;
  @IsOptional() @IsString() telephone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() photoProfilUrl?: string;
}
