import { IsEnum, IsIn, IsOptional, IsString } from 'class-validator';

export enum ModePaiementEnum {
  MTN_MOMO = 'MTN_MOMO',
  ORANGE_MONEY = 'ORANGE_MONEY',
  ESPECES = 'ESPECES',
  CARTE = 'CARTE',
  VIREMENT = 'VIREMENT',
}

export class RecordPaymentDto {
  @IsString() commandeId: string;
  @IsEnum(ModePaiementEnum) modePaiement: ModePaiementEnum;
}

// Lot V2 (§11 du cahier des charges) : initiation d'un encaissement
// mobile money directement depuis l'application, sans ressaisie manuelle.
export class InitiateMobileMoneyDto {
  @IsString() commandeId: string;

  @IsIn(['MTN_MOMO', 'ORANGE_MONEY'])
  operateur: 'MTN_MOMO' | 'ORANGE_MONEY';

  @IsOptional() @IsString() telephonePayeur?: string; // requis pour MTN_MOMO
}

// Corps du webhook envoyé par l'opérateur à la confirmation (ou à
// l'échec) du paiement — la structure exacte varie par opérateur ; ce
// DTO couvre le dénominateur commun exploité par PaymentsService.
export class MobileMoneyWebhookDto {
  @IsString() referenceExterne: string; // X-Reference-Id (MTN) ou pay_token (Orange)

  @IsIn(['SUCCESSFUL', 'FAILED', 'PENDING', 'SUCCESS', 'ERROR'])
  statut: string;
}
