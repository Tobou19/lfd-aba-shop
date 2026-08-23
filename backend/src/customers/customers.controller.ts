import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CenterScopeGuard } from '../common/guards/center-scope.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@UseGuards(JwtAuthGuard, RolesGuard, CenterScopeGuard)
@Controller('customers')
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Roles('DIRECTION', 'GESTIONNAIRE', 'CAISSIER')
  @Get()
  findAll(@Query('q') q?: string, @Query('centerId') centerId?: string) {
    return this.customersService.findAll({ q, centreId: centerId });
  }

  @Roles('DIRECTION', 'GESTIONNAIRE', 'CAISSIER')
  @Post()
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @Roles('DIRECTION', 'GESTIONNAIRE', 'CAISSIER')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customersService.update(id, dto);
  }

  @Roles('DIRECTION', 'GESTIONNAIRE', 'CAISSIER')
  @Get(':id/history')
  historique(@Param('id') id: string) {
    return this.customersService.historique(id);
  }
}
