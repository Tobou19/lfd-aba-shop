import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { DeviseDto } from '../../centers/dto/center.dto';

export enum TypeProduitDto {
  NOURRITURE = 'NOURRITURE',
  STANDARD = 'STANDARD',
}

export class CreateProductDto {
  @IsString() nom: string;
  @IsOptional() @IsString() nomScientifique?: string;
  @IsOptional() @IsString() vertus?: string;

  @IsNumber() @Min(0) prixUnitaire: number;
  @IsEnum(DeviseDto) devise: DeviseDto;

  // NOURRITURE => commande par période avec fidélité (repas
  // thérapeutiques) ; STANDARD => commande simple, comme tout autre
  // article de la boutique ABA SHOP. Détermine le comportement de la
  // commande au moment de sa création (voir OrdersService.create).
  @IsEnum(TypeProduitDto) type: TypeProduitDto;

  // Nullable : un produit sans centreId est un prix de référence global,
  // surchageable par centre — cf. §4.3 « prix modifiable par produit et
  // par devise/centre si nécessaire ».
  @IsOptional() @IsString() centreId?: string;
  @IsOptional() @IsString() photoUrl?: string;
}

export class UpdateProductDto {
  @IsOptional() @IsNumber() @Min(0) prixUnitaire?: number;
  @IsOptional() @IsString() photoUrl?: string;
}

export class UpdateAvailabilityDto {
  @IsBoolean() disponible: boolean;
}
