import { Injectable, Logger } from '@nestjs/common';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

export interface FichierAStocker {
  cheminRelatif: string; // ex. 'recus/2026/REC-2026-000123.pdf'
  contenu: Buffer;
  contentType: string;
}

// Abstraction de stockage : pilote local (dossier disque, pratique pour
// démarrer simplement — cf. Document de Conception Technique §7.1,
// alternative « stockage disque du serveur pour un démarrage simple »)
// ou pilote S3-compatible pour la production, ou Supabase Storage,
// sélectionné par STORAGE_DRIVER. Le reste de l'application ne connaît que cette
// interface, jamais le détail du pilote actif.
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly driver = process.env.STORAGE_DRIVER || 'local';
  private readonly localRoot = process.env.STORAGE_LOCAL_ROOT || './storage';
  private readonly publicBaseUrl = process.env.STORAGE_PUBLIC_BASE_URL || '/files';

  async enregistrer(fichier: FichierAStocker): Promise<string> {
    if (this.driver === 's3') {
      return this.enregistrerS3(fichier);
    }
    if (this.driver === 'supabase') {
      return this.enregistrerSupabase(fichier);
    }
    return this.enregistrerLocal(fichier);
  }

  private async enregistrerLocal(fichier: FichierAStocker): Promise<string> {
    const cheminComplet = join(this.localRoot, fichier.cheminRelatif);
    await mkdir(join(cheminComplet, '..'), { recursive: true });
    await writeFile(cheminComplet, fichier.contenu);
    return `${this.publicBaseUrl}/${fichier.cheminRelatif}`;
  }

  // Implémentation S3 minimale mais fonctionnelle : nécessite
  // @aws-sdk/client-s3 et les variables S3_BUCKET / S3_REGION /
  // S3_ENDPOINT (compatible tout fournisseur S3, pas seulement AWS).
  private async enregistrerS3(fichier: FichierAStocker): Promise<string> {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    const client = new S3Client({
      region: process.env.S3_REGION,
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: !!process.env.S3_ENDPOINT,
    });
    const bucket = process.env.S3_BUCKET;
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: fichier.cheminRelatif,
        Body: fichier.contenu,
        ContentType: fichier.contentType,
      }),
    );
    this.logger.log(`Fichier déposé sur S3 : ${bucket}/${fichier.cheminRelatif}`);
    return `${process.env.S3_PUBLIC_BASE_URL}/${fichier.cheminRelatif}`;
  }

  // Implémentation Supabase Storage : nécessite @supabase/supabase-js
  // et les variables SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / SUPABASE_BUCKET
  private async enregistrerSupabase(fichier: FichierAStocker): Promise<string> {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const bucket = process.env.SUPABASE_BUCKET || 'lfd-aba-shop';
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fichier.cheminRelatif, fichier.contenu, {
        contentType: fichier.contentType,
        upsert: true,
      });

    if (error) {
      this.logger.error(`Erreur Supabase Storage : ${error.message}`);
      throw new Error(`Erreur Supabase Storage : ${error.message}`);
    }

    this.logger.log(`Fichier déposé sur Supabase : ${bucket}/${fichier.cheminRelatif}`);
    const publicBaseUrl = process.env.SUPABASE_PUBLIC_BASE_URL || 
      `${process.env.SUPABASE_URL}/storage/v1/object/public/${bucket}`;
    return `${publicBaseUrl}/${fichier.cheminRelatif}`;
  }
}
