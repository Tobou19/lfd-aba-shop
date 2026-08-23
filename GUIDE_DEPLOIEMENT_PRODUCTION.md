# Guide de Déploiement Production LFD ABA Shop

## 📋 Sommaire

1. Déployer le frontend sur Vercel
2. Déployer le backend sur Railway
3. Obtenir un domaine sur Freenom
4. Configurer le DNS
5. Tester en production

---

## 🚀 Étape 1: Déployer le Frontend sur Vercel

### 1.1 Créer un Compte Vercel

1. Allez sur https://vercel.com
2. Cliquez sur "Sign Up"
3. Inscrivez-vous avec votre compte GitHub
4. Autorisez Vercel à accéder à votre dépôt GitHub

### 1.2 Importer le Dépôt

1. Cliquez sur "Add New Project"
2. Cliquez sur "Continue with GitHub"
3. Sélectionnez votre dépôt: `Tobou19/lfd-aba-shop`
4. Cliquez sur "Import"

### 1.3 Configurer le Projet

Dans la page de configuration du projet:

#### Framework Preset
- **Framework**: Vite
- **Root Directory**: `frontend`

#### Build and Output Settings
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

#### Environment Variables
- **VITE_API_BASE**: `https://votre-backend-railway.app/api/v1`
  - Remplacez `votre-backend-railway.app` par l'URL de votre backend Railway après déploiement

### 1.4 Déployer

1. Cliquez sur "Deploy"
2. Attendez que le build se termine (environ 2-3 minutes)
3. Vercel vous donnera une URL: `https://votre-projet.vercel.app`

**Note**: Notez cette URL, vous en aurez besoin pour la suite.

---

## 🚀 Étape 2: Déployer le Backend sur Railway

### 2.1 Créer un Compte Railway

1. Allez sur https://railway.app
2. Cliquez sur "Sign Up"
3. Inscrivez-vous avec votre compte GitHub
4. Autorisez Railway à accéder à votre dépôt GitHub

### 2.2 Créer un Nouveau Projet

1. Cliquez sur "New Project"
2. Cliquez sur "Deploy from GitHub repo"
3. Sélectionnez votre dépôt: `Tobou19/lfd-aba-shop`
4. Cliquez sur "Import"

### 2.3 Configurer PostgreSQL

Railway ajoutera automatiquement PostgreSQL à votre projet. Vous verrez:

1. **PostgreSQL Database** - cliquez sur "Add New Database"
2. Sélectionnez "PostgreSQL"
3. Cliquez sur "Add"

Railway créera une base de données PostgreSQL avec les identifiants suivants:
- Host
- Port
- User
- Password
- Database Name

**Important**: Copiez le **DATABASE_URL** généré, vous en aurez besoin.

### 2.4 Configurer les Variables d'Environnement

Dans votre projet Railway, allez dans l'onglet "Variables":

#### Variables Requises

```
DATABASE_URL
votre_database_url_copiée_à_l'étape_précédente

JWT_ACCESS_SECRET
générez_un_secret_32_caractères_minimum

JWT_REFRESH_SECRET
générez_un_secret_32_caractères_minimum

CORS_ORIGIN
https://votre-projet-vercel.app

NODE_ENV
production

STORAGE_DRIVER
local

STORAGE_LOCAL_ROOT
./storage

STORAGE_PUBLIC_BASE_URL
/files
```

#### Comment Générer un Secret

Vous pouvez générer un secret sécurisé en ligne:
- Allez sur https://generate-random.org/api-key
- Générez une clé de 32+ caractères
- Copiez-la pour JWT_ACCESS_SECRET et JWT_REFRESH_SECRET (utilisez des clés différentes)

### 2.5 Configurer le Backend

Dans les paramètres du projet Railway:

#### Root Directory
- **Root Directory**: `backend`

#### Build Command
- **Build Command**: `npm run build`

#### Start Command
- **Start Command**: `npm run start:prod`

### 2.6 Déployer

1. Cliquez sur "Deploy"
2. Attendez que le build se termine (environ 3-5 minutes)
3. Railway vous donnera une URL: `https://votre-backend-production.up.railway.app`

**Note**: Notez cette URL, vous en aurez besoin pour:
- La variable VITE_API_BASE sur Vercel
- La variable CORS_ORIGIN

### 2.7 Migrer la Base de Données

Une fois le backend déployé, vous devez migrer la base de données:

1. Dans Railway, cliquez sur votre service PostgreSQL
2. Cliquez sur "Console"
3. Exécutez les commandes suivantes:

```bash
# Depuis le répertoire backend
npx prisma migrate deploy
```

Ou vous pouvez utiliser l'interface web de Railway pour exécuter cette commande.

### 2.8 Seeder la Base de Données

```bash
npx prisma db seed
```

---

## 🌐 Étape 3: Obtenir un Domaine sur Freenom

### 3.1 Créer un Compte Freenom

1. Allez sur https://www.freenom.com
2. Cliquez sur "Sign Up"
3. Remplissez le formulaire d'inscription
4. Vérifiez votre email

### 3.2 Rechercher un Domaine

1. Connectez-vous à Freenom
2. Cliquez sur "Services" → "Register a New Domain"
3. Dans "Find a new domain", tapez: `lfd-aba-shop`
4. Sélectionnez l'extension `.eu.org`
5. Cliquez sur "Check Availability"

Si `lfd-aba-shop.eu.org` n'est pas disponible, essayez:
- `lfd-services.eu.org`
- `lfd-aba-shopeu.org`
- `lfd-aba-organization.eu.org`

### 3.3 Enregistrer le Domaine

1. Une fois le domaine disponible, cliquez sur "Get it free"
2. Choisissez la durée: "12 Months @ Free"
3. Cliquez sur "Continue"
4. Remplissez les informations d'enregistrement:
   - **First Name**: Votre prénom
   - **Last Name**: Votre nom
   - **Address**: Votre adresse
   - **City**: Votre ville
   - **Country**: Votre pays
   - **Email**: Votre email
5. Cliquez sur "Continue"
6. Sélectionnez "My own DNS" (nous allons configurer DNS manuellement)
7. Cliquez sur "Continue"
8. Attendez la confirmation (environ 1-2 heures)
9. Une fois activé, vous verrez le domaine dans votre compte Freenom

---

## 🔧 Étape 4: Configurer le DNS

### 4.1 Obtenir les DNS Vercel

1. Allez sur votre projet Vercel
2. Cliquez sur "Settings" → "Domains"
3. Cliquez sur "Add Domain"
4. Entrez votre domaine: `lfd-aba-shop.eu.org`
5. Vercel vous donnera les DNS à configurer:
   - **Type**: CNAME
   - **Name**: `@`
   - **Value**: `cname.vercel-dns.com`

### 4.2 Configurer DNS sur Freenom

1. Connectez-vous à Freenom
2. Allez sur "Services" → "My Domains"
3. Cliquez sur votre domaine: `lfd-aba-shop.eu.org`
4. Cliquez sur "Management Tools" → "Nameservers"
5. Sélectionnez "Use Freenom Nameservers" (recommandé)
6. Cliquez sur "Change Nameservers"
7. Attendez la propagation (environ 1-2 heures)

### 4.3 Configurer les Records DNS

1. Toujours sur Freenom, cliquez sur "Management Tools" → "DNS"
2. Cliquez sur "Add Record"
3. Configurez comme suit:

#### Record A (Optionnel - Pour racine du domaine)
- **Type**: A
- **Name**: @
- **TTL**: 3600
- **Target**: `76.76.21.21` (ou laissez vide si vous utilisez CNAME)

#### Record CNAME (Recommandé)
- **Type**: CNAME
- **Name**: @
- **TTL**: 3600
- **Target**: `votre-projet.vercel.app`

### 4.4 Configurer le Domaine sur Vercel

1. Retournez sur Vercel
2. Allez dans "Settings" → "Domains"
3. Vérifiez que votre domaine est actif
4. Attendez la propagation DNS (environ 1-2 heures)
5. Vercel générera automatiquement un certificat SSL

### 4.5 Mettre à jour la Variable d'Environnement

1. Sur Vercel, allez dans "Settings" → "Environment Variables"
2. Mettez à jour `VITE_API_BASE`:
   ```
   VITE_API_BASE=https://votre-backend-railway.app/api/v1
   ```
3. Cliquez sur "Save"
4. Redéployez le projet Vercel

---

## ✅ Étape 5: Tester en Production

### 5.1 Tester le Frontend

1. Attendez que Vercel ait redéployé
2. Ouvrez votre navigateur
3. Allez sur: `https://lfd-aba-shop.eu.org`
4. Vérifiez:
   - ✅ La page de connexion s'affiche
   - ✅ Le design premium est visible
   - ✅ HTTPS est actif (cadenas vert)
   - ✅ Le logo et QR code s'affichent

### 5.2 Tester la Connexion

1. Utilisez les identifiants de démo:
   - Email: `direction@lfd-services.com`
   - Mot de passe: `ChangezMoiDirection123!`
2. Cliquez sur "Se connecter"
3. Vérifiez:
   - ✅ La connexion réussit
   - ✅ Le tableau de bord s'affiche
   - ✅ Les fonctionnalités sont accessibles

### 5.3 Tester le Backend

1. Ouvrez les DevTools du navigateur (F12)
2. Allez dans l'onglet "Network"
3. Essayez de vous connecter
4. Vérifiez les requêtes API:
   - ✅ Les requêtes vers `/api/v1/auth/login` réussissent
   - ✅ Status 201 est retourné
   - ✅ Access token est reçu

### 5.4 Tester le Mode Hors Connexion

1. Ouvrez les DevTools (F12)
2. Allez dans l'onglet "Network"
3. Changez à "Offline"
4. Rafraîchissez la page
5. Vérifiez:
   - ✅ L'application fonctionne hors connexion
   - ✅ Les données en cache sont accessibles
   - ✅ La bannière hors connexion s'affiche

### 5.5 Tester la Synchronisation

1. Reconnectez-vous à internet
2. Effectuez une action hors connexion
3. Vérifiez:
   - ✅ La synchronisation automatique se lance
   - ✅ Les données sont envoyées au backend
   - ✅ Le compteur de synchronisation diminue

---

## 🔐 Étape 6: Sécuriser le Déploiement

### 6.1 Changer les Mots de Passe de Démo

IMPORTANT: Changez immédiatement les mots de passe de démo en production.

1. Connectez-vous à votre base de données Railway
2. Exécutez la requête SQL pour changer les mots de passe:
```sql
UPDATE utilisateur
SET motDePasseHash = 'nouveau_hash'
WHERE email = 'direction@lfd-services.com';
```

Ou utilisez l'interface de l'application pour changer les mots de passe.

### 6.2 Régénérer les Secrets JWT

1. Sur Railway, allez dans "Variables"
2. Générez de nouveaux secrets pour:
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
3. Mettez à jour les variables
4. Redéployez le backend

### 6.3 Configurer CORS Correctement

1. Sur Railway, mettez à jour `CORS_ORIGIN`:
   ```
   CORS_ORIGIN=https://lfd-aba-shop.eu.org
   ```
2. Sur Vercel, mettez à jour `VITE_API_BASE`:
   ```
   VITE_API_BASE=https://votre-backend-railway.app/api/v1
   ```
3. Redéployez les deux services

---

## 📋 Checklist de Déploiement

### Frontend (Vercel)
- [ ] Compte Vercel créé
- [ ] Dépôt GitHub importé
- [ ] Root directory configuré (frontend)
- [ ] Build command configuré
- [ ] Output directory configuré
- [ ] Variable VITE_API_BASE configurée
- [ ] Déploiement réussi
- [ ] Domaine ajouté
- [ ] HTTPS actif

### Backend (Railway)
- [ ] Compte Railway créé
- [ ] Dépôt GitHub importé
- [ ] PostgreSQL ajouté
- [ ] DATABASE_URL copié
- [ ] Variables d'environnement configurées
- [ ] Root directory configuré (backend)
- [ ] Build command configuré
- [ ] Start command configuré
- [ ] Déploiement réussi
- [ ] Migration effectuée
- [ ] Seed effectué

### Domaine (Freenom)
- [ ] Compte Freenom créé
- [ ] Domaine recherché (lfd-aba-shop.eu.org)
- [ ] Domaine enregistré
- [ ] DNS configuré
- [ ] Propagation DNS terminée

### Test Production
- [ ] Frontend accessible
- [ ] HTTPS actif
- [ ] Connexion fonctionnelle
- [ ] API répondant
- [ ] Mode hors connexion testé
- [ ] Synchronisation testée
- [ ] Mots de passe changés
- [ ] Secrets JWT régénérés

---

## 🆘 Dépannage

### Frontend ne se charge pas

**Problème**: Le frontend ne se charge pas sur le domaine

**Solution**:
1. Vérifiez que le DNS a propagé (attendez 24-48h)
2. Vérifiez les records DNS sur Freenom
3. Vérifiez que le domaine est actif sur Vercel
4. Vérifiez que HTTPS est actif

### API renvoie des erreurs CORS

**Problème**: Erreurs CORS dans la console

**Solution**:
1. Vérifiez que `CORS_ORIGIN` sur Railway contient votre domaine Vercel
2. Vérifiez que `VITE_API_BASE` sur Vercel contient l'URL du backend Railway
3. Redéployez les deux services

### Base de données vide

**Problème**: Les données ne s'affichent pas

**Solution**:
1. Vérifiez que la migration a été effectuée
2. Vérifiez que le seed a été effectué
3. Vérifiez que `DATABASE_URL` est correct
4. Refaites la migration et le seed

### Domaine inaccessible

**Problème**: Le domaine ne répond pas

**Solution**:
1. Vérifiez que le domaine est actif sur Freenom
2. Vérifiez que les records DNS sont corrects
3. Attendez la propagation DNS (24-48h)
4. Utilisez l'URL Vercel en attendant

---

## 📞 Support

Pour toute question:
- Documentation Vercel: https://vercel.com/docs
- Documentation Railway: https://docs.railway.app
- Documentation Freenom: https://www.freenom.com
- Email: support@lfd-services.com

---

**Bon déploiement !** 🚀