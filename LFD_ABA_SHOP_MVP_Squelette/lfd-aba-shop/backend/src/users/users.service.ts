import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Réservé à la Direction/CMB (§5, matrice des permissions) : aucune
  // route d'auto-inscription n'existe ailleurs dans l'application.
  async create(dto: CreateUserDto) {
    if (!dto.email && !dto.telephone) {
      throw new ConflictException("Un email ou un téléphone est requis.");
    }
    const existant = await this.prisma.utilisateur.findFirst({
      where: { OR: [{ email: dto.email }, { telephone: dto.telephone }] },
    });
    if (existant) {
      throw new ConflictException('Un utilisateur existe déjà avec cet identifiant.');
    }

    const motDePasseHash = await bcrypt.hash(dto.motDePasse, BCRYPT_ROUNDS);

    return this.prisma.utilisateur.create({
      data: {
        nomComplet: dto.nomComplet,
        email: dto.email,
        telephone: dto.telephone,
        motDePasseHash,
        role: dto.role as any,
        centres: { create: dto.centreIds.map((centreId) => ({ centreId })) },
      },
      select: this.champsPublics(),
    });
  }

  findAll() {
    return this.prisma.utilisateur.findMany({
      select: this.champsPublics(),
      orderBy: { nomComplet: 'asc' },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.assertExiste(id);
    return this.prisma.utilisateur.update({
      where: { id },
      data: {
        nomComplet: dto.nomComplet,
        role: dto.role as any,
        statut: dto.statut,
        ...(dto.centreIds
          ? {
              centres: {
                deleteMany: {},
                create: dto.centreIds.map((centreId) => ({ centreId })),
              },
            }
          : {}),
      },
      select: this.champsPublics(),
    });
  }

  // Désactivation plutôt que suppression : conserve la traçabilité des
  // commandes et reçus déjà créés par cet utilisateur (§6.7, minimisation
  // sans perte d'intégrité référentielle).
  async desactiver(id: string) {
    await this.assertExiste(id);
    return this.prisma.utilisateur.update({
      where: { id },
      data: { statut: false },
      select: this.champsPublics(),
    });
  }

  async reinitialiserMotDePasse(id: string, nouveauMotDePasse: string) {
    await this.assertExiste(id);
    const motDePasseHash = await bcrypt.hash(nouveauMotDePasse, BCRYPT_ROUNDS);
    await this.prisma.utilisateur.update({
      where: { id },
      data: { motDePasseHash, tentativesEchouees: 0, bloqueJusqua: null },
    });
    return { ok: true };
  }

  private async assertExiste(id: string) {
    const u = await this.prisma.utilisateur.findUnique({ where: { id } });
    if (!u) throw new NotFoundException('Utilisateur introuvable.');
  }

  // Ne jamais exposer motDePasseHash, tentativesEchouees ou bloqueJusqua
  // via l'API — ces champs restent internes au module auth.
  private champsPublics() {
    return {
      id: true,
      nomComplet: true,
      email: true,
      telephone: true,
      role: true,
      statut: true,
      derniereConnexion: true,
      centres: { select: { centreId: true } },
    } as const;
  }
}
