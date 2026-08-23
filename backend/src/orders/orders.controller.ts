import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CenterScopeGuard } from '../common/guards/center-scope.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

// Chaque route métier applique les trois guards dans cet ordre :
// 1) JwtAuthGuard  — l'appelant est authentifié
// 2) RolesGuard    — son rôle est autorisé pour cette action
// 3) CenterScopeGuard — le centre concerné lui est bien rattaché
@UseGuards(JwtAuthGuard, RolesGuard, CenterScopeGuard)
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Roles('DIRECTION', 'GESTIONNAIRE', 'CAISSIER')
  @Get()
  list(@Query('centerId') centerId: string) {
    return this.ordersService.findByCenter(centerId);
  }

  @Roles('DIRECTION', 'GESTIONNAIRE', 'CAISSIER')
  @Post()
  create(@Body() dto: CreateOrderDto, @Request() req) {
    return this.ordersService.create({ ...dto, agentCreateurId: req.user.id });
  }

  // Incrémente les jours servis et fait basculer le statut en
  // "entièrement servi" une fois la durée totale atteinte — commandes
  // de repas (type PERIODE) uniquement.
  @Roles('DIRECTION', 'GESTIONNAIRE', 'CAISSIER')
  @Patch(':id/progress')
  updateProgress(@Param('id') id: string, @Body('joursServisSupplementaires') n: number) {
    return this.ordersService.incrementProgress(id, n);
  }

  // Marque une commande STANDARD comme livrée en une fois — pas de
  // notion de progression jour par jour pour ces produits.
  @Roles('DIRECTION', 'GESTIONNAIRE', 'CAISSIER')
  @Patch(':id/deliver')
  livrer(@Param('id') id: string) {
    return this.ordersService.livrer(id);
  }

  @Roles('DIRECTION', 'GESTIONNAIRE')
  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.ordersService.cancel(id);
  }
}
