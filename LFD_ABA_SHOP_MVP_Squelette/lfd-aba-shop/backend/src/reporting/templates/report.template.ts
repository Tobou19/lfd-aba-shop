export interface LigneRapportCentre {
  centre: string;
  devise: string;
  nombreCommandes: number;
  commandesAnnulees: number;
  commandesEnAttente: number;
  chiffreAffaires: number;
}

export function construireHtmlRapport(
  titre: string,
  periode: string,
  lignes: LigneRapportCentre[],
): string {
  const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(Math.round(n));

  const lignesHtml = lignes
    .map(
      (l) => `
      <tr>
        <td>${l.centre}</td>
        <td>${l.nombreCommandes}</td>
        <td>${l.commandesEnAttente}</td>
        <td>${l.commandesAnnulees}</td>
        <td>${fmt(l.chiffreAffaires)} ${l.devise}</td>
      </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<style>
  body { font-family: 'Helvetica', 'Arial', sans-serif; color: #17231D; padding: 28px; }
  h1 { font-size: 18px; color: #1E5C48; margin-bottom: 2px; }
  .sous-titre { font-size: 12px; color: #5B6470; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { text-align: left; background: #1E5C48; color: #fff; padding: 8px 10px; text-transform: uppercase; font-size: 10px; }
  td { padding: 8px 10px; border-bottom: 1px solid #D8DECB; }
  tr:nth-child(even) td { background: #F4F7F0; }
</style>
</head>
<body>
  <h1>${titre}</h1>
  <div class="sous-titre">LFD-Services — Central Management Board · Période : ${periode}</div>
  <table>
    <thead><tr><th>Centre</th><th>Commandes</th><th>En attente</th><th>Annulées</th><th>Chiffre d'affaires</th></tr></thead>
    <tbody>${lignesHtml}</tbody>
  </table>
</body>
</html>`;
}
