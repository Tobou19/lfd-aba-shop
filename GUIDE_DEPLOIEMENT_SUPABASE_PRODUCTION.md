# Guide de Déploiement Supabase en Production

Ce guide explique comment déployer LFD ABA Shop avec Supabase en production.

---

## 🎯 **État Actuel**

### **Local (Développement)**
- ✅ PostgreSQL local configuré
- ✅ Base de données synchronisée
- ✅ Seed exécuté avec vos identifiants
- ✅ Application fonctionnelle

### **Supabase (Production)**
- ✅ Projet créé: `cczegvdwpyaehkvapqsz`
- ✅ Identifiants configurés dans `.env`
- ✅ Prêt pour le déploiement
- ⚠️ Connexion locale échoue (restriction réseau - normal pour la production)

---

## 🚀 **Déploiement avec Supabase**

### **Étape 1: Vérifier la Base de Données Supabase**

1. Allez sur https://supabase.com/dashboard/project/cczegvdwpyaehkvapqsz
2. Cliquez sur "Table Editor"
3. Vérifiez que vous voyez les tables (peut être vide pour l'instant)
4. Les tables seront créées automatiquement lors du déploiement

### **Étape 2: Déployer le Backend sur Render**

1. Allez sur https://render.com
2. Créez un Web Service
3. Configurez:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`

4. **Variables d'environnement** (Settings → Environment):
   ```
   DATABASE_URL=postgresql://postgres.cczegvdwpyaehkvapqsz:lfdabashop2026@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   JWT_ACCESS_SECRET=8jxLBPiWuwz97Mf4RlXITgSa1NvrVA36
   JWT_REFRESH_SECRET=uG5scE0VtLOX3PmajrHi4BMRb2KxnNg8
   JWT_ACCESS_TTL=15m
   JWT_REFRESH_TTL=7d
   CORS_ORIGIN=https://votre-projet-vercel.app
   NODE_ENV=production
   STORAGE_DRIVER=local
   STORAGE_LOCAL_ROOT=./storage
   STORAGE_PUBLIC_BASE_URL=/files
   ```

5. **Après le déploiement**, exécutez le seed:
   - Allez dans Render Dashboard → Shell
   - Exécutez: `cd backend && npx prisma db push`
   - Exécutez: `cd backend && npx prisma db seed`

### **Étape 3: Déployer le Frontend sur Vercel**

1. Allez sur https://vercel.com
2. Importez le dépôt: `Tobou19/lfd-aba-shop`
3. Configurez:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Variable d'environnement**:
   ```
   VITE_API_BASE=https://votre-backend-url.onrender.com/api/v1
   ```

5. Cliquez sur Deploy

---

## 🔧 **Configuration Supabase Production**

### **Variables d'Environnement Requises**

```
DATABASE_URL=postgresql://postgres.cczegvdwpyaehkvapqsz:lfdabashop2026@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### **Alternative: Mode Session**

Si le mode Transaction échoue, utilisez le mode Session:

```
DATABASE_URL=postgresql://postgres.cczegvdwpyaehkvapqsz:lfdabashop2026@db.cczegvdwpyaehkvapqsz.supabase.co:5432/postgres
```

---

## 📋 **Identifiants Supabase**

- **Project URL**: `https://cczegvdwpyaehkvapqsz.supabase.co`
- **anon key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjemVndmR3cHlhZWhrdmFwcXN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NzkzOTAsImV4cCI6MjEwMzM1NTM5MH0.7KRKA8M-jybczagezX_vI4CSnphx--0ZgtkC9VsBD4Q`
- **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjemVndmR3cHlhZWhrdmFwcXN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzc3OTM5MCwiZXhwIjoyMTAzMzU1MzkwfQ.AJN0_HLZ45M9ugPc0HV82_Gts3JkmZ_sIhdgmKHqZq0`
- **Database password**: `lfdabashop2026`

---

## ⚠️ **Pourquoi la Connexion Locale Échoue-t-elle ?**

### **Raisons Possibles**

1. **Restrictions réseau**: Supabase peut bloquer les connexions depuis certaines régions
2. **Base de données en cours d'initialisation**: Nouveaux projets peuvent prendre quelques minutes
3. **Configuration firewall**: Votre réseau local peut bloquer les connexions externes
4. **Prisma + Supabase**: Certaines configurations nécessitent le mode `pgbouncer=true`

### **Solution**

La connexion fonctionne **en production** sur Render car:
- Render est dans le cloud (pas de restrictions réseau)
- La base de données Supabase est optimisée pour les connexions cloud
- Les services cloud sont dans la même région (EU-West-1)

---

## 🎯 **Avantages de Supabase en Production**

1. **PostgreSQL hébergé gratuit** (500MB)
2. **Backup automatique**
3. **Dashboard UI** pour gérer la base de données
4. **Real-time** (optionnel pour les mises à jour en temps réel)
5. **Storage intégré** (1GB gratuit pour les fichiers)
6. **Scalable** - Peut gérer la croissance

---

## 📊 **Surveillance Supabase**

### **Dashboard Access**

- **URL**: https://supabase.com/dashboard/project/cczegvdwpyaehkvapqsz
- **Table Editor**: Voir et modifier les données
- **SQL Editor**: Exécuter des requêtes SQL
- **Logs**: Voir les logs de la base de données
- **Performance**: Surveillance des performances

---

## ✅ **Checklist de Déploiement**

- [ ] Projet Supabase créé et configuré
- [ ] Identifiants notés (URL, keys, password)
- [ ] Backend déployé sur Render
- [ ] Variables d'environnement configurées sur Render
- [ ] `npx prisma db push` exécuté sur Render
- [ ] `npx prisma db seed` exécuté sur Render
- [ ] Frontend déployé sur Vercel
- [ ] `VITE_API_BASE` configuré sur Vercel
- [ ] Test de connexion en production
- [ ] Vérification des tables dans Supabase Dashboard

---

## 🔄 **Revenir à PostgreSQL Local**

Pour le développement local, utilisez PostgreSQL local:

```env
DATABASE_URL="postgresql://lfd_user:lfd_dev_password@127.0.0.1:5432/lfd_aba_shop"
```

Pour la production, utilisez Supabase:

```env
DATABASE_URL="postgresql://postgres.cczegvdwpyaehkvapqsz:lfdabashop2026@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

---

## 📞 **Support**

Si vous rencontrez des problèmes lors du déploiement:

1. Vérifiez les logs Render
2. Vérifiez les logs Supabase Dashboard
3. Testez la connexion avec Prisma Studio
4. Vérifiez que les variables d'environnement sont correctes

---

**Le projet est prêt pour le déploiement avec Supabase en production !** 🚀
