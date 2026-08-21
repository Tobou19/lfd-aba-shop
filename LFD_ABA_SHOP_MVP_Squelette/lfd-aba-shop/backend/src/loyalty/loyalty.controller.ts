import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { LoyaltyService } from './loyalty.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('loyalty')
export class LoyaltyController {
  constructor(private loyaltyService: LoyaltyService) {}

  @Roles('DIRECTION', 'GESTIONNAIRE', 'CAISSIER')
  @Get(':clientId')
  historique(@Param('clientId') clientId: string) {
    return this.loyaltyService.historique(clientId);
  }

  // Octroi recommandé avec validation du Gestionnaire (§5, matrice des permissions).
  @Roles('DIRECTION', 'GESTIONNAIRE')
  @Post(':clientId/grant')
  grant(
    @Param('clientId') clientId: string,
    @Body('semaineIso') semaineIso: string,
    @Body('agentId') agentId: string,
  ) {
    return this.loyaltyService.accorderSemaineGratuite(clientId, semaineIso, agentId);
  }

  // Déclenchement manuel du traitement hebdomadaire (uniquement les
  // commandes de repas PAYÉES comptent — voir LoyaltyService). Réservé à
  // la Direction en attendant le branchement d'un job planifié
  // automatique (@nestjs/schedule, non inclus dans ce squelette).
  @Roles('DIRECTION')
  @Post('process-week/:semaineIso')
  traiterSemaine(@Param('semaineIso') semaineIso: string) {
    return this.loyaltyService.traiterConsommationHebdomadaire(semaineIso);
  }
}
