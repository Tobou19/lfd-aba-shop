import { BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';

// Vérifie la règle métier centrale clarifiée par LFD-Services : les
// commandes de repas thérapeutiques (produits NOURRITURE) se facturent
// par période (jour/semaine/mois/année) avec fidélité, tandis que tous
// les autres produits de la boutique (STANDARD) se commandent normalement
// — montant = prix × quantité, sans notion de période.
describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: any;

  const produitNourriture = { id: 'p1', prixUnitaire: 2500, type: 'NOURRITURE' };
  const produitNourriture2 = { id: 'p2', prixUnitaire: 3000, type: 'NOURRITURE' };
  const produitStandard = { id: 'p3', prixUnitaire: 15000, type: 'STANDARD' };

  beforeEach(() => {
    prisma = {
      produit: { findMany: jest.fn() },
      commande: {
        create: jest.fn((args) => Promise.resolve({ id: 'cmd1', ...args.data })),
        findUnique: jest.fn(),
        update: jest.fn((args) => Promise.resolve({ id: args.where.id, ...args.data })),
      },
    };
    service = new OrdersService(prisma);
  });

  describe('commande de repas (type PERIODE)', () => {
    it('calcule le montant = somme(prix × quantité/jour × nombre de jours)', async () => {
      prisma.produit.findMany.mockResolvedValue([produitNourriture, produitNourriture2]);

      await service.create({
        clientId: 'c1',
        centreId: 'douala',
        lieuLivraison: 'Bonamoussadi',
        dateDebut: '2026-08-01',
        dateFin: '2026-08-03', // 3 jours inclus
        sousTraitement: false,
        modePaiement: 'ESPECES',
        agentCreateurId: 'u1',
        lignes: [
          { produitId: 'p1', quantite: 2 }, // 2500 * 2 * 3 = 15000
          { produitId: 'p2', quantite: 1 }, // 3000 * 1 * 3 = 9000
        ],
      } as any);

      expect(prisma.commande.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ typeCommande: 'PERIODE', montantTotal: 24000 }),
        }),
      );
    });

    it('accepte une période longue (plusieurs mois / une année) sans limite technique', async () => {
      prisma.produit.findMany.mockResolvedValue([produitNourriture]);

      await service.create({
        clientId: 'c1',
        centreId: 'douala',
        lieuLivraison: 'Bonamoussadi',
        dateDebut: '2026-01-01',
        dateFin: '2026-12-31', // ~1 an
        sousTraitement: false,
        modePaiement: 'VIREMENT',
        agentCreateurId: 'u1',
        lignes: [{ produitId: 'p1', quantite: 1 }],
      } as any);

      const appel = prisma.commande.create.mock.calls[0][0];
      expect(appel.data.montantTotal).toBe(2500 * 365);
    });

    it('refuse une commande de repas sans dates de période', async () => {
      prisma.produit.findMany.mockResolvedValue([produitNourriture]);

      await expect(
        service.create({
          clientId: 'c1',
          centreId: 'douala',
          lieuLivraison: 'Bonamoussadi',
          sousTraitement: false,
          modePaiement: 'ESPECES',
          agentCreateurId: 'u1',
          lignes: [{ produitId: 'p1', quantite: 1 }],
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('fait basculer entierementServi une fois la durée totale atteinte', async () => {
      prisma.commande.findUnique.mockResolvedValue({
        id: 'cmd1',
        typeCommande: 'PERIODE',
        dateDebut: new Date('2026-08-01'),
        dateFin: new Date('2026-08-05'),
        joursServis: 3,
      });

      const resultat = await service.incrementProgress('cmd1', 2);

      expect(resultat.joursServis).toBe(5);
      expect(resultat.entierementServi).toBe(true);
    });

    it('ne dépasse jamais le nombre total de jours de la commande', async () => {
      prisma.commande.findUnique.mockResolvedValue({
        id: 'cmd1',
        typeCommande: 'PERIODE',
        dateDebut: new Date('2026-08-01'),
        dateFin: new Date('2026-08-05'),
        joursServis: 4,
      });

      const resultat = await service.incrementProgress('cmd1', 10);
      expect(resultat.joursServis).toBe(5);
    });

    it('refuse la livraison directe sur une commande de repas', async () => {
      prisma.commande.findUnique.mockResolvedValue({ id: 'cmd1', typeCommande: 'PERIODE' });
      await expect(service.livrer('cmd1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('commande standard (autres produits de la boutique)', () => {
    it('calcule le montant = prix × quantité, sans notion de jours', async () => {
      prisma.produit.findMany.mockResolvedValue([produitStandard]);

      await service.create({
        clientId: 'c1',
        centreId: 'douala',
        lieuLivraison: 'Bonamoussadi',
        sousTraitement: false,
        modePaiement: 'CARTE',
        agentCreateurId: 'u1',
        lignes: [{ produitId: 'p3', quantite: 2 }], // 15000 * 2 = 30000
      } as any);

      expect(prisma.commande.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            typeCommande: 'STANDARD',
            montantTotal: 30000,
            dateDebut: null,
            dateFin: null,
          }),
        }),
      );
    });

    it('refuse la progression jour par jour sur une commande standard', async () => {
      prisma.commande.findUnique.mockResolvedValue({ id: 'cmd1', typeCommande: 'STANDARD' });
      await expect(service.incrementProgress('cmd1', 1)).rejects.toThrow(BadRequestException);
    });

    it('marque une commande standard comme livrée en une fois', async () => {
      prisma.commande.findUnique.mockResolvedValue({ id: 'cmd1', typeCommande: 'STANDARD' });
      const resultat = await service.livrer('cmd1');
      expect(resultat.entierementServi).toBe(true);
    });
  });

  it('refuse de mélanger repas et produits standards dans une même commande', async () => {
    prisma.produit.findMany.mockResolvedValue([produitNourriture, produitStandard]);

    await expect(
      service.create({
        clientId: 'c1',
        centreId: 'douala',
        lieuLivraison: 'Bonamoussadi',
        dateDebut: '2026-08-01',
        dateFin: '2026-08-03',
        sousTraitement: false,
        modePaiement: 'ESPECES',
        agentCreateurId: 'u1',
        lignes: [
          { produitId: 'p1', quantite: 1 },
          { produitId: 'p3', quantite: 1 },
        ],
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('refuse une commande référençant un produit introuvable', async () => {
    prisma.produit.findMany.mockResolvedValue([produitNourriture]); // un seul trouvé sur deux demandés

    await expect(
      service.create({
        clientId: 'c1',
        centreId: 'douala',
        lieuLivraison: 'Bonamoussadi',
        dateDebut: '2026-08-01',
        dateFin: '2026-08-03',
        sousTraitement: false,
        modePaiement: 'ESPECES',
        agentCreateurId: 'u1',
        lignes: [
          { produitId: 'p1', quantite: 1 },
          { produitId: 'inconnu', quantite: 1 },
        ],
      } as any),
    ).rejects.toThrow(BadRequestException);
  });
});
