import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ReceiptsService } from './receipts.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('receipts')
export class ReceiptsController {
  constructor(private receiptsService: ReceiptsService) {}

  @Roles('DIRECTION', 'GESTIONNAIRE', 'CAISSIER')
  @Post()
  creer(
    @Body()
    body: {
      clientId: string;
      commandeIds: string[];
      caissierId: string;
      modePaiement: string;
      signatureDataUrl?: string;
      cachetDataUrl?: string;
      photosRepasDataUrls?: string[];
    },
  ) {
    return this.receiptsService.creer(body.clientId, body.commandeIds, body.caissierId, body.modePaiement, {
      signatureDataUrl: body.signatureDataUrl,
      cachetDataUrl: body.cachetDataUrl,
      photosRepasDataUrls: body.photosRepasDataUrls,
    });
  }

  @Roles('DIRECTION', 'GESTIONNAIRE', 'CAISSIER')
  @Post(':id/send')
  envoyer(@Param('id') id: string, @Body('canal') canal: 'email' | 'whatsapp') {
    return this.receiptsService.envoyer(id, canal);
  }
}
