import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';

const MAX_TENTATIVES = 5;
const BLOCAGE_MINUTES = 15;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  // Authentifie par email OU téléphone, jamais en clair, avec blocage
  // temporaire après plusieurs échecs (cahier des charges §4.1).
  async login(identifiant: string, motDePasse: string, ip?: string) {
    const utilisateur = await this.prisma.utilisateur.findFirst({
      where: { OR: [{ email: identifiant }, { telephone: identifiant }] },
      include: { centres: true },
    });

    if (!utilisateur || !utilisateur.statut) {
      await this.journaliser(null, ip, 'echec');
      throw new UnauthorizedException('Identifiants invalides.');
    }

    if (utilisateur.bloqueJusqua && utilisateur.bloqueJusqua > new Date()) {
      throw new ForbiddenException(
        'Compte temporairement bloqué suite à plusieurs échecs. Réessayez plus tard.',
      );
    }

    const motDePasseValide = await bcrypt.compare(
      motDePasse,
      utilisateur.motDePasseHash,
    );

    if (!motDePasseValide) {
      const tentatives = utilisateur.tentativesEchouees + 1;
      const bloque = tentatives >= MAX_TENTATIVES;
      await this.prisma.utilisateur.update({
        where: { id: utilisateur.id },
        data: {
          tentativesEchouees: tentatives,
          bloqueJusqua: bloque
            ? new Date(Date.now() + BLOCAGE_MINUTES * 60_000)
            : undefined,
        },
      });
      await this.journaliser(utilisateur.id, ip, 'echec');
      throw new UnauthorizedException('Identifiants invalides.');
    }

    await this.prisma.utilisateur.update({
      where: { id: utilisateur.id },
      data: { tentativesEchouees: 0, derniereConnexion: new Date() },
    });
    await this.journaliser(utilisateur.id, ip, 'succes');

    const centreIds = utilisateur.centres.map((c) => c.centreId);
    return this.emettreJetons(utilisateur.id, utilisateur.role, centreIds);
  }

  private emettreJetons(userId: string, role: string, centreIds: string[]) {
    const payload = { sub: userId, role, centreIds };
    return {
      accessToken: this.jwt.sign(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_TTL || '15m',
      }),
      refreshToken: this.jwt.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_TTL || '7d',
      }),
    };
  }

  private async journaliser(
    utilisateurId: string | null,
    ip: string | undefined,
    resultat: string,
  ) {
    if (!utilisateurId) return;
    await this.prisma.journalConnexion.create({
      data: { utilisateurId, adresseIp: ip, resultat },
    });
  }
}
