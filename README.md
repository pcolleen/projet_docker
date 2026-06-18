## Prérequis

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Installation

**1. Cloner le projet**
```bash
git clone https://github.com/pcolleen/projet_docker.git
cd projet_docker
```

**2. Créer le fichier d'environnement**
```bash
cp .env.example .env
```
Modifier `.env` avec vos valeurs (notamment `JWT_SECRET`).

**3. Lancer l'application**
```bash
docker compose up --build
```

## Accès

| Service | URL |
|---|---|
| Application | http://localhost |
| API | http://localhost:3000 |
| Documentation API | http://localhost:3000/api-docs |

```

## Commandes utiles
```bash
# Lancer
docker compose up --build

# Lancer en arrière-plan
docker compose up --build -d

# Arrêter
docker compose down

# Arrêter et supprimer les données
docker compose down -v

# Voir les logs
docker compose logs -f
```

