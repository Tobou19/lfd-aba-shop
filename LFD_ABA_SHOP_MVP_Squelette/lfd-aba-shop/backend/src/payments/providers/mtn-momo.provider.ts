import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { randomUUID } from 'crypto';

// Implémentation de l'API MTN Mobile Money « Collections » (demande de
// paiement / requesttopay). Réplique le flux officiel MTN : jeton OAuth
// puis requête de paiement identifiée par un X-Reference-Id unique, dont
// le statut est ensuite confirmé de façon asynchrone (webhook ou
// interrogation). Nécessite au minimum les variables d'environnement
// MTN_MOMO_BASE_URL, MTN_MOMO_SUBSCRIPTION_KEY, MTN_MOMO_API_USER,
// MTN_MOMO_API_KEY, MTN_MOMO_TARGET_ENVIRONMENT.
@Injectable()
export class MtnMomoProvider {
  private readonly logger = new Logger(MtnMomoProvider.name);
  private readonly baseUrl = process.env.MTN_MOMO_BASE_URL || 'https://sandbox.momodeveloper.mtn.com';

  private async obtenirJeton(): Promise<string> {
    const identifiants = Buffer.from(
      `${process.env.MTN_MOMO_API_USER}:${process.env.MTN_MOMO_API_KEY}`,
    ).toString('base64');

    const reponse = await fetch(`${this.baseUrl}/collection/token/`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${identifiants}`,
        'Ocp-Apim-Subscription-Key': process.env.MTN_MOMO_SUBSCRIPTION_KEY || '',
      },
    });

    if (!reponse.ok) {
      this.logger.error(`Échec d'obtention du jeton MTN MoMo (${reponse.status}).`);
      throw new ServiceUnavailableException('Service MTN Mobile Money indisponible.');
    }
    const data = (await reponse.json()) as { access_token: string };
    return data.access_token;
  }

  // Déclenche la demande de paiement côté opérateur ; le client reçoit une
  // invite USSD/notification sur son téléphone pour confirmer. Retourne
  // la référence externe à conserver pour le rapprochement webhook.
  async demanderPaiement(params: {
    montant: number;
    devise: string;
    telephonePayeur: string;
    referenceCommande: string;
  }): Promise<{ referenceExterne: string }> {
    const jeton = await this.obtenirJeton();
    const referenceExterne = randomUUID();

    const reponse = await fetch(`${this.baseUrl}/collection/v1_0/requesttopay`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jeton}`,
        'X-Reference-Id': referenceExterne,
        'X-Target-Environment': process.env.MTN_MOMO_TARGET_ENVIRONMENT || 'sandbox',
        'Ocp-Apim-Subscription-Key': process.env.MTN_MOMO_SUBSCRIPTION_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: String(params.montant),
        currency: params.devise,
        externalId: params.referenceCommande,
        payer: { partyIdType: 'MSISDN', partyId: params.telephonePayeur },
        payerMessage: `Commande LFD-Services ${params.referenceCommande}`,
        payeeNote: 'Paiement ABA SHOP',
      }),
    });

    if (reponse.status !== 202) {
      this.logger.error(`Échec de la demande de paiement MTN MoMo (${reponse.status}).`);
      throw new ServiceUnavailableException("La demande de paiement n'a pas pu être initiée.");
    }

    return { referenceExterne };
  }

  // Interrogation directe du statut, en complément du webhook (utile si
  // le webhook est en retard ou indisponible).
  async consulterStatut(referenceExterne: string): Promise<'PENDING' | 'SUCCESSFUL' | 'FAILED'> {
    const jeton = await this.obtenirJeton();
    const reponse = await fetch(
      `${this.baseUrl}/collection/v1_0/requesttopay/${referenceExterne}`,
      {
        headers: {
          Authorization: `Bearer ${jeton}`,
          'X-Target-Environment': process.env.MTN_MOMO_TARGET_ENVIRONMENT || 'sandbox',
          'Ocp-Apim-Subscription-Key': process.env.MTN_MOMO_SUBSCRIPTION_KEY || '',
        },
      },
    );
    if (!reponse.ok) throw new ServiceUnavailableException('Statut MTN MoMo indisponible.');
    const data = (await reponse.json()) as { status: 'PENDING' | 'SUCCESSFUL' | 'FAILED' };
    return data.status;
  }
}
