import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCenterDto, UpdateCenterDto } from './dto/center.dto';

@Injectable()
export class CentersService {
  constructor(private prisma: PrismaService) {}

  // Visible par tous les rôles authentifiés : un Caissier doit pouvoir
  // lister les centres pour, par exemple, orienter un client — la
  // restriction porte sur les DONNÉES d'un centre (commandes, clients),
  // pas sur la liste des centres eux-mêmes.
  findAll() {
    return this.prisma.centre.findMany({ orderBy: { nom: 'asc' } });
  }

  async create(dto: CreateCenterDto) {
    return this.prisma.centre.create({ data: dto as any });
  }

  // Couvre le cas déjà observé dans le cahier des charges : changement
  // d'adresse du centre Nigeria (§13.3) sans perte d'historique.
  async update(id: string, dto: UpdateCenterDto) {
    await this.assertExiste(id);
    return this.prisma.centre.update({ where: { id }, data: dto });
  }

  async desactiver(id: string) {
    await this.assertExiste(id);
    return this.prisma.centre.update({ where: { id }, data: { actif: false } });
  }

  private async assertExiste(id: string) {
    const c = await this.prisma.centre.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('Centre introuvable.');
  }
}
