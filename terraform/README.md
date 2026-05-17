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
