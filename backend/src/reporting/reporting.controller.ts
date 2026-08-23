import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CenterScopeGuard } from '../common/guards/center-scope.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ReportingService } from './reporting.service';

@UseGuards(JwtAuthGuard, RolesGuard, CenterScopeGuard)
@Controller('reports')
export class ReportingController {
  constructor(private reportingService: ReportingService) {}

  // Un Gestionnaire/Caissier ne peut demander que le tableau de bord de
  // son propre centre (CenterScopeGuard) ; la Direction peut omettre
  // centerId pour obtenir la vue consolidée (§4.9, §9.3).
  @Roles('DIRECTION', 'GESTIONNAIRE', 'CAISSIER')
  @Get('dashboard')
  dashboard(
    @Query('centerId') centerId?: string,
    @Query('period') period: 'month' | 'year' = 'month',
  ) {
    if (!centerId) return this.reportingService.consolide(period);
    return this.reportingService.dashboard(centerId, period);
  }

  @Roles('DIRECTION', 'GESTIONNAIRE')
  @Get('export')
  export(
    @Query('format') format: 'pdf' | 'excel' = 'pdf',
    @Query('centerId') centerId?: string,
    @Query('period') period: 'month' | 'year' = 'month',
  ) {
    return this.reportingService.export(format, centerId, period);
  }
}
