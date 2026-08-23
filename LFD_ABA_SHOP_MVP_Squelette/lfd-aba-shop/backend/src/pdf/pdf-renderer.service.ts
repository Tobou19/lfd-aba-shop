import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import type { Browser } from 'puppeteer';

// Encapsule Puppeteer derrière une interface simple : rendu HTML -> PDF
// et HTML -> PNG. Le navigateur est lancé une seule fois et réutilisé
// (coût de démarrage élevé), avec une nouvelle page par rendu pour
// l'isolation. Cf. Document de Conception Technique §2.1 (« Génération
// PDF : bibliothèque serveur, ex. Puppeteer »).
@Injectable()
export class PdfRendererService implements OnModuleDestroy {
  private readonly logger = new Logger(PdfRendererService.name);
  private browserPromise: Promise<Browser> | null = null;

  private async getBrowser(): Promise<Browser> {
    if (!this.browserPromise) {
      const puppeteer = await import('puppeteer');
      this.browserPromise = puppeteer.launch({
        headless: true,
        // En conteneur Docker, PUPPETEER_EXECUTABLE_PATH pointe vers le
        // Chromium système installé dans l'image (voir backend/Dockerfile)
        // plutôt que vers le Chromium embarqué par Puppeteer. En
        // développement local hors Docker, cette variable est absente et
        // Puppeteer utilise son propre Chromium téléchargé normalement.
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
    return this.browserPromise;
  }

  async htmlVersPdf(html: string, options: { format?: 'A4' } = {}): Promise<Buffer> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    try {
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        format: options.format || 'A4',
        printBackground: true,
        margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
      });
      return Buffer.from(pdf);
    } finally {
      await page.close();
    }
  }

  // Rend le même contenu HTML en image PNG figée, utilisé pour le reçu
  // exportable en image (§4.7 : « Export du reçu en PDF et en image »).
  async htmlVersPng(html: string, viewport = { width: 420, height: 700 }): Promise<Buffer> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    try {
      await page.setViewport(viewport);
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const png = await page.screenshot({ type: 'png', fullPage: true });
      return Buffer.from(png);
    } finally {
      await page.close();
    }
  }

  async onModuleDestroy() {
    if (this.browserPromise) {
      const browser = await this.browserPromise;
      await browser.close().catch(() => this.logger.warn('Fermeture du navigateur Puppeteer en échec.'));
    }
  }
}
