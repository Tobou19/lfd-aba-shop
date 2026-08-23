import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

const SEUIL_SEMAINES = 8; // paramétrable — cahier des charges §4.6

@Injectable()
export class LoyaltyService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  historique(clientId: string) {
    return this.prisma.suiviFidelite.findMany({
      where: { clientId },
      orderBy: { semaineIso: 'asc' },
    });
  }

  // Appelé après chaque commande payée : marque la semaine ISO courante
  // comme consommée et recalcule la série de semaines consécutives.
  // N'est censé être invoqué QUE pour de la consommation de repas
  // (commande de type PERIODE) — jamais pour une commande STANDARD
  // (autres produits de la boutique), qui n'entre jamais dans le calcul
  // de fidélité. Voir traiterConsommationHebdomadaire ci-dessous, qui
  // applique déjà ce filtre automatiquement.
  async enregistrerConsommation(clientId: string, semaineIso: string) {
    const semaine = await this.prisma.suiviFidelite.upsert({
      where: { clientId_semaineIso: { clientId, semaineIso } },
      update: { aConsomme: true },
      create: { clientId, semaineIso, aConsomme: true },
    });

    const consecutives = await this.calculerSemainesConsecutives(clientId, semaineIso);
    const semaineGratuiteDue = consecutives > 0 && consecutives % SEUIL_SEMAINES === 0;

    const miseAJour = await this.prisma.suiviFidelite.update({
      where: { id: semaine.id },
      data: { semainesConsecutives: consecutives, semaineGratuiteDue },
    });

    if (semaineGratuiteDue) {
      const client = await this.prisma.client.findUnique({ where: { id: clientId } });
      if (client) {
        await this.notifications.notifierSemaineGratuiteDue(
          client.centreHabituelId,
          client.nomComplet,
          client.id,
        );
      }
    }

    return miseAJour;
  }

  // La contrainte unique (clientId, semaineIso) en base empêche mécaniquement
  // le doublon d'octroi — cette méthode ne fait qu'exposer l'action au Gestionnaire.
  async accorderSemaineGratuite(clientId: string, semaineIso: string, agentId: string) {
    const semaine = await this.prisma.suiviFidelite.findUnique({
      where: { clientId_semaineIso: { clientId, semaineIso } },
    });
    if (!semaine || !semaine.semaineGratuiteDue) {
      throw new ConflictException("Aucune semaine gratuite due pour cette période.");
    }
    if (semaine.dateAttribution) {
      throw new ConflictException('Semaine gratuite déjà accordée.');
    }
    return this.prisma.suiviFidelite.update({
      where: { id: semaine.id },
      data: { dateAttribution: new Date(), agentAttributionId: agentId },
    });
  }

  // Point d'entrée destiné à un job planifié hebdomadaire (à brancher via
  // @nestjs/schedule, non inclus dans ce squelette) : pour la semaine ISO
  // donnée, identifie tous les clients ayant au moins une commande de
  // repas (typeCommande = PERIODE) PAYÉE couvrant cette semaine, et
  // enregistre leur consommation. Les commandes STANDARD (tous les
  // autres produits de la boutique ABA SHOP) sont exclues par
  // construction de la requête ci-dessous — elles ne peuvent jamais
  // déclencher ni interrompre une série de fidélité.
  async traiterConsommationHebdomadaire(semaineIso: string) {
    const { debut, fin } = this.plageDateSemaineIso(semaineIso);

    const commandes = await this.prisma.commande.findMany({
      where: {
        typeCommande: 'PERIODE',
        statutPaiement: 'PAYE',
        dateDebut: { lte: fin },
        dateFin: { gte: debut },
      },
      select: { clientId: true },
    });

    const clientsUniques = [...new Set(commandes.map((c) => c.clientId))];
    return Promise.all(
      clientsUniques.map((clientId) => this.enregistrerConsommation(clientId, semaineIso)),
    );
  }

  // Calcule le lundi et le dimanche (UTC) correspondant à une semaine au
  // format ISO 8601 'AAAA-Wnn', pour déterminer quelles commandes de
  // repas couvrent cette semaine.
  private plageDateSemaineIso(semaineIso: string): { debut: Date; fin: Date } {
    const [anneeStr, semaineStr] = semaineIso.split('-W');
    const annee = Number(anneeStr);
    const semaine = Number(semaineStr);

    const approx = new Date(Date.UTC(annee, 0, 1 + (semaine - 1) * 7));
    const jourSemaineIso = approx.getUTCDay() || 7; // lundi=1 … dimanche=7
    const lundi = new Date(approx);
    lundi.setUTCDate(approx.getUTCDate() - jourSemaineIso + 1);
    lundi.setUTCHours(0, 0, 0, 0);

    const dimanche = new Date(lundi);
    dimanche.setUTCDate(lundi.getUTCDate() + 6);
    dimanche.setUTCHours(23, 59, 59, 999);

    return { debut: lundi, fin: dimanche };
  }

  private async calculerSemainesConsecutives(clientId: string, semaineIso: string) {
    const [annee, semaine] = semaineIso.split('-W').map(Number);
    let compteur = 0;
    let a = annee;
    let s = semaine;
    while (true) {
      const iso = `${a}-W${String(s).padStart(2, '0')}`;
      const enreg = await this.prisma.suiviFidelite.findUnique({
        where: { clientId_semaineIso: { clientId, semaineIso: iso } },
      });
      if (!enreg || !enreg.aConsomme) break;
      compteur++;
      s--;
      if (s < 1) { s = 52; a--; }
    }
    return compteur;
  }
}
