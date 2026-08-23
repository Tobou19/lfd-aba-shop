import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  findByCenter(centreId: string) {
    return this.prisma.commande.findMany({
      where: { centreId },
      include: { client: true, lignes: { include: { produit: true } } },
      orderBy: { createdAt: 'asc' }, // "premier payé, premier servi" (§4.5)
    });
  }

  // Une commande est soit entièrement composée de repas thérapeutiques
  // (type PERIODE — paiement par jour/semaine/mois/année, fidélité),
  // soit entièrement composée d'autres produits de la boutique (type
  // STANDARD — commande simple, comme n'importe quel achat classique).
  // Le mélange des deux dans une même commande est refusé : cela
  // éviterait d'avoir à faire cohabiter deux logiques de calcul et de
  // livraison incompatibles sur un seul objet.
  async create(dto: CreateOrderDto & { agentCreateurId: string }) {
    const produits = await this.prisma.produit.findMany({
      where: { id: { in: dto.lignes.map((l) => l.produitId) } },
    });
    if (produits.length !== dto.lignes.length) {
      throw new BadRequestException('Un ou plusieurs produits sont introuvables.');
    }

    const typesPresents = new Set(produits.map((p) => p.type));
    if (typesPresents.size > 1) {
      throw new BadRequestException(
        "Une commande ne peut pas mélanger des repas thérapeutiques (facturés par période) " +
          'et des produits standards. Créez deux commandes séparées.',
      );
    }
    const typeCommande = typesPresents.has('NOURRITURE') ? 'PERIODE' : 'STANDARD';

    if (typeCommande === 'PERIODE') {
      return this.creerCommandePeriode(dto, produits);
    }
    return this.creerCommandeStandard(dto, produits);
  }

  // Repas thérapeutiques : le montant dépend de la durée choisie par le
  // client — un jour, une semaine, un mois, ou plusieurs mois/années
  // (§ règle métier LFD-Services : « on paye par jour i.e 1 plat ou
  // plusieurs, par semaine même principe, par mois ou pour plusieurs
  // mois voire par an »). Le nombre de jours facturés découle simplement
  // de l'écart entre dateDebut et dateFin, quelle que soit son ampleur —
  // aucune limite technique n'est imposée à la durée choisie.
  private async creerCommandePeriode(
    dto: CreateOrderDto & { agentCreateurId: string },
    produits: { id: string; prixUnitaire: unknown }[],
  ) {
    if (!dto.dateDebut || !dto.dateFin) {
      throw new BadRequestException(
        'Une commande de repas doit préciser une date de début et une date de fin (période facturée).',
      );
    }
    const jours = this.nombreDeJours(dto.dateDebut, dto.dateFin);

    // Le montant total est calculé côté serveur, jamais reçu du client
    // (cf. §12 : un reçu doit être fiable quel que soit l'appareil).
    const montantTotal = dto.lignes.reduce((total, ligne) => {
      const p = produits.find((p) => p.id === ligne.produitId);
      return total + Number(p.prixUnitaire) * ligne.quantite * jours;
    }, 0);

    return this.prisma.commande.create({
      data: {
        clientId: dto.clientId,
        centreId: dto.centreId,
        lieuLivraison: dto.lieuLivraison,
        typeCommande: 'PERIODE',
        dateDebut: new Date(dto.dateDebut),
        dateFin: new Date(dto.dateFin),
        sousTraitement: dto.sousTraitement,
        modePaiement: dto.modePaiement as any,
        montantTotal,
        agentCreateurId: dto.agentCreateurId,
        lignes: {
          create: dto.lignes.map((l) => ({ produitId: l.produitId, quantite: l.quantite })),
        },
      },
    });
  }

  // Tous les autres produits de la boutique : commande simple, une seule
  // livraison, montant = prix × quantité, sans notion de période ni de
  // fidélité — exactement comme n'importe quel achat classique.
  private async creerCommandeStandard(
    dto: CreateOrderDto & { agentCreateurId: string },
    produits: { id: string; prixUnitaire: unknown }[],
  ) {
    const montantTotal = dto.lignes.reduce((total, ligne) => {
      const p = produits.find((p) => p.id === ligne.produitId);
      return total + Number(p.prixUnitaire) * ligne.quantite;
    }, 0);

    return this.prisma.commande.create({
      data: {
        clientId: dto.clientId,
        centreId: dto.centreId,
        lieuLivraison: dto.lieuLivraison,
        typeCommande: 'STANDARD',
        // Pas de période pour une commande standard.
        dateDebut: null,
        dateFin: null,
        sousTraitement: dto.sousTraitement,
        modePaiement: dto.modePaiement as any,
        montantTotal,
        agentCreateurId: dto.agentCreateurId,
        lignes: {
          create: dto.lignes.map((l) => ({ produitId: l.produitId, quantite: l.quantite })),
        },
      },
    });
  }

  // Progression jour par jour — réservée aux commandes de repas (PERIODE).
  // Une commande STANDARD n'a pas de notion de "jours servis" : elle se
  // livre en une fois (voir livrer ci-dessous).
  async incrementProgress(id: string, joursSupplementaires: number) {
    const commande = await this.prisma.commande.findUnique({ where: { id } });
    if (!commande) throw new NotFoundException('Commande introuvable.');
    if (commande.typeCommande !== 'PERIODE') {
      throw new BadRequestException(
        "La progression jour par jour ne s'applique qu'aux commandes de repas (type PERIODE).",
      );
    }

    const totalJours = this.nombreDeJours(
      commande.dateDebut!.toISOString(),
      commande.dateFin!.toISOString(),
    );
    const joursServis = Math.min(totalJours, commande.joursServis + joursSupplementaires);

    return this.prisma.commande.update({
      where: { id },
      data: {
        joursServis,
        entierementServi: joursServis >= totalJours,
      },
    });
  }

  // Livraison en une fois — réservée aux commandes STANDARD.
  async livrer(id: string) {
    const commande = await this.prisma.commande.findUnique({ where: { id } });
    if (!commande) throw new NotFoundException('Commande introuvable.');
    if (commande.typeCommande !== 'STANDARD') {
      throw new BadRequestException(
        'Cette commande est facturée par période : utilisez la progression jour par jour, pas la livraison directe.',
      );
    }
    return this.prisma.commande.update({
      where: { id },
      data: { entierementServi: true },
    });
  }

  cancel(id: string) {
    return this.prisma.commande.update({
      where: { id },
      data: { statutPaiement: 'ANNULE' },
    });
  }

  private nombreDeJours(debut: string, fin: string): number {
    const ms = new Date(fin).getTime() - new Date(debut).getTime();
    return Math.max(1, Math.round(ms / 86_400_000) + 1);
  }
}
