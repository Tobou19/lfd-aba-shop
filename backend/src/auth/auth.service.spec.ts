import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn().mockResolvedValue(false),
  hash: jest.fn().mockResolvedValue('hashed'),
}));

// PrismaService et JwtService sont entièrement simulés : ce test vérifie
// la LOGIQUE de blocage/déblocage, pas l'accès réel à une base de données
// (couvert séparément par les tests e2e).
describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwt: any;

  const utilisateurBase = {
    id: 'u1',
    email: 'caissier@lfd.test',
    telephone: null,
    motDePasseHash: 'hash-valide',
    role: 'CAISSIER',
    statut: true,
    tentativesEchouees: 0,
    bloqueJusqua: null,
    centres: [{ centreId: 'douala' }],
  };

  beforeEach(() => {
    prisma = {
      utilisateur: {
        findFirst: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
      journalConnexion: { create: jest.fn() },
    };
    jwt = { sign: jest.fn().mockReturnValue('jeton-signe') };
    service = new AuthService(prisma, jwt);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('refuse une connexion avec un identifiant inconnu', async () => {
    prisma.utilisateur.findFirst.mockResolvedValue(null);
    await expect(service.login('inconnu@lfd.test', 'motdepasse123')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('refuse une connexion sur un compte désactivé', async () => {
    prisma.utilisateur.findFirst.mockResolvedValue({ ...utilisateurBase, statut: false });
    await expect(service.login('caissier@lfd.test', 'motdepasse123')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('refuse une connexion sur un compte temporairement bloqué', async () => {
    const dansUneHeure = new Date(Date.now() + 3_600_000);
    prisma.utilisateur.findFirst.mockResolvedValue({
      ...utilisateurBase,
      bloqueJusqua: dansUneHeure,
    });
    await expect(service.login('caissier@lfd.test', 'motdepasse123')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('incrémente le compteur d\u2019échecs sur un mot de passe invalide', async () => {
    prisma.utilisateur.findFirst.mockResolvedValue({ ...utilisateurBase, tentativesEchouees: 2 });
    const bcrypt = require('bcrypt');
    bcrypt.compare.mockResolvedValue(false);

    await expect(service.login('caissier@lfd.test', 'mauvais-mdp')).rejects.toThrow(
      UnauthorizedException,
    );

    expect(prisma.utilisateur.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tentativesEchouees: 3 }),
      }),
    );
  });

  it('bloque le compte au 5e échec consécutif', async () => {
    prisma.utilisateur.findFirst.mockResolvedValue({ ...utilisateurBase, tentativesEchouees: 4 });
    const bcrypt = require('bcrypt');
    bcrypt.compare.mockResolvedValue(false);

    await expect(service.login('caissier@lfd.test', 'mauvais-mdp')).rejects.toThrow(
      UnauthorizedException,
    );

    expect(prisma.utilisateur.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tentativesEchouees: 5,
          bloqueJusqua: expect.any(Date),
        }),
      }),
    );
  });

  it('émet un jeton avec le rôle et les centres au succès de connexion', async () => {
    prisma.utilisateur.findFirst.mockResolvedValue(utilisateurBase);
    const bcrypt = require('bcrypt');
    bcrypt.compare.mockResolvedValue(true);

    const resultat = await service.login('caissier@lfd.test', 'bon-mdp');

    expect(jwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 'u1', role: 'CAISSIER', centreIds: ['douala'] }),
      expect.anything(),
    );
    expect(resultat).toHaveProperty('accessToken');
    expect(resultat).toHaveProperty('refreshToken');
  });
});
