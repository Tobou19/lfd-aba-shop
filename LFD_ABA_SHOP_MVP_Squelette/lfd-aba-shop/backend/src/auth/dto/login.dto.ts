import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  identifiant: string; // email ou téléphone

  @IsString()
  @MinLength(8)
  motDePasse: string;
}
