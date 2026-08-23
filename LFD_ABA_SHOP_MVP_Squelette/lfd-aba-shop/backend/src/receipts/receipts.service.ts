import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PdfRendererService } from '../pdf/pdf-renderer.service';
import { StorageService } from '../storage/storage.service';
import { construireHtmlRecu } from './templates/receipt.template';

@Injectable()
export class ReceiptsService {
  constructor(
    private prisma: PrismaService,
    private pdfRenderer: PdfRendererService,
    private storage: StorageService,
  ) {}

  async creer(
    clientId: string,
    commandeIds: string[],
    caissierId: string,
    modePaiement: string,
    options: { signatureDataUrl?: string; cachetDataUrl?: string; photosRepasDataUrls?: string[] } = {},
  ) {
    const [client, commandes, caissier] = await Promise.all([
      this.prisma.client.findUnique({
        where: { id: clientId },
        include: { centreHabituel: true },
      }),
      this.prisma.commande.findMany({
        where: { id: { in: commandeIds } },
        include: { lignes: { include: { produit: true } } },
      }),
      this.prisma.utilisateur.findUnique({ where: { id: caissierId } }),
    ]);
    if (!client) throw new NotFoundException('Bénéficiaire introuvable.');
    if (!caissier) throw new NotFoundException('Caissier introuvable.');
    if (commandes.length === 0) throw new NotFoundException('Aucune commande à facturer.');

    const montantTotal = commandes.reduce((s, c) => s + Number(c.montantTotal), 0);
    const numero = await this.prochainNumero();

    // Le détail affiché sur le reçu dépend du type de commande : une
    // ligne de repas (PERIODE) montre la quantité par jour et le nombre
    // de jours facturés ; une ligne de produit standard montre juste la
    // quantité achetée en une fois — voir OrdersService pour la même
    // distinction côté calcul du montant.
    const lignesRecu = commandes.flatMap((c) => {
      const jours =
        c.typeCommande === 'PERIODE' && c.dateDebut && c.dateFin
          ? Math.max(1, Math.round((c.dateFin.getTime() - c.dateDebut.getTime()) / 86_400_000) + 1)
          : 1;

      return c.lignes.map((l) => {
        const quantite = Number(l.quantite);
        const prixUnitaire = Number(l.produit.prixUnitaire);
        return {
          nom: l.produit.nom,
          detail: c.typeCommande === 'PERIODE' ? `× ${quantite} / ${jours}j` : `× ${quantite}`,
          montant: c.typeCommande === 'PERIODE' ? quantite * jours * prixUnitaire : quantite * prixUnitaire,
        };
      });
    });

    // 1) Rendu HTML -> PDF et PNG (figés, non modifiables — §4.7).
    const html = await construireHtmlRecu({
      numero,
      centreNom: client.centreHabituel.nom,
      clientNom: client.nomComplet,
      lignes: lignesRecu,
      montantTotal,
      devise: client.centreHabituel.devise,
      modePaiement,
      caissierNom: caissier.nomComplet,
      signatureDataUrl: options.signatureDataUrl,
      cachetDataUrl: options.cachetDataUrl,
      photosRepasDataUrls: options.photosRepasDataUrls,
    });

    const [pdfBuffer, pngBuffer] = await Promise.all([
      this.pdfRenderer.htmlVersPdf(html),
      this.pdfRenderer.htmlVersPng(html),
    ]);

    const annee = new Date().getFullYear();
    const [fichierPdfUrl, fichierPngUrl] = await Promise.all([
      this.storage.enregistrer({
        cheminRelatif: `recus/${annee}/${numero}.pdf`,
        contenu: pdfBuffer,
        contentType: 'application/pdf',
      }),
      this.storage.enregistrer({
        cheminRelatif: `recus/${annee}/${numero}.png`,
        contenu: pngBuffer,
        contentType: 'image/png',
      }),
    ]);

    // 2) Persistance du reçu, fichiers déjà générés et déposés.
    const recu = await this.prisma.recu.create({
      data: {
        numero,
        clientId,
        montantTotal,
        modePaiement: modePaiement as any,
        caissierId,
        signatureUrl: options.signatureDataUrl ? `${fichierPdfUrl}#signature` : undefined,
        cachetUrl: options.cachetDataUrl ? `${fichierPdfUrl}#cachet` : undefined,
        photosRepasUrls: options.photosRepasDataUrls || [],
        fichierPdfUrl,
        fichierPngUrl,
        commandes: { create: commandeIds.map((id) => ({ commandeId: id })) },
      },
    });

    return recu;
  }

  async envoyer(id: string, canal: 'email' | 'whatsapp') {
    const recu = await this.prisma.recu.findUnique({ where: { id } });
    if (!recu) throw new NotFoundException('Reçu introuvable.');

    // L'envoi effectif (SMTP transactionnel / passerelle WhatsApp
    // Business) est un point d'intégration externe distinct, hors
    // périmètre de ce squelette — ce service fixe le contrat et met à
    // jour le statut, prêt à être branché sur un fournisseur réel.
    const statutEnvoi =
      recu.statutEnvoi === 'NON_ENVOYE'
        ? canal.toUpperCase()
        : 'LES_DEUX';

    return this.prisma.recu.update({
      where: { id },
      data: { statutEnvoi: statutEnvoi as any },
    });
  }

  private async prochainNumero() {
    const count = await this.prisma.recu.count();
    return `REC-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;
  }
}
