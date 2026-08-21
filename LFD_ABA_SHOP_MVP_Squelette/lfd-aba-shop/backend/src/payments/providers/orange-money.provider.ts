import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';

// Implémentation de l'API Orange Money « Web Payment ». Contrairement à
// MTN MoMo (invite USSD directe), ce flux génère une URL de paiement vers
// laquelle rediriger le bénéficiaire ; la confirmation arrive ensuite sur
// l'URL de notification (webhook) configurée. Nécessite au minimum
// ORANGE_MONEY_BASE_URL, ORANGE_MONEY_CLIENT_ID, ORANGE_MONEY_CLIENT_SECRET,
// ORANGE_MONEY_MERCHANT_KEY, ORANGE_MONEY_COUNTRY (ex. 'cm' pour Cameroun),
// ORANGE_MONEY_NOTIF_URL.
@Injectable()
export class OrangeMoneyProvider {
  private readonly logger = new Logger(OrangeMoneyProvider.name);
  private readonly baseUrl = process.env.ORANGE_MONEY_BASE_URL || 'https://api.orange.com';

  private async obtenirJeton(): Promise<string> {
    const identifiants = Buffer.from(
      `${process.env.ORANGE_MONEY_CLIENT_ID}:${process.env.ORANGE_MONEY_CLIENT_SECRET}`,
    ).toString('base64');

    const reponse = await fetch(`${this.baseUrl}/oauth/v3/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${identifiants}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!reponse.ok) {
      this.logger.error(`Échec d'obtention du jeton Orange Money (${reponse.status}).`);
      throw new ServiceUnavailableException('Service Orange Money indisponible.');
    }
    const data = (await reponse.json()) as { access_token: string };
    return data.access_token;
  }

  // Crée la session de paiement et renvoie l'URL vers laquelle rediriger
  // le bénéficiaire, ainsi que le jeton de paiement (pay_token) à
  // conserver comme référence externe pour le rapprochement webhook.
  async creerSessionPaiement(params: {
    montant: number;
    devise: string;
    referenceCommande: string;
  }): Promise<{ referenceExterne: string; urlPaiement: string }> {
    const jeton = await this.obtenirJeton();
    const pays = process.env.ORANGE_MONEY_COUNTRY || 'cm';

    const reponse = await fetch(`${this.baseUrl}/orange-money-webpay/${pays}/v1/webpayment`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jeton}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        merchant_key: process.env.ORANGE_MONEY_MERCHANT_KEY,
        currency: params.devise,
        order_id: params.referenceCommande,
        amount: params.montant,
        return_url: process.env.ORANGE_MONEY_RETURN_URL,
        cancel_url: process.env.ORANGE_MONEY_CANCEL_URL,
        notif_url: process.env.ORANGE_MONEY_NOTIF_URL,
        lang: 'fr',
        reference: 'ABA SHOP',
      }),
    });

    if (!reponse.ok) {
      this.logger.error(`Échec de création de session Orange Money (${reponse.status}).`);
      throw new ServiceUnavailableException("La session de paiement n'a pas pu être créée.");
    }

    const data = (await reponse.json()) as { pay_token: string; payment_url: string };
    return { referenceExterne: data.pay_token, urlPaiement: data.payment_url };
  }
}
