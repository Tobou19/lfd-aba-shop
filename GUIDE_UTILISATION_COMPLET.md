# Guide d'Utilisation Complet LFD ABA Shop

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Installation et Configuration](#installation-et-configuration)
3. [Démarrage de l'Application](#démarrage-de-lapplication)
4. [Première Connexion](#première-connexion)
5. [Tour d'Horizon des Fonctionnalités](#tour-dhorizon-des-fonctionnalités)
6. [Utilisation Avancée](#utilisation-avancée)
7. [Mode Hors Connexion](#mode-hors-connexion)
8. [Dépannage](#dépannage)

---

## 🔧 Prérequis

### Configuration Matérielle Minimum
- **Processeur**: Intel Core i3 ou équivalent
- **RAM**: 4 Go minimum (8 Go recommandé)
- **Stockage**: 500 Mo d'espace libre
- **Écran**: 1024x768 minimum

### Logiciels Requis
- **Node.js**: v20.11.1 ou supérieur
- **PostgreSQL**: 18.2 ou supérieur
- **Git**: Pour le versionnement
- **Navigateur**: Chrome, Edge, Firefox, ou Safari (version récente)

### Accès Nécessaires
- Accès administrateur pour l'installation
- Accès internet pour la première installation
- Ports disponibles: 3000 (backend), 5432 (PostgreSQL), 5173 (frontend dev)

---

## 🚀 Installation et Configuration

### Étape 1: Cloner le Dépôt

```bash
# Ouvrir un terminal et naviguer vers le dossier souhaité
cd C:\Users\LFD SERVICE\Downloads\LFD_ABA_SHOP_MVP_Squelette

# Le projet est déjà présent dans ce dossier
cd lfd-aba-shop
```

### Étape 2: Vérifier PostgreSQL

```bash
# Vérifier que PostgreSQL est installé
psql --version

# Démarrer le service PostgreSQL si nécessaire
# Windows: Services PostgreSQL
# Commande: pg_ctl start -D "C:\Program Files\PostgreSQL\18\data"
```

### Étape 3: Configurer le Backend

```bash
# Naviguer vers le dossier backend
cd backend

# Copier le fichier d'environnement
copy .env.example .env

# Éditer le fichier .env avec vos configurations
# Ouvrir .env dans un éditeur de texte et configurer:
# DATABASE_URL="postgresql://lfd_user:lfd_dev_password@localhost:5432/lfd_aba_shop"
# JWT_ACCESS_SECRET="votre_secret_32_chars_minimum"
# JWT_REFRESH_SECRET="votre_secret_32_chars_minimum"
# CORS_ORIGIN="http://localhost:5173"
# NODE_ENV="development"
```

### Étape 4: Installer les Dépendances Backend

```bash
# Installer les dépendances
npm install

# Générer le client Prisma
npm run prisma:generate

# Migrer la base de données
npm run prisma:migrate

# Seéder la base de données (crée les données de test)
npm run db:seed
```

**Résultat attendu:**
```
✓ Base de données créée avec succès
✓ 5 centres créés
✓ 3 utilisateurs de démo créés
✓ 6 produits créés
```

### Étape 5: Configurer le Frontend

```bash
# Naviguer vers le dossier frontend
cd ../frontend

# Installer les dépendances
npm install
```

### Étape 6: Vérifier la Configuration

```bash
# Vérifier que tous les fichiers sont présents
dir src\hooks
dir src\components
dir src\styles

# Vérifier que les fichiers de configuration existent
dir vite.config.ts
dir package.json
```

---

## 🎯 Démarrage de l'Application

### Option A: Mode Développement (Recommandé pour le développement)

#### Terminal 1: Backend
```bash
# Dans le dossier backend
cd C:\Users\LFD SERVICE\Downloads\LFD_ABA_SHOP_MVP_Squelette\lfd-aba-shop\backend
npm run start:dev
```

**Résultat attendu:**
```
[Nest] 12345  - Starting application...
[InstanceLoader] AppModule dependencies initialized
[RouterExplorer] AppController {/} +9ms
Application is running on: http://localhost:3000
```

#### Terminal 2: Frontend
```bash
# Dans un nouveau terminal
cd C:\Users\LFD SERVICE\Downloads\LFD_ABA_SHOP_MVP_Squelette\lfd-aba-shop\frontend
npm run dev
```

**Résultat attendu:**
```
VITE v5.4.21  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Option B: Mode Production (Pour déploiement)

```bash
# Construire le frontend
cd frontend
npm run build

# Démarrer le preview de production
npm run preview
```

**Accès:** http://localhost:4173

---

## 🔐 Première Connexion

### Accéder à l'Application

1. **Ouvrir le navigateur**
   - Chrome: http://localhost:5173
   - Edge: http://localhost:5173
   - Firefox: http://localhost:5173

2. **Page de connexion**
   - Vous verrez le formulaire de connexion
   - Le tutorial d'onboarding apparaîtra automatiquement

### Identifiants de Démo

#### Utilisateur Direction
- **Email**: direction@lfd-services.com
- **Mot de passe**: ChangezMoiDirection123!
- **Permissions**: Accès complet, gestion utilisateurs, rapports

#### Utilisateur Gestionnaire
- **Email**: gestionnaire@lfd-services.com
- **Mot de passe**: ChangezMoiGestion123!
- **Permissions**: Gestion stocks, clients, commandes

#### Utilisateur Caissier
- **Email**: caissier@lfd-services.com
- **Mot de passe**: ChangezMoiCaisse123!
- **Permissions**: Traitement commandes, paiements

### Premier Connexion

1. **Saisir l'email** (direction@lfd-services.com)
2. **Saisir le mot de passe** (ChangezMoiDirection123!)
3. **Cliquer sur "Se connecter"**

**Résultat attendu:**
- Tutorial d'onboarding apparaît (6 étapes)
- Suivre les instructions du tutorial
- Après le tutorial, vous arrivez sur le tableau de bord

---

## 🎓 Tour d'Horizon des Fonctionnalités

### 1. Tableau de Bord Principal

#### Indicateurs Visuels
- **🟢 En ligne**: Connexion internet active
- **🟠 Hors ligne**: Mode cache activé
- **⚡ Bouton Rapide**: Accès aux tâches courantes
- **⭐ Compteur Favoris**: Nombre d'éléments favoris
- **🔔 Compteur Notifications**: Notifications non lues
- **📋 Synchronisation**: Éléments à synchroniser

#### Sections du Tableau de Bord
- **💡 Astuces rapides**: Raccourcis et conseils
- **⚙️ Préférences**: Paramètres utilisateur
- **📊 Statistiques**: Utilisation de l'application

### 2. Mode Sombre/Clair Automatique

#### Comportement
- **Auto**: Change selon l'heure (6h-18h = clair, sinon sombre)
- **Clair**: Thème clair permanent
- **Sombre**: Thème sombre permanent

#### Utilisation
- Cliquer sur le bouton thème dans l'en-tête
- Cycle: Auto → Clair → Sombre → Auto
- Le thème est sauvegardé automatiquement

### 3. Raccourcis Clavier

#### Raccourcis Principaux
- **Ctrl+K**: Recherche globale
- **Ctrl+L**: Changer de thème
- **Ctrl+Q**: Mode rapide
- **Escape**: Fermer les modals

#### Voir Tous les Raccourcis
- Cliquer sur le bouton "⌨️ Raccourcis"
- Modal affiche tous les raccourcis disponibles

### 4. Recherche Globale

#### Activation
- Appuyer sur **Ctrl+K**
- Ou cliquer sur la barre de recherche

#### Recherche
- Tapez votre recherche
- Résultats pour: Produits, Clients, Centres
- Navigation avec flèches ou souris
- Entrée pour sélectionner

### 5. Mode Rapide (Quick Mode)

#### Activation
- Appuyer sur **Ctrl+Q**
- Ou cliquer sur le bouton "⚡ Rapide"

#### Actions Disponibles
- **📋 Nouvelle Commande**: Créer une commande
- **👤 Nouveau Client**: Ajouter un client
- **📱 Scan QR Code**: Scanner un code QR
- **📅 Commandes du Jour**: Voir les commandes du jour
- **💳 Paiement Rapide**: Traiter un paiement
- **📦 Vérifier Stock**: Consulter le stock

#### Utilisation
- Tapez pour rechercher une action
- Cliquez sur l'action souhaitée
- Escape pour fermer

### 6. Système de Favoris

#### Ajouter aux Favoris
- Cliquer sur le bouton étoile (☆) près d'un élément
- L'étoile devient pleine (⭐)
- L'élément est ajouté aux favoris

#### Retirer des Favoris
- Cliquer sur l'étoile pleine (⭐)
- L'étoile devient vide (☆)
- L'élément est retiré des favoris

#### Voir les Favoris
- Le compteur dans l'en-tête montre le nombre
- Favoris par type: produits, clients, centres

### 7. Historique des Actions

#### Tracking Automatique
- Toutes les actions sont enregistrées
- Maximum 20 actions récentes
- Déduplication automatique

#### Types d'Actions
- **order**: Création de commandes
- **customer**: Création de clients
- **search**: Recherches effectuées
- **view**: Pages visitées

### 8. Templates de Commandes

#### Templates Prédéfinis
- **Repas Hebdomadaires**: Pack repas pour 7 jours
- **Repas Mensuels**: Pack repas pour 30 jours

#### Utilisation
- Sélectionner un template
- Les produits sont automatiquement ajoutés
- Modifier les quantités si nécessaire

#### Créer un Template Personnalisé
- Créer une commande
- Sauvegarder comme template
- Réutiliser pour les commandes futures

### 9. Calculatrice Intégrée

#### Activation
- Accessible depuis le tableau de bord
- Ou via un raccourci futur

#### Fonctions
- **Opérations de base**: +, -, ×, ÷
- **Pourcentage**: Calculer des pourcentages
- **Backspace**: Corriger les erreurs
- **Clear**: Effacer tout

#### Utilisation
- Cliquer sur les boutons
- Utiliser le clavier numérique
- Résultat affiché en temps réel

### 10. Notifications Locales

#### Types de Notifications
- **info**: Informations générales
- **success**: Opérations réussies
- **warning**: Avertissements
- **error**: Erreurs

#### Comportement
- Notifications push si autorisé
- Compteur de non-lus visible
- Marquer comme lu individuellement
- Marquer tout comme lu

#### Autoriser les Notifications
- Au premier lancement, accepter les notifications
- Ou via les paramètres du navigateur

### 11. Notes Rapides

#### Créer une Note
- Cliquer sur "Nouvelle Note"
- Saisir le contenu
- Choisir une couleur
- Sauvegarder

#### Gérer les Notes
- **Éditer**: Modifier le contenu
- **Supprimer**: Retirer la note
- **Rechercher**: Trouver une note
- **Couleur**: Changer la couleur

#### Utilisation
- Notes pour les rappels
- Notes pour les informations importantes
- Synchronisées automatiquement

### 12. Multi-Session

#### Comportement
- Supporte plusieurs appareils
- Chaque appareil a un ID unique
- Sessions actives suivies (30 min)

#### Gestion
- Maximum 5 sessions par utilisateur
- Sessions inactives automatiquement supprimées
- Tracking d'activité pour sécurité

---

## 📱 Mode Hors Connexion

### Activation Automatique

Le mode hors connexion s'active automatiquement lorsque:
- La connexion internet est perdue
- Le serveur backend est inaccessible
- L'utilisateur est en mode avion

### Fonctionnalités Hors Connexion

#### Données Accessibles
- **Produits en cache**: Consultation possible
- **Centres en cache**: Informations disponibles
- **Clients locaux**: Données récentes
- **Historique**: Actions récentes

#### Opérations Possibles
- **Créer des commandes**: Mises en file d'attente
- **Créer des clients**: Mises en file d'attente
- **Rechercher**: Dans les données locales
- **Favoris**: Accès aux favoris

#### Synchronisation
- **Automatique**: À la reconnexion
- **Manuelle**: Via le bouton synchroniser
- **Priorité**: Clients d'abord, puis commandes
- **Indicateur**: Compteur d'éléments à synchroniser

### Tester le Mode Hors Connexion

1. **Ouvrir l'application**
2. **Se connecter** avec vos identifiants
3. **Désactiver internet** (mode avion ou débrancher)
4. **Vérifier**: L'indicateur passe à 🟠
5. **Naviguer**: Les données sont toujours accessibles
6. **Réactiver internet**
7. **Vérifier**: Synchronisation automatique

---

## ⚡ Utilisation Avancée

### Workflow Typique: Traitement d'une Commande

#### Étape 1: Recherche de Client
1. **Ctrl+K** pour la recherche globale
2. Taper le nom du client
3. Sélectionner le client
4. Si le client n'existe pas: **Ctrl+Q** → "Nouveau Client"

#### Étape 2: Sélection des Produits
1. Utiliser un template si applicable
2. Ou ajouter des produits manuellement
3. Ajouter aux favoris les produits fréquents

#### Étape 3: Calcul des Montants
1. Utiliser la calculatrice intégrée
2. Vérifier les totaux
3. Appliquer les remises si applicables

#### Étape 4: Paiement
1. **Ctrl+Q** → "Paiement Rapide"
2. Sélectionner le mode de paiement
3. Traiter le paiement
4. Émettre le reçu

#### Étape 5: Synchronisation
1. Vérifier le compteur de synchronisation
2. Attendre la synchronisation automatique
3. Confirmer que la commande est synchronisée

### Gestion des Stocks

#### Vérifier le Stock
1. **Ctrl+Q** → "Vérifier Stock"
2. Consulter les niveaux de stock
3. Identifier les produits en rupture

#### Réapprovisionnement
1. Créer une note pour les produits à commander
2. Utiliser les templates pour les commandes fréquentes
3. Configurer des alertes de stock bas

### Rapports et Statistiques

#### Voir les Statistiques
1. Accéder au tableau de bord
2. Consulter la section "📊 Statistiques"
3. Voir les métriques d'utilisation

#### Exporter des Données
1. Sélectionner la période
2. Choisir le format (PDF, Excel)
3. Télécharger le rapport

---

## 🔧 Dépannage

### Problèmes Courants

#### Backend ne démarre pas
**Symptôme**: Erreur de connexion à la base de données

**Solution**:
```bash
# Vérifier PostgreSQL
psql -U lfd_user -d lfd_aba_shop

# Si erreur, recréer la base
npm run prisma:migrate
npm run db:seed
```

#### Frontend ne se charge pas
**Symptôme**: Page blanche ou erreur 404

**Solution**:
```bash
# Réinstaller les dépendances
cd frontend
rm -rf node_modules
npm install

# Nettoyer le cache
npm run build
```

#### Mode hors connexion ne fonctionne pas
**Symptôme**: Erreur de service worker

**Solution**:
1. Vider le cache du navigateur
2. Réinstaller l'application PWA
3. Vérifier les permissions du navigateur

#### Synchronisation échoue
**Symptôme**: Compteur ne diminue pas

**Solution**:
1. Vérifier la connexion internet
2. Vérifier que le backend est accessible
3. Vider la file d'attente et recommencer

### Nettoyage Complet

#### Réinitialiser l'Application
```bash
# Nettoyer le frontend
cd frontend
rm -rf node_modules dist
npm install

# Nettoyer le backend
cd ../backend
rm -rf node_modules
npm install

# Réinitialiser la base de données
npm run prisma:migrate reset
npm run db:seed
```

#### Nettoyer le Cache Local
1. Ouvrir les DevTools du navigateur (F12)
2. Aller à "Application" → "Storage"
3. Cliquez sur "Clear site data"
4. Rafraîchir la page

### Obtenir de l'Aide

#### Logs Backend
```bash
cd backend
npm run start:dev 2>&1 | tee logs/backend.log
```

#### Logs Frontend
1. Ouvrir les DevTools (F12)
2. Aller à "Console"
3. Chercher les erreurs rouges

#### Support
- Email: support@lfd-services.com
- Documentation: README.md
- Guides: USER_GUIDE.md, DEPLOYMENT_GUIDE.md

---

## 📚 Ressources Additionnelles

### Documentation Technique
- **README.md**: Vue d'ensemble du projet
- **DEPLOYMENT_GUIDE.md**: Guide de déploiement
- **USER_GUIDE.md**: Guide utilisateur simplifié
- **SECURITY.md**: Considérations de sécurité

### Dépôt GitHub
- **URL**: https://github.com/Tobou19/lfd-aba-shop
- **Issues**: Signaler des bugs
- **Releases**: Voir les mises à jour

### API Documentation
- **Swagger**: http://localhost:3000/api
- **Endpoints**: /api/v1/*
- **Authentification**: JWT tokens

---

## ✅ Checklist de Démarrage

### Avant de Commencer
- [ ] PostgreSQL installé et démarré
- [ ] Node.js installé (v20+)
- [ ] Git installé
- [ ] Ports 3000, 5432, 5173 disponibles

### Installation
- [ ] Dépôt cloné ou téléchargé
- [ ] Backend configuré (.env créé)
- [ ] Backend dépendances installées
- [ ] Base de données migrée
- [ ] Base de données seedée
- [ ] Frontend dépendances installées

### Premier Lancement
- [ ] Backend démarré (port 3000)
- [ ] Frontend démarré (port 5173)
- [ ] Navigateur ouvert sur localhost:5173
- [ ] Premier connexion réussie
- [ ] Tutorial d'onboarding complété

### Vérification
- [ ] Mode sombre/clair fonctionne
- [ ] Raccourcis clavier opérationnels
- [ ] Recherche globale fonctionne
- [ ] Mode rapide accessible
- [ ] Favoris opérationnels
- [ ] Notifications reçues
- [ ] Mode hors connexion testé

---

## 🎯 Prochaines Étapes

### Pour les Développeurs
1. Explorer la structure du code
2. Comprendre l'architecture PWA
3. Ajouter de nouvelles fonctionnalités
4. Contribuer au dépôt GitHub

### Pour les Utilisateurs
1. Explorer toutes les fonctionnalités
2. Personnaliser les préférences
3. Créer des templates personnalisés
4. Utiliser les raccourcis clavier

### Pour les Administrateurs
1. Configurer les utilisateurs
2. Gérer les centres
3. Surveiller les statistiques
4. Planifier les mises à jour

---

**Félicitations ! Vous êtes maintenant prêt à utiliser LFD ABA Shop !** 🎉

Pour toute question ou problème, consultez la documentation ou contactez le support technique.