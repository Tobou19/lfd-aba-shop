import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CentersService } from './centers.service';
import { CreateCenterDto, UpdateCenterDto } from './dto/center.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('centers')
export class CentersController {
  constructor(private centersService: CentersService) {}

  // Lecture ouverte aux trois rôles — la donnée sensible est le contenu
  // d'un centre (commandes, clients), pas la liste des centres.
  @Roles('DIRECTION', 'GESTIONNAIRE', 'CAISSIER')
  @Get()
  findAll() {
    return this.centersService.findAll();
  }

  @Roles('DIRECTION')
  @Post()
  create(@Body() dto: CreateCenterDto) {
    return this.centersService.create(dto);
  }

  @Roles('DIRECTION')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCenterDto) {
    return this.centersService.update(id, dto);
  }

  @Roles('DIRECTION')
  @Delete(':id')
  desactiver(@Param('id') id: string) {
    return this.centersService.desactiver(id);
  }
}
