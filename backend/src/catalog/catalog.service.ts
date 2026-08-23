import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class CatalogService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  // Un centre voit son propre catalogue + les produits globaux (centreId null).
  findForCenter(centreId?: string) {
    return this.prisma.produit.findMany({
      where: centreId ? { OR: [{ centreId }, { centreId: null }] } : undefined,
      orderBy: { nom: 'asc' },
    });
  }

  create(dto: CreateProductDto) {
    return this.prisma.produit.create({ data: dto as any });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.assertExiste(id);
    return this.prisma.produit.update({ where: { id }, data: dto });
  }

  // Endpoint dédié : bascule la disponibilité et déclenche l'alerte de
  // rupture consommée par le module `notifications` (§4.10).
  async setAvailability(id: string, disponible: boolean) {
    await this.assertExiste(id);
    const produit = await this.prisma.produit.update({
      where: { id },
      data: { disponible },
    });
    if (!disponible) {
      await this.notifications.notifierRuptureStock(produit.centreId, produit.nom, produit.id);
    }
    return produit;
  }

  private async assertExiste(id: string) {
    const p = await this.prisma.produit.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Produit introuvable.');
  }
}
