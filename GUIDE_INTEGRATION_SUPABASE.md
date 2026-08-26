# Guide d'Intégration Supabase

Ce guide explique comment intégrer Supabase dans LFD ABA Shop pour remplacer PostgreSQL local et le stockage de fichiers.

---

## 🎯 **Pourquoi Supabase ?**

Supabase est recommandé pour LFD ABA Shop car:

1. **PostgreSQL hébergé gratuit** (500MB) - pas besoin de configurer Railway PostgreSQL
2. **Storage intégré** pour les fichiers (reçus PDF, rapports)
3. **Real-time** pour les mises à jour en temps réel (optionnel)
4. **Authentification** (optionnel - mais votre JWT custom est déjà implémenté)
5. **Dashboard UI** pour gérer la base de données visuellement
6. **Backup automatique** et sécurisé

---

## 📦 **Intégrations Implémentées**

### ✅ **1. Base de Données PostgreSQL**
Le backend utilise Prisma qui se connecte à PostgreSQL via `DATABASE_URL`. Supabase fournit une chaîne de connexion PostgreSQL standard.

### ✅ **2. Stockage de Fichiers**
Le `StorageService` supporte maintenant Supabase Storage en plus du stockage local et S3.

---

## 🚀 **Étape 1: Créer un Projet Supabase**

1. **Allez sur** https://supabase.com
2. **Cliquez sur "Start your project"**
3. **Connectez-vous avec GitHub** (recommandé)
4. **Cliquez sur "New Project"**
5. **Remplissez les informations**:
   - **Name**: `lfd-aba-shop`
   - **Database Password**: Choisissez un mot de passe fort (notez-le !)
   - **Region**: Choisissez la région la plus proche (ex: Frankfurt pour l'Afrique)
   - **Plan**: Free (gratuit)

6. **Attendez** que le projet soit créé (environ 2 minutes)

---

## 🔑 **Étape 2: Récupérer les Identifiants**

Une fois le projet créé, allez dans:

### **Project Settings → API**

Vous aurez besoin de:
- **Project URL**: `https://[PROJECT-REF].supabase.co`
- **anon public key**: Clé publique (pour le frontend si nécessaire)
- **service_role key**: Clé administrative (pour le backend)

### **Project Settings → Database**

Vous aurez besoin de:
- **Connection string**: Format PostgreSQL pour `DATABASE_URL`

---

## 🔧 **Étape 3: Configurer le Backend**

### **Fichier: `backend/.env`**

Remplacez les valeurs par vos identifiants Supabase:

```env
# Supabase PostgreSQL Database
DATABASE_URL="postgresql://postgres:[VOTRE-MOT-DE-PASSE]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Supabase Storage (optionnel - pour les fichiers)
STORAGE_DRIVER="supabase"
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="[VOTRE-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[VOTRE-SERVICE-ROLE-KEY]"
SUPABASE_BUCKET="lfd-aba-shop"
SUPABASE_PUBLIC_BASE_URL="https://[PROJECT-REF].supabase.co/storage/v1/object/public/lfd-aba-shop"
```

### **Fichier: `backend/prisma/schema.prisma`**

Aucune modification nécessaire ! Prisma fonctionne avec Supabase comme n'importe quelle base PostgreSQL.

---

## 📦 **Étape 4: Installer les Dépendances**

```bash
cd backend
npm install @supabase/supabase-js
```

La dépendance a déjà été ajoutée à `package.json`.

---

## 🗄️ **Étape 5: Synchroniser la Base de Données**

### **Option A: Utiliser Prisma (Recommandé)**

```bash
cd backend
npx prisma db push
```

Cela créera automatiquement toutes les tables dans Supabase.

### **Option B: Exécuter le Seed**

```bash
cd backend
npx prisma db seed
```

Cela créera les tables et peuplera les données (centres, utilisateurs, produits).

---

## 📁 **Étape 6: Configurer Supabase Storage (Optionnel)**

Si vous voulez utiliser Supabase Storage pour les fichiers:

1. **Allez sur** Supabase Dashboard → Storage
2. **Cliquez sur "New bucket"**
3. **Nom du bucket**: `lfd-aba-shop`
4. **Public bucket**: Oui (pour accéder aux fichiers publiquement)
5. **Cliquez sur "Create bucket"**

6. **Dans les permissions du bucket**:
   - Activez "Public read access"
   - Configurez les règles RLS (Row Level Security) si nécessaire

---

## 🎯 **Étape 7: Tester l'Intégration**

### **Tester la Base de Données**

```bash
cd backend
npm run start:dev
```

Testez l'API:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifiant":"toboudjilayanxavier@gmail.com","motDePasse":"X@vier1st"}'
```

### **Tester le Stockage**

Si `STORAGE_DRIVER="supabase"`:
- Les fichiers générés (reçus PDF) seront stockés dans Supabase Storage
- Les URLs publiques seront: `https://[PROJECT-REF].supabase.co/storage/v1/object/public/lfd-aba-shop/...`

---

## 🌍 **Étape 8: Déploiement avec Supabase**

### **Avantages pour le Déploiement**

- ✅ **Pas besoin de Railway PostgreSQL** - Supabase remplace
- ✅ **Pas besoin de S3** - Supabase Storage remplace
- ✅ **Configuration simplifiée** - Une seule plateforme
- ✅ **Plan gratuit généreux** - 500MB DB + 1GB Storage

### **Vercel (Frontend)**

Déployez normalement sur Vercel avec:
- `VITE_API_BASE`: URL du backend (peut être Render ou Railway)

### **Render ou Railway (Backend)**

Déployez normalement avec:
- `DATABASE_URL`: Chaîne de connexion Supabase
- `STORAGE_DRIVER`: `supabase`
- Variables Supabase configurées

---

## 🔐 **Sécurité**

### **Clés Supabase**

- **Anon Key**: Pour le frontend (accès limité par RLS)
- **Service Role Key**: Pour le backend (accès administrateur complet)
- **NE JAMAIS** exposer la service_role key dans le frontend

### **Row Level Security (RLS)**

Si vous activez RLS dans Supabase:
- Configurez les politiques pour autoriser le backend
- Utilisez la service_role key pour contourner RLS

---

## 📊 **Surveillance**

### **Supabase Dashboard**

- **Logs**: Voir les requêtes SQL et erreurs
- **Performance**: Temps de réponse des requêtes
- **Storage**: Utilisation du stockage
- **Database**: Taille de la base de données

---

## 🔄 **Migration depuis PostgreSQL Local**

### **Sauvegarder les Données Locales**

```bash
cd backend
npx prisma db pull
```

### **Migrer vers Supabase**

1. Configurez `DATABASE_URL` avec Supabase
2. Exécutez:
```bash
npx prisma db push
npx prisma db seed
```

---

## 📝 **Variables d'Environnement Récapitulatives**

```env
# Base de données
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"

# Stockage (optionnel)
STORAGE_DRIVER="supabase"
SUPABASE_URL="https://[REF].supabase.co"
SUPABASE_ANON_KEY="[ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE-ROLE-KEY]"
SUPABASE_BUCKET="lfd-aba-shop"
SUPABASE_PUBLIC_BASE_URL="https://[REF].supabase.co/storage/v1/object/public/lfd-aba-shop"

# Authentification (optionnel - Supabase Auth si vous voulez remplacer JWT custom)
# SUPABASE_AUTH_ENABLED="false"  # Keep false to use your custom JWT
```

---

## 🆘 **Dépannage**

### **Erreur de connexion PostgreSQL**

- Vérifiez que `DATABASE_URL` est correcte
- Vérifiez que le mot de passe est correct
- Vérifiez que la région Supabase est accessible

### **Erreur de stockage Supabase**

- Vérifiez que le bucket existe
- Vérifiez que les permissions sont correctes
- Vérifiez que la service_role key est utilisée

### **Erreur RLS (Row Level Security)**

- Si RLS est activé, utilisez la service_role key dans le backend
- Ou configurez les politiques RLS pour autoriser les opérations nécessaires

---

## 📚 **Ressources**

- **Documentation Supabase**: https://supabase.com/docs
- **Dashboard**: https://supabase.com/dashboard
- **Prisma + Supabase**: https://www.prisma.io/docs/guides/database/supabase

---

## ✅ **Checklist d'Intégration**

- [ ] Créer un projet Supabase
- [ ] Récupérer les identifiants (URL, keys, connection string)
- [ ] Configurer `backend/.env` avec les identifiants Supabase
- [ ] Installer `@supabase/supabase-js`
- [ ] Exécuter `npx prisma db push` pour synchroniser la base de données
- [ ] Exécuter `npx prisma db seed` pour peupler les données
- [ ] (Optionnel) Créer un bucket Supabase Storage
- [ ] Tester l'API de connexion
- [ ] (Optionnel) Tester le stockage de fichiers
- [ ] Déployer le backend avec les variables Supabase

---

**L'intégration Supabase est maintenant prête !** 🚀
