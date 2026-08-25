#!/bin/bash

# Script de build pour Render
# Ce script est exécuté automatiquement par Render avant le déploiement

cd backend

# Installer les dépendances
npm install

# Générer le client Prisma
npx prisma generate

# Builder l'application
npm run build

# Exécuter le seed (optionnel - décommentez si vous voulez seed automatiquement)
# npx prisma db seed
