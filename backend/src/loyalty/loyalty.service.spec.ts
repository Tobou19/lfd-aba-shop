import { ConflictException } from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';

// Vérifie la règle centrale du module Fidélité : la semaine gratuite est
// due exactement au multiple de 8 semaines CONSÉCUTIVES, et son octroi
// ne peut jamais être doublé pour une même semaine (§4.6 et §12).
describe('LoyaltyService', () => {
  let service: LoyaltyService;
  let prisma: any;
  let notifications: any;

  // Simule un magasin en mémoire pour suiviFidelite, indexé par
  // "clientId|semaineIso", pour que calculerSemainesConsecutives (qui
  // relit les semaines précédentes) fonctionne sans vraie base.
  let store: Record<string, any>;

  function cle(clientId: string, semaineIso: string) {
    return `${clientId}|${semaineIso}`;
  }

  beforeEach(() => {
    store = {};
    prisma = {
      suiviFidelite: {
        upsert: jest.fn(({ where, create }) => {
          const k = cle(where.clientId_semaineIso.clientId, where.clientId_semaineIso.semaineIso);
          store[k] = store[k]
            ? { ...store[k], aConsomme: true }
            : { id: k, ...create };
          return Promise.resolve(store[k]);
        }),
        findUnique: jest.fn(({ where }) => {
          const k = cle(where.clientId_semaineIso.clientId, where.clientId_semaineIso.semaineIso);
          return Promise.resolve(store[k] ?? null);
        }),
        update: jest.fn(({ where, data }) => {
          const entry = Object.values(store).find((e: any) => e.id === where.id);
          Object.assign(entry, data);
          return Promise.resolve(entry);
        }),
      },
      client: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'c1',
          nomComplet: 'Mireille Fotso',
          centreHabituelId: 'douala',
        }),
      },
    };
    notifications = { notifierSemaineGratuiteDue: jest.fn() };
    service = new LoyaltyService(prisma, notifications);
  });

  async function consommerSemaines(clientId: string, semaines: string[]) {
    let derniere;
    for (const s of semaines) {
      derniere = await service.enregistrerConsommation(clientId, s);
    }
    return derniere;
  }

  it('ne doit rien tant que le seuil de 8 semaines n\u2019est pas atteint', async () => {
    const semaines = Array.from({ length: 7 }, (_, i) => `2026-W${String(i + 1).padStart(2, '0')}`);
    const resultat = await consommerSemaines('c1', semaines);
    expect(resultat.semainesConsecutives).toBe(7);
    expect(resultat.semaineGratuiteDue).toBe(false);
    expect(notifications.notifierSemaineGratuiteDue).not.toHaveBeenCalled();
  });

  it('déclenche la semaine gratuite due à la 8e semaine consécutive', async () => {
    const semaines = Array.from({ length: 8 }, (_, i) => `2026-W${String(i + 1).padStart(2, '0')}`);
    const resultat = await consommerSemaines('c1', semaines);
    expect(resultat.semainesConsecutives).toBe(8);
    expect(resultat.semaineGratuiteDue).toBe(true);
    expect(notifications.notifierSemaineGratuiteDue).toHaveBeenCalledWith(
      'douala',
      'Mireille Fotso',
      'c1',
    );
  });

  it('interrompt la série si une semaine n\u2019est pas consommée', async () => {
    await consommerSemaines('c1', ['2026-W01', '2026-W02', '2026-W03']);
    // saute la semaine 04
    const resultat = await service.enregistrerConsommation('c1', '2026-W05');
    expect(resultat.semainesConsecutives).toBe(1);
  });

  it('refuse un octroi si aucune semaine gratuite n\u2019est due', async () => {
    await consommerSemaines('c1', ['2026-W01']);
    await expect(
      service.accorderSemaineGratuite('c1', '2026-W01', 'gestionnaire1'),
    ).rejects.toThrow(ConflictException);
  });

  it('empêche un double octroi pour la même semaine gratuite', async () => {
    const semaines = Array.from({ length: 8 }, (_, i) => `2026-W${String(i + 1).padStart(2, '0')}`);
    await consommerSemaines('c1', semaines);

    await service.accorderSemaineGratuite('c1', '2026-W08', 'gestionnaire1');

    await expect(
      service.accorderSemaineGratuite('c1', '2026-W08', 'gestionnaire1'),
    ).rejects.toThrow(ConflictException);
  });

  describe('traitement hebdomadaire automatique', () => {
    it("n'interroge que les commandes de type PERIODE, jamais STANDARD", async () => {
      prisma.commande = { findMany: jest.fn().mockResolvedValue([]) };

      await service.traiterConsommationHebdomadaire('2026-W10');

      expect(prisma.commande.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ typeCommande: 'PERIODE', statutPaiement: 'PAYE' }),
        }),
      );
    });

    it('enregistre la consommation de chaque client trouvé une seule fois (dédoublonnage)', async () => {
      prisma.commande = {
        findMany: jest.fn().mockResolvedValue([
          { clientId: 'c1' },
          { clientId: 'c1' }, // deux commandes du même client cette semaine-là
          { clientId: 'c2' },
        ]),
      };

      const resultat = await service.traiterConsommationHebdomadaire('2026-W10');

      expect(resultat).toHaveLength(2); // c1 et c2, pas 3
      const clientsTraites = Object.keys(store).map((k) => k.split('|')[0]);
      expect(new Set(clientsTraites)).toEqual(new Set(['c1', 'c2']));
    });
  });
});
