import { ReportingService } from './reporting.service';

// PdfRendererService et StorageService sont simulés : ce test vérifie le
// calcul des indicateurs (§4.9) et l'orchestration de l'export, pas le
// rendu Puppeteer réel ni un accès disque/S3 (non pertinents en test
// unitaire — Puppeteer nécessite un navigateur, testé manuellement).
describe('ReportingService', () => {
  let service: ReportingService;
  let prisma: any;
  let pdfRenderer: any;
  let storage: any;

  const commandesDouala = [
    { statutPaiement: 'PAYE', montantTotal: 15000 },
    { statutPaiement: 'PAYE', montantTotal: 9000 },
    { statutPaiement: 'EN_ATTENTE', montantTotal: 5000 },
    { statutPaiement: 'ANNULE', montantTotal: 3000 },
  ];

  beforeEach(() => {
    prisma = {
      commande: { findMany: jest.fn().mockResolvedValue(commandesDouala) },
      centre: {
        findMany: jest.fn().mockResolvedValue([{ id: 'douala', nom: 'Douala', devise: 'FCFA' }]),
        findUnique: jest.fn().mockResolvedValue({ nom: 'Douala', devise: 'FCFA' }),
      },
    };
    pdfRenderer = { htmlVersPdf: jest.fn().mockResolvedValue(Buffer.from('pdf')) };
    storage = { enregistrer: jest.fn().mockResolvedValue('/files/rapports/x.pdf') };
    service = new ReportingService(prisma, pdfRenderer, storage);
  });

  it('ne compte dans le chiffre d\u2019affaires que les commandes payées', async () => {
    const resultat = await service.dashboard('douala', 'month');
    expect(resultat.chiffreAffaires).toBe(24000);
    expect(resultat.nombreCommandes).toBe(4);
    expect(resultat.commandesEnAttente).toBe(1);
    expect(resultat.commandesAnnulees).toBe(1);
  });

  it('construit la vue consolidée pour tous les centres', async () => {
    const resultat = await service.consolide('month');
    expect(resultat).toHaveLength(1);
    expect(resultat[0].centre).toBe('Douala');
    expect(resultat[0].chiffreAffaires).toBe(24000);
  });

  it('exporte en PDF via le moteur de rendu et le stockage', async () => {
    const resultat = await service.export('pdf', 'douala', 'month');
    expect(pdfRenderer.htmlVersPdf).toHaveBeenCalled();
    expect(storage.enregistrer).toHaveBeenCalledWith(
      expect.objectContaining({ contentType: 'application/pdf' }),
    );
    expect(resultat.format).toBe('pdf');
    expect(resultat.url).toBe('/files/rapports/x.pdf');
  });

  it('exporte en Excel avec le bon type de contenu', async () => {
    storage.enregistrer.mockResolvedValue('/files/rapports/x.xlsx');
    const resultat = await service.export('excel', 'douala', 'month');
    expect(storage.enregistrer).toHaveBeenCalledWith(
      expect.objectContaining({
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
    );
    expect(resultat.format).toBe('excel');
  });
});
