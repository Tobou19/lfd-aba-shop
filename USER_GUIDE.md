# Guide d'Utilisation LFD ABA Shop

## 🎯 Vue d'ensemble

LFD ABA Shop est une application de gestion pour les centres de bien-être LFD-Services, conçue pour fonctionner même hors connexion.

## 📱 Installation

### Sur Mobile (Android/iOS)
1. Ouvrez l'application dans Chrome (Android) ou Safari (iOS)
2. Cliquez sur "Ajouter à l'écran d'accueil"
3. L'application sera installée comme une app native

### Sur Desktop
1. Ouvrez l'application dans Chrome/Edge
2. Cliquez sur l'icône d'installation dans la barre d'adresse
3. L'application sera installée sur votre ordinateur

## 🔐 Connexion

### Identifiants de Démo
- **Direction**: direction@lfd-services.com / ChangezMoiDirection123!
- **Gestionnaire**: gestionnaire@lfd-services.com / ChangezMoiGestion123!
- **Caissier**: caissier@lfd-services.com / ChangezMoiCaisse123!

> ⚠️ **Important**: Changez ces mots de passe après la première connexion en production!

## 🌐 Mode Hors Connexion

### Comment ça marche
- L'application cache automatiquement les données essentielles
- Vous pouvez continuer à travailler sans connexion
- Les données sont synchronisées automatiquement quand la connexion revient

### Indicateurs visuels
- 🟢 **Vert**: En ligne - Synchronisation active
- 🟠 **Orange**: Hors ligne - Mode cache activé
- 📋 **Bannière**: Apparaît automatiquement lors des changements de connexion

### Fonctionnalités hors connexion
- ✅ Consultation des produits et centres
- ✅ Création de commandes (mises en file d'attente)
- ✅ Création de clients (mis en file d'attente)
- ✅ Accès aux données récentes

### Synchronisation
- **Automatique**: Dès que la connexion est rétablie
- **Manuelle**: Bouton "Synchroniser" dans le tableau de bord
- **Priorité**: Clients d'abord, puis commandes

## 📋 Flux de Travail

### Pour les Caissiers

1. **Ouverture de session**
   - Se connecter avec identifiants caissier
   - Vérifier le statut de connexion

2. **Traitement des commandes**
   - Sélectionner le client (créer si nouveau)
   - Ajouter les produits
   - Valider la commande
   - En mode hors ligne: mise en file d'attente automatique

3. **Paiement**
   - Choisir le mode de paiement
   - Mobile Money (MTN/Orange)
   - Espèces
   - Émettre le reçu

4. **Synchronisation**
   - Vérifier les éléments en attente
   - Synchroniser manuellement si nécessaire

### Pour les Gestionnaires

1. **Vue d'ensemble**
   - Tableau de bord avec statistiques
   - État des synchronisations
   - Alertes système

2. **Gestion des stocks**
   - Consulter les inventaires
   - Mettre à jour les disponibilités
   - Gérer les alertes de stock

3. **Rapports**
   - Exporter les rapports quotidiens
   - Analyser les tendances
   - Gérer les anomalies

### Pour la Direction

1. **Surveillance globale**
   - Vue multi-centres
   - Performance par centre
   - Indicateurs clés

2. **Gestion utilisateurs**
   - Créer/modifier des comptes
   - Gérer les permissions
   - Réinitialiser les mots de passe

3. **Rapports avancés**
   - Analyses financières
   - Tendances de fidélité
   - Export de données

## ⚡ Performance et Cache

### Cache automatique
- **Images**: 30 jours
- **Polices**: 1 an
- **API**: 5 minutes
- **Données essentielles**: 24h-7 jours selon le type

### Nettoyage automatique
- Commandes synchronisées: 30 jours
- Clients synchronisés: 30 jours
- Données obsolètes: Suppression automatique

### Optimisation des performances
- Préchargement des données essentielles
- Compression automatique
- Lazy loading des images
- Optimisation des requêtes API

## 🔧 Dépannage

### Problèmes courants

**Application ne se charge pas**
- Vérifiez votre connexion internet
- Videz le cache du navigateur
- Réessayez l'installation

**Synchronisation échoue**
- Vérifiez votre connexion
- Vérifiez vos identifiants
- Contactez le support si persiste

**Données incorrectes**
- Synchronisez manuellement
- Vérifiez les logs
- Rafraîchissez la page

**Éléments en attente ne synchronisent pas**
- Vérifiez la connexion
- Vérifiez les permissions
- Supprimez et recréez si nécessaire

## 📞 Support

### En cas de problème
1. Consultez ce guide
2. Vérifiez les logs de synchronisation
3. Contactez le support technique

### Contact Support
- Email: support@lfd-services.com
- Téléphone: [Votre numéro]
- Horaires: 8h-18h, Lun-Ven

## 💡 Conseils d'utilisation

### Pour une meilleure expérience
- Gardez l'application à jour
- Synchronisez régulièrement
- Utilisez le WiFi quand disponible
- Gardez de l'espace de stockage libre

### Sécurité
- Déconnectez-vous après utilisation
- Changez régulièrement vos mots de passe
- Ne partagez pas vos identifiants
- Signalez toute activité suspecte