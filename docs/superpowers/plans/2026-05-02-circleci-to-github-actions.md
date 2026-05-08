# CircleCI → GitHub Actions Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrer les workflows CircleCI (tests + déploiements Lambda AWS) vers GitHub Actions.

**Architecture:** Deux workflows — `ci.yml` pour les tests automatiques sur chaque push, `deploy.yml` pour les déploiements manuels via `workflow_dispatch` avec approbation via GitHub Environments. Le script de déploiement est déplacé de `.circleci/` vers `scripts/`.

**Tech Stack:** GitHub Actions, Node 14, Yarn, AWS CLI, AWS Lambda, S3

---

### Task 1: Créer la branche

**Files:**
- Aucun fichier modifié

- [ ] **Step 1: Créer et basculer sur la branche**

```bash
git checkout -b feat/circleci-to-github-actions
```

Expected: `Switched to a new branch 'feat/circleci-to-github-actions'`

---

### Task 2: Déplacer le script de déploiement

**Files:**
- Create: `scripts/deploy.sh`

- [ ] **Step 1: Créer le répertoire scripts et copier le script**

Créer `scripts/deploy.sh` avec ce contenu exact :

```bash
#!/usr/bin/env bash

set -o nounset
set -o errexit


current_build="${DEPLOY_FUNCTION}"

zip -r "${current_build}.zip" *.js config node_modules
echo "Checking if function $current_build already exists"
aws lambda list-functions | jq -r --arg CURRENTFUNCTION "$current_build" '.Functions[] | select(.FunctionName==$CURRENTFUNCTION) | .FunctionArn'
echo "Sending zip to S3"
aws s3api put-object --bucket alhau --key "deploy/${current_build}.zip" --body "${current_build}.zip"
echo "Updating function: $current_build"
aws lambda update-function-code --function-name "$current_build" --s3-bucket alhau --s3-key "deploy/${current_build}.zip" --region eu-west-1 --no-publish
```

- [ ] **Step 2: Rendre le script exécutable**

```bash
chmod +x scripts/deploy.sh
```

- [ ] **Step 3: Commit**

```bash
git add scripts/deploy.sh
git commit -m "chore: move deploy script from .circleci to scripts/"
```

---

### Task 3: Créer le workflow CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Créer le fichier `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches:
      - '**'

jobs:
  test:
    runs-on: ubuntu-latest
    env:
      APP_ENV: test
      CRYPTOPASS: 'circleci oauth'
      PROD_MODE: false
      INSTANCE_NAME: dev
      MYSQL_ADDON_HOST: localhost
      MYSQL_ADDON_PORT: '3306'
      MYSQL_ADDON_DB: alexa_oauth
      METRICS_HOST: no.host
      METRICS_PORT: 2003
      METRICS_UDP_PORT: 8124
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '14'
          cache: 'yarn'
      - run: yarn install
      - run: yarn test
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions CI workflow"
```

---

### Task 4: Créer le workflow de déploiement

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Créer le fichier `.github/workflows/deploy.yml`**

```yaml
name: Deploy

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environnement cible'
        required: true
        default: 'preprod'
        type: choice
        options:
          - preprod
          - prod

jobs:
  test:
    runs-on: ubuntu-latest
    env:
      APP_ENV: test
      CRYPTOPASS: 'circleci oauth'
      PROD_MODE: false
      INSTANCE_NAME: dev
      MYSQL_ADDON_HOST: localhost
      MYSQL_ADDON_PORT: '3306'
      MYSQL_ADDON_DB: alexa_oauth
      METRICS_HOST: no.host
      METRICS_PORT: 2003
      METRICS_UDP_PORT: 8124
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '14'
          cache: 'yarn'
      - run: yarn install
      - run: yarn test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment }}
    env:
      DEPLOY_FUNCTION: ${{ github.event.inputs.environment == 'prod' && 'ludohomekit' || 'alhau_preprod' }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '14'
          cache: 'yarn'
      - run: yarn install --production
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_DEFAULT_REGION }}
      - run: sh ./scripts/deploy.sh
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Actions deploy workflow"
```

---

### Task 5: Pousser la branche et créer la PR

- [ ] **Step 1: Pousser la branche**

```bash
git push -u origin feat/circleci-to-github-actions
```

- [ ] **Step 2: Créer la PR**

```bash
gh pr create \
  --title "ci: migrate CircleCI to GitHub Actions" \
  --body "..."
```

---

## Configuration GitHub requise (post-merge)

Avant d'utiliser le workflow de déploiement, créer deux environnements dans **Settings → Environments** :
- `preprod` : ajouter les reviewers requis
- `prod` : ajouter les reviewers requis

Puis configurer les secrets dans **Settings → Secrets → Actions** :
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_DEFAULT_REGION`
