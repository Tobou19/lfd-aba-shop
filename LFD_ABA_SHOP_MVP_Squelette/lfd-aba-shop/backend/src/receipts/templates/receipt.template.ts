import * as bwipjs from 'bwip-js';

export interface DonneesRecu {
  numero: string;
  centreNom: string;
  clientNom: string;
  // Le montant de chaque ligne est calculé en amont par ReceiptsService
  // (la formule diffère entre une commande de repas facturée par
  // période et une commande standard) — le gabarit se contente d'un
  // libellé et d'un montant déjà prêts à afficher.
  lignes: { nom: string; detail: string; montant: number }[];
  montantTotal: number;
  devise: string;
  modePaiement: string;
  caissierNom: string;
  signatureDataUrl?: string;
  cachetDataUrl?: string;
  photosRepasDataUrls?: string[];
}

const URL_BOUTIQUE = 'https://buyticle.store/shop/(LFD)-Services-SHOP';

// Génère les images de code-barres (Code128, à partir du numéro de reçu)
// et de QR code (fixe, vers la boutique en ligne) en data URL PNG,
// directement exploitables dans le gabarit HTML — cf. §4.7 du cahier
// des charges.
async function genererCodeBarres(numero: string): Promise<string> {
  const png = await bwipjs.toBuffer({
    bcid: 'code128',
    text: numero,
    scale: 3,
    height: 12,
    includetext: false,
  });
  return `data:image/png;base64,${png.toString('base64')}`;
}

async function genererQrCode(): Promise<string> {
  const png = await bwipjs.toBuffer({
    bcid: 'qrcode',
    text: URL_BOUTIQUE,
    scale: 3,
  });
  return `data:image/png;base64,${png.toString('base64')}`;
}

export async function construireHtmlRecu(donnees: DonneesRecu): Promise<string> {
  const [codeBarres, qrCode] = await Promise.all([
    genererCodeBarres(donnees.numero),
    genererQrCode(),
  ]);

  const fmt = (n: number) =>
    new Intl.NumberFormat('fr-FR').format(Math.round(n)) + ' ' + donnees.devise;

  const lignesHtml = donnees.lignes
    .map(
      (l) => `
      <div class="ligne">
        <span>${l.nom} ${l.detail}</span>
        <span>${fmt(l.montant)}</span>
      </div>`,
    )
    .join('');

  const photosHtml = (donnees.photosRepasDataUrls || [])
    .map((src) => `<img src="${src}" class="photo-repas" />`)
    .join('');

  // Gabarit volontairement autonome (CSS inline) : Puppeteer n'a pas
  // accès aux feuilles de style de l'application front-end.
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<style>
  body { font-family: 'Helvetica', 'Arial', sans-serif; margin: 0; padding: 24px; color: #17231D; }
  .recu { max-width: 380px; margin: 0 auto; border: 1px solid #B9C2A9; border-radius: 4px; padding: 20px; }
  .entete { text-align: center; border-bottom: 1px dashed #B9C2A9; padding-bottom: 12px; margin-bottom: 12px; }
  .marque { font-size: 18px; font-weight: 700; color: #1E5C48; }
  .slogan { font-size: 10px; font-style: italic; color: #5B6470; }
  .numero { font-family: monospace; font-size: 11px; color: #5B6470; margin-top: 6px; }
  .ligne { display: flex; justify-content: space-between; font-size: 12.5px; padding: 3px 0; }
  .total { display: flex; justify-content: space-between; font-size: 15px; font-weight: 700; border-top: 1px solid #B9C2A9; margin-top: 10px; padding-top: 10px; }
  .meta { font-size: 11px; color: #5B6470; margin-top: 6px; }
  .codebarres { text-align: center; margin: 16px 0 6px; }
  .codebarres img { height: 34px; }
  .pied { display: flex; align-items: center; justify-content: space-between; margin-top: 16px; gap: 10px; }
  .qr img { width: 56px; height: 56px; }
  .signature img, .cachet img { max-height: 50px; max-width: 90px; }
  .label { font-size: 8.5px; text-transform: uppercase; color: #5B6470; text-align: center; margin-top: 3px; }
  .photos { display: flex; gap: 6px; margin-top: 12px; flex-wrap: wrap; justify-content: center; }
  .photo-repas { width: 64px; height: 64px; object-fit: cover; border-radius: 4px; }
</style>
</head>
<body>
  <div class="recu">
    <div class="entete">
      <div class="marque">LFD-Services</div>
      <div class="slogan">Passion for Optimal Healthcare</div>
      <div class="numero">${donnees.numero} · ${donnees.centreNom}</div>
    </div>

    <div class="meta">Bénéficiaire : ${donnees.clientNom}</div>
    <div class="meta">Caissier : ${donnees.caissierNom} · Paiement : ${donnees.modePaiement}</div>

    <div style="margin-top:10px;">${lignesHtml}</div>
    <div class="total"><span>Total</span><span>${fmt(donnees.montantTotal)}</span></div>

    <div class="codebarres"><img src="${codeBarres}" /></div>

    ${photosHtml ? `<div class="photos">${photosHtml}</div>` : ''}

    <div class="pied">
      <div class="qr"><img src="${qrCode}" /><div class="label">Boutique en ligne</div></div>
      <div class="signature">
        ${donnees.signatureDataUrl ? `<img src="${donnees.signatureDataUrl}" />` : ''}
        <div class="label">Signature caissier</div>
      </div>
      <div class="cachet">
        ${donnees.cachetDataUrl ? `<img src="${donnees.cachetDataUrl}" />` : ''}
        <div class="label">Cachet</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}
