import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CatalogService } from './catalog.service';
import { CreateProductDto, UpdateAvailabilityDto, UpdateProductDto } from './dto/product.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class CatalogController {
  constructor(private catalogService: CatalogService) {}

  @Roles('DIRECTION', 'GESTIONNAIRE', 'CAISSIER')
  @Get()
  findForCenter(@Query('centerId') centerId?: string) {
    return this.catalogService.findForCenter(centerId);
  }

  // Modification du catalogue/prix réservée à la Direction et au
  // Gestionnaire (§5) — jamais au Caissier.
  @Roles('DIRECTION', 'GESTIONNAIRE')
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.catalogService.create(dto);
  }

  @Roles('DIRECTION', 'GESTIONNAIRE')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.catalogService.update(id, dto);
  }

  @Roles('DIRECTION', 'GESTIONNAIRE')
  @Patch(':id/availability')
  setAvailability(@Param('id') id: string, @Body() dto: UpdateAvailabilityDto) {
    return this.catalogService.setAvailability(id, dto.disponible);
  }
}
