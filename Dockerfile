# Utilisation d'une image de base Node.js officielle (version LTS)
FROM node:18-alpine

# Définition du répertoire de travail dans le conteneur
WORKDIR /app

# Copie du fichier package.json et package-lock.json 
COPY package*.json ./

# Installation des dépendances
RUN npm install --production

# Copie du reste du code source dans le conteneur
COPY . .

# Exposition du port sur lequel l'application écoute
EXPOSE 3000

# Définition de la variable d'environnement pour le mode production
ENV NODE_ENV=production

# Commande de démarrage de l'application
CMD ["npm", "start"]

