# Restreindre l'accès à des personnes tierces

L'application n'a pas vocation à être un site public : c'est un outil
interne aux centres LFD-Services. La défense se construit sur plusieurs
niveaux indépendants, pour qu'une seule faille ne suffise pas à entrer.

## 1. Pas d'inscription publique — comptes créés uniquement par la Direction

Il n'existe aucune page « créer un compte » exposée publiquement.
Seule la Direction/CMB (via le module `users`, protégé par
`@Roles('DIRECTION')`) peut créer un utilisateur. Une personne extérieure
ne peut donc pas simplement s'inscrire, même si elle trouve l'URL de
l'application.

## 2. Authentification forte dès la connexion

- Mots de passe hachés (bcrypt), jamais stockés ni transmis en clair.
- Blocage automatique du compte après 5 échecs de connexion (15 minutes),
  déjà implémenté dans `auth.service.ts`.
- Limite de débit sur `/auth/login` (10 tentatives/minute/IP) pour freiner
  une attaque automatisée, indépendamment du blocage par compte.
- Jetons JWT de courte durée (15 minutes) ; toute session inactive expire
  et redemande une connexion.

## 3. Cloisonnement strict par rôle et par centre

`RolesGuard` + `CenterScopeGuard` (déjà implémentés) empêchent un compte
Caissier ou Gestionnaire d'atteindre les données d'un autre centre, même
en modifiant un identifiant dans l'URL — la vérification se fait côté
serveur à chaque requête, jamais seulement dans l'interface.

## 4. Restriction au niveau réseau (indépendante du code applicatif)

Plusieurs mesures s'ajoutent en complément, à activer selon le niveau de
sensibilité souhaité :

- **HTTPS obligatoire partout**, avec redirection forcée et HSTS — un
  identifiant intercepté en clair sur un réseau public devient inutilisable.
- **Restriction par adresse IP ou VPN** pour les routes d'administration
  (`/api/v1/users`, exports consolidés) : accessibles uniquement depuis les
  réseaux des centres ou un VPN d'entreprise, configurable au niveau du
  reverse proxy (nginx, Cloudflare Access, etc.) sans toucher au code.
- **Authentification à deux facteurs (2FA)** pour les comptes Direction —
  extension naturelle du module `auth`, recommandée avant le lot V2 vu le
  niveau d'accès de ce rôle.
- **Non-indexation du site** : balise `noindex` + fichier `robots.txt`
  interdisant tout moteur de recherche, pour que l'URL ne remonte jamais
  dans une recherche publique — une PWA n'a pas de fiche sur un store, donc
  sa seule porte d'entrée est l'URL elle-même.

## 5. Traçabilité

`JournalConnexion` et `JournalAction` (déjà dans le schéma Prisma)
enregistrent qui s'est connecté, quand, depuis quelle IP, et qui a réalisé
une action sensible (octroi de fidélité, annulation de commande,
modification de prix). En cas de doute sur un accès, l'historique complet
est consultable par la Direction.

## 6. Sauvegardes et reprise

Sauvegardes automatiques quotidiennes de la base de données (§6.3 du
cahier des charges), avec accès en lecture strictement réservé à l'équipe
d'exploitation — une sauvegarde mal protégée est aussi une fuite de
données potentielle.

## Ce qui ne protège pas, à éviter

- Compter sur le simple fait que l'URL de la PWA n'est « pas connue » :
  ce n'est pas une protection, seulement un délai. L'authentification et
  le cloisonnement par rôle restent la vraie barrière.
- Stocker le jeton d'accès dans `localStorage` côté frontend : une faille
  XSS pourrait alors le voler. Le squelette fourni garde le jeton d'accès
  en mémoire JavaScript uniquement, et prévoit un refresh token en cookie
  `httpOnly` côté serveur (non lisible par du JavaScript).
