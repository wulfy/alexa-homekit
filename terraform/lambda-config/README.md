# Terraform — Lambda runtime configuration

Manages the **runtime config** of both Lambdas (`alhau_preprod` / `ludohomekit`):
handler, layers, environment variables. Everything we previously set
manually in the AWS console.

The **code zip** stays managed by `scripts/deploy.sh` (which calls
`aws lambda update-function-code`). Terraform points at a placeholder
and ignores all code-related attributes via `lifecycle.ignore_changes`.

## What Terraform does (and doesn't do) here

| Owned by Terraform | Owned elsewhere |
|---|---|
| `handler` = `newrelic-lambda-wrapper.handler` | Code zip (deploy.sh) |
| `runtime` = `nodejs24.x` | IAM role + its policies |
| `layers` (NR Lambda Layer) | Triggers (Alexa skill) |
| `environment.variables` (FULL map: app + NR) | Destinations / DLQ |

## Prerequisites

- Terraform >= 1.10
- `terraform/.envrc` sourced with `AWS_*` and `NEW_RELIC_*` env vars
- The two Lambdas already exist on AWS — Terraform will **import** them,
  not create from scratch.

## First-time bootstrap (one-shot)

### 1. Capture current values from AWS

For each function (`alhau_preprod`, `ludohomekit`):

```bash
# Role ARN
aws lambda get-function-configuration \
  --function-name alhau_preprod --region eu-west-1 \
  --query 'Role' --output text

# Current env vars (use as basis for `env_vars` in tfvars)
aws lambda get-function-configuration \
  --function-name alhau_preprod --region eu-west-1 \
  --query 'Environment.Variables' --output json
```

Repeat with `--function-name ludohomekit` for prod.

### 2. Fill in `terraform.tfvars`

```bash
cd terraform/lambda-config
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars: paste role_arn and env_vars from step 1
```

⚠️ **Important** — `env_vars` must contain **every** existing app env
var (DOMOTICZ_*, MYSQL_*, CRYPTOPASS, etc.). Any var present on the
live function but missing from `env_vars` will be **deleted** at
`terraform apply` time. The NR_* env vars are managed automatically
via `main.tf` and should NOT appear in `env_vars`.

The `terraform.tfvars` file contains secrets (DB passwords, etc.) —
it is gitignored. Don't commit it.

### 3. Set the NR license key via env var

```bash
# Add to terraform/.envrc (gitignored):
export TF_VAR_nr_license_key="eu01xxYOURKEYHERE"
```

This keeps the license key out of `terraform.tfvars` entirely.

### 4. Initialize and import

```bash
terraform init
terraform import aws_lambda_function.preprod alhau_preprod
terraform import aws_lambda_function.prod    ludohomekit
```

`terraform import` brings the existing AWS state into the Terraform
state file. After this, Terraform knows the functions exist; the next
plan will show diffs only for what's actually different.

### 5. Plan and review

```bash
terraform plan
```

Expected diffs on first plan:

- `layers` add (if the NR layer wasn't already attached)
- `environment.variables` add (`NEW_RELIC_LAMBDA_HANDLER`,
  `NEW_RELIC_APM_LAMBDA_MODE`, etc. that we manage)
- `handler` change to `newrelic-lambda-wrapper.handler` (if not
  already set)

If you see a diff that would remove an env var you actually need
(e.g., `MYSQL_ADDON_PASSWORD`), it means your `env_vars` map is
incomplete. Re-run the capture in step 1, update tfvars, re-plan.

### 6. Apply

```bash
terraform apply
```

After apply, the runtime config is reproducible. Next time you bump
the NR layer version or change an env var, edit the .tf or tfvars,
re-plan, re-apply.

## Day-to-day

- **Deploy code only** → `scripts/deploy.sh` (existing workflow). Touches
  the zip; Terraform ignores it via `lifecycle.ignore_changes`.
- **Update layer version** → bump the default in `variables.tf` or set
  `TF_VAR_nr_lambda_layer_arn`, then `terraform apply`.
- **Add/change app env var** → edit `terraform.tfvars`, `terraform apply`.
- **Add NR-managed env var** → edit `main.tf` locals.

## Caveats

- **Drift**: if someone changes the live function via the AWS console
  (e.g., adds an env var manually), the next `terraform plan` will
  show that as drift and propose to remove it. Either update tfvars to
  match, or revert the manual change.
- **Code deploys racing apply**: `deploy.sh` and `terraform apply`
  both modify the function, but they touch disjoint attributes
  (code vs config). They can run in any order without conflict.
- **First-time apply may report `last_modified` changes**: harmless,
  Terraform is just refreshing the timestamp in state.

## Architecture

```
terraform/
├── bootstrap/           # local state — creates the S3 bucket
├── dashboard/           # S3-backed — NR dashboard
└── lambda-config/       # S3-backed — Lambda handler/layers/env vars  ← you are here
```

Both `dashboard/` and `lambda-config/` use the same S3 bucket
(`alhau-tfstate`) with distinct keys, so they never clobber each
other's state.
