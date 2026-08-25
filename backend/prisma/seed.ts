import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 12;

// Amorce la base avec les 5 centres réels, un compte par rôle (identifiants
// de démonstration à changer immédiatement en production), et un petit
// catalogue illustrant les deux types de produits (§ règle métier : repas
// facturés par période vs autres produits en achat simple).
//
// Idempotent : peut être relancé sans dupliquer les données (upsert sur
// les identifiants métier stables — email pour les utilisateurs, nom pour
// les centres).
async function main() {
  console.log('Amorçage de la base de données LFD-Services / ABA SHOP…');

  // ---------- 1. Centres ----------
  const centresData = [
    { nom: 'Douala', adresse: 'Vers Lendi, après Fin Goudron Bangué', pays: 'Cameroun', devise: 'FCFA' as const, responsable: 'M. Ekwalla' },
    { nom: 'Yaoundé', adresse: 'Après carrefour Anguissa, derrière le stade Malien', pays: 'Cameroun', devise: 'FCFA' as const, responsable: 'Mme Yolande' },
    { nom: 'Bafoussam', adresse: 'Pessi Hôtel, derrière Avenir Voyage', pays: 'Cameroun', devise: 'FCFA' as const, responsable: 'M. Talla' },
    { nom: 'Abakaliki', adresse: '187 Ogoja Road, Ebonyi State', pays: 'Nigeria', devise: 'NGN' as const, responsable: 'Mr. Okafor' },
    { nom: 'Libreville', adresse: 'Cité Damas, route du Stade de Basket-Ball', pays: 'Gabon', devise: 'FCFA' as const, responsable: 'Mme Ondo' },
  ];

  const centres: Record<string, string> = {}; // nom -> id
  for (const c of centresData) {
    const existant = await prisma.centre.findFirst({ where: { nom: c.nom } });
    const centre = existant
      ? await prisma.centre.update({ where: { id: existant.id }, data: c })
      : await prisma.centre.create({ data: c });
    centres[c.nom] = centre.id;
    console.log(`  Centre : ${c.nom} (${c.pays}) — ${existant ? 'mis à jour' : 'créé'}`);
  }

  // ---------- 2. Utilisateurs (un compte par rôle, à titre de démonstration) ----------
  // ⚠️ Mots de passe de démonstration — à changer immédiatement après le
  // premier déploiement, en particulier le compte Direction.
  const utilisateursData = [
    {
      nomComplet: 'Toboudjila Yan Xavier',
      email: 'toboudjilayanxavier@gmail.com',
      telephone: '688758020',
      motDePasse: 'X@vier1st',
      role: 'DIRECTION' as const,
      centreNoms: Object.keys(centres), // accès à tous les centres
    },
    {
      nomComplet: 'Yolande Fotso',
      email: 'gestionnaire@lfd-services.com',
      motDePasse: 'ChangezMoiGestion123!',
      role: 'GESTIONNAIRE' as const,
      centreNoms: ['Yaoundé'],
    },
    {
      nomComplet: 'Brice Ngassa',
      email: 'caissier@lfd-services.com',
      motDePasse: 'ChangezMoiCaisse123!',
      role: 'CAISSIER' as const,
      centreNoms: ['Douala'],
    },
  ];

  const utilisateurs: Record<string, string> = {}; // email -> id
  for (const u of utilisateursData) {
    const motDePasseHash = await bcrypt.hash(u.motDePasse, BCRYPT_ROUNDS);
    const existant = await prisma.utilisateur.findUnique({ where: { email: u.email } });

    const utilisateur = existant
      ? await prisma.utilisateur.update({
          where: { id: existant.id },
          data: { nomComplet: u.nomComplet, role: u.role },
        })
      : await prisma.utilisateur.create({
          data: { nomComplet: u.nomComplet, email: u.email, motDePasseHash, role: u.role },
        });

    // Rattachement aux centres (supprime puis recrée pour rester idempotent)
    await prisma.utilisateurCentre.deleteMany({ where: { utilisateurId: utilisateur.id } });
    await prisma.utilisateurCentre.createMany({
      data: u.centreNoms.map((nom) => ({ utilisateurId: utilisateur.id, centreId: centres[nom] })),
    });

    utilisateurs[u.email] = utilisateur.id;
    console.log(`  Utilisateur : ${u.nomComplet} (${u.role}) — ${existant ? 'mis à jour' : 'créé'}`);
  }

  // ---------- 3. Catalogue (repas + produits standards) ----------
  const produitsData = [
    // Repas thérapeutiques — facturés par période (§ règle métier)
    { nom: "Jus d'Herbe de Blé", nomScientifique: 'Triticum aestivum', vertus: 'Détoxifiant, riche en chlorophylle', prixUnitaire: 3500, devise: 'FCFA' as const, type: 'NOURRITURE' as const },
    { nom: 'Salade Vivante Complète', nomScientifique: 'Mélange de germinations', vertus: 'Digestion, apport enzymatique', prixUnitaire: 4500, devise: 'FCFA' as const, type: 'NOURRITURE' as const },
    { nom: 'Lait de Coco Fermenté', nomScientifique: 'Cocos nucifera', vertus: 'Probiotique naturel', prixUnitaire: 3000, devise: 'FCFA' as const, type: 'NOURRITURE' as const },
    { nom: 'Boisson Curcuma-Gingembre', nomScientifique: 'Curcuma longa', vertus: 'Anti-oxydant, immunité', prixUnitaire: 2500, devise: 'FCFA' as const, type: 'NOURRITURE' as const },
    // Autres produits ABA SHOP — achat simple, sans notion de période
    { nom: 'Huile de Massage Thérapeutique', nomScientifique: null, vertus: 'Détente musculaire', prixUnitaire: 6000, devise: 'FCFA' as const, type: 'STANDARD' as const },
    { nom: 'Tisane Détox — Sachet de 20', nomScientifique: null, vertus: 'Cure ponctuelle', prixUnitaire: 4500, devise: 'FCFA' as const, type: 'STANDARD' as const },
  ];

  for (const p of produitsData) {
    const existant = await prisma.produit.findFirst({ where: { nom: p.nom } });
    if (existant) {
      await prisma.produit.update({ where: { id: existant.id }, data: p });
      console.log(`  Produit : ${p.nom} (${p.type}) — mis à jour`);
    } else {
      await prisma.produit.create({ data: p });
      console.log(`  Produit : ${p.nom} (${p.type}) — créé`);
    }
  }

  console.log('\nAmorçage terminé.');
  console.log('\nComptes de démonstration (à changer en production) :');
  for (const u of utilisateursData) {
    console.log(`  ${u.role.padEnd(13)} ${u.email}  /  ${u.motDePasse}`);
  }
}

main()
  .catch((e) => {
    console.error('Échec de l\u2019amorçage :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
