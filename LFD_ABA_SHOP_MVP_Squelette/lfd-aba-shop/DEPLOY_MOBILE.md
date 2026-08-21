# Exécution sur Android et sur iPhone

L'application est conçue comme une PWA (Progressive Web App), conformément
au cahier des charges (§6.1) : c'est une seule application web, servie par
une seule URL HTTPS, qui s'installe sur le téléphone sans passer par le
Play Store ni l'App Store. C'est le chemin le plus rapide et le moins
coûteux pour équiper les centres.

## Android (Chrome)

1. Ouvrir l'URL de l'application dans Chrome (ex. `https://app.lfd-services.com`).
2. Chrome propose automatiquement une bannière « Ajouter à l'écran d'accueil »
   (ou : menu ⋮ → « Installer l'application »).
3. Une icône ABA SHOP apparaît sur l'écran d'accueil, comme une application
   native : plein écran, sans barre d'adresse, avec l'icône et le nom
   définis dans `manifest.webmanifest`.
4. Les écrans déjà consultés restent accessibles en cas de coupure réseau
   courte (mise en cache par le service worker).

## iPhone (Safari — obligatoire, Chrome iOS ne le permet pas)

1. Ouvrir l'URL dans Safari (pas dans Chrome, à cause d'une restriction
   d'Apple sur iOS).
2. Toucher l'icône de partage (le carré avec la flèche vers le haut).
3. Choisir « Sur l'écran d'accueil ».
4. Confirmer le nom (« ABA SHOP ») et valider.
5. L'icône apparaît sur l'écran d'accueil et s'ouvre en plein écran, sans
   interface Safari visible.

## Ce que cela permet, et ce que cela ne permet pas

- Fonctionne : icône sur l'écran d'accueil, plein écran, fonctionnement
  hors-ligne partiel, mêmes fonctionnalités que sur ordinateur.
- Ne permet pas nativement : notifications push sur iPhone (limitation
  Apple, partiellement levée depuis iOS 16.4 mais avec des contraintes),
  accès à certains capteurs matériels avancés.

## Si une présence sur le Play Store / App Store devient nécessaire (V2)

Le cahier des charges prévoit cette option en lot V2 (§11 : « Application
mobile native, si le besoin se confirme »). Deux chemins possibles, sans
réécrire l'application :

- **TWA (Trusted Web Activity)** pour Android : empaquette la PWA existante
  pour publication sur le Play Store, quasiment sans code supplémentaire.
- **Capacitor** (Ionic) pour Android et iPhone : enveloppe la même
  application React dans un conteneur natif, ajoute l'accès aux
  notifications push natives et aux capteurs, publication sur les deux
  stores.

Aucun des deux ne nécessite de refaire le backend ni les écrans : ils
empaquettent la PWA déjà construite.
