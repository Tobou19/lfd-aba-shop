import { Body, Controller, Headers, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PaymentsService } from './payments.service';
import { InitiateMobileMoneyDto, MobileMoneyWebhookDto, RecordPaymentDto } from './dto/payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DIRECTION', 'GESTIONNAIRE', 'CAISSIER')
  @Post()
  record(@Body() dto: RecordPaymentDto) {
    return this.paymentsService.record(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DIRECTION', 'GESTIONNAIRE', 'CAISSIER')
  @Post('mobile-money/initiate')
  initiateMobileMoney(@Body() dto: InitiateMobileMoneyDto) {
    return this.paymentsService.initiateMobileMoney(dto);
  }

  // Endpoint appelé par MTN/Orange, PAS par le frontend : jamais protégé
  // par JwtAuthGuard (l'opérateur n'a pas de compte utilisateur), mais
  // vérifié par un secret partagé transmis en en-tête — à configurer
  // avec l'opérateur (MTN_MOMO_WEBHOOK_SECRET / ORANGE_MONEY_WEBHOOK_SECRET).
  // Sans ce contrôle, n'importe qui pourrait déclencher une fausse
  // confirmation de paiement.
  @Post('mobile-money/webhook')
  webhook(@Body() dto: MobileMoneyWebhookDto, @Headers('x-webhook-secret') secret: string) {
    const attendu = process.env.MOBILE_MONEY_WEBHOOK_SECRET;
    if (!attendu || secret !== attendu) {
      throw new UnauthorizedException('Secret de webhook invalide.');
    }
    return this.paymentsService.traiterWebhook(dto.referenceExterne, dto.statut);
  }
}
