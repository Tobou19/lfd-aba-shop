import { IsArray, IsBoolean, IsDateString, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class LigneDto {
  @IsString() produitId: string;
  quantite: number;
}

export class CreateOrderDto {
  @IsString() clientId: string;
  @IsString() centreId: string;
  @IsString() lieuLivraison: string;

  // Requis uniquement pour une commande de repas (produits NOURRITURE) —
  // le service détermine le type de commande à partir des produits
  // choisis et valide la présence de ces dates dans ce cas précis.
  // Voir OrdersService.create.
  @IsOptional() @IsDateString() dateDebut?: string;
  @IsOptional() @IsDateString() dateFin?: string;

  @IsBoolean() sousTraitement: boolean;
  @IsString() modePaiement: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LigneDto)
  lignes: LigneDto[];
}
