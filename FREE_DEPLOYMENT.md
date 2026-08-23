# Faire tourner l'application sans aucun coût récurrent

Ce document répond point par point aux quatre postes qui, en usage
courant, ont un coût réel : l'hébergement, le nom de domaine, le
stockage des fichiers, et le paiement mobile money. Pour chacun, une
option à 0 FCFA/0 € existe et fonctionne avec le squelette déjà fourni,
sans changer une ligne de code métier.

**Point d'honnêteté à garder en tête** : « gratuit » veut parfois dire
« gratuit dans certaines limites » (quota, performance réduite, ou offre
qui peut changer dans le temps chez le fournisseur). Ce n'est pas une
combine, c'est la réalité de toute offre gratuite — je le signale à
chaque option pour que vous décidiez en connaissance de cause.

## 1. Hébergement — remplacer un VPS payant

### Option recommandée : Oracle Cloud « Always Free »
Contrairement aux essais gratuits de 12 mois d'AWS ou Google Cloud,
l'offre « Always Free » d'Oracle Cloud est gratuite **sans limite de
durée** : jusqu'à 4 cœurs ARM (Ampere) et 24 Go de RAM à vie, largement
suffisant pour PostgreSQL + backend + frontend pour 5 centres à volume
modéré. Contrepartie réelle : la création du compte demande une carte
bancaire pour vérification (aucun débit sur l'offre Always Free), et la
disponibilité des instances ARM gratuites varie selon la région/le
moment de la création.

### Option alternative : matériel déjà possédé par LFD-Services
Un ordinateur existant dans un des centres (ex. celui qui faisait
tourner le classeur Excel) peut héberger l'application avec Docker,
sans coût d'hébergement du tout — seule la connexion internet du centre
est utilisée. Moins robuste qu'un vrai serveur cloud (coupure de courant
= application indisponible), mais à coût strictement nul.

### Option d'appoint : offres gratuites des plateformes (Fly.io, Render)
Utile pour un environnement de **test/démonstration**, moins pour la
production : ces plateformes limitent la RAM/le CPU disponibles
gratuitement et peuvent mettre l'application en veille après une période
d'inactivité (le premier accès après une pause devient lent le temps du
réveil).

## 2. Nom de domaine — remplacer l'achat d'un `.com`

**DuckDNS** (`duckdns.org`) fournit un sous-domaine gratuit à vie, du
type `lfd-services.duckdns.org`, avec mise à jour automatique de l'IP du
serveur. C'est moins « professionnel » à l'œil qu'un `.com` payant, mais
techniquement identique pour l'application : HTTPS fonctionne dessus
exactement pareil.

Si une des plateformes d'hébergement gratuites ci-dessus est utilisée à
la place d'un serveur dédié, elle fournit déjà son propre sous-domaine
gratuit (`*.fly.dev`, `*.onrender.com`) — DuckDNS devient alors inutile.

## 3. Certificat HTTPS — déjà gratuit, et automatisé

**Let's Encrypt** délivre des certificats HTTPS gratuits et
renouvelables automatiquement. Le fichier `Caddyfile` ajouté dans ce
projet utilise **Caddy** comme reverse proxy : il obtient et renouvelle
le certificat tout seul, sans configuration manuelle de `certbot`.

## 4. Stockage des fichiers (reçus, rapports) — remplacer S3 payant

Le squelette utilise déjà, **par défaut**, le pilote `local`
(`STORAGE_DRIVER="local"`) : les fichiers sont stockés directement sur le
disque du serveur, sans aucun service payant. Pour la taille de LFD-
Services (5 centres, quelques dizaines de reçus par jour), c'est
largement suffisant et déjà configuré — aucune action requise.

Si le volume de fichiers devient important au point de vouloir un
stockage objet séparé, **Cloudflare R2** offre gratuitement 10 Go de
stockage et, point important, **aucun frais de sortie de données**
(contrairement à AWS S3, qui facture chaque téléchargement). R2 est
compatible avec le pilote `s3` déjà écrit dans `storage.service.ts` : il
suffit de renseigner `S3_ENDPOINT` avec l'URL R2 fournie par Cloudflare,
sans changer de code.

## 5. Paiement mobile money — la seule limite réellement incontournable

C'est le seul point où « gratuit » demande un choix de fonctionnement,
pas juste un changement de fournisseur.

**Ce qui reste gratuit** : garder le paiement mobile money **manuel**,
exactement comme la version Excel/VBA actuelle et comme le lot MVP déjà
livré (`POST /payments` — `payments.service.ts`, méthode `record`). Le
bénéficiaire paie sur le numéro Mobile Money du centre comme aujourd'hui,
le caissier encaisse et enregistre simplement le mode de paiement dans
l'application. **Aucun frais d'intégration, aucun abonnement API.**

**Ce qui reste payant, quelle que soit la solution technique** :
automatiser la demande de paiement directement depuis l'application
(`POST /payments/mobile-money/initiate`, déjà codé) nécessite un compte
marchand chez MTN et/ou Orange, avec leurs frais associés. Ce n'est pas
un choix technique évitable : c'est la manière dont ces opérateurs
facturent l'accès à leur API de paiement, peu importe le logiciel utilisé
en face.

**Recommandation concrète** : garder le module `payments` en mode manuel
pour le MVP et le lot V1 (déjà le cas), et ne considérer l'automatisation
`mobile-money/initiate` que si le volume de commandes justifie un jour
l'investissement — le code est déjà prêt et attend simplement de vraies
identifiants opérateur le jour venu, sans rien à réécrire.

## Résumé

| Poste | Option gratuite | Limite honnête |
|---|---|---|
| Hébergement | Oracle Cloud Always Free, ou matériel existant | Vérification carte bancaire (Oracle) ; dépendance à l'électricité/l'internet local (matériel propre) |
| Nom de domaine | DuckDNS, ou sous-domaine de la plateforme d'hébergement | Moins « pro » qu'un .com payant |
| HTTPS | Let's Encrypt via Caddy | Aucune, déjà gratuit pour tout le monde |
| Stockage fichiers | Disque local (déjà configuré par défaut), ou Cloudflare R2 (10 Go gratuits) | Limite de 10 Go sur R2 au-delà du disque local |
| Paiement mobile money | Encaissement manuel (déjà implémenté) | L'automatisation `initiate` restera toujours payante — ce n'est pas contournable |
