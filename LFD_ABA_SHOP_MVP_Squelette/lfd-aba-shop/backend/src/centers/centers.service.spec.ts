import { NotFoundException } from '@nestjs/common';
import { CentersService } from './centers.service';

describe('CentersService', () => {
  let service: CentersService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      centre: {
        findMany: jest.fn().mockResolvedValue([{ id: 'douala', nom: 'Douala' }]),
        findUnique: jest.fn(),
        create: jest.fn((args) => Promise.resolve({ id: 'c1', ...args.data })),
        update: jest.fn((args) => Promise.resolve({ id: args.where.id, ...args.data })),
      },
    };
    service = new CentersService(prisma);
  });

  it('liste tous les centres', async () => {
    const resultat = await service.findAll();
    expect(resultat).toHaveLength(1);
  });

  it('crée un centre avec les champs fournis', async () => {
    const resultat = await service.create({
      nom: 'Bafoussam',
      adresse: 'Pessi Hôtel',
      pays: 'Cameroun',
      devise: 'FCFA' as any,
    });
    expect(resultat.nom).toBe('Bafoussam');
  });

  it('refuse de mettre à jour un centre inexistant', async () => {
    prisma.centre.findUnique.mockResolvedValue(null);
    await expect(service.update('inconnu', { nom: 'X' })).rejects.toThrow(NotFoundException);
  });

  it('permet de changer l\u2019adresse d\u2019un centre existant (cas Nigeria, §13.3)', async () => {
    prisma.centre.findUnique.mockResolvedValue({ id: 'nigeria', adresse: 'Ancienne adresse' });
    const resultat = await service.update('nigeria', { adresse: '187 Ogoja Road, Abakaliki' });
    expect(resultat.adresse).toBe('187 Ogoja Road, Abakaliki');
  });

  it('désactive un centre existant', async () => {
    prisma.centre.findUnique.mockResolvedValue({ id: 'douala' });
    const resultat = await service.desactiver('douala');
    expect(prisma.centre.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { actif: false } }),
    );
    expect(resultat).toBeDefined();
  });
});
