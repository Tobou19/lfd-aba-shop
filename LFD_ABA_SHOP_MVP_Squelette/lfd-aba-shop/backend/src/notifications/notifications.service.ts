import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  // Liste les notifications d'un centre (ou globales si centreId absent,
  // réservé à la Direction). Les plus récentes et non lues en premier.
  findForCenter(centreId?: string) {
    return this.prisma.notification.findMany({
      where: centreId ? { OR: [{ centreId }, { centreId: null }] } : undefined,
      orderBy: [{ lue: 'asc' }, { createdAt: 'desc' }],
    });
  }

  marquerLue(id: string) {
    return this.prisma.notification.update({ where: { id }, data: { lue: true } });
  }

  // Émetteurs internes appelés par les autres modules (catalog, loyalty) —
  // volontairement simples : un événement = une ligne. Une file de
  // messages (ex. BullMQ/Redis) remplacerait cet appel direct si le
  // volume de notifications devenait significatif.
  notifierSemaineGratuiteDue(centreId: string, clientNom: string, clientId: string) {
    return this.prisma.notification.create({
      data: {
        type: 'SEMAINE_GRATUITE_DUE',
        centreId,
        message: `Semaine gratuite due pour ${clientNom}.`,
        lienEntite: clientId,
      },
    });
  }

  notifierRuptureStock(centreId: string | null, produitNom: string, produitId: string) {
    return this.prisma.notification.create({
      data: {
        type: 'RUPTURE_STOCK',
        centreId,
        message: `Rupture de stock : ${produitNom}.`,
        lienEntite: produitId,
      },
    });
  }

  // Déclenché par un job planifié (cron) — hors périmètre de ce squelette,
  // à brancher via @nestjs/schedule. Reprend la pratique déjà en place au
  // centre de Yaoundé (§4.10 du cahier des charges).
  notifierRapportHebdomadaire(centreId: string, resume: string) {
    return this.prisma.notification.create({
      data: { type: 'RAPPORT_HEBDOMADAIRE', centreId, message: resume },
    });
  }
}
