# Prototype visuel

Un seul fichier HTML autonome (aucune installation requise — double-clic
pour ouvrir dans un navigateur, fonctionne entièrement hors connexion,
base de données en `localStorage`).

**`application-offline.html`** — application fonctionnelle complète :

- **Connexion** avec les 3 rôles (comptes de démonstration préchargés :
  `direction@lfd-services.com` / `yolande@lfd-services.com` /
  `caissier@lfd-services.com`, mots de passe dans `seedDatabase()`).
- **Caissier** — commandes, reçus avec signature/cachet/code-barres/QR,
  génération PDF réelle (jsPDF embarqué).
- **Gestionnaire** — commandes du centre, fidélité, catalogue, clients.
- **Direction/CMB** — tableau de bord consolidé enrichi : carte
  schématique des centres pondérée par chiffre d'affaires réel,
  répartition du CA par centre, classement des meilleurs bénéficiaires —
  calculés à partir des vraies données de l'application (`DB`), pas de
  données fictives séparées.
- Permissions, journal d'actions, notifications, paramètres — tout est
  déjà branché sur une base de données locale persistante.

Ce fichier remplace les anciennes versions séparées (maquette UI seule +
tableau de bord riche) : les deux ont été fusionnés directement dans
l'application réelle plutôt que juxtaposés.
