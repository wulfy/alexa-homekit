# New Relic Dashboard via Terraform — Design

**Date** : 2026-05-09
**Branche cible** : nouvelle branche basée sur `master`
**Livrable** : PR GitHub introduisant la gestion d'un dashboard New Relic en Terraform

## 1. Objectif et motivation

Suivre les données envoyées par le projet `alexa-homekit` à New Relic dans un dashboard versionné en code (IaC) plutôt que cliqué dans l'UI. Objectifs secondaires :

- **Apprentissage Terraform** par l'utilisateur — les fichiers doivent être idiomatiques et commentés sur le *pourquoi*, pas seulement le *quoi*.
- **Reproductibilité** — recréer le dashboard depuis zéro doit prendre une commande.
- **Revue par PR** — toute modification de dashboard passe par un `terraform plan` commenté automatiquement sur la PR.

## 2. Contexte télémétrie

L'application Lambda envoie deux familles de données à New Relic :

**APM standard** via `require('newrelic')` dans `index.js:1` (agent Node.js v13.19.2) :
- Transactions (durée, throughput, erreurs)
- Métadonnées Lambda (cold starts, invocations, fonctions)
- Distributed tracing activé

**Métriques custom** via `config/metrics.js:18` et `:21`, préfixe `Custom/lambda.alhau.<INSTANCE_NAME>/` :

| Pattern | Source | Type |
|---|---|---|
| `request.<Alexa.Namespace>.<name>` | `index.js:20` | counter |
| `request.<Alexa.Namespace>.<name>` | `index.js:161` | timing (ms) |
| `calls.answer.<name>` | `domoticzApiHelper.js:50` | counter |
| `calls.command.<deviceSubtype>` | `domoticz.js:133` | counter |
| `calls.database.getUserData` | `config/database.js:51` | counter |

**Lambdas concernées** :
- Production : `ludohomekit` en `eu-west-1`
- Préprod : `alhau_preprod` en `eu-west-1`
- New Relic app name (commun) : `alexa-homekit`
- Variable d'instance distinctive : `INSTANCE_NAME` (env var, non standardisée)

## 3. Décisions structurelles

| Décision | Choix | Justification |
|---|---|---|
| Backend Terraform | S3 + lockfile natif (`use_lockfile = true`) | Free tier AWS, pas de DynamoDB à maintenir, idiomatique Terraform 1.10+ |
| Bootstrap du bucket | Module Terraform séparé (`bootstrap/`) avec state local | Évite l'œuf-poule sans doc manuelle ; pédagogique sur le concept "deux états distincts" |
| Trigger apply | `terraform plan` auto sur PR + apply manuel via `workflow_dispatch` | Compromis sécurité/automatisation ; pas d'apply auto sur master |
| Structure du dashboard | Un seul dashboard avec variable de filtre `instance` (prod/preprod) | Maintenance simple, switch visuel rapide entre envs |
| Organisation des fichiers | Root + child module (`modules/alhau-dashboard`) | Choix pédagogique pour apprendre le pattern modules même si overkill pour un seul consommateur |
| Partage variables non-secrètes | `.envrc.example` (direnv, `TF_VAR_*`) **et** `shared.tfvars.example` (flag `-var-file`) | Démontre les deux patterns courants ; README explique quand utiliser quoi |
| Tokens / secrets | Variables d'environnement uniquement (`AWS_*`, `NEW_RELIC_*`) — jamais en `.tf` ou `.tfvars` | Pratique standard ; les providers les lisent automatiquement |

## 4. Architecture des fichiers

```
terraform/
├── README.md                            # Procédure bootstrap + plan + apply
├── .envrc.example                       # AWS_*, NEW_RELIC_*, TF_VAR_*
├── shared.tfvars.example                # account_id, région, lambda names
├── bootstrap/                           # State LOCAL — exécuté une seule fois
│   ├── versions.tf
│   ├── main.tf                          # bucket S3 + versioning + encryption + PAB + lifecycle
│   ├── variables.tf                     # bucket_name, region
│   ├── outputs.tf                       # bucket_name, region (à recopier dans dashboard/backend.tf)
│   └── terraform.tfvars.example
└── dashboard/                           # State DISTANT (S3)
    ├── versions.tf                      # Terraform 1.10+, providers AWS + newrelic
    ├── backend.tf                       # backend "s3" avec use_lockfile = true
    ├── providers.tf                     # provider "newrelic" (région EU)
    ├── main.tf                          # appelle ./modules/alhau-dashboard
    ├── variables.tf                     # nr_account_id, lambda names, dashboard_name
    ├── outputs.tf                       # URL du dashboard
    ├── terraform.tfvars.example
    └── modules/
        └── alhau-dashboard/
            ├── versions.tf
            ├── variables.tf             # account_id, dashboard_name, lambda names, app_name
            ├── main.tf                  # ressource newrelic_one_dashboard (config globale + variables)
            ├── pages.tf                 # 4 pages : Lambda Health, Alexa Traffic, Business, Logs
            ├── outputs.tf               # permalink du dashboard
            └── README.md                # documente les inputs/outputs du module
```

`.gitignore` ajoutera : `.envrc`, `terraform.tfvars`, `*.auto.tfvars`, `terraform/bootstrap/.terraform/`, `terraform/bootstrap/terraform.tfstate*`, `terraform/dashboard/.terraform/`, `*.tfplan`.

## 5. Détail du module `bootstrap/`

**Ressources créées** :
- `aws_s3_bucket` — nom passé en variable, ex: `alhau-tfstate`
- `aws_s3_bucket_versioning` (Enabled) — permet la récupération en cas de state corrompu
- `aws_s3_bucket_server_side_encryption_configuration` — AES256 (gratuit, pas de KMS)
- `aws_s3_bucket_public_access_block` — bloque les 4 dimensions d'accès public
- `aws_s3_bucket_lifecycle_configuration` — purge des versions non-courantes après 90 jours

**State** : local, dans `terraform/bootstrap/terraform.tfstate`. Ce fichier est **gitignored**. Le bucket existe une fois pour toute l'histoire du projet ; perdre ce state n'a pas de conséquence majeure (le bucket peut être ré-importé via `terraform import`).

**Outputs** : `bucket_name`, `region`. À recopier manuellement dans `dashboard/backend.tf` (les blocks `backend` ne supportent pas les variables Terraform — c'est une limitation connue).

## 6. Détail du module `dashboard/` (root)

### `backend.tf`

```hcl
terraform {
  backend "s3" {
    bucket       = "alhau-tfstate"   # valeur recopiée du bootstrap output
    key          = "newrelic-dashboard/terraform.tfstate"
    region       = "eu-west-1"
    use_lockfile = true              # Terraform 1.10+ : remplace DynamoDB
    encrypt      = true
  }
}
```

### `providers.tf`

```hcl
provider "newrelic" {
  account_id = var.nr_account_id
  region     = "EU"
  # api_key lu depuis NEW_RELIC_API_KEY (env var)
}
```

### `main.tf`

```hcl
module "alhau_dashboard" {
  source              = "./modules/alhau-dashboard"
  account_id          = var.nr_account_id
  dashboard_name      = var.dashboard_name        # défaut "ALHAU — Alexa HomeKit"
  newrelic_app_name   = var.newrelic_app_name     # défaut "alexa-homekit"
  lambda_prod_name    = var.lambda_prod_name      # défaut "ludohomekit"
  lambda_preprod_name = var.lambda_preprod_name   # défaut "alhau_preprod"
  metric_namespace    = var.metric_namespace      # défaut "lambda.alhau"
}
```

## 7. Détail du child module `modules/alhau-dashboard/`

Ressource principale : `newrelic_one_dashboard`.

**Configuration globale** :
- `name` : depuis `var.dashboard_name`
- `permissions` : `public_read_only` (libre à toi de changer)
- **Variable de filtre dashboard** `instance` : type `enum`, valeurs `["preprod", "prod"]`, default `prod`. Cette variable se propage dans le NRQL de chaque widget via `{{ instance }}`.

### Page 1 — Lambda Health (5 widgets)

| Titre | Type | Requête NRQL (account_id passé en argument du widget) |
|---|---|---|
| Invocations | `widget_line` | `FROM AwsLambdaInvocation SELECT count(*) WHERE provider.functionName IN ({{ list lambdas }}) TIMESERIES` |
| Taux d'erreurs | `widget_billboard` | `FROM AwsLambdaInvocation SELECT percentage(count(*), WHERE error IS true)` |
| Durée p50/p95/p99 | `widget_line` | `FROM Transaction SELECT percentile(duration, 50, 95, 99) WHERE appName = '{{ var.newrelic_app_name }}' TIMESERIES` |
| Cold starts | `widget_line` | `FROM AwsLambdaInvocation SELECT count(*) WHERE provider.coldStart IS true TIMESERIES` |
| Erreurs récentes | `widget_table` | `FROM TransactionError SELECT timestamp, error.message, error.class WHERE appName = '{{ var.newrelic_app_name }}' LIMIT 50` |

### Page 2 — Alexa Traffic (4 widgets)

| Titre | Type | Logique |
|---|---|---|
| Volume requêtes par directive | `widget_stacked_bar` | metric timeslices `request.*` avec FACET sur `metricTimesliceName` |
| Top 10 directives | `widget_pie` | top 10 par sum, même périmètre |
| Latence p95 par directive | `widget_line` | `percentile(newrelic.timeslice.value, 95)` sur les mêmes métriques |
| Discovery vs Commandes | `widget_area` | deux séries : Discovery seul vs reste des directives |

### Page 3 — Activité métier (4 widgets)

| Titre | Type | Logique |
|---|---|---|
| Commandes Domoticz par sous-type | `widget_bar` | `calls.command.*` FACET sous-type |
| Top devices commandés | `widget_pie` | top 10 |
| Lookups DB / heure | `widget_line` | `calls.database.getUserData` TIMESERIES |
| Réponses Alexa par type | `widget_stacked_bar` | `calls.answer.*` FACET name |

### Page 4 — Logs (3 widgets)

| Titre | Type | Logique |
|---|---|---|
| Volume logs par niveau | `widget_line` | `FROM Log SELECT count(*) FACET level TIMESERIES` |
| Logs ERROR récents | `widget_log_table` | `FROM Log SELECT timestamp, message WHERE level = 'error' LIMIT 100` |
| Recherche full-text | `widget_log_table` | requête générique paramétrable manuellement |

**Note technique** : les métriques custom de `metrics.js` sont publiées en **metric timeslice data** (via `incrementMetric`/`recordMetric`). Elles s'interrogent en NRQL via `FROM Metric WHERE metricTimesliceName = '...'`. Ce point sera documenté dans le README du module pour éviter les confusions avec les Custom Events (qui auraient une syntaxe différente).

## 8. CI/CD — GitHub Actions

### `.github/workflows/terraform-plan.yml`

- **Trigger** : `pull_request` avec `paths: terraform/dashboard/**`
- **Étapes** :
  1. `actions/checkout@v4`
  2. `hashicorp/setup-terraform@v3` (version pinned 1.10+)
  3. `terraform fmt -check -recursive`
  4. `terraform init` (avec backend S3 — credentials via `aws-actions/configure-aws-credentials@v4`)
  5. `terraform validate`
  6. `terraform plan -no-color -out=tfplan`
  7. Commentaire de la PR avec `actions/github-script@v7` — bloc dépliable contenant le plan

### `.github/workflows/terraform-apply.yml`

- **Trigger** : `workflow_dispatch` (manuel)
- **Étapes** : init + validate + `apply -auto-approve`
- **Output** : URL du dashboard dans le résumé du run

### Secrets à configurer dans GitHub

À documenter dans le README, **non créés par Terraform** :

| Secret | Usage |
|---|---|
| `AWS_ACCESS_KEY_ID` (existant) | Backend S3 |
| `AWS_SECRET_ACCESS_KEY` (existant) | Backend S3 |
| `AWS_DEFAULT_REGION` (existant) | Backend S3 |
| `NEW_RELIC_API_KEY` (à créer) | Provider New Relic — User API Key, distincte de la License Key |
| `NEW_RELIC_ACCOUNT_ID` (à créer) | Provider New Relic |

## 9. Documentation utilisateur (`terraform/README.md`)

Le README couvrira :

1. **Vue d'ensemble** — diagramme des deux états (bootstrap local + dashboard distant)
2. **Prérequis** — Terraform 1.10+, AWS CLI configuré, compte NR avec User API Key
3. **First-time bootstrap** — séquence pas à pas :
   ```
   cd terraform/bootstrap
   cp terraform.tfvars.example terraform.tfvars
   # éditer
   terraform init
   terraform apply
   # noter les outputs (bucket_name)
   # éditer terraform/dashboard/backend.tf avec ces valeurs
   ```
4. **Apply régulier du dashboard** — manuel local OU via workflow GitHub
5. **Patterns de variables expliqués** — `.envrc` (direnv) vs `shared.tfvars` (flag explicite)
6. **Modifier le dashboard** — édition des fichiers, plan via PR, apply via workflow_dispatch
7. **Debug NRQL** — pointe vers New Relic Query Builder pour valider les requêtes avant edit Terraform

## 10. Ce qui n'est PAS dans le scope

- **Création du compte New Relic** (présumé existant)
- **Création des secrets GitHub** (manuelle)
- **Alerting / synthetic monitoring** — uniquement le dashboard
- **Drift detection automatique** (cron de re-plan)
- **Modules Terraform pour gérer la Lambda elle-même** — `serverless.yml` reste en charge
- **Modification du code app** — aucune nouvelle métrique custom ajoutée ; on visualise ce qui existe
- **Tests automatisés Terraform** (terratest) — overkill pour ce scope

## 11. Risques et limitations connus

- **Première PR : le workflow `terraform-plan` va échouer** — il fait `terraform init` qui nécessite que le bucket S3 existe. Le bootstrap doit être exécuté en local **avant** que la PR initiale soit mergée. Mitigation : la description de PR documentera ce prérequis ; on peut aussi ajouter un `if: github.event.pull_request.head.ref != 'chore/init-terraform-...'` pour skip la branche d'init, mais on accepte l'échec visible comme indication explicite que le bootstrap est nécessaire.
- **Secrets New Relic absents au moment de la PR** — `NEW_RELIC_API_KEY` et `NEW_RELIC_ACCOUNT_ID` doivent être créés en GitHub Secrets *avant* le premier run de workflow ; sinon `terraform init` du provider échoue. À documenter en tête de PR.
- **Validité des requêtes NRQL** : les `metricTimesliceName` exacts dépendent de la façon dont l'agent New Relic publie les métriques. Une ou deux requêtes peuvent nécessiter un ajustement après le premier `apply`. Mitigation : le README guide vers le Query Builder NR pour valider.
- **Le bloc `backend` ne supporte pas les variables Terraform** — le `bucket` du dashboard est une string en dur, recopiée du bootstrap output. C'est une limitation Terraform, pas une erreur de design.
- **Pas de drift detection** — si quelqu'un édite le dashboard dans l'UI NR, la dérive ne sera détectée qu'au prochain `plan` manuel.
- **Free tier AWS** : la lifecycle policy purge à 90 jours pour rester sous les limites. Surveiller si le projet grossit.

## 12. Définition de "fait"

- [ ] Branche créée depuis `master`
- [ ] Tous les fichiers `terraform/` listés en section 4 présents
- [ ] `terraform fmt` et `validate` passent sur les deux dossiers
- [ ] `.gitignore` mis à jour
- [ ] Workflows GitHub Actions présents et syntaxiquement valides
- [ ] README documente la procédure complète
- [ ] PR ouverte vers `master` avec description explicite des étapes manuelles requises (création secrets NR, premier bootstrap)
