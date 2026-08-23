# Instructions pour les Images

Ce dossier contient les images à intégrer dans l'application LFD ABA Shop.

## Images Actuelles (Placeholders)

Des images placeholder SVG ont été créées automatiquement:
- `lfd-logo.svg` - Logo placeholder (vert avec texte LFD)
- `qr-code-shop.svg` - QR code placeholder (pattern QR avec logo LFD)
- `center-photo.svg` - Photo placeholder (bâtiment stylisé)

## Images Requises (Vos Vraies Images)

### 1. QR Code de la Boutique
- **Nom du fichier**: `qr-code-shop.png` (ou `.svg`)
- **Format**: PNG recommandé pour compatibilité
- **Taille**: Minimum 300x300px
- **Description**: QR code pointant vers la boutique en ligne LFD-Services
- **Utilisation**: Affiché sur les reçus, la page d'accueil, et pour le scan mobile
- **Votre image**: Image 1 (QR code avec logo LFD au centre)

### 2. Logo LFD-Services
- **Nom du fichier**: `lfd-logo.png` (ou `.svg`)
- **Format**: PNG avec fond transparent ou SVG
- **Taille**: Minimum 200x200px
- **Description**: Logo officiel du centre de santé LFD-Services
- **Utilisation**: Affiché dans l'en-tête, sur les reçus, et comme favicon
- **Votre image**: Image 2 (logo circulaire avec texte "LFD-Services")

### 3. Photo du Centre/Bâtiment
- **Nom du fichier**: `center-photo.jpg` (ou `.png`)
- **Format**: JPG pour compression, PNG pour qualité
- **Taille**: Minimum 800x600px (recommandé 1920x1080px)
- **Description**: Photo du bâtiment LFD-Services
- **Utilisation**: Affichée sur la page d'accueil et dans la section "À propos"
- **Votre image**: Image 3 (photo du bâtiment avec balcon)

## Comment Ajouter Vos Images

### Étape 1: Sauvegarder Vos Images
1. Sauvegardez Image 1 (QR code) comme `qr-code-shop.png`
2. Sauvegardez Image 2 (Logo) comme `lfd-logo.png`
3. Sauvegardez Image 3 (Photo) comme `center-photo.jpg`

### Étape 2: Placer les Images
Copiez vos fichiers dans ce dossier:
```
frontend/public/images/
```

### Étape 3: Vérifier
Les composants sont déjà configurés pour utiliser ces fichiers:
- `BrandHeader.tsx` → utilise `/images/lfd-logo.png`
- `BrandAssets.tsx` → utilise `/images/qr-code-shop.png` et `/images/center-photo.jpg`
- `index.html` → utilise `/images/lfd-logo.png` comme favicon

### Étape 4: Fallback
Si les fichiers PNG n'existent pas, l'application utilisera automatiquement les SVG placeholders.

## Composants Utilisant Ces Images

- `BrandHeader.tsx` - Affichage du logo dans l'en-tête
- `BrandAssets.tsx` - Affichage du QR code et de la photo
- `App.tsx` - Intégration dans la page de connexion et tableau de bord
- `index.html` - Favicon du navigateur

## Note Importante

Les images fournies dans les métadonnées sont:
- **Image 1**: QR code de la boutique avec logo LFD
- **Image 2**: Logo circulaire LFD-Services avec texte
- **Image 3**: Photo du bâtiment LFD-Services

Ces images doivent être sauvegardées manuellement dans ce dossier pour remplacer les placeholders SVG actuels.