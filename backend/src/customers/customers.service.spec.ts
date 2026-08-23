import { NotFoundException } from '@nestjs/common';
import { CustomersService } from './customers.service';

describe('CustomersService', () => {
  let service: CustomersService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      client: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn() },
      commande: { findMany: jest.fn() },
    };
    service = new CustomersService(prisma);
  });

  it('construit une recherche combinant nom et téléphone (insensible à la casse)', async () => {
    await service.findAll({ q: 'mireille', centreId: 'douala' });
    expect(prisma.client.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          centreHabituelId: 'douala',
          OR: [
            { nomComplet: { contains: 'mireille', mode: 'insensitive' } },
            { telephone: { contains: 'mireille' } },
          ],
        }),
      }),
    );
  });

  it("lève une erreur si le bénéficiaire n'existe pas pour l'historique", async () => {
    prisma.client.findUnique.mockResolvedValue(null);
    await expect(service.historique('inconnu')).rejects.toThrow(NotFoundException);
  });

  it('calcule le montant total dépensé et le statut "toutes servies"', async () => {
    prisma.client.findUnique.mockResolvedValue({ id: 'c1' });
    prisma.commande.findMany.mockResolvedValue([
      { montantTotal: 15000, entierementServi: true, statutPaiement: 'PAYE' },
      { montantTotal: 9000, entierementServi: true, statutPaiement: 'PAYE' },
    ]);

    const resultat = await service.historique('c1');

    expect(resultat.montantTotalDepense).toBe(24000);
    expect(resultat.toutesServies).toBe(true);
  });

  it("l'indicateur toutesServies passe à faux si une commande est encore en cours", async () => {
    prisma.client.findUnique.mockResolvedValue({ id: 'c1' });
    prisma.commande.findMany.mockResolvedValue([
      { montantTotal: 15000, entierementServi: true, statutPaiement: 'PAYE' },
      { montantTotal: 5000, entierementServi: false, statutPaiement: 'EN_ATTENTE' },
    ]);

    const resultat = await service.historique('c1');

    expect(resultat.toutesServies).toBe(false);
  });
});
