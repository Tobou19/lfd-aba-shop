import { NotFoundException } from '@nestjs/common';
import { CatalogService } from './catalog.service';

describe('CatalogService', () => {
  let service: CatalogService;
  let prisma: any;
  let notifications: any;

  beforeEach(() => {
    prisma = {
      produit: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        create: jest.fn((args) => Promise.resolve({ id: 'p1', ...args.data })),
        update: jest.fn((args) => Promise.resolve({ id: args.where.id, ...args.data })),
      },
    };
    notifications = { notifierRuptureStock: jest.fn() };
    service = new CatalogService(prisma, notifications);
  });

  it('interroge les produits du centre ET les produits à prix global', async () => {
    await service.findForCenter('douala');
    expect(prisma.produit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { OR: [{ centreId: 'douala' }, { centreId: null }] },
      }),
    );
  });

  it("lève une erreur si le produit n'existe pas", async () => {
    prisma.produit.findUnique.mockResolvedValue(null);
    await expect(service.update('inconnu', { prixUnitaire: 1000 })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('déclenche une notification de rupture quand disponible passe à faux', async () => {
    prisma.produit.findUnique.mockResolvedValue({ id: 'p1', nom: 'Moringa', centreId: 'douala' });
    prisma.produit.update.mockResolvedValue({ id: 'p1', nom: 'Moringa', centreId: 'douala', disponible: false });

    await service.setAvailability('p1', false);

    expect(notifications.notifierRuptureStock).toHaveBeenCalledWith('douala', 'Moringa', 'p1');
  });

  it('ne déclenche aucune notification quand disponible repasse à vrai', async () => {
    prisma.produit.findUnique.mockResolvedValue({ id: 'p1', nom: 'Moringa', centreId: 'douala' });
    prisma.produit.update.mockResolvedValue({ id: 'p1', disponible: true });

    await service.setAvailability('p1', true);

    expect(notifications.notifierRuptureStock).not.toHaveBeenCalled();
  });
});
