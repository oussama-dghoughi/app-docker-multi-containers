# Application Web Conteneurisée avec Docker

##  Description du Projet

Ce projet présente une application web multi-conteneurs développée . L'application est entièrement conteneurisée et utilise Docker Compose pour l'orchestration de plusieurs services interconnectés.

### Fonctionnalités

- Application web Node.js/Express avec interface HTML moderne
- Base de données Redis pour la persistance des données
- Reverse proxy Nginx pour le routage des requêtes
- Architecture multi-conteneurs avec communication inter-services
- Images Docker publiées publiquement sur Docker Hub

---

## Architecture

L'application est composée de **trois conteneurs Docker** qui communiquent via un réseau dédié :

1. **web** : Application Node.js/Express (port 3000)
   - Page d'accueil avec interface utilisateur
   - Routes API REST (`/api/info`, `/api/stats`)
   - Intégration avec Redis pour le stockage de données

2. **redis** : Base de données Redis (port 6379)
   - Stockage en mémoire pour les compteurs de visites
   - Persistance des données via volumes Docker

3. **nginx** : Reverse proxy Nginx (port 70 sur l'hôte, port 80 dans le conteneur)
   - Routage des requêtes vers l'application web
   - Point d'entrée principal de l'application

---

##  Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Docker** (version 20.10 ou supérieure)
- **Docker Compose** (version 2.0 ou supérieure, généralement inclus avec Docker Desktop)

### Vérification de l'installation

```bash
docker --version
docker compose version
```

Si vous utilisez une ancienne version de Docker, vous pouvez utiliser `docker-compose` (avec tiret) au lieu de `docker compose`.

---

##  Instructions d'Exécution

### Méthode 1 : Utilisation de Docker Compose (Recommandée)

Cette méthode est la plus simple et permet de lancer tous les services en une seule commande.

#### Étape 1 : Cloner ou télécharger le projet

```bash
cd Examen-blanc
```

#### Étape 2 : Lancer tous les conteneurs

**Mode interactif (voir les logs en temps réel) :**
```bash
docker compose up --build
```

**Mode détaché (en arrière-plan) :**
```bash
docker compose up -d --build
```

L'option `--build` force la reconstruction des images avant de démarrer les conteneurs.

**Note :** Si vous utilisez une ancienne version de Docker, remplacez `docker compose` par `docker-compose`.

#### Étape 3 : Accéder à l'application

Une fois les conteneurs démarrés, l'application est accessible via :

- **Via Nginx (reverse proxy)** : http://localhost:70
- **Directement sur l'application** : http://localhost:3001

---

### Méthode 2 : Utilisation de Docker uniquement (sans Docker Compose)

Cette méthode permet de construire et lancer les conteneurs manuellement.

#### Étape 1 : Construire l'image Docker de l'application

```bash
docker build -t examen-web-app .
```

Cette commande :
- Lit le `Dockerfile` dans le répertoire courant
- Construit une image Docker nommée `examen-web-app`
- Installe les dépendances Node.js
- Copie le code source dans l'image

#### Étape 2 : Lancer le conteneur Redis

```bash
docker run -d --name examen-redis -p 6379:6379 redis:7-alpine
```

Cette commande :
- Télécharge l'image Redis officielle
- Lance un conteneur Redis en arrière-plan (`-d`)
- Expose le port 6379 sur la machine hôte

#### Étape 3 : Lancer le conteneur de l'application

```bash
docker run -d --name examen-web-app -p 3001:3000 \
  --link examen-redis:redis \
  -e REDIS_HOST=redis \
  -e REDIS_PORT=6379 \
  examen-web-app
```

Cette commande :
- Lance le conteneur de l'application en arrière-plan
- Expose le port 3000 du conteneur sur le port 3001 de l'hôte
- Lie le conteneur à Redis pour la communication
- Configure les variables d'environnement nécessaires

#### Étape 4 : Accéder à l'application

L'application est accessible sur : http://localhost:3001

---

##  Vérification du Fonctionnement

### 1. Vérifier que les conteneurs sont en cours d'exécution

**Avec Docker Compose :**
```bash
docker compose ps
```

**Avec Docker uniquement :**
```bash
docker ps
```

Vous devriez voir trois conteneurs en cours d'exécution :
- `examen-web-app` (statut : Up)
- `examen-redis` (statut : Up)
- `examen-nginx` (statut : Up, si vous utilisez Docker Compose)

### 2. Tester l'application dans le navigateur

#### Page d'accueil
Ouvrez votre navigateur et accédez à :
- http://localhost:70 (via Nginx)
- http://localhost:3001 (directement)

Vous devriez voir une page d'accueil avec :
- Un titre "Application Docker"
- Des liens vers les routes API
- Des informations sur le port et l'environnement

#### Route API - Informations
Testez l'endpoint `/api/info` :
- http://localhost:70/api/info
- http://localhost:3001/api/info

**Résultat attendu :** Un JSON contenant :
```json
{
  "message": "Informations sur l'API",
  "version": "1.0.0",
  "description": "API REST pour l'application Docker",
  "endpoints": [...],
  "visits": <nombre de visites>,
  "timestamp": "..."
}
```

#### Route API - Statistiques
Testez l'endpoint `/api/stats` :
- http://localhost:70/api/stats
- http://localhost:3001/api/stats

**Résultat attendu :** Un JSON contenant :
```json
{
  "message": "Statistiques de l'application",
  "totalVisits": <nombre>,
  "uptime": <temps en secondes>,
  "memory": {...},
  "nodeVersion": "...",
  "platform": "...",
  "timestamp": "..."
}
```

### 3. Vérifier les logs des conteneurs

**Voir tous les logs :**
```bash
docker compose logs
```

**Voir les logs d'un service spécifique :**
```bash
docker compose logs web
docker compose logs redis
docker compose logs nginx
```

**Suivre les logs en temps réel :**
```bash
docker compose logs -f
```

**Logs attendus :**
- `examen-web-app` : " Serveur démarré sur le port 3000" et "Connecté à Redis"
- `examen-redis` : "Ready to accept connections tcp"
- `examen-nginx` : "Configuration complete; ready for start up"

### 4. Vérifier la communication entre conteneurs

Testez que Redis fonctionne en vérifiant que le compteur de visites s'incrémente à chaque appel de l'API :
1. Appelez http://localhost:70/api/info plusieurs fois
2. Vérifiez que le champ `visits` dans la réponse JSON s'incrémente

---

##  Commandes Docker Utiles

### Gestion des conteneurs

**Arrêter tous les conteneurs :**
```bash
docker compose down
```

**Arrêter et supprimer les volumes (supprime les données Redis) :**
```bash
docker compose down -v
```

**Redémarrer les conteneurs :**
```bash
docker compose restart
```

**Arrêter un conteneur spécifique :**
```bash
docker stop examen-web-app
```

**Démarrer un conteneur arrêté :**
```bash
docker start examen-web-app
```

### Gestion des images

**Voir toutes les images :**
```bash
docker images
```

**Reconstruire les images (sans utiliser le cache) :**
```bash
docker compose build --no-cache
```

**Supprimer une image :**
```bash
docker rmi examen-web-app
```

### Monitoring

**Voir l'utilisation des ressources :**
```bash
docker stats
```

**Inspecter un conteneur :**
```bash
docker inspect examen-web-app
```

**Exécuter une commande dans un conteneur :**
```bash
docker exec -it examen-web-app sh
```

---

##  Structure du Projet

```
Examen-blanc/
├── server.js                  # Application Express principale
├── package.json               # Dépendances Node.js et scripts
├── Dockerfile                 # Configuration pour construire l'image Docker
├── docker-compose.yml         # Configuration multi-conteneurs
├── nginx.conf                 # Configuration du reverse proxy Nginx
├── .dockerignore              # Fichiers à exclure lors de la construction
├── .gitignore                 # Fichiers à exclure de Git
├── README.md                  # Ce fichier (documentation principale)
├── GUIDE-DOCKER-DESKTOP.md    # Guide spécifique pour Docker Desktop
└── PUBLICATION-DOCKER-HUB.md  # Guide pour publier sur Docker Hub
```

---

##  Détails Techniques

### Dockerfile

Le `Dockerfile` est structuré selon les bonnes pratiques :

```dockerfile
FROM node:18-alpine          # Image de base légère et sécurisée
WORKDIR /app                 # Définition du répertoire de travail
COPY package*.json ./        # Copie des dépendances (optimisation du cache)
RUN npm install --production # Installation des dépendances
COPY . .                     # Copie du code source
EXPOSE 3000                  # Exposition du port
ENV NODE_ENV=production      # Configuration de l'environnement
CMD ["npm", "start"]         # Commande de démarrage
```

**Optimisations :**
- Utilisation d'une image Alpine (plus légère)
- Copie séparée de `package.json` pour optimiser le cache Docker
- Installation uniquement des dépendances de production

### Docker Compose

Le fichier `docker-compose.yml` définit :

- **3 services** interconnectés via un réseau bridge (`app-network`)
- **Volume persistant** (`redis-data`) pour la persistance des données Redis
- **Dépendances** entre services (`depends_on`) pour l'ordre de démarrage
- **Variables d'environnement** pour la configuration
- **Mapping des ports** pour l'accès depuis l'hôte
- **Politique de redémarrage** (`restart: unless-stopped`)

### Application Web

L'application Node.js/Express propose :

- **Route `/`** : Page d'accueil avec interface HTML moderne
- **Route `/api/info`** : Endpoint REST retournant des informations sur l'API
- **Route `/api/stats`** : Endpoint REST retournant des statistiques système
- **Intégration Redis** : Compteur de visites persistant entre les redémarrages

---

##  Publication sur Docker Hub

### Image Docker Hub

L'image de l'application est disponible publiquement sur Docker Hub :

** Lien :** https://hub.docker.com/r/oussamadghoughi/examen-web-app

**Tag :** `oussamadghoughi/examen-web-app:latest`

### Utiliser l'image depuis Docker Hub

Vous pouvez utiliser l'image directement depuis Docker Hub sans la construire localement :

```bash
docker pull oussamadghoughi/examen-web-app:latest
```

Puis modifier `docker-compose.yml` pour utiliser l'image :

```yaml
web:
  image: oussamadghoughi/examen-web-app:latest
  # Supprimez la section build:
  container_name: examen-web-app
  # ... reste de la configuration
```

### Publier une nouvelle version

Si vous souhaitez publier une nouvelle version de l'image :

```bash
# 1. Se connecter à Docker Hub
docker login

# 2. Construire l'image avec votre nom d'utilisateur
docker build -t oussamadghoughi/examen-web-app:latest .

# 3. Publier l'image
docker push oussamadghoughi/examen-web-app:latest
```

Pour plus de détails, consultez le fichier **PUBLICATION-DOCKER-HUB.md**.

---

##  Dépannage

### Les conteneurs ne démarrent pas

**Problème :** Erreur "port is already allocated"

**Solution :**
1. Vérifiez quels ports sont utilisés :
   ```bash
   lsof -i :70
   lsof -i :3001
   lsof -i :6379
   ```
2. Arrêtez les conteneurs existants :
   ```bash
   docker compose down
   ```
3. Ou modifiez les ports dans `docker-compose.yml` si nécessaire

### Erreur de connexion à Redis

**Problème :** L'application ne peut pas se connecter à Redis

**Solution :**
1. Vérifiez que Redis est démarré :
   ```bash
   docker compose ps
   ```
2. Attendez quelques secondes après le démarrage (Redis a besoin de temps pour initialiser)
3. Vérifiez les logs de Redis :
   ```bash
   docker compose logs redis
   ```
4. L'application fonctionne en mode dégradé si Redis n'est pas disponible

### L'application ne répond pas

**Problème :** Impossible d'accéder à l'application dans le navigateur

**Solution :**
1. Vérifiez que tous les conteneurs sont en cours d'exécution :
   ```bash
   docker ps
   ```
2. Vérifiez les logs de l'application :
   ```bash
   docker compose logs web
   ```
3. Testez directement sur le port de l'application : http://localhost:3001
4. Vérifiez que le port n'est pas bloqué par un firewall

### Erreur "command not found: docker-compose"

**Problème :** La commande `docker-compose` n'est pas trouvée

**Solution :**
1. Utilisez `docker compose` (sans tiret) pour les versions récentes de Docker
2. Ou installez docker-compose :
   ```bash
   brew install docker-compose
   ```

### Les données Redis sont perdues après redémarrage

**Problème :** Les compteurs de visites sont réinitialisés

**Solution :**
1. Vérifiez que le volume `redis-data` existe :
   ```bash
   docker volume ls
   ```
2. Ne supprimez pas les volumes lors de l'arrêt :
   ```bash
   # Utilisez cette commande (sans -v)
   docker compose down
   
   # Évitez cette commande (supprime les volumes)
   docker compose down -v
   ```

---

##  Notes Importantes

- Les données Redis sont **persistantes** grâce au volume Docker `redis-data`
- L'application fonctionne en **mode dégradé** si Redis n'est pas disponible (les compteurs ne fonctionneront pas)
- Nginx agit comme **reverse proxy** et route toutes les requêtes vers l'application web
- Les conteneurs redémarrent automatiquement en cas d'arrêt inattendu (`restart: unless-stopped`)
- L'application est configurée pour fonctionner en **mode production** (`NODE_ENV=production`)

---


##  Auteur

**Oussama Dghoughi**

- Docker Hub : [oussamadghoughi](https://hub.docker.com/u/oussamadghoughi)
- Image : [oussamadghoughi/examen-web-app](https://hub.docker.com/r/oussamadghoughi/examen-web-app)


---

**Date de création :** Janvier 2026
