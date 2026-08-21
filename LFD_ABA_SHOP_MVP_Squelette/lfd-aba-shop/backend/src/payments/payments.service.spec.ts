import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaymentsService } from './payments.service';

// MtnMomoProvider et OrangeMoneyProvider sont simulés : ce test vérifie
// l'ORCHESTRATION (validation, persistance de la tentative, idempotence
// du webhook), pas les appels réseau réels vers les opérateurs.
describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: any;
  let mtnMomo: any;
  let orangeMoney: any;

  beforeEach(() => {
    prisma = {
      commande: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'cmd1',
          centreId: 'douala',
          montantTotal: 24000,
        }),
        update: jest.fn((args) => Promise.resolve({ id: args.where.id, ...args.data })),
      },
      centre: {
        findUnique: jest.fn().mockResolvedValue({ id: 'douala', devise: 'FCFA' }),
      },
      tentativePaiementMobile: {
        create: jest.fn((args) => Promise.resolve({ id: 't1', statut: 'EN_ATTENTE', ...args.data })),
        findUnique: jest.fn(),
        update: jest.fn((args) => Promise.resolve({ id: args.where.id, ...args.data })),
      },
    };
    mtnMomo = { demanderPaiement: jest.fn().mockResolvedValue({ referenceExterne: 'ref-mtn-1' }) };
    orangeMoney = {
      creerSessionPaiement: jest
        .fn()
        .mockResolvedValue({ referenceExterne: 'pay-token-1', urlPaiement: 'https://pay.orange/x' }),
    };
    service = new PaymentsService(prisma, mtnMomo, orangeMoney);
  });

  it('marque la commande payée lors d\u2019un enregistrement manuel', async () => {
    const resultat = await service.record({ commandeId: 'cmd1', modePaiement: 'ESPECES' as any });
    expect(resultat.statutPaiement).toBe('PAYE');
  });

  it('refuse une initiation MTN Mobile Money sans numéro de téléphone', async () => {
    await expect(
      service.initiateMobileMoney({ commandeId: 'cmd1', operateur: 'MTN_MOMO' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('initie un paiement MTN Mobile Money et journalise la tentative', async () => {
    const resultat = await service.initiateMobileMoney({
      commandeId: 'cmd1',
      operateur: 'MTN_MOMO',
      telephonePayeur: '677889900',
    } as any);

    expect(mtnMomo.demanderPaiement).toHaveBeenCalledWith(
      expect.objectContaining({ montant: 24000, devise: 'FCFA', telephonePayeur: '677889900' }),
    );
    expect(prisma.tentativePaiementMobile.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ operateur: 'MTN_MOMO' }) }),
    );
    expect(resultat.referenceExterne).toBe('ref-mtn-1');
  });

  it('initie un paiement Orange Money et renvoie l\u2019URL de paiement', async () => {
    const resultat = await service.initiateMobileMoney({
      commandeId: 'cmd1',
      operateur: 'ORANGE_MONEY',
    } as any);

    expect(orangeMoney.creerSessionPaiement).toHaveBeenCalled();
    expect(resultat.urlPaiement).toBe('https://pay.orange/x');
  });

  it("lève une erreur si la référence du webhook est inconnue", async () => {
    prisma.tentativePaiementMobile.findUnique.mockResolvedValue(null);
    await expect(service.traiterWebhook('ref-inconnue', 'SUCCESSFUL')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('confirme la commande au succès du webhook', async () => {
    prisma.tentativePaiementMobile.findUnique.mockResolvedValue({
      id: 't1',
      commandeId: 'cmd1',
      operateur: 'MTN_MOMO',
      statut: 'EN_ATTENTE',
    });

    await service.traiterWebhook('ref-mtn-1', 'SUCCESSFUL');

    expect(prisma.commande.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cmd1' },
        data: expect.objectContaining({ statutPaiement: 'PAYE' }),
      }),
    );
  });

  it('ignore un webhook déjà traité (idempotence)', async () => {
    prisma.tentativePaiementMobile.findUnique.mockResolvedValue({
      id: 't1',
      commandeId: 'cmd1',
      statut: 'REUSSI',
    });

    await service.traiterWebhook('ref-mtn-1', 'SUCCESSFUL');

    expect(prisma.tentativePaiementMobile.update).not.toHaveBeenCalled();
    expect(prisma.commande.update).not.toHaveBeenCalled();
  });
});
