import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// Module entièrement réservé à la Direction/CMB : la gestion des comptes
// et des rôles est le point d'entrée le plus sensible de l'application.
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DIRECTION')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  desactiver(@Param('id') id: string) {
    return this.usersService.desactiver(id);
  }

  @Patch(':id/reset-password')
  resetPassword(@Param('id') id: string, @Body('nouveauMotDePasse') nouveauMotDePasse: string) {
    return this.usersService.reinitialiserMotDePasse(id, nouveauMotDePasse);
  }
}
