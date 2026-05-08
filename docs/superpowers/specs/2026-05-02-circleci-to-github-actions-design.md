# Migration CircleCI → GitHub Actions

**Date:** 2026-05-02

## Contexte

Le projet utilise CircleCI pour les tests et les déploiements vers AWS Lambda. L'objectif est de migrer vers GitHub Actions en conservant le comportement existant, notamment la validation manuelle avant tout déploiement.

## Configuration actuelle (CircleCI)

- **build-app** : tests sur chaque push (Node 14, yarn)
- **deploy-preprod** : déploiement vers Lambda `alhau_preprod` (approbation manuelle)
- **deploy-prod** : déploiement vers Lambda `ludohomekit` (approbation manuelle)
- Script de déploiement : zip des fichiers JS + config + node_modules, upload S3, update Lambda

## Design GitHub Actions

### Deux workflows

#### 1. `.github/workflows/ci.yml` — Tests automatiques

- **Déclencheur** : `push` sur toutes les branches
- **Job `test`** : Node 14, `yarn install`, `yarn test`
- Variables d'environnement : `APP_ENV=test`, `CRYPTOPASS`, `PROD_MODE=false`, `INSTANCE_NAME=dev`, `MYSQL_ADDON_HOST=localhost`, `MYSQL_ADDON_PORT=3306`, `MYSQL_ADDON_DB=alexa_oauth`, `METRICS_HOST=no.host`, `METRICS_PORT=2003`, `METRICS_UDP_PORT=8124`

#### 2. `.github/workflows/deploy.yml` — Déploiement manuel

- **Déclencheur** : `workflow_dispatch` (l'utilisateur sélectionne la branche dans l'UI GitHub, défaut `master`)
- **Input** : `environment` → choix entre `preprod` et `prod`
- **Job `test`** : re-run des tests pour garantir que le build passe avant le déploiement
- **Job `deploy`** : dépend de `test`, utilise un **GitHub Environment** (`preprod` ou `prod`) avec "Required reviewers" — mécanisme natif d'approbation manuelle GitHub

### Script de déploiement

- Déplacé de `.circleci/deploy.sh` vers `scripts/deploy.sh`
- Contenu inchangé : zip, upload S3 (`alhau`), update Lambda via AWS CLI
- `.circleci/` conservé pour l'instant (suppression dans une PR séparée)

### Secrets GitHub à configurer

| Nom | Usage |
|-----|-------|
| `AWS_ACCESS_KEY` | Clé d'accès AWS |
| `AWS_PREPROD_ACCESS_SECRET` | Secret AWS (utilisé pour preprod et prod) |
| `AWS_REGION_NAME` | Région AWS |

### Variables par environnement

| Variable | Preprod | Prod |
|----------|---------|------|
| `DEPLOY_FUNCTION` | `alhau_preprod` | `ludohomekit` |

## Fichiers créés/modifiés

- `scripts/deploy.sh` — déplacé depuis `.circleci/deploy.sh`
- `.github/workflows/ci.yml` — nouveau
- `.github/workflows/deploy.yml` — nouveau

## Configuration GitHub requise

Avant d'utiliser le workflow de déploiement, créer deux environnements GitHub dans Settings → Environments :
- `preprod` : ajouter les reviewers requis
- `prod` : ajouter les reviewers requis

## Différence avec CircleCI

Dans CircleCI, les approbations `hold-preprod` et `hold-prod` sont indépendantes du job `build-app` (pas de dépendance). Dans GitHub Actions, le job `deploy` a une dépendance explicite sur `test` — le déploiement ne peut pas démarrer si les tests échouent.
