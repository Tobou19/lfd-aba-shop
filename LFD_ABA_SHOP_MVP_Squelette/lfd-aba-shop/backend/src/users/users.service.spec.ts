import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';

// Vérifie deux garanties de sécurité essentielles du module Utilisateurs :
// (1) impossible de créer un doublon d'identifiant, (2) le mot de passe
// haché n'est jamais renvoyé par l'API (§6.3 du cahier des charges).
describe('UsersService', () => {
  let service: UsersService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      utilisateur: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn((args) =>
          Promise.resolve({
            id: 'u1',
            nomComplet: args.data.nomComplet,
            email: args.data.email,
            telephone: args.data.telephone,
            role: args.data.role,
            statut: true,
          }),
        ),
        update: jest.fn((args) => Promise.resolve({ id: args.where.id, ...args.data })),
      },
    };
    service = new UsersService(prisma);
  });

  it("refuse la création sans email ni téléphone", async () => {
    await expect(
      service.create({ nomComplet: 'Test', motDePasse: 'motdepasse123', role: 'CAISSIER' as any, centreIds: [] }),
    ).rejects.toThrow(ConflictException);
  });

  it('refuse un doublon d\u2019identifiant', async () => {
    prisma.utilisateur.findFirst.mockResolvedValue({ id: 'existant' });
    await expect(
      service.create({
        nomComplet: 'Test',
        email: 'deja@lfd.test',
        motDePasse: 'motdepasse123',
        role: 'CAISSIER' as any,
        centreIds: ['douala'],
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('hache le mot de passe avant stockage et ne le renvoie jamais', async () => {
    prisma.utilisateur.findFirst.mockResolvedValue(null);
    const hashSpy = jest.spyOn(bcrypt, 'hash');

    const resultat = await service.create({
      nomComplet: 'Ferdinand Nkolo',
      email: 'ferdinand@lfd.test',
      motDePasse: 'motdepasse123',
      role: 'CAISSIER' as any,
      centreIds: ['douala'],
    });

    expect(hashSpy).toHaveBeenCalledWith('motdepasse123', 12);
    expect(resultat).not.toHaveProperty('motDePasseHash');
    expect(prisma.utilisateur.create).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.not.objectContaining({ motDePasseHash: true }),
      }),
    );
  });

  it('lève une erreur si on désactive un utilisateur inexistant', async () => {
    prisma.utilisateur.findUnique.mockResolvedValue(null);
    await expect(service.desactiver('inconnu')).rejects.toThrow(NotFoundException);
  });

  it('réinitialise le mot de passe et remet le blocage à zéro', async () => {
    prisma.utilisateur.findUnique.mockResolvedValue({ id: 'u1' });
    const resultat = await service.reinitialiserMotDePasse('u1', 'NouveauMdp123');

    expect(prisma.utilisateur.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'u1' },
        data: expect.objectContaining({ tentativesEchouees: 0, bloqueJusqua: null }),
      }),
    );
    expect(resultat).toEqual({ ok: true });
  });
});
