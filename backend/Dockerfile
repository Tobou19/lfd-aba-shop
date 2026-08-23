# --- Base partagée : Node + Chromium système ---
# Puppeteer a besoin d'un navigateur pour générer les PDF/PNG des reçus et
# rapports. Plutôt que de laisser Puppeteer télécharger et embarquer son
# propre Chromium (gros, et il manque des bibliothèques système sur une
# image "slim" de base), on installe le paquet Chromium de Debian une
# seule fois ici, et on demande à Puppeteer de l'utiliser directement.
FROM node:20-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends \
      chromium \
      fonts-liberation \
      ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Empêche Puppeteer de télécharger son propre Chromium (inutile, plus
# lourd, et source d'échecs de build sur un réseau restreint) ; pointe
# vers le binaire Debian installé ci-dessus.
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# --- Étape 1 : build ---
FROM base AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

# --- Étape 2 : image d'exécution, minimale ---
FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Utilisateur non-root : une compromission de l'application n'obtient pas
# directement les droits root sur le conteneur. Chromium a aussi besoin
# d'un utilisateur non-root pour son bac à sable (sandbox) — on le crée
# avec un vrai répertoire personnel pour éviter les erreurs de permission.
RUN groupadd -r lfd && useradd -r -g lfd -m lfd \
    && mkdir -p /app/storage && chown -R lfd:lfd /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

USER lfd
EXPOSE 3000
CMD ["node", "dist/main.js"]
