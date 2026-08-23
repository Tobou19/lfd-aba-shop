# Guide de Déploiement LFD ABA Shop MVP

## 🚀 Déploiement Local (Développement)

### Prérequis
- Node.js v20+
- PostgreSQL 18+
- Git

### Étapes

1. **Cloner le dépôt**
```bash
git clone https://github.com/Tobou19/lfd-aba-shop.git
cd lfd-aba-shop
```

2. **Configurer le backend**
```bash
cd backend
cp .env.example .env
# Éditer .env avec vos configurations
npm install
npx prisma db push
npm run db:seed
npm run build
npm run start:dev
```

3. **Lancer le frontend**
```bash
cd frontend
npm install
npm run dev
```

### Accès
- Backend: http://localhost:3000
- Frontend: http://localhost:5173

## 🌐 Déploiement en Production

### Option 1: Docker Compose (Recommandé)

```bash
# À la racine du projet
docker-compose up -d
```

### Option 2: Vercel + Railway/Render

1. **Backend (Railway/Render)**
   - Connecter votre dépôt GitHub
   - Configurer les variables d'environnement
   - Déployer automatiquement

2. **Frontend (Vercel)**
   - Connecter votre dépôt GitHub
   - Configurer `VITE_API_BASE` avec l'URL du backend
   - Déployer automatiquement

### Variables d'Environnement Production

#### Backend
```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_ACCESS_SECRET=votre_secret_32_chars_min
JWT_REFRESH_SECRET=votre_secret_32_chars_min
CORS_ORIGIN=https://votre-domaine.com
NODE_ENV=production
```

#### Frontend
```env
VITE_API_BASE=https://votre-backend-api.com/api/v1
```

## 📱 Configuration PWA

L'application est configurée comme PWA (Progressive Web App) avec:

- **Mode hors connexion**: Cache automatique des ressources
- **Synchronisation**: Données mises en cache et synchronisées automatiquement
- **Installation**: Installable sur mobile et desktop
- **Performance**: Cache agressif pour temps de chargement optimal

## 🔧 Maintenance

### Mise à jour de l'application
```bash
git pull origin main
cd backend && npm install && npm run build
cd ../frontend && npm install && npm run build
```

### Nettoyage du cache
Le cache se vide automatiquement après:
- 30 jours pour les commandes synchronisées
- 24h pour les produits
- 7 jours pour les centres
- 1 an pour les polices

### Sauvegarde de la base de données
```bash
pg_dump lfd_aba_shop > backup_$(date +%Y%m%d).sql
```

## 📊 Monitoring

### Logs Backend
```bash
cd backend
npm run start:prod 2>&1 | tee logs/app.log
```

### Statistiques
- Vérifiez les logs de synchronisation dans la console du navigateur
- Surveillez l'utilisation du cache via les DevTools (Application > Storage)

## 🆘 Support

En cas de problème:
1. Vérifiez les logs du backend
2. Vérifiez la console du navigateur
3. Videz le cache de l'application
4. Consultez les logs de synchronisation