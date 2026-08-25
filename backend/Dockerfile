# Dockerfile pour LFD ABA Shop Backend
# Utilisé pour le déploiement sur Render et autres plateformes Docker

FROM node:20-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le reste du code source
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Builder l'application
RUN npm run build

# Étape de production
FROM node:20-alpine AS production

# Installer les dépendances nécessaires pour Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances de production
RUN npm ci --only=production

# Copier le code compilé depuis le builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Créer le répertoire de stockage
RUN mkdir -p ./storage

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "run", "start:prod"]
