# Guide de Déploiement Automatisé (Un Clic)

## 🚀 Déploiement en 3 Étapes Simples

J'ai créé des fichiers de configuration automatisés pour rendre le déploiement aussi simple que possible.

---

## 📋 Méthode 1: Render Blueprints (Le Plus Simple)

Render supporte maintenant les "Blueprints" qui permettent de déployer directement depuis GitHub avec une configuration automatique.

### Étape 1: Importer le Blueprint sur Render

1. Allez sur https://render.com
2. Connectez-vous avec GitHub
3. Cliquez sur "New" → "Blueprint"
4. Entrez l'URL du dépôt: `https://github.com/Tobou19/lfd-aba-shop`
5. Cliquez sur "Import"

Render détectera automatiquement le fichier `render.yaml` et configurera:
- ✅ Backend Node.js
- ✅ PostgreSQL Database
- ✅ Variables d'environnement
- ✅ Secrets JWT auto-générés
- ✅ CORS configuré pour Vercel

### Étape 2: Déployer le Frontend sur Vercel

1. Allez sur https://vercel.com
2. Connectez-vous avec GitHub
3. Cliquez sur "Add New Project"
4. Importez le dépôt: `Tobou19/lfd-aba-shop`
5. Configurez:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Ajoutez la variable d'environnement:
   - `VITE_API_BASE`: Utilisez l'URL Render après déploiement
7. Cliquez sur Deploy

### Étape 3: Seed la Base de Données

Une fois le backend déployé sur Render:

1. Allez sur votre service Render
2. Cliquez sur "Shell"
3. Exécutez: `cd backend && npx prisma db seed`

---

## 📋 Méthode 2: Script Interactif (deploy.sh)

Pour les utilisateurs de Linux/Mac, j'ai créé un script interactif:

```bash
# Dans le répertoire racine du projet
chmod +x deploy.sh
./deploy.sh
```

Le script vous guidera étape par étape.

---

## 📋 Méthode 3: Manuel (Simple grâce aux fichiers créés)

### Backend sur Render

1. Allez sur https://render.com
2. Connectez-vous avec GitHub
3. Cliquez sur "New" → "Web Service"
4. Importez: `Tobou19/lfd-aba-shop`
5. Configurez:
   - Name: `lfd-aba-shop-backend`
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`
6. Cliquez sur "Create Web Service"
7. Après création, ajoutez PostgreSQL:
   - Cliquez sur "New" → "Database" → "PostgreSQL"
   - Connectez-le au Web Service
8. Render auto-configurera DATABASE_URL
9. Les autres variables sont dans `render.yaml` pour référence

### Frontend sur Vercel

1. Allez sur https://vercel.com
2. Connectez-vous avec GitHub
3. Cliquez sur "Add New Project"
4. Importez: `Tobou19/lfd-aba-shop`
5. Configurez:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Ajoutez `VITE_API_BASE` avec l'URL Render
7. Cliquez sur Deploy

---

## 🔐 Identifiants Administrateur

Une fois le backend déployé et seedé:

- **Email**: `toboudjilayanxavier@gmail.com`
- **Téléphone**: `688758020`
- **Mot de passe**: `X@vier1st`

---

## 📁 Fichiers de Déploiement Créés

### `render.yaml`
Configuration native Render qui automatise:
- Backend Node.js
- PostgreSQL Database
- Variables d'environnement
- Secrets JWT auto-générés

### `backend/Dockerfile`
Docker container pour le backend si vous voulez utiliser Docker.

### `backend/.render/build.sh`
Script de build pour Render (optionnel).

### `docker-compose.render.yml`
Référence Docker Compose pour développement local.

### `deploy.sh`
Script interactif pour Linux/Mac.

---

## ✅ Avantages de cette Configuration

1. **Automatisation**: Render détecte `render.yaml` automatiquement
2. **Secrets Auto-générés**: JWT secrets créés automatiquement
3. **PostgreSQL Intégré**: Base de données liée automatiquement
4. **CORS Configuré**: Prêt pour Vercel frontend
5. **Zero Configuration**: Tout est pré-configuré

---

## 🎯 Recommandation

**Utilisez la Méthode 1 (Render Blueprints)** car:
- C'est le plus simple
- Tout est automatisé
- Configuration minimale requise
- Déploiement en quelques clics

---

## 🆘 Support

Si vous rencontrez des problèmes:
1. Vérifiez que `render.yaml` est à la racine du dépôt
2. Vérifiez que vous avez connecté GitHub à Render
3. Vérifiez que le dépôt est public ou que Render y a accès

---

**Déploiement prêt ! Il ne vous reste qu'à cliquer !** 🚀
