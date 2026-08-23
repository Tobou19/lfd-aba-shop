# 🚀 Guide de Démarrage Rapide LFD ABA Shop

## Étape 1: Démarrer l'Application Localement

### Vérifier PostgreSQL
```bash
# Ouvrir un terminal et vérifier PostgreSQL
psql --version
```

Si PostgreSQL n'est pas démarré:
```bash
# Démarrer PostgreSQL via Services Windows
# Chercher "PostgreSQL" dans les services Windows
# Clic droit → Démarrer
```

### Démarrer le Backend
```bash
cd C:\Users\LFD SERVICE\Downloads\LFD_ABA_SHOP_MVP_Squelette\lfd-aba-shop\backend
npm run start:dev
```

**Résultat attendu**: Application backend sur http://localhost:3000

### Démarrer le Frontend (Nouveau Terminal)
```bash
cd C:\Users\LFD SERVICE\Downloads\LFD_ABA_SHOP_MVP_Squelette\lfd-aba-shop\frontend
npm run dev
```

**Résultat attendu**: Application frontend sur http://localhost:5173

### Première Connexion
1. Ouvrez http://localhost:5173 dans votre navigateur
2. Utilisez les identifiants de démo:
   - Email: direction@lfd-services.com
   - Mot de passe: ChangezMoiDirection123!

---

## 🌐 Options d'Hébergement Gratuites

### Option 1: Vercel (Frontend) + Railway/Render (Backend) - RECOMMANDÉ

#### Avantages
- ✅ 100% gratuit pour les projets de base
- ✅ HTTPS automatique
- ✅ Déploiement automatique depuis GitHub
- ✅ Facile à configurer
- ✅ Performance excellente

#### Frontend: Vercel
1. **Créer un compte Vercel**
   - Allez sur https://vercel.com
   - Inscrivez-vous avec GitHub

2. **Importer le dépôt**
   - Cliquez sur "Add New Project"
   - Sélectionnez votre dépôt GitHub: `Tobou19/lfd-aba-shop`
   - Configurez:
     - Root Directory: `frontend`
     - Build Command: `npm run build`
     - Output Directory: `dist`

3. **Configurer les variables d'environnement**
   - Dans Settings → Environment Variables
   - Ajoutez: `VITE_API_BASE=https://votre-backend-url.com/api/v1`

#### Backend: Railway ou Render

**Railway (Recommandé)**
1. **Créer un compte Railway**
   - Allez sur https://railway.app
   - Inscrivez-vous avec GitHub

2. **Créer un nouveau projet**
   - Cliquez "New Project"
   - Sélectionnez "Deploy from GitHub repo"
   - Choisissez `Tobou19/lfd-aba-shop`

3. **Configurer PostgreSQL**
   - Railway ajoute automatiquement PostgreSQL
   - Copiez la DATABASE_URL fournie

4. **Configurer les variables d'environnement**
   - Dans Variables
   - Ajoutez:
     - `DATABASE_URL` (fourni par Railway)
     - `JWT_ACCESS_SECRET` (générez un secret de 32+ caractères)
     - `JWT_REFRESH_SECRET` (générez un secret de 32+ caractères)
     - `CORS_ORIGIN=https://votre-domaine-vercel.com`
     - `NODE_ENV=production`

5. **Configurer le backend**
   - Root Directory: `backend`
   - Build Command: `npm run build`
   - Start Command: `npm run start:prod`

**Render (Alternative)**
1. **Créer un compte Render**
   - Allez sur https://render.com
   - Inscrivez-vous avec GitHub

2. **Créer un Web Service**
   - "New" → "Web Service"
   - Connectez votre dépôt GitHub
   - Configurez comme Railway ci-dessus

---

### Option 2: Netlify (Frontend) + Railway/Render (Backend)

#### Frontend: Netlify
1. **Créer un compte Netlify**
   - Allez sur https://netlify.com
   - Inscrivez-vous

2. **Drag & Drop**
   - Glissez le dossier `frontend/dist` dans Netlify
   - Ou connectez votre dépôt GitHub

3. **Configurer les variables**
   - Site settings → Environment variables
   - Ajoutez `VITE_API_BASE`

---

### Option 3: GitHub Pages (Frontend) + Railway/Render (Backend)

#### Frontend: GitHub Pages
1. **Créer une branche gh-pages**
   ```bash
   cd frontend
   git checkout -b gh-pages
   npm run build
   git add dist
   git commit -m "Deploy to GitHub Pages"
   git push origin gh-pages
   ```

2. **Activer GitHub Pages**
   - Allez sur votre dépôt GitHub
   - Settings → Pages
   - Source: `gh-pages` branch
   - Votre site sera accessible à: `https://votre-username.github.io/lfd-aba-shop/`

---

## 🌐 Options de Nom de Domaine

### Option 1: Domaine Gratuit (Subdomain)

#### Freenom
- **URL**: votre-nom.eu.org
- **Coût**: Gratuit
- **Procédure**:
  1. Allez sur https://www.freenom.com
  2. Inscrivez-vous
  3. Choisissez un domaine disponible
  4. Configurez le DNS pour pointer vers Vercel/Netlify

#### DuckDNS
- **URL**: votre-nom.duckdns.org
- **Coût**: Gratuit
- **Procédure**:
  1. Allez sur https://www.duckdns.org
  2. Créez un sous-domaine
  3. Configurez le DNS

#### GitHub Pages
- **URL**: votre-username.github.io/lfd-aba-shop
- **Coût**: Gratuit
- **Automatique**: Activé instantanément

---

### Option 2: Domaine Payant (Personnalisé)

#### Namecheap
- **Coût**: ~10-12€/an pour .com
- **Avantages**: DNS gratuit, WHOIS privacy gratuit
- **Procédure**:
  1. Achetez votre domaine
  2. Configurez le DNS pour pointer vers Vercel/Netlify
  3. Ajoutez le domaine dans Vercel/Netlify

#### OVH / Gandi
- **Coût**: ~10-15€/an pour .com
- **Avantages**: Services basés en France/Europe
- **Procédure**: Similaire à Namecheap

---

## 🎯 Recommandation pour Démarrage Rapide

### Pour Test Local (Immédiat)
1. **Démarrez PostgreSQL** (vérifier Services Windows)
2. **Démarrez le backend**: `cd backend && npm run start:dev`
3. **Démarrez le frontend**: `cd frontend && npm run dev`
4. **Ouvrez**: http://localhost:5173
5. **Connectez-vous** avec les identifiants de démo

### Pour Déploiement Production (Après Tests)

#### Option Recommandée: Vercel + Railway
1. **Héberger le frontend sur Vercel** (gratuit)
2. **Héberger le backend sur Railway** (gratuit avec PostgreSQL)
3. **Utiliser un sous-domaine gratuit** (freenom ou duckdns)
4. **Coût total**: 0€

---

## 📋 Checklist de Démarrage

### Local
- [ ] PostgreSQL installé et démarré
- [ ] Backend configuré (.env créé)
- [ ] Base de données migrée
- [ ] Base de données seedée
- [ ] Backend démarré (port 3000)
- [ ] Frontend démarré (port 5173)
- [ ] Premier connexion réussie

### Production
- [ ] Compte Vercel créé
- [ ] Compte Railway créé
- [ ] Frontend déployé sur Vercel
- [ ] Backend déployé sur Railway
- [ ] Variables d'environnement configurées
- [ ] Domaine configuré
- [ ] HTTPS actif
- [ ] Test de bout en bout complet

---

## 🔧 Configuration des Variables d'Environnement Production

### Backend (Railway/Render)
```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_ACCESS_SECRET=votre_secret_32_caractères_minimum
JWT_REFRESH_SECRET=votre_secret_32_caractères_minimum
CORS_ORIGIN=https://votre-domaine.com
NODE_ENV=production
STORAGE_DRIVER=local
STORAGE_LOCAL_ROOT=./storage
STORAGE_PUBLIC_BASE_URL=/files
```

### Frontend (Vercel/Netlify)
```env
VITE_API_BASE=https://votre-backend-railway.app/api/v1
```

---

## 🚀 Après le Déploiement

### Test de Bout en Bout
1. **Accéder à l'application** via votre domaine
2. **Tester la connexion** avec les identifiants de démo
3. **Vérifier les centres** dans l'API
4. **Tester le mode hors connexion**
5. **Vérifier les notifications**
6. **Tester la synchronisation**

### Sécurité
- **IMPORTANT**: Changez les mots de passe de démo immédiatement
- **IMPORTANT**: Régénérez les secrets JWT avant production
- **IMPORTANT**: Ne committez jamais .env ou secrets

---

## 📞 Support Technique

Pour toute question:
- Consultez `GUIDE_UTILISATION_COMPLET.md`
- Consultez `DEPLOYMENT_GUIDE.md`
- Consultez `GUIDE_INTEGRATION_IMAGES.md`

---

**Prêt à démarrer ? Suivez les étapes ci-dessus !** 🎉