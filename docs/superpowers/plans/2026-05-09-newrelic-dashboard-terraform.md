# New Relic Dashboard via Terraform — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Manage a New Relic dashboard for the `alexa-homekit` Lambda as Terraform code, with an S3-backed state, a CI plan-on-PR workflow, and a manual apply workflow.

**Architecture:** Two Terraform root modules. `terraform/bootstrap/` (state local) creates the S3 bucket. `terraform/dashboard/` (state distant via backend `s3` + native lockfile) calls a child module `modules/alhau-dashboard/` which defines the `newrelic_one_dashboard` resource (4 pages × 16 widgets, with an `instance` filter variable). GitHub Actions runs `terraform plan` on PRs touching `terraform/dashboard/**`, and `terraform apply` on `workflow_dispatch`.

**Tech Stack:** Terraform `>= 1.10`, provider `hashicorp/aws ~> 5.50`, provider `newrelic/newrelic ~> 3.50`, GitHub Actions (`hashicorp/setup-terraform@v3`, `aws-actions/configure-aws-credentials@v4`).

**Reference spec:** `docs/superpowers/specs/2026-05-09-newrelic-dashboard-terraform-design.md`

**Branch:** `feat/newrelic-dashboard-terraform` (already created from `master`, spec already committed there).

---

## File map

```
.gitignore                                      # MODIFY — add Terraform artifacts
.github/workflows/terraform-plan.yml            # CREATE
.github/workflows/terraform-apply.yml           # CREATE
terraform/README.md                             # CREATE
terraform/.envrc.example                        # CREATE
terraform/shared.tfvars.example                 # CREATE
terraform/bootstrap/versions.tf                 # CREATE
terraform/bootstrap/variables.tf                # CREATE
terraform/bootstrap/main.tf                     # CREATE
terraform/bootstrap/outputs.tf                  # CREATE
terraform/bootstrap/terraform.tfvars.example    # CREATE
terraform/dashboard/versions.tf                 # CREATE
terraform/dashboard/backend.tf                  # CREATE
terraform/dashboard/providers.tf                # CREATE
terraform/dashboard/variables.tf                # CREATE
terraform/dashboard/outputs.tf                  # CREATE
terraform/dashboard/main.tf                     # CREATE
terraform/dashboard/terraform.tfvars.example    # CREATE
terraform/dashboard/modules/alhau-dashboard/versions.tf   # CREATE
terraform/dashboard/modules/alhau-dashboard/variables.tf  # CREATE
terraform/dashboard/modules/alhau-dashboard/main.tf       # CREATE
terraform/dashboard/modules/alhau-dashboard/pages.tf      # CREATE
terraform/dashboard/modules/alhau-dashboard/outputs.tf    # CREATE
terraform/dashboard/modules/alhau-dashboard/README.md     # CREATE
```

**Note on `pages.tf` vs `main.tf` in the child module** — the `newrelic_one_dashboard` resource contains all `page` blocks; we host it in `pages.tf` for readability. `main.tf` of the child module hosts only `locals` (NRQL building blocks shared between widgets). This keeps the long resource isolated.

---

## Task 1 — Update `.gitignore` for Terraform artifacts

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Append Terraform-related ignores**

Read the current `.gitignore` and append the block below at the end:

```
# Terraform
**/.terraform/
**/.terraform.lock.hcl
**/terraform.tfstate
**/terraform.tfstate.backup
**/terraform.tfvars
**/*.auto.tfvars
**/.envrc
**/*.tfplan
**/crash.log
**/crash.*.log
```

We **do** want to commit `versions.tf` and module sources but **not** lock files (`.terraform.lock.hcl`) for now — they will be regenerated on each `init`. (For production-grade pinning we'd commit them, but for this learning project we keep things simple.)

- [ ] **Step 2: Verify**

Run: `git diff .gitignore`
Expected: only the appended Terraform block is shown.

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore: ignore Terraform state, plans and tfvars"
```

---

## Task 2 — Bootstrap module: scaffold files

**Files:**
- Create: `terraform/bootstrap/versions.tf`
- Create: `terraform/bootstrap/variables.tf`
- Create: `terraform/bootstrap/terraform.tfvars.example`

- [ ] **Step 1: Write `terraform/bootstrap/versions.tf`**

```hcl
# Pinning Terraform and provider versions guarantees reproducible runs.
# We require >= 1.10 because the dashboard root module uses native S3 state
# locking (use_lockfile), introduced in Terraform 1.10. This bootstrap module
# does not strictly need 1.10 itself, but we align all modules on the same
# minimum version for simplicity.
terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50"
    }
  }
}

# AWS credentials and region are read from the standard AWS env vars or
# ~/.aws/credentials. Region can also be overridden via the `region` input
# variable to avoid relying on shell configuration.
provider "aws" {
  region = var.region
}
```

- [ ] **Step 2: Write `terraform/bootstrap/variables.tf`**

```hcl
variable "bucket_name" {
  description = "Name of the S3 bucket that will host the dashboard module's tfstate. Must be globally unique across AWS."
  type        = string
}

variable "region" {
  description = "AWS region in which the bucket is created. Should match the dashboard module's backend region."
  type        = string
  default     = "eu-west-1"
}

variable "lifecycle_noncurrent_days" {
  description = "Number of days a noncurrent version of an object is kept before being permanently deleted. Lower values save storage cost but reduce the recovery window."
  type        = number
  default     = 90
}
```

- [ ] **Step 3: Write `terraform/bootstrap/terraform.tfvars.example`**

```hcl
# Copy this file to terraform.tfvars (gitignored) before running `terraform apply`.
# The bucket name must be globally unique across AWS.
bucket_name = "alhau-tfstate"
region      = "eu-west-1"
```

- [ ] **Step 4: Commit**

```bash
git add terraform/bootstrap/versions.tf terraform/bootstrap/variables.tf terraform/bootstrap/terraform.tfvars.example
git commit -m "feat(terraform): scaffold bootstrap module (versions, variables)"
```

---

## Task 3 — Bootstrap module: S3 bucket and security configuration

**Files:**
- Create: `terraform/bootstrap/main.tf`

- [ ] **Step 1: Write `terraform/bootstrap/main.tf`**

```hcl
# This module's only job is to create the S3 bucket that will host the
# *other* root module's tfstate. It uses a LOCAL state file (gitignored)
# because it must run before any remote state exists.
#
# We split the bucket configuration across several resources because the
# AWS provider has dedicated resources for each S3 feature (versioning,
# encryption, public access block, lifecycle). This is the modern,
# idiomatic style — older Terraform code often had inline blocks on
# aws_s3_bucket itself, but those are deprecated in provider v4+.

resource "aws_s3_bucket" "tfstate" {
  bucket = var.bucket_name

  tags = {
    Project     = "alexa-homekit"
    ManagedBy   = "terraform"
    Purpose     = "tfstate-storage"
  }
}

# Versioning protects us from accidental state corruption: if a faulty
# apply writes a broken state, we can roll back to a previous version.
resource "aws_s3_bucket_versioning" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Server-side encryption with AES-256 is free (no KMS key needed).
# We do NOT use a KMS key because that would incur monthly cost and
# add complexity for a personal project. AES-256 is sufficient for
# tfstate encryption at rest.
resource "aws_s3_bucket_server_side_encryption_configuration" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block all forms of public access. Tfstate may contain sensitive data
# (resource attributes, sometimes credentials in older provider versions)
# so it MUST never be reachable from the public internet.
resource "aws_s3_bucket_public_access_block" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Purge noncurrent versions after N days to keep storage costs minimal.
# This is fine because we only need enough history to recover from a
# botched apply within a reasonable window.
resource "aws_s3_bucket_lifecycle_configuration" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  # The lifecycle rule depends on versioning being enabled first.
  depends_on = [aws_s3_bucket_versioning.tfstate]

  rule {
    id     = "expire-old-versions"
    status = "Enabled"

    filter {}

    noncurrent_version_expiration {
      noncurrent_days = var.lifecycle_noncurrent_days
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add terraform/bootstrap/main.tf
git commit -m "feat(terraform): bootstrap creates encrypted versioned S3 bucket"
```

---

## Task 4 — Bootstrap module: outputs

**Files:**
- Create: `terraform/bootstrap/outputs.tf`

- [ ] **Step 1: Write `terraform/bootstrap/outputs.tf`**

```hcl
# These outputs are printed at the end of `terraform apply` and must be
# manually copied into terraform/dashboard/backend.tf, because the `backend`
# block does NOT support variables (a known Terraform limitation).

output "bucket_name" {
  description = "Name of the bucket. Copy into terraform/dashboard/backend.tf as the `bucket` argument."
  value       = aws_s3_bucket.tfstate.id
}

output "region" {
  description = "Region of the bucket. Copy into terraform/dashboard/backend.tf as the `region` argument."
  value       = var.region
}

output "post_apply_instructions" {
  description = "What to do after applying this module."
  value       = <<-EOT
    Bootstrap complete. Next steps:

      1. Edit terraform/dashboard/backend.tf and set:
         - bucket = "${aws_s3_bucket.tfstate.id}"
         - region = "${var.region}"

      2. cd terraform/dashboard && terraform init
  EOT
}
```

- [ ] **Step 2: Commit**

```bash
git add terraform/bootstrap/outputs.tf
git commit -m "feat(terraform): expose bootstrap outputs with handoff instructions"
```

---

## Task 5 — Bootstrap module: validate locally

**Files:** none modified — verification only.

- [ ] **Step 1: Format check**

Run: `terraform -chdir=terraform/bootstrap fmt -check -diff`
Expected: no output, exit 0. If it fails, run `terraform -chdir=terraform/bootstrap fmt` and re-run the check, then `git add` the reformatted files and amend nothing — commit them as a fix on top.

- [ ] **Step 2: Init & validate**

Run: `terraform -chdir=terraform/bootstrap init -backend=false`
Expected: providers downloaded, `Terraform has been successfully initialized!`

Run: `terraform -chdir=terraform/bootstrap validate`
Expected: `Success! The configuration is valid.`

- [ ] **Step 3: Clean local init artifacts**

The `.terraform/` directory created by `init` is already gitignored, so nothing to do — just confirm `git status` is clean.

Run: `git status`
Expected: nothing to commit (working tree clean) OR only untracked `.terraform*` files which are gitignored.

---

## Task 6 — Dashboard root module: versions, providers, backend

**Files:**
- Create: `terraform/dashboard/versions.tf`
- Create: `terraform/dashboard/backend.tf`
- Create: `terraform/dashboard/providers.tf`

- [ ] **Step 1: Write `terraform/dashboard/versions.tf`**

```hcl
# We require >= 1.10 because we use native S3 state locking
# (use_lockfile attribute on the S3 backend, GA in Terraform 1.10).
# Before 1.10 we would have needed a DynamoDB table for locking.
terraform {
  required_version = ">= 1.10"

  required_providers {
    newrelic = {
      source  = "newrelic/newrelic"
      version = "~> 3.50"
    }
  }
}
```

- [ ] **Step 2: Write `terraform/dashboard/backend.tf`**

```hcl
# Remote state stored in the S3 bucket created by the bootstrap module.
#
# IMPORTANT: the `backend` block does not support variables — these
# values are recopied manually from the bootstrap outputs.
#
# `use_lockfile = true` (Terraform 1.10+) enables native S3 state locking.
# A `.tflock` file is created next to the state during apply, removing the
# need for a DynamoDB table. This is the modern, recommended pattern.
terraform {
  backend "s3" {
    bucket       = "alhau-tfstate"
    key          = "newrelic-dashboard/terraform.tfstate"
    region       = "eu-west-1"
    use_lockfile = true
    encrypt      = true
  }
}
```

- [ ] **Step 3: Write `terraform/dashboard/providers.tf`**

```hcl
# The New Relic provider authenticates via env vars by default:
#   - NEW_RELIC_API_KEY (User API key, distinct from the License Key
#     used by the runtime agent)
#   - NEW_RELIC_REGION (US or EU — set to "EU" for European accounts)
#
# We pass `account_id` explicitly so it is documented in code and
# can come from the shared.tfvars (.envrc TF_VAR_nr_account_id) without
# leaking into the rest of the codebase.
provider "newrelic" {
  account_id = var.nr_account_id
  region     = var.nr_region
}
```

- [ ] **Step 4: Commit**

```bash
git add terraform/dashboard/versions.tf terraform/dashboard/backend.tf terraform/dashboard/providers.tf
git commit -m "feat(terraform): dashboard root module versions, S3 backend and provider"
```

---

## Task 7 — Dashboard root module: variables and tfvars example

**Files:**
- Create: `terraform/dashboard/variables.tf`
- Create: `terraform/dashboard/terraform.tfvars.example`

- [ ] **Step 1: Write `terraform/dashboard/variables.tf`**

```hcl
variable "nr_account_id" {
  description = "New Relic account ID. Found in the URL of one.eu.newrelic.com (e.g. /account/<id>)."
  type        = number
}

variable "nr_region" {
  description = "New Relic region. \"EU\" for European accounts (one.eu.newrelic.com), \"US\" otherwise."
  type        = string
  default     = "EU"

  validation {
    condition     = contains(["US", "EU"], var.nr_region)
    error_message = "nr_region must be \"US\" or \"EU\"."
  }
}

variable "dashboard_name" {
  description = "Display name of the dashboard in New Relic One."
  type        = string
  default     = "ALHAU — Alexa HomeKit"
}

variable "newrelic_app_name" {
  description = "Name of the New Relic APM application as seen in NR One. Must match NEW_RELIC_APP_NAME of the running Lambda."
  type        = string
  default     = "alexa-homekit"
}

variable "lambda_prod_name" {
  description = "AWS Lambda function name for the prod environment."
  type        = string
  default     = "ludohomekit"
}

variable "lambda_preprod_name" {
  description = "AWS Lambda function name for the preprod environment."
  type        = string
  default     = "alhau_preprod"
}

variable "metric_namespace" {
  description = "Prefix used by the app's custom metrics, e.g. 'lambda.alhau' (the per-instance suffix is added automatically by config/metrics.js)."
  type        = string
  default     = "lambda.alhau"
}
```

- [ ] **Step 2: Write `terraform/dashboard/terraform.tfvars.example`**

```hcl
# Copy this file to terraform.tfvars (gitignored) and fill in your values.
# Alternatively, use TF_VAR_<name> env vars or the shared.tfvars at the
# parent terraform/ folder via -var-file=../shared.tfvars.

nr_account_id = 1234567
# nr_region   = "EU"   # default — uncomment to override
# dashboard_name      = "ALHAU — Alexa HomeKit"
# newrelic_app_name   = "alexa-homekit"
# lambda_prod_name    = "ludohomekit"
# lambda_preprod_name = "alhau_preprod"
# metric_namespace    = "lambda.alhau"
```

- [ ] **Step 3: Commit**

```bash
git add terraform/dashboard/variables.tf terraform/dashboard/terraform.tfvars.example
git commit -m "feat(terraform): dashboard root variables and tfvars example"
```

---

## Task 8 — Dashboard root module: main.tf and outputs.tf

**Files:**
- Create: `terraform/dashboard/main.tf`
- Create: `terraform/dashboard/outputs.tf`

- [ ] **Step 1: Write `terraform/dashboard/main.tf`**

```hcl
# The root module's job is to wire variables into the child module that
# actually defines the dashboard. Keeping the root thin (just the module
# call + provider config) is a common pattern: the root deals with
# "deployment context" (account, env), the child module deals with
# "what the dashboard looks like".

module "alhau_dashboard" {
  source = "./modules/alhau-dashboard"

  account_id          = var.nr_account_id
  dashboard_name      = var.dashboard_name
  newrelic_app_name   = var.newrelic_app_name
  lambda_prod_name    = var.lambda_prod_name
  lambda_preprod_name = var.lambda_preprod_name
  metric_namespace    = var.metric_namespace
}
```

- [ ] **Step 2: Write `terraform/dashboard/outputs.tf`**

```hcl
output "dashboard_permalink" {
  description = "Direct URL to the dashboard in New Relic One. Open this after `apply` to verify the result."
  value       = module.alhau_dashboard.permalink
}

output "dashboard_guid" {
  description = "Entity GUID of the dashboard, useful if you later want to link other resources (alerts, etc.) to it."
  value       = module.alhau_dashboard.guid
}
```

- [ ] **Step 3: Commit**

```bash
git add terraform/dashboard/main.tf terraform/dashboard/outputs.tf
git commit -m "feat(terraform): wire root module to child dashboard module"
```

---

## Task 9 — Child module: scaffold (versions, variables, outputs)

**Files:**
- Create: `terraform/dashboard/modules/alhau-dashboard/versions.tf`
- Create: `terraform/dashboard/modules/alhau-dashboard/variables.tf`
- Create: `terraform/dashboard/modules/alhau-dashboard/outputs.tf`

- [ ] **Step 1: Write `versions.tf`**

```hcl
# Child modules declare provider *requirements* (compatibility) but inherit
# provider *configuration* from the caller. We pin the same version range
# as the root to keep them aligned.
terraform {
  required_version = ">= 1.10"

  required_providers {
    newrelic = {
      source  = "newrelic/newrelic"
      version = "~> 3.50"
    }
  }
}
```

- [ ] **Step 2: Write `variables.tf`**

```hcl
variable "account_id" {
  description = "New Relic account ID, used by every NRQL widget."
  type        = number
}

variable "dashboard_name" {
  description = "Display name of the dashboard."
  type        = string
}

variable "newrelic_app_name" {
  description = "APM application name (matches NEW_RELIC_APP_NAME)."
  type        = string
}

variable "lambda_prod_name" {
  description = "AWS Lambda function name for prod."
  type        = string
}

variable "lambda_preprod_name" {
  description = "AWS Lambda function name for preprod."
  type        = string
}

variable "metric_namespace" {
  description = "Custom metric namespace used by config/metrics.js (e.g. 'lambda.alhau')."
  type        = string
}
```

- [ ] **Step 3: Write `outputs.tf`**

```hcl
output "permalink" {
  description = "URL of the dashboard in New Relic One."
  value       = newrelic_one_dashboard.alhau.permalink
}

output "guid" {
  description = "Entity GUID of the dashboard."
  value       = newrelic_one_dashboard.alhau.guid
}
```

- [ ] **Step 4: Commit**

```bash
git add terraform/dashboard/modules/alhau-dashboard/versions.tf terraform/dashboard/modules/alhau-dashboard/variables.tf terraform/dashboard/modules/alhau-dashboard/outputs.tf
git commit -m "feat(terraform): scaffold alhau-dashboard child module"
```

---

## Task 10 — Child module: shared NRQL locals (`main.tf`)

**Files:**
- Create: `terraform/dashboard/modules/alhau-dashboard/main.tf`

- [ ] **Step 1: Write `main.tf`**

```hcl
# Locals used by widgets across pages. Centralizing these strings here
# avoids subtle drift between pages and makes it obvious what query
# fragment is reused where.
#
# Note on metric data shape: the app uses newrelic.incrementMetric() and
# newrelic.recordMetric() (see config/metrics.js). Both publish *metric
# timeslice data*, which is queried in NRQL as:
#
#   FROM Metric WHERE metricTimesliceName LIKE 'Custom/<ns>/<key>'
#   SELECT sum(newrelic.timeslice.value)            -- for counters
#   SELECT percentile(newrelic.timeslice.value, 95) -- for ms timings
#
# This is DIFFERENT from custom events (FROM <EventName> ...).
# If the queries below return no data after `apply`, the most likely
# cause is a mismatch in metricTimesliceName — verify with the New Relic
# Query Builder by running:
#
#   FROM Metric SELECT uniques(metricTimesliceName)
#   WHERE metricTimesliceName LIKE 'Custom/lambda.alhau%' SINCE 1 day ago
#
# and adjust the `like_*` locals below.

locals {
  lambda_function_names = [
    var.lambda_prod_name,
    var.lambda_preprod_name,
  ]

  # NRQL-friendly representation: "'ludohomekit', 'alhau_preprod'"
  lambda_in_clause = join(", ", [for n in local.lambda_function_names : format("'%s'", n)])

  # LIKE patterns for metric timeslices. The `%` after the namespace covers
  # the per-instance suffix (e.g. lambda.alhau.prod, lambda.alhau.preprod).
  like_request  = "Custom/${var.metric_namespace}.%/request.%"
  like_answer   = "Custom/${var.metric_namespace}.%/calls.answer.%"
  like_command  = "Custom/${var.metric_namespace}.%/calls.command.%"
  like_database = "Custom/${var.metric_namespace}.%/calls.database.%"
}
```

- [ ] **Step 2: Commit**

```bash
git add terraform/dashboard/modules/alhau-dashboard/main.tf
git commit -m "feat(terraform): centralize NRQL building blocks as locals"
```

---

## Task 11 — Child module: dashboard resource skeleton + Page 1 (Lambda Health)

**Files:**
- Create: `terraform/dashboard/modules/alhau-dashboard/pages.tf`

- [ ] **Step 1: Write `pages.tf` with the dashboard resource and Page 1**

```hcl
# Single resource holding the whole dashboard. Pages and widgets are nested
# blocks of this resource — there is no way to split them across multiple
# Terraform resources, the New Relic API treats a dashboard as one entity.
#
# We host this resource in pages.tf (rather than main.tf) because main.tf
# is reserved for locals/helpers, keeping each file focused.

resource "newrelic_one_dashboard" "alhau" {
  name        = var.dashboard_name
  permissions = "public_read_only"
  description = "Alexa HomeKit Lambda — health, traffic and business metrics."

  # Dashboard-level variable: lets the user toggle between prod and preprod
  # at the top of the dashboard. Each NRQL query that filters on instance
  # references {{ instance }} (handled below in widgets where appropriate).
  variable {
    name                 = "instance"
    title                = "Environment"
    type                 = "enum"
    replacement_strategy = "default"
    default_values       = ["prod"]
    is_multi_selection   = false

    item {
      title = "prod"
      value = "prod"
    }

    item {
      title = "preprod"
      value = "preprod"
    }
  }

  # ----------------------------------------------------------------------
  # PAGE 1 — Lambda Health
  # APM- and AWS Lambda-level signals: invocations, errors, latency,
  # cold starts. Filtered by Lambda function name (covers both envs).
  # ----------------------------------------------------------------------
  page {
    name = "Lambda Health"

    widget_line {
      title  = "Invocations / 5 min"
      row    = 1
      column = 1
      width  = 4
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM AwsLambdaInvocation SELECT count(*) WHERE provider.functionName IN (${local.lambda_in_clause}) FACET provider.functionName TIMESERIES 5 minutes"
      }
    }

    widget_billboard {
      title  = "Error rate (last hour)"
      row    = 1
      column = 5
      width  = 4
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM AwsLambdaInvocation SELECT percentage(count(*), WHERE error IS true) WHERE provider.functionName IN (${local.lambda_in_clause}) SINCE 1 hour ago"
      }

      warning  = 1
      critical = 5
    }

    widget_line {
      title  = "Cold starts"
      row    = 1
      column = 9
      width  = 4
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM AwsLambdaInvocation SELECT count(*) WHERE provider.coldStart IS true AND provider.functionName IN (${local.lambda_in_clause}) TIMESERIES"
      }
    }

    widget_line {
      title  = "Transaction duration (p50 / p95 / p99)"
      row    = 4
      column = 1
      width  = 8
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Transaction SELECT percentile(duration, 50, 95, 99) WHERE appName = '${var.newrelic_app_name}' TIMESERIES"
      }

      legend_enabled    = true
      y_axis_left_zero  = true
      ignore_time_range = false
    }

    widget_table {
      title  = "Recent errors"
      row    = 4
      column = 9
      width  = 4
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM TransactionError SELECT timestamp, error.message, error.class WHERE appName = '${var.newrelic_app_name}' SINCE 1 day ago LIMIT 50"
      }

      initial_sorting {
        direction = "desc"
        name      = "timestamp"
      }
    }
  }
}
```

- [ ] **Step 2: Verify the file compiles syntactically**

Run: `terraform -chdir=terraform/dashboard/modules/alhau-dashboard fmt -check -diff`
Expected: no output. If formatting differs, run `terraform fmt` and re-check.

- [ ] **Step 3: Commit**

```bash
git add terraform/dashboard/modules/alhau-dashboard/pages.tf
git commit -m "feat(terraform): dashboard resource with Lambda Health page"
```

---

## Task 12 — Child module: add Page 2 (Alexa Traffic)

**Files:**
- Modify: `terraform/dashboard/modules/alhau-dashboard/pages.tf`

- [ ] **Step 1: Append Page 2 inside the `newrelic_one_dashboard` resource, after the Page 1 `page { ... }` block and before the closing `}` of the resource**

```hcl
  # ----------------------------------------------------------------------
  # PAGE 2 — Alexa Traffic
  # Volumes and latency of incoming Alexa directives, broken down by
  # namespace + name (e.g. Alexa.PowerController.TurnOn).
  # ----------------------------------------------------------------------
  page {
    name = "Alexa Traffic"

    widget_stacked_bar {
      title  = "Requests by directive (timeseries)"
      row    = 1
      column = 1
      width  = 8
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Metric SELECT sum(newrelic.timeslice.value) WHERE metricTimesliceName LIKE '${local.like_request}' FACET metricTimesliceName TIMESERIES"
      }
    }

    widget_pie {
      title  = "Top 10 directives (last 24h)"
      row    = 1
      column = 9
      width  = 4
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Metric SELECT sum(newrelic.timeslice.value) WHERE metricTimesliceName LIKE '${local.like_request}' FACET metricTimesliceName SINCE 1 day ago LIMIT 10"
      }
    }

    widget_line {
      title  = "Latency p95 by directive"
      row    = 4
      column = 1
      width  = 8
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Metric SELECT percentile(newrelic.timeslice.value, 95) WHERE metricTimesliceName LIKE '${local.like_request}' FACET metricTimesliceName TIMESERIES"
      }

      legend_enabled    = true
      y_axis_left_zero  = true
      ignore_time_range = false

      units {
        unit = "ms"
      }
    }

    widget_area {
      title  = "Discovery vs Commands"
      row    = 4
      column = 9
      width  = 4
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Metric SELECT sum(newrelic.timeslice.value) AS 'Discovery' WHERE metricTimesliceName LIKE '${local.like_request}' AND metricTimesliceName LIKE '%Discovery%' TIMESERIES"
      }

      nrql_query {
        account_id = var.account_id
        query      = "FROM Metric SELECT sum(newrelic.timeslice.value) AS 'Other directives' WHERE metricTimesliceName LIKE '${local.like_request}' AND metricTimesliceName NOT LIKE '%Discovery%' TIMESERIES"
      }
    }
  }
```

- [ ] **Step 2: Verify formatting**

Run: `terraform -chdir=terraform/dashboard/modules/alhau-dashboard fmt -check -diff`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add terraform/dashboard/modules/alhau-dashboard/pages.tf
git commit -m "feat(terraform): add Alexa Traffic page to dashboard"
```

---

## Task 13 — Child module: add Page 3 (Activité métier)

**Files:**
- Modify: `terraform/dashboard/modules/alhau-dashboard/pages.tf`

- [ ] **Step 1: Append Page 3 after Page 2**

```hcl
  # ----------------------------------------------------------------------
  # PAGE 3 — Activité métier
  # Domain-level signals: which Domoticz device subtypes are commanded,
  # how often the app hits the OAuth/users DB, what kinds of Alexa
  # responses are sent back.
  # ----------------------------------------------------------------------
  page {
    name = "Activité métier"

    widget_bar {
      title  = "Commands by Domoticz subtype"
      row    = 1
      column = 1
      width  = 6
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Metric SELECT sum(newrelic.timeslice.value) WHERE metricTimesliceName LIKE '${local.like_command}' FACET metricTimesliceName SINCE 1 day ago LIMIT 20"
      }

      filter_current_dashboard = true
    }

    widget_pie {
      title  = "Top 10 device subtypes"
      row    = 1
      column = 7
      width  = 6
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Metric SELECT sum(newrelic.timeslice.value) WHERE metricTimesliceName LIKE '${local.like_command}' FACET metricTimesliceName SINCE 1 day ago LIMIT 10"
      }
    }

    widget_line {
      title  = "DB user-data lookups"
      row    = 4
      column = 1
      width  = 6
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Metric SELECT sum(newrelic.timeslice.value) WHERE metricTimesliceName LIKE '${local.like_database}' TIMESERIES"
      }
    }

    widget_stacked_bar {
      title  = "Alexa responses by directive name"
      row    = 4
      column = 7
      width  = 6
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Metric SELECT sum(newrelic.timeslice.value) WHERE metricTimesliceName LIKE '${local.like_answer}' FACET metricTimesliceName TIMESERIES"
      }
    }
  }
```

- [ ] **Step 2: Verify formatting**

Run: `terraform -chdir=terraform/dashboard/modules/alhau-dashboard fmt -check -diff`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add terraform/dashboard/modules/alhau-dashboard/pages.tf
git commit -m "feat(terraform): add Activité métier page (Domoticz / DB / responses)"
```

---

## Task 14 — Child module: add Page 4 (Logs)

**Files:**
- Modify: `terraform/dashboard/modules/alhau-dashboard/pages.tf`

- [ ] **Step 1: Append Page 4 after Page 3**

```hcl
  # ----------------------------------------------------------------------
  # PAGE 4 — Logs
  # Quick triage view. Requires "Logs in Context" or log forwarding to
  # be enabled in the New Relic agent. The error-level table below is
  # the most useful starting point when triaging an incident.
  # ----------------------------------------------------------------------
  page {
    name = "Logs"

    widget_line {
      title  = "Log volume by level"
      row    = 1
      column = 1
      width  = 12
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Log SELECT count(*) WHERE entity.name = '${var.newrelic_app_name}' FACET level TIMESERIES"
      }

      legend_enabled = true
    }

    widget_log_table {
      title  = "Recent ERROR logs"
      row    = 4
      column = 1
      width  = 12
      height = 4

      nrql_query {
        account_id = var.account_id
        query      = "FROM Log SELECT timestamp, message, level WHERE entity.name = '${var.newrelic_app_name}' AND level = 'error' SINCE 1 day ago LIMIT 100"
      }
    }

    widget_log_table {
      title  = "Recent logs (all levels)"
      row    = 8
      column = 1
      width  = 12
      height = 4

      nrql_query {
        account_id = var.account_id
        query      = "FROM Log SELECT timestamp, message, level WHERE entity.name = '${var.newrelic_app_name}' SINCE 1 hour ago LIMIT 200"
      }
    }
  }
```

- [ ] **Step 2: Verify formatting**

Run: `terraform -chdir=terraform/dashboard/modules/alhau-dashboard fmt -check -diff`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add terraform/dashboard/modules/alhau-dashboard/pages.tf
git commit -m "feat(terraform): add Logs page to dashboard"
```

---

## Task 15 — Child module: README

**Files:**
- Create: `terraform/dashboard/modules/alhau-dashboard/README.md`

- [ ] **Step 1: Write `README.md`**

```markdown
# Module `alhau-dashboard`

Defines the New Relic One dashboard for the Alexa HomeKit Lambda.

## Inputs

| Name | Type | Description |
|---|---|---|
| `account_id` | `number` | New Relic account ID used by every NRQL query. |
| `dashboard_name` | `string` | Display name in NR One. |
| `newrelic_app_name` | `string` | APM application name (matches `NEW_RELIC_APP_NAME`). |
| `lambda_prod_name` | `string` | AWS Lambda name (prod). |
| `lambda_preprod_name` | `string` | AWS Lambda name (preprod). |
| `metric_namespace` | `string` | Custom-metric prefix used by `config/metrics.js` (default `lambda.alhau`). |

## Outputs

| Name | Description |
|---|---|
| `permalink` | URL of the dashboard in NR One. |
| `guid` | Entity GUID of the dashboard. |

## Pages

1. **Lambda Health** — APM/Lambda signals: invocations, error rate, latency p50/p95/p99, cold starts, recent errors.
2. **Alexa Traffic** — Requests and latency by Alexa directive (`Alexa.PowerController.TurnOn`, …) based on `Custom/<ns>/request.*` metric timeslices.
3. **Activité métier** — Domoticz commands by subtype, top devices, DB lookups, Alexa response volumes.
4. **Logs** — Log volume by level, recent error logs, recent logs (all levels). Requires log forwarding to be enabled.

## NRQL data shape

The custom metrics are published via `newrelic.incrementMetric()` and `newrelic.recordMetric()` in `config/metrics.js`. They arrive as **metric timeslice data**, queried in NRQL via:

```nrql
FROM Metric SELECT sum(newrelic.timeslice.value)
WHERE metricTimesliceName LIKE 'Custom/lambda.alhau.%/request.%'
FACET metricTimesliceName
```

If a widget shows no data, validate the `metricTimesliceName` patterns in the New Relic Query Builder:

```nrql
FROM Metric SELECT uniques(metricTimesliceName)
WHERE metricTimesliceName LIKE 'Custom/lambda.alhau%' SINCE 1 day ago
```

then adjust the `like_*` locals in `main.tf`.

## Dashboard-level variable

A single `instance` filter (`prod` / `preprod`) is exposed at the top of the dashboard. As of this version, NRQL queries do not yet inject the `{{ instance }}` token explicitly — adding `WHERE provider.functionName = '{{ instance == "prod" ? "ludohomekit" : "alhau_preprod" }}'` -style mapping is a future improvement. The current widgets cover both envs by Lambda name in `IN (...)` clauses.
```

- [ ] **Step 2: Commit**

```bash
git add terraform/dashboard/modules/alhau-dashboard/README.md
git commit -m "docs(terraform): document alhau-dashboard module inputs and pages"
```

---

## Task 16 — Validate the dashboard module locally

**Files:** none modified — verification only.

- [ ] **Step 1: Format check on the whole `terraform/` tree**

Run: `terraform -chdir=terraform/dashboard fmt -check -recursive -diff`
Expected: no output, exit 0. Fix any reported issues with `terraform -chdir=terraform/dashboard fmt -recursive` and commit them.

- [ ] **Step 2: Init without backend (skip remote state since the bucket isn't created yet from this machine)**

Run: `terraform -chdir=terraform/dashboard init -backend=false`
Expected: `Terraform has been successfully initialized!` and the `newrelic` provider downloaded.

- [ ] **Step 3: Validate**

Run: `terraform -chdir=terraform/dashboard validate`
Expected: `Success! The configuration is valid.`

If validation fails, the most likely causes are:
- A typo in a widget block name (`widget_pie` etc.) — refer to the New Relic provider docs.
- A typo in a `nrql_query` argument — must be `account_id` (singular) for widgets and `account_ids` (plural list) for variable blocks.

Fix and re-run.

- [ ] **Step 4: Commit any formatting fixes**

If `fmt` rewrote files, commit them:

```bash
git status
git add terraform/
git commit -m "style(terraform): apply terraform fmt"
```

---

## Task 17 — Shared examples and top-level Terraform README

**Files:**
- Create: `terraform/.envrc.example`
- Create: `terraform/shared.tfvars.example`
- Create: `terraform/README.md`

- [ ] **Step 1: Write `terraform/.envrc.example`**

```bash
# Copy this file to .envrc (gitignored) and `direnv allow` to auto-load.
# Or `source` it manually before running terraform.

# --- AWS (read by AWS provider AND S3 backend) -----------------------
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_REGION="eu-west-1"

# --- New Relic (read by newrelic provider) --------------------------
# User API Key — different from the License Key used by the runtime
# agent. Create one at https://one.eu.newrelic.com/api-keys
export NEW_RELIC_API_KEY="NRAK-..."
# Optional: also exposed as a Terraform variable below
export NEW_RELIC_REGION="EU"

# --- Terraform variables (shared across bootstrap/ and dashboard/) --
# Any TF_VAR_<name> env var is automatically picked up by Terraform
# as the value of variable <name>.
export TF_VAR_nr_account_id="1234567"
export TF_VAR_nr_region="EU"
# Bootstrap-specific:
export TF_VAR_bucket_name="alhau-tfstate"
export TF_VAR_region="eu-west-1"
```

- [ ] **Step 2: Write `terraform/shared.tfvars.example`**

```hcl
# Copy to shared.tfvars (gitignored) and use with:
#
#   terraform -chdir=terraform/dashboard apply -var-file=../shared.tfvars
#
# Only contains NON-SECRET values. Tokens go to env vars (.envrc), never
# to .tfvars files.

nr_account_id       = 1234567
nr_region           = "EU"
dashboard_name      = "ALHAU — Alexa HomeKit"
newrelic_app_name   = "alexa-homekit"
lambda_prod_name    = "ludohomekit"
lambda_preprod_name = "alhau_preprod"
metric_namespace    = "lambda.alhau"
```

- [ ] **Step 3: Write `terraform/README.md`**

```markdown
# Terraform — New Relic dashboard

Manages the `ALHAU — Alexa HomeKit` dashboard in New Relic One as code.

## Architecture

```
terraform/
├── bootstrap/   # state LOCAL — creates the S3 bucket once
└── dashboard/   # state REMOTE in S3 — defines the dashboard
    └── modules/alhau-dashboard/   # the actual dashboard pages and widgets
```

## Prerequisites

- Terraform >= 1.10 (`brew install terraform` or [tfenv](https://github.com/tfutils/tfenv))
- AWS CLI authenticated (`aws sts get-caller-identity` works)
- New Relic User API Key (one.eu.newrelic.com → API keys → User key)
- New Relic account ID (visible in the URL of one.eu.newrelic.com)

## Configuring credentials and variables

There are two patterns supported. Use whichever you prefer; this README covers both for learning purposes.

### Pattern A — Env vars via `.envrc` (with [direnv](https://direnv.net/))

```bash
cp terraform/.envrc.example terraform/.envrc
# Edit terraform/.envrc with your real values
direnv allow terraform/
```

Terraform automatically picks up:
- `AWS_*` for AWS provider and S3 backend
- `NEW_RELIC_API_KEY` for the New Relic provider
- `TF_VAR_<name>` as values for Terraform variables of the same name

### Pattern B — `shared.tfvars` + explicit `-var-file`

```bash
cp terraform/shared.tfvars.example terraform/shared.tfvars
# Edit terraform/shared.tfvars
```

Then on every command:

```bash
terraform -chdir=terraform/dashboard apply -var-file=../shared.tfvars
```

Tokens (`AWS_*`, `NEW_RELIC_API_KEY`) still must come from env vars — never put them in `.tfvars`.

## First-time bootstrap (one-shot)

The S3 bucket that will store the dashboard's tfstate must be created **before** the dashboard module can `init`. The bootstrap module handles this with a local state.

```bash
cd terraform/bootstrap
cp terraform.tfvars.example terraform.tfvars      # adjust bucket_name if needed
terraform init                                     # local state, no backend
terraform apply                                    # create the bucket
```

Note the `bucket_name` and `region` outputs, then **edit `terraform/dashboard/backend.tf`** to set:

```hcl
bucket = "<value of bucket_name output>"
region = "<value of region output>"
```

(The `backend` block does not support variables — this is a known Terraform limitation.)

## Working on the dashboard

```bash
cd terraform/dashboard
terraform init        # initializes the S3 backend
terraform plan        # see what would change
terraform apply       # apply the change
```

After a successful apply, the `dashboard_permalink` output points to the dashboard in New Relic.

## Modifying the dashboard

1. Edit files under `terraform/dashboard/modules/alhau-dashboard/`.
2. Open a PR — the `terraform-plan` GitHub Action will post the plan as a PR comment.
3. After review, manually trigger the `terraform-apply` workflow (Actions → "Terraform Apply" → Run workflow).

## Required GitHub Secrets

Configure these in the repo settings (Settings → Secrets and variables → Actions):

| Secret | Source |
|---|---|
| `AWS_ACCESS_KEY_ID` | already exists for the Lambda deploy |
| `AWS_SECRET_ACCESS_KEY` | already exists |
| `AWS_DEFAULT_REGION` | already exists |
| `NEW_RELIC_API_KEY` | New Relic User API key |
| `NEW_RELIC_ACCOUNT_ID` | New Relic account ID |

## Debugging NRQL

If a widget appears empty, validate the underlying query in the New Relic Query Builder (`one.eu.newrelic.com → Query your data`). The most common cause of empty widgets is a mismatch in `metricTimesliceName` patterns — see `modules/alhau-dashboard/README.md` for the recommended diagnostic query.

## Limitations and known gotchas

- The `backend` bucket name is hard-coded — you must update `dashboard/backend.tf` after bootstrap.
- The first PR you open with this Terraform code will fail the `terraform-plan` workflow until the bucket exists; that is expected.
- No drift detection — if someone edits the dashboard via the NR UI, the dashboard will be reverted on the next `apply`.
```

- [ ] **Step 4: Commit**

```bash
git add terraform/.envrc.example terraform/shared.tfvars.example terraform/README.md
git commit -m "docs(terraform): add envrc/shared.tfvars examples and top-level README"
```

---

## Task 18 — GitHub Actions: terraform-plan workflow

**Files:**
- Create: `.github/workflows/terraform-plan.yml`

- [ ] **Step 1: Write the workflow**

```yaml
name: Terraform Plan

on:
  pull_request:
    paths:
      - 'terraform/dashboard/**'
      - '.github/workflows/terraform-plan.yml'

permissions:
  contents: read
  pull-requests: write   # to comment the plan on the PR

jobs:
  plan:
    name: Plan
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: terraform/dashboard
    env:
      NEW_RELIC_API_KEY:    ${{ secrets.NEW_RELIC_API_KEY }}
      NEW_RELIC_ACCOUNT_ID: ${{ secrets.NEW_RELIC_ACCOUNT_ID }}
      NEW_RELIC_REGION:     EU
      TF_VAR_nr_account_id: ${{ secrets.NEW_RELIC_ACCOUNT_ID }}
      TF_INPUT:             "false"
      TF_IN_AUTOMATION:     "true"
    steps:
      - uses: actions/checkout@v4

      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id:     ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region:            ${{ secrets.AWS_DEFAULT_REGION }}

      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.10.5

      - name: Terraform fmt
        run: terraform fmt -check -recursive

      - name: Terraform init
        run: terraform init

      - name: Terraform validate
        run: terraform validate -no-color

      - name: Terraform plan
        id: plan
        run: terraform plan -no-color -out=tfplan
        continue-on-error: true

      - name: Render plan
        if: steps.plan.outcome == 'success'
        run: terraform show -no-color tfplan > plan.txt

      - name: Comment plan on PR
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const planOutcome = '${{ steps.plan.outcome }}';
            let body;
            if (planOutcome === 'success' && fs.existsSync('terraform/dashboard/plan.txt')) {
              const plan = fs.readFileSync('terraform/dashboard/plan.txt', 'utf8');
              const truncated = plan.length > 60000 ? plan.slice(0, 60000) + '\n\n…(truncated)…' : plan;
              body = `### Terraform plan\n\n<details><summary>Show plan</summary>\n\n\`\`\`\n${truncated}\n\`\`\`\n\n</details>`;
            } else {
              body = `### Terraform plan failed\n\nSee the workflow logs for details.`;
            }
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body,
            });

      - name: Fail if plan failed
        if: steps.plan.outcome != 'success'
        run: exit 1
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/terraform-plan.yml
git commit -m "ci: add terraform plan workflow on PRs"
```

---

## Task 19 — GitHub Actions: terraform-apply workflow

**Files:**
- Create: `.github/workflows/terraform-apply.yml`

- [ ] **Step 1: Write the workflow**

```yaml
name: Terraform Apply

on:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  apply:
    name: Apply
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: terraform/dashboard
    env:
      NEW_RELIC_API_KEY:    ${{ secrets.NEW_RELIC_API_KEY }}
      NEW_RELIC_ACCOUNT_ID: ${{ secrets.NEW_RELIC_ACCOUNT_ID }}
      NEW_RELIC_REGION:     EU
      TF_VAR_nr_account_id: ${{ secrets.NEW_RELIC_ACCOUNT_ID }}
      TF_INPUT:             "false"
      TF_IN_AUTOMATION:     "true"
    steps:
      - uses: actions/checkout@v4

      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id:     ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region:            ${{ secrets.AWS_DEFAULT_REGION }}

      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.10.5

      - name: Terraform init
        run: terraform init

      - name: Terraform validate
        run: terraform validate -no-color

      - name: Terraform apply
        run: terraform apply -auto-approve -no-color

      - name: Output dashboard URL
        run: |
          {
            echo "## Dashboard URL"
            echo ""
            echo "Permalink: $(terraform output -raw dashboard_permalink)"
          } >> "$GITHUB_STEP_SUMMARY"
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/terraform-apply.yml
git commit -m "ci: add terraform apply workflow (manual workflow_dispatch)"
```

---

## Task 20 — Final validation, push and create PR

**Files:** none modified — verification + push only.

- [ ] **Step 1: Final fmt check across the whole Terraform tree**

Run: `terraform -chdir=terraform/bootstrap fmt -check -recursive -diff && terraform -chdir=terraform/dashboard fmt -check -recursive -diff`
Expected: no output, exit 0.

- [ ] **Step 2: Final validate**

```bash
terraform -chdir=terraform/bootstrap init -backend=false && \
terraform -chdir=terraform/bootstrap validate && \
terraform -chdir=terraform/dashboard init -backend=false && \
terraform -chdir=terraform/dashboard validate
```
Expected: both validations succeed.

- [ ] **Step 3: Confirm working tree is clean**

Run: `git status`
Expected: `nothing to commit, working tree clean` (or only gitignored `.terraform*` directories).

- [ ] **Step 4: Push the branch**

Run: `git push -u origin feat/newrelic-dashboard-terraform`

- [ ] **Step 5: Create the PR**

```bash
gh pr create --title "feat: New Relic dashboard managed by Terraform" --body "$(cat <<'EOF'
## Summary
- Adds `terraform/` with two root modules:
  - `bootstrap/` — creates the S3 bucket that stores tfstate (one-shot, local state)
  - `dashboard/` — defines the New Relic dashboard via a child module (4 pages, ~16 widgets), state in S3 with native lockfile (Terraform 1.10+)
- Adds GitHub Actions workflows: `terraform-plan` on PRs touching `terraform/dashboard/**`, `terraform-apply` on manual `workflow_dispatch`.
- Documents the full bootstrap/apply flow in `terraform/README.md`.

## Manual steps required before merging

1. **Run the bootstrap once** locally:
   \`\`\`
   cd terraform/bootstrap
   cp terraform.tfvars.example terraform.tfvars   # edit bucket_name if needed
   terraform init && terraform apply
   \`\`\`
2. **Update `terraform/dashboard/backend.tf`** with the `bucket` and `region` printed by the bootstrap (the \`backend\` block does not support variables).
3. **Add GitHub Secrets**: \`NEW_RELIC_API_KEY\` and \`NEW_RELIC_ACCOUNT_ID\` (the AWS secrets already exist).

Until step 1 is done, the \`terraform-plan\` workflow on this PR will fail at \`init\` — that's expected.

## Test plan
- [ ] \`terraform fmt -check -recursive\` passes for `terraform/bootstrap` and `terraform/dashboard`
- [ ] \`terraform validate\` passes for both root modules
- [ ] After bootstrap + backend.tf update, \`terraform-plan\` workflow runs successfully on PR
- [ ] After manual \`terraform-apply\` workflow run, the dashboard exists in New Relic and the permalink in the run summary opens it
- [ ] All 4 pages render — widgets with no data are explained in `terraform/dashboard/modules/alhau-dashboard/README.md` (NRQL diagnostic query)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: PR URL printed. Save and share with the user.

---

## Self-review notes (for the agent executing this plan)

- The plan creates files in dependency order: variables/versions before resources that reference them, `outputs.tf` for the child module before the root module references its outputs.
- Every NRQL query is **plausible but not validated against the live NR account** — first apply may surface 1–2 queries needing `metricTimesliceName` tweaks. The diagnostic query is documented in the module README.
- `terraform.lock.hcl` is gitignored to keep the diff small for this learning project; in a production setting we would commit it.
- The dashboard-level `instance` variable is declared but not yet used inside widget NRQL (page widgets filter by Lambda `IN (...)` instead). Documented as a future improvement.
- The first PR will see the `terraform-plan` workflow fail until the user has run the bootstrap and edited `backend.tf`. This is documented in the PR body.
