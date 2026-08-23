import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { PrismaService } from '../prisma.service';
import { PdfRendererService } from '../pdf/pdf-renderer.service';
import { StorageService } from '../storage/storage.service';
import { construireHtmlRapport, LigneRapportCentre } from './templates/report.template';

@Injectable()
export class ReportingService {
  constructor(
    private prisma: PrismaService,
    private pdfRenderer: PdfRendererService,
    private storage: StorageService,
  ) {}

  // Vue mensuelle/annuelle par centre et consolidée (§4.9). centreId
  // absent => vue consolidée, réservée à la Direction au niveau du
  // contrôleur (RolesGuard), jamais recalculée côté client.
  async dashboard(centreId?: string, period: 'month' | 'year' = 'month') {
    const depuis = this.debutPeriode(period);

    const commandes = await this.prisma.commande.findMany({
      where: { centreId, createdAt: { gte: depuis } },
    });

    const chiffreAffaires = commandes
      .filter((c) => c.statutPaiement === 'PAYE')
      .reduce((s, c) => s + Number(c.montantTotal), 0);

    return {
      periode: period,
      depuis,
      nombreCommandes: commandes.length,
      commandesAnnulees: commandes.filter((c) => c.statutPaiement === 'ANNULE').length,
      commandesEnAttente: commandes.filter((c) => c.statutPaiement === 'EN_ATTENTE').length,
      chiffreAffaires,
    };
  }

  // Comparatif tous centres, réservé à la Direction (§9.3).
  async consolide(period: 'month' | 'year' = 'month'): Promise<LigneRapportCentre[]> {
    const centres = await this.prisma.centre.findMany();
    return Promise.all(
      centres.map(async (c) => ({
        centre: c.nom,
        devise: c.devise,
        ...(await this.dashboard(c.id, period)),
      })),
    );
  }

  // Génération réelle du fichier, déposée en stockage et renvoyée sous
  // forme d'URL de téléchargement — §4.9 : « Export des rapports en
  // PDF/Excel ».
  async export(format: 'pdf' | 'excel', centreId?: string, period: 'month' | 'year' = 'month') {
    const lignes: LigneRapportCentre[] = centreId
      ? [
          {
            centre: (await this.prisma.centre.findUnique({ where: { id: centreId } }))?.nom || centreId,
            devise: (await this.prisma.centre.findUnique({ where: { id: centreId } }))?.devise || 'FCFA',
            ...(await this.dashboard(centreId, period)),
          },
        ]
      : await this.consolide(period);

    const nomFichier = `rapport-${period}-${Date.now()}`;
    const url =
      format === 'pdf'
        ? await this.exporterPdf(lignes, period, nomFichier)
        : await this.exporterExcel(lignes, nomFichier);

    return { format, genereLe: new Date(), url };
  }

  private async exporterPdf(lignes: LigneRapportCentre[], periode: string, nomFichier: string) {
    const html = construireHtmlRapport('Rapport des commandes', periode, lignes);
    const pdf = await this.pdfRenderer.htmlVersPdf(html);
    return this.storage.enregistrer({
      cheminRelatif: `rapports/${nomFichier}.pdf`,
      contenu: pdf,
      contentType: 'application/pdf',
    });
  }

  private async exporterExcel(lignes: LigneRapportCentre[], nomFichier: string) {
    const classeur = new ExcelJS.Workbook();
    classeur.creator = 'ABA SHOP — LFD-Services';
    const feuille = classeur.addWorksheet('Rapport');

    feuille.columns = [
      { header: 'Centre', key: 'centre', width: 22 },
      { header: 'Commandes', key: 'nombreCommandes', width: 14 },
      { header: 'En attente', key: 'commandesEnAttente', width: 14 },
      { header: 'Annulées', key: 'commandesAnnulees', width: 14 },
      { header: "Chiffre d'affaires", key: 'chiffreAffaires', width: 20 },
      { header: 'Devise', key: 'devise', width: 10 },
    ];
    feuille.getRow(1).font = { bold: true };
    feuille.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E5C48' },
    };
    feuille.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    lignes.forEach((l) => feuille.addRow(l));

    const buffer = await classeur.xlsx.writeBuffer();
    return this.storage.enregistrer({
      cheminRelatif: `rapports/${nomFichier}.xlsx`,
      contenu: Buffer.from(buffer),
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  private debutPeriode(period: 'month' | 'year'): Date {
    const maintenant = new Date();
    return period === 'year'
      ? new Date(maintenant.getFullYear(), 0, 1)
      : new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
  }
}
