# Instructions de Remplacement des Images

Les images actuelles sont des **placeholders SVG** créés automatiquement. Pour utiliser vos vraies images:

## Images à Remplacer

### 1. Logo LFD-Services
- **Fichier actuel**: `public/images/lfd-logo.svg`
- **Votre image**: Image 2 (logo circulaire avec texte)
- **Action**: Remplacez `lfd-logo.svg` par votre image PNG ou convertissez votre image en SVG

### 2. QR Code de la Boutique
- **Fichier actuel**: `public/images/qr-code-shop.svg`
- **Votre image**: Image 1 (QR code avec logo LFD)
- **Action**: Remplacez `qr-code-shop.svg` par votre image PNG

### 3. Photo du Centre
- **Fichier actuel**: `public/images/center-photo.svg`
- **Votre image**: Image 3 (photo du bâtiment)
- **Action**: Remplacez `center-photo.svg` par votre image JPG ou PNG

## Comment Procéder

### Option A: Remplacer Directement les Fichiers

1. **Sauvegardez vos images** avec les noms suivants:
   - Image 2 → `lfd-logo.png` (ou .svg)
   - Image 1 → `qr-code-shop.png` (ou .svg)
   - Image 3 → `center-photo.jpg` (ou .png)

2. **Placez-les dans**:
   ```
   frontend/public/images/
   ```

3. **Modifiez les composants** si nécessaire:
   - `BrandHeader.tsx` → Changez `.svg` en `.png` si vous utilisez PNG
   - `BrandAssets.tsx` → Changez les extensions selon vos fichiers

### Option B: Ajouter les Versions PNG

Conservez les SVG actuels et ajoutez des versions PNG:

1. Sauvegardez vos images comme:
   - `lfd-logo.png`
   - `qr-code-shop.png`
   - `center-photo.jpg`

2. Modifiez `BrandHeader.tsx` et `BrandAssets.tsx` pour utiliser PNG:
   ```tsx
   // Dans BrandHeader.tsx
   src="/images/lfd-logo.png"  // au lieu de .svg
   
   // Dans BrandAssets.tsx
   src="/images/qr-code-shop.png"  // au lieu de .svg
   src="/images/center-photo.jpg"  // au lieu de .svg
   ```

3. Mettez à jour `vite.config.ts` pour inclure les PNG:
   ```typescript
   includeAssets: [
     'favicon.svg', 
     'icons/icon-192.svg', 
     'icons/icon-512.svg',
     'images/lfd-logo.png',
     'images/qr-code-shop.png',
     'images/center-photo.jpg',
   ],
   ```

## Recommandations

- **Préférez SVG** pour le logo (qualité parfaite à toute taille)
- **Préférez PNG** pour le QR code (compatibilité maximale)
- **Préférez JPG** pour la photo (compression optimale)

## Test

Après avoir remplacé les images:

1. Redémarrez le serveur de développement
2. Vérifiez que les images s'affichent correctement
3. Testez sur différents navigateurs
4. Vérifiez le build de production