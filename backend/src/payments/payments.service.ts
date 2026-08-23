import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MtnMomoProvider } from './providers/mtn-momo.provider';
import { OrangeMoneyProvider } from './providers/orange-money.provider';
import { RecordPaymentDto, InitiateMobileMoneyDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private mtnMomo: MtnMomoProvider,
    private orangeMoney: OrangeMoneyProvider,
  ) {}

  // Enregistre un paiement déjà encaissé manuellement (espèces, carte,
  // virement, ou mobile money confirmé hors application) — couvre le
  // périmètre MVP/V1 du cahier des charges (§4.8).
  async record(dto: RecordPaymentDto) {
    const commande = await this.prisma.commande.findUnique({ where: { id: dto.commandeId } });
    if (!commande) throw new NotFoundException('Commande introuvable.');

    return this.prisma.commande.update({
      where: { id: dto.commandeId },
      data: { modePaiement: dto.modePaiement as any, statutPaiement: 'PAYE' },
    });
  }

  // Initie un encaissement mobile money (lot V2, §11) : contacte
  // l'opérateur retenu, enregistre la tentative pour un rapprochement
  // idempotent au webhook, et renvoie au frontend de quoi guider le
  // bénéficiaire (numéro à confirmer côté MTN, ou URL à ouvrir côté
  // Orange).
  async initiateMobileMoney(dto: InitiateMobileMoneyDto) {
    const commande = await this.prisma.commande.findUnique({ where: { id: dto.commandeId } });
    if (!commande) throw new NotFoundException('Commande introuvable.');

    const centre = await this.prisma.centre.findUnique({ where: { id: commande.centreId } });
    const devise = centre?.devise || 'FCFA';

    if (dto.operateur === 'MTN_MOMO') {
      if (!dto.telephonePayeur) {
        throw new BadRequestException('Le téléphone du payeur est requis pour MTN Mobile Money.');
      }
      const { referenceExterne } = await this.mtnMomo.demanderPaiement({
        montant: Number(commande.montantTotal),
        devise,
        telephonePayeur: dto.telephonePayeur,
        referenceCommande: commande.id,
      });

      await this.prisma.tentativePaiementMobile.create({
        data: {
          commandeId: commande.id,
          operateur: 'MTN_MOMO',
          referenceExterne,
          telephonePayeur: dto.telephonePayeur,
        },
      });

      return {
        operateur: 'MTN_MOMO',
        referenceExterne,
        instructions: 'Une invite de confirmation a été envoyée sur le téléphone du bénéficiaire.',
      };
    }

    // ORANGE_MONEY
    const { referenceExterne, urlPaiement } = await this.orangeMoney.creerSessionPaiement({
      montant: Number(commande.montantTotal),
      devise,
      referenceCommande: commande.id,
    });

    await this.prisma.tentativePaiementMobile.create({
      data: {
        commandeId: commande.id,
        operateur: 'ORANGE_MONEY',
        referenceExterne,
        telephonePayeur: dto.telephonePayeur || '',
      },
    });

    return { operateur: 'ORANGE_MONEY', referenceExterne, urlPaiement };
  }

  // Traite la confirmation reçue en webhook. Idempotent : si la tentative
  // est déjà au statut REUSSI, un second appel (ré-émission réseau côté
  // opérateur) n'a aucun effet supplémentaire.
  async traiterWebhook(referenceExterne: string, statutBrut: string) {
    const tentative = await this.prisma.tentativePaiementMobile.findUnique({
      where: { referenceExterne },
    });
    if (!tentative) {
      throw new NotFoundException('Référence de paiement inconnue.');
    }
    if (tentative.statut !== 'EN_ATTENTE') {
      return tentative; // déjà traité — on ignore silencieusement le doublon
    }

    const succes = ['SUCCESSFUL', 'SUCCESS'].includes(statutBrut.toUpperCase());
    const nouveauStatut = succes ? 'REUSSI' : 'ECHEC';

    const miseAJour = await this.prisma.tentativePaiementMobile.update({
      where: { id: tentative.id },
      data: { statut: nouveauStatut as any },
    });

    if (succes) {
      await this.prisma.commande.update({
        where: { id: tentative.commandeId },
        data: { statutPaiement: 'PAYE', modePaiement: tentative.operateur },
      });
    }

    return miseAJour;
  }
}
