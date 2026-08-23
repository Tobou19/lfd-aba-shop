# LFD-Services · ABA SHOP — Squelette du lot MVP

Ce dépôt traduit en code de départ le Document de Conception Technique
(architecture, modèle de données, API, sécurité). Il n'est pas un produit
fini : c'est une ossature à étendre module par module par l'équipe de
développement, en suivant le même pattern que les modules `orders`,
`loyalty` et `receipts` déjà implémentés.

## Structure

```
backend/    NestJS + Prisma + PostgreSQL — API REST versionnée (/api/v1)
frontend/   React + Vite + PWA — installable sur Android et iPhone sans store
```

## 🚀 Nouveautés PWA & Mode Hors Connexion

L'application est maintenant configurée comme **Progressive Web App (PWA)** avec support complet du mode hors connexion et de nombreuses améliorations UX gratuites :

### ✨ Fonctionnalités PWA
- **Installation**: Installable sur mobile (Android/iOS) et desktop
- **Mode hors connexion**: Fonctionnement complet sans connexion internet
- **Cache automatique**: Données mises en cache intelligemment
- **Synchronisation**: Données synchronisées automatiquement lors de la reconnexion
- **Performance**: Temps de chargement optimisé avec cache agressif
- **Bannière de statut**: Indicateur visuel de l'état de connexion

### 🎯 Nouvelles Fonctionnalités UX (Gratuites)
- **Mode sombre/clair automatique**: Change selon l'heure système (6h-18h = clair)
- **Raccourcis clavier**: Ctrl+K (recherche), Ctrl+L (thème), Ctrl+Q (mode rapide), Escape (fermer)
- **Recherche globale**: Ctrl+K pour rechercher produits, clients, centres
- **Tooltips contextuels**: Aide intégrée pour chaque élément
- **Tutorial d'onboarding**: Guide interactif au premier lancement
- **Statistiques d'utilisation**: Tracking local des appels au système
- **Responsive mobile**: Interface optimisée pour smartphones/tablettes
- **Préférences utilisateur**: Personnalisation de l'expérience

### ⚡ Nouvelles Fonctionnalités Productivité (Gratuites)
- **Système de favoris**: Marquer produits, clients et centres comme favoris avec bouton étoile
- **Historique des actions récentes**: Tracking automatique des dernières actions avec déduplication
- **Templates de commandes**: Modèles prédéfinis pour commandes fréquentes (repas hebdomadaires/mensuels)
- **Calculatrice intégrée**: Calculatrice complète avec pourcentage, backspace et opérations de base
- **Mode rapide**: Ctrl+Q pour accéder rapidement aux tâches courantes avec recherche
- **Notifications locales**: Système de notifications avec support navigateur et compteur non-lus
- **Notes rapides**: Système de notes colorées avec recherche et édition
- **Multi-session**: Support de sessions multiples avec tracking par appareil

### 📱 Mode Hors Connexion
- **Cache API**: 5 minutes pour les requêtes API
- **Cache images**: 30 jours
- **Cache polices**: 1 an
- **Cache ressources statiques**: 24h
- **Données essentielles**: Centres (7 jours), Produits (24h)
- **Synchronisation automatique**: Clients et commandes mis en file d'attente

### 🎯 Utilisation
- Consultez `USER_GUIDE.md` pour le guide d'utilisation complet
- Consultez `DEPLOYMENT_GUIDE.md` pour le guide de déploiement
- L'application fonctionne sur: http://localhost:5173 (dev) ou http://localhost:4173 (build)

## Démarrage rapide

### Backend

```
cd backend
cp .env.example .env        # renseigner DATABASE_URL et les secrets JWT
npm install
npm run prisma:generate
npm run prisma:migrate
npm run db:seed             # crée les 5 centres, un compte par rôle, et un petit catalogue
npm run start:dev
```

Le seed affiche à la fin les identifiants de démonstration créés
(Direction / Gestionnaire / Caissier) — **à changer immédiatement** si ce
script tourne sur un environnement autre que local/test. Il est
idempotent : le relancer ne duplique rien, il met simplement à jour les
enregistrements existants.

### Frontend

```
cd frontend
npm install
npm run dev
```

Pour tester le build PWA :
```
npm run build
npm run preview
```

## Modules implémentés (les dix du périmètre MVP + extensions V1/V2)

- `auth` — connexion, hachage bcrypt, JWT access/refresh, blocage après échecs, journal de connexion.
- `users` — création/désactivation de comptes, rattachement centres, réinitialisation de mot de passe ; réservé à la Direction/CMB.
- `centers` — fiche centre, activation/désactivation, lecture ouverte aux trois rôles.
- `catalog` — produits, prix, bascule de disponibilité qui déclenche une vraie notification de rupture ; écriture réservée Direction/Gestionnaire. Chaque produit porte un `type` (`NOURRITURE` ou `STANDARD`, voir la règle métier ci-dessous).
- `customers` — recherche/filtre, fiche bénéficiaire, historique et montant total dépensé calculés à la volée.
- `orders` — **deux logiques de commande distinctes selon le type de produit** (voir « Règle métier : repas vs autres produits » plus bas).
- `loyalty` — détection des 8 semaines consécutives (= 2 mois) de repas, octroi anti-doublon, déclenche une notification quand une semaine gratuite devient due. **Alimentée uniquement par les commandes de repas**, jamais par les autres produits de la boutique.
- `receipts` — **génération réelle** du reçu en PDF et PNG (Puppeteer), avec code-barres et QR code générés (bwip-js) et déposés en stockage.
- `payments` — enregistrement des paiements manuels **et** intégration mobile money fonctionnelle (voir ci-dessous).
- `notifications` — alertes fidélité/rupture de stock, rapport hebdomadaire ; consommées par `catalog` et `loyalty`.
- `reporting` — tableau de bord par centre et vue consolidée, **export réel** en PDF (Puppeteer) et Excel (exceljs), déposé en stockage.

Tous suivent le même triptyque `*.controller.ts` / `*.service.ts` / `*.module.ts`,
protégé par `JwtAuthGuard`, `RolesGuard`, et `CenterScopeGuard` quand la
donnée est rattachée à un centre.

## Deux façons de commander — règle métier centrale

Le catalogue distingue deux types de produits (`Produit.type`), qui
déterminent automatiquement le comportement de la commande créée
(`Commande.typeCommande`) :

| | `NOURRITURE` → commande `PERIODE` | `STANDARD` → commande `STANDARD` |
|---|---|---|
| Concerne | Repas thérapeutiques | Tous les autres produits de la boutique ABA SHOP |
| Facturation | Par période choisie librement : un jour (un ou plusieurs plats), une semaine, un mois, plusieurs mois, une année | Prix × quantité, en une seule fois — commande classique |
| Suivi | Progression jour par jour (`joursServis` / `entierementServi`), barre rouge → jaune → vert | Livraison directe en une fois (`PATCH /orders/:id/deliver`) |
| Fidélité | Oui — alimente `SuiviFidelite` | Non, jamais |

Une commande ne peut pas mélanger les deux types de produits (rejetée
avec une erreur explicite) — c'est ce qui permet à `OrdersService` de
choisir sans ambiguïté la bonne formule de calcul et le bon mode de
suivi. Voir `OrdersService.create` pour le détail de la logique.

**Fidélité (8 semaines = 2 mois de consommation successives)** :
`LoyaltyService.traiterConsommationHebdomadaire(semaineIso)` est le point
d'entrée destiné à un job planifié hebdomadaire (non branché dans ce
squelette — à connecter via `@nestjs/schedule`). Il n'interroge que les
commandes `PERIODE` payées : une commande `STANDARD`, quel que soit son
montant, n'a jamais d'effet sur la série de semaines consécutives d'un
client.

## Règle métier : repas vs autres produits

Clarification importante de LFD-Services, appliquée dans tout le module
`orders` : **seuls les repas thérapeutiques se facturent par période**,
tous les autres produits de la boutique ABA SHOP se commandent
normalement.

- **Produits `NOURRITURE`** (repas thérapeutiques) → commande de type
  `PERIODE` : le client paie pour une durée choisie — un jour (1 ou
  plusieurs plats), une semaine, un mois, ou plusieurs mois/années — sans
  limite technique sur la durée. Le montant est `prix × quantité × nombre
  de jours`. Chaque commande alimente le suivi de fidélité : **une
  semaine gratuite après 8 semaines consécutives de consommation payée
  (= 2 mois)**. Suivi de progression jour par jour via
  `PATCH /orders/:id/progress`.

- **Tous les autres produits** (type `STANDARD`) → commande de type
  `STANDARD` : achat simple, livré en une fois, montant = `prix ×
  quantité`, **aucune notion de période ni de fidélité**. Marquée livrée
  via `PATCH /orders/:id/deliver`.

- Une même commande ne peut pas mélanger les deux types de produits —
  `OrdersService.create` le refuse explicitement (400) pour éviter de
  faire cohabiter deux logiques de calcul incompatibles sur un seul
  objet. Le frontend doit créer deux commandes séparées si le
  bénéficiaire prend à la fois des repas et un autre article.

Exemple — commande de repas sur une semaine :
```json
POST /api/v1/orders
{
  "clientId": "…", "centreId": "…", "lieuLivraison": "Bonamoussadi",
  "dateDebut": "2026-08-24", "dateFin": "2026-08-30",
  "sousTraitement": false, "modePaiement": "ESPECES",
  "lignes": [{ "produitId": "moringa-500g", "quantite": 1 }]
}
```

Exemple — achat d'un autre produit ABA SHOP (pas de dates) :
```json
POST /api/v1/orders
{
  "clientId": "…", "centreId": "…", "lieuLivraison": "Retrait au centre",
  "sousTraitement": false, "modePaiement": "MTN_MOMO",
  "lignes": [{ "produitId": "huile-massage-therapeutique", "quantite": 2 }]
}
```

## Génération de fichiers (reçus, rapports)

- `src/pdf/pdf-renderer.service.ts` — encapsule Puppeteer (HTML → PDF et
  HTML → PNG), un seul navigateur réutilisé entre les rendus.
- `src/storage/storage.service.ts` — abstraction de stockage, pilote
  `local` (dossier disque, par défaut) ou `s3` (compatible tout
  fournisseur S3), sélectionné par `STORAGE_DRIVER`.
- `src/receipts/templates/receipt.template.ts` — gabarit HTML du reçu,
  code-barres Code128 et QR code générés par `bwip-js` (pas de dépendance
  navigateur ni de service tiers).
- `src/reporting/templates/report.template.ts` — gabarit HTML du rapport
  PDF ; l'export Excel est produit directement par `exceljs`.

En développement, les fichiers atterrissent dans `backend/storage/` et
sont servis via `STORAGE_PUBLIC_BASE_URL` (à brancher sur un serveur de
fichiers statique ou le reverse proxy). Puppeteer télécharge son propre
Chromium à l'installation (`npm install`) — sur un environnement CI/serveur
minimal, prévoir les paquets système listés dans la documentation
Puppeteer (`libnss3`, `libatk-bridge2.0-0`, etc.) ou utiliser l'image
Docker officielle `puppeteer` comme base.

## Paiement mobile money (lot V2)

- `src/payments/providers/mtn-momo.provider.ts` — implémente le flux réel
  MTN MoMo Collections : jeton OAuth (`/collection/token/`), demande de
  paiement (`/collection/v1_0/requesttopay`) identifiée par un
  `X-Reference-Id` unique, et consultation de statut.
- `src/payments/providers/orange-money.provider.ts` — implémente le flux
  réel Orange Money Web Payment : jeton OAuth (`/oauth/v3/token`), création
  de session (`/orange-money-webpay/{pays}/v1/webpayment`) renvoyant une
  URL de paiement à ouvrir côté client.
- `POST /payments/mobile-money/initiate` — point d'entrée unique pour les
  deux opérateurs (`operateur: 'MTN_MOMO' | 'ORANGE_MONEY'`).
- `POST /payments/mobile-money/webhook` — reçoit la confirmation de
  l'opérateur, vérifiée par un secret partagé (`MOBILE_MONEY_WEBHOOK_SECRET`,
  en-tête `X-Webhook-Secret`), et traitée de façon **idempotente** via le
  modèle `TentativePaiementMobile` (une confirmation reçue deux fois ne
  déclenche l'effet qu'une seule fois).

Ces intégrations nécessitent de vrais identifiants opérateur (sandbox ou
production) pour fonctionner de bout en bout — voir `.env.example` pour
la liste complète des variables à renseigner.

## Tests

```
cd backend
npm test              # tests unitaires — 10 modules couverts
npm run test:e2e      # flux d'authentification de bout en bout, contre une vraie base PostgreSQL
```

Modules couverts par des tests unitaires : `auth`, `orders`, `loyalty`,
`users`, `centers`, `catalog`, `customers`, `payments`, `notifications`,
`reporting`. Chaque suite cible la ou les règles de gestion les plus
sensibles du module plutôt qu'une couverture superficielle de chaque
ligne — ex. idempotence du webhook mobile money, non-exposition du hash
de mot de passe, calcul du chiffre d'affaires limité aux commandes
payées.

Le test e2e démarre une vraie application NestJS contre PostgreSQL
(le service `postgres` du docker-compose ou du workflow CI), crée un
utilisateur de test, et vérifie tout le cycle : refus sans jeton, refus
avec un mauvais mot de passe, émission d'un jeton valide, accès à une
route protégée avec ce jeton.

## Qualité de code

`npm run lint` applique une configuration ESLint réelle (backend et
frontend) — la CI échoue désormais si le lint échoue, sans tolérance.

## Infrastructure

- `backend/Dockerfile`, `frontend/Dockerfile` — builds multi-étapes,
  utilisateur non-root, image d'exécution minimale. `backend/Dockerfile`
  installe Chromium système pour Puppeteer (génération PDF/PNG des reçus
  et rapports), plutôt que de laisser Puppeteer télécharger son propre
  navigateur.
- `docker-compose.yml` — environnement de **développement** (PostgreSQL +
  backend + frontend, rechargement à chaud).
- `docker-compose.prod.yml` — déploiement de **production complet et
  gratuit** : PostgreSQL + backend + frontend + Caddy (reverse proxy avec
  HTTPS automatique via Let's Encrypt, gratuit), stockage des fichiers sur
  disque local partagé. Voir `.env.prod.example` pour les variables à
  renseigner.
- `Caddyfile` — configuration du reverse proxy : HTTPS automatique, routage
  `/api` vers le backend et `/files` vers les fichiers générés (reçus,
  rapports), en-têtes de sécurité (`noindex`, `X-Frame-Options`).
- `.github/workflows/ci.yml` — lint/build/tests à chaque pull request,
  puis build et publication des images Docker sur `main`.

```
docker compose up                                              # dev : postgres + backend + frontend
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build   # production
docker compose -f docker-compose.prod.yml exec backend npm run db:seed         # amorçage (une fois la base migrée)
```

Voir `FREE_DEPLOYMENT.md` pour des alternatives gratuites à chaque poste
qui a normalement un coût (hébergement, nom de domaine, stockage,
paiement mobile money), `SECURITY.md` pour la restriction d'accès,
`DEPLOY_MOBILE.md` pour l'installation Android / iPhone, et
`prototypes/application-offline.html` pour l'application fonctionnelle
complète des trois rôles (fichier unique, base de données locale
persistante, à ouvrir directement dans un navigateur).

## 📚 Documentation Additionnelle

- `USER_GUIDE.md` - Guide d'utilisation complet pour les utilisateurs finaux
- `DEPLOYMENT_GUIDE.md` - Guide de déploiement pour les développeurs
- Guide PWA dans ce README pour les fonctionnalités hors connexion
- Guide UX dans ce README pour les nouvelles fonctionnalités gratuites
