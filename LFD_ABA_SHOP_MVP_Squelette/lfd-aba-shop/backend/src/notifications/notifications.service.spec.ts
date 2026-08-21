import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      notification: {
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn((args) => Promise.resolve({ id: args.where.id, ...args.data })),
        create: jest.fn((args) => Promise.resolve({ id: 'n1', ...args.data })),
      },
    };
    service = new NotificationsService(prisma);
  });

  it('liste les notifications du centre et les notifications globales', async () => {
    await service.findForCenter('douala');
    expect(prisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { OR: [{ centreId: 'douala' }, { centreId: null }] },
      }),
    );
  });

  it('marque une notification comme lue', async () => {
    const resultat = await service.marquerLue('n1');
    expect(resultat.lue).toBe(true);
  });

  it('crée une notification de type SEMAINE_GRATUITE_DUE avec le bon message', async () => {
    const resultat = await service.notifierSemaineGratuiteDue('douala', 'Jean-Paul Ateba', 'c2');
    expect(resultat.type).toBe('SEMAINE_GRATUITE_DUE');
    expect(resultat.message).toContain('Jean-Paul Ateba');
    expect(resultat.lienEntite).toBe('c2');
  });

  it('crée une notification de type RUPTURE_STOCK avec le bon message', async () => {
    const resultat = await service.notifierRuptureStock('douala', 'Lait de Coco Fermenté', 'p4');
    expect(resultat.type).toBe('RUPTURE_STOCK');
    expect(resultat.message).toContain('Lait de Coco Fermenté');
  });
});
