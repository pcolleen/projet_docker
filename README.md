# Projet Docker — Application Kanban

Projet réalisé dans le cadre du cours Docker en M1 Dev. L'idée était de conteneuriser une application web complète avec authentification, base de données et supervision.

## Ce qu'on a fait

Une appli Kanban (style Trello simplifié) avec connexion/inscription. Les tâches sont organisées en 3 colonnes : **À faire / En cours / Terminé**. Chaque utilisateur a ses propres tâches persistées en base.

### Organisation du projet

![Kanban](./docs/kanban.png)

On a utilisé Trello pour se répartir le boulot. Les grandes catégories : Backend, Frontend, DevOps, Test. Tout est terminé à 100%.

## Stack technique

| Côté | Techno |
|---|---|
| Frontend | React 18 + Vite, servi par Nginx |
| Backend | Node.js + Express |
| Base de données | PostgreSQL 16 |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| API Docs | Swagger UI (`/api-docs`) |
| Conteneurisation | Docker + Docker Compose |
| CI | GitHub Actions |
| Supervision | Prometheus + Grafana |

## Architecture Docker

8 conteneurs orchestrés via Docker Compose sur un réseau interne `app-network` :

```
frontend (Nginx:80) ──► backend (Node:3000) ──► db (Postgres:5432)
                                │
                         postgres-exporter
                                │
cadvisor ──────────────► prometheus ──────────► grafana
node-exporter ─────────►
```

**Points notables :**
- Healthchecks sur `db` et `backend` — démarrage ordonné garanti
- `restart: on-failure` sur le backend
- Variables sensibles dans `.env` (jamais commité)
- Limites mémoire sur les conteneurs de monitoring

## Prérequis

- [Docker](https://docs.docker.com/get-docker/) (v24+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2+)

## Installation

```bash
git clone https://github.com/pcolleen/projet_docker.git
cd projet_docker
cp .env.example .env
```

Éditer `.env` et remplacer au minimum le `JWT_SECRET` :

```bash
openssl rand -hex 32  # génère une clé sécurisée
```

Puis lancer :

```bash
docker compose up --build
```

## Accès

| Service | URL | Credentials |
|---|---|---|
| Application | http://localhost | compte à créer |
| API + Swagger | http://localhost:3000/api-docs | — |
| Grafana | http://localhost:3001 | admin / voir `.env` |
| Prometheus | http://localhost:9090 | — |

## Supervision

On a mis en place une stack de supervision complète avec Prometheus et Grafana.

**Ce qui est monitoré :**
- **Machine hôte** (via `node-exporter`) : CPU, RAM, disque
- **Conteneurs Docker** (via `cAdvisor`) : CPU, RAM, réseau par conteneur
- **Backend Node.js** (via `prom-client`) : nombre de requêtes HTTP par route/méthode/statut
- **PostgreSQL** (via `postgres-exporter`) : connexions, transactions, cache hit ratio, taille des tables

**2 dashboards Grafana disponibles :**
- *Docker TP - Supervision* — vue globale de tous les conteneurs
- *PostgreSQL - Métriques* — métriques détaillées de la base de données

Les dashboards sont provisionnés automatiquement au démarrage, pas besoin de les importer manuellement.

## Persistance des données

| Volume | Contenu |
|---|---|
| `postgres_data` | Utilisateurs + tâches Kanban |
| `prometheus_data` | Historique des métriques (1 jour) |
| `grafana_data` | Config et dashboards Grafana |

`docker compose down` conserve les données. `docker compose down -v` les supprime.

## Commandes utiles

```bash
# Lancer (rebuild si modifs)
docker compose up --build

# Arrière-plan
docker compose up --build -d

# Logs en temps réel
docker compose logs -f backend

# Arrêter sans perdre les données
docker compose down

# Reset complet (supprime les volumes)
docker compose down -v && docker compose up --build

# Voir les conteneurs
docker compose ps
```

## CI

GitHub Actions build les images Docker à chaque push sur n'importe quelle branche.
La branche `main` est protégée : merge obligatoirement via Pull Request.
