import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { NotificationsService } from './notifications.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Roles('DIRECTION', 'GESTIONNAIRE', 'CAISSIER')
  @Get()
  findForCenter(@Query('centerId') centerId?: string) {
    return this.notificationsService.findForCenter(centerId);
  }

  @Roles('DIRECTION', 'GESTIONNAIRE', 'CAISSIER')
  @Patch(':id/read')
  marquerLue(@Param('id') id: string) {
    return this.notificationsService.marquerLue(id);
  }
}
