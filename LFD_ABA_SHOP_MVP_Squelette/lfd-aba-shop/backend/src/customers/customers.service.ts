import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  // Recherche/filtre combiné (§4.4) : nom, téléphone, centre, statut de
  // fidélité. Le filtre centre est systématiquement appliqué en amont
  // par CenterScopeGuard pour Gestionnaire/Caissier — ici on l'accepte
  // aussi en paramètre explicite pour la Direction (vue multi-centres).
  findAll(params: { q?: string; centreId?: string }) {
    return this.prisma.client.findMany({
      where: {
        centreHabituelId: params.centreId,
        OR: params.q
          ? [
              { nomComplet: { contains: params.q, mode: 'insensitive' } },
              { telephone: { contains: params.q } },
            ]
          : undefined,
      },
      orderBy: { nomComplet: 'asc' },
    });
  }

  create(dto: CreateCustomerDto) {
    return this.prisma.client.create({ data: dto });
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.assertExiste(id);
    return this.prisma.client.update({ where: { id }, data: dto });
  }

  // Historique complet + montant total dépensé, calculés à la volée
  // plutôt que stockés — évite toute désynchronisation (§4.4).
  async historique(id: string) {
    await this.assertExiste(id);
    const commandes = await this.prisma.commande.findMany({
      where: { clientId: id },
      include: { lignes: { include: { produit: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const montantTotalDepense = commandes.reduce(
      (s, c) => s + Number(c.montantTotal),
      0,
    );
    const toutesServies = commandes.every((c) => c.entierementServi || c.statutPaiement === 'ANNULE');
    return { commandes, montantTotalDepense, toutesServies };
  }

  private async assertExiste(id: string) {
    const c = await this.prisma.client.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('Bénéficiaire introuvable.');
  }
}
