# Terraform — Lambda runtime configuration

Manages the **IAM execution role + runtime config** of both Lambdas
(`alhau_preprod` / `ludohomekit`): role, handler, runtime, layers,
environment variables. Replaces what we previously set by hand in the
AWS console.

The **code zip** stays managed by `scripts/deploy.sh` (which calls
`aws lambda update-function-code`). Terraform points at a placeholder
zip and ignores all code-related attributes via
`lifecycle.ignore_changes`.

## What Terraform owns (and doesn't)

| Owned by Terraform | Owned elsewhere |
|---|---|
| IAM execution role + basic Lambda policy | Code zip (`deploy.sh`) |
| `handler` = `newrelic-lambda-wrapper.handler` | Triggers (Alexa skill) |
| `runtime` = `nodejs24.x` | Destinations / DLQ |
| `layers` (NR Lambda Layer) | |
| `environment.variables` (full map: app + NR) | |

## Prerequisites

- Terraform >= 1.10
- `terraform/.envrc` sourced with `AWS_*` + `TF_VAR_nr_license_key` +
  `TF_VAR_nr_account_id`
- AWS credentials with IAM + Lambda permissions

## Path A — From-scratch deployment

For a fresh AWS account or after recreating everything from zero. The
order matters because each step depends on the previous.

### 1. Create the Terraform state bucket (one-shot per AWS account)

```bash
cd terraform/bootstrap
terraform init
terraform apply        # creates the alhau-tfstate S3 bucket
```

### 2. Fill in tfvars

```bash
cd terraform/lambda-config
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars: pick role names, paste env_vars
```

### 3. Set the NR license key

```bash
# Add to terraform/.envrc (gitignored):
export TF_VAR_nr_license_key="eu01xxYOURKEYHERE"
```

### 4. Apply

```bash
terraform init
terraform apply
```

Terraform creates:
- One shared IAM execution role (named per `shared_iam_role_name`)
- The basic Lambda execution policy attached to it (for CloudWatch Logs)
- Both Lambda functions with handler/runtime/layers/env vars set,
  pointing to the shared role (using a tiny placeholder zip — real code
  comes next)

### 5. Deploy the real function code

```bash
cd ../..
sh scripts/deploy.sh          # or via the GitHub Actions Deploy workflow
```

`deploy.sh` updates the function code in place; Terraform's
`lifecycle.ignore_changes` keeps it from fighting back.

### 6. Create the New Relic dashboard

```bash
cd terraform/dashboard
terraform init
terraform apply
```

You now have a fully reproducible setup from a vanilla AWS account.

## Path B — Adopt existing functions (recommended for current users)

Same module, different flow: Terraform takes over an already-existing
Lambda + role instead of creating them.

### 1. Capture current state from AWS

```bash
# Function names + roles (note the role NAME at the end, not the ARN)
aws lambda get-function-configuration --function-name alhau_preprod \
  --region eu-west-1 --query 'Role' --output text
# → arn:aws:iam::xxxxx:role/service-role/alhau_preprod-role-abc123
#                                          ^^^^^^^^^^^^^^^^^^^^^^^^^^ this part

# Current env vars (full map)
aws lambda get-function-configuration --function-name alhau_preprod \
  --region eu-west-1 --query 'Environment.Variables' --output json
```

Repeat for `ludohomekit`.

### 2. Fill in `terraform.tfvars`

Set `shared_iam_role_name` to the existing role's **name** (not the
full ARN — strip everything before/including the last `/`), and paste
the env vars into each `env_vars` map. ⚠️ **The map must be COMPLETE** —
anything missing from `env_vars` will be deleted from the live function
on apply. The NR_* env vars are managed automatically via `main.tf` and
should NOT appear in `env_vars`.

### 3. Initialize and import

Because preprod and prod share the same IAM role, the role is imported
ONCE.

```bash
cd terraform/lambda-config
terraform init

# Import the shared role (use the role NAME, not ARN)
terraform import aws_iam_role.shared <existing-role-name>

# Import the policy attachment (<role-name>/<policy-arn>)
terraform import aws_iam_role_policy_attachment.shared_basic_execution \
  <existing-role-name>/arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# Import each function
terraform import aws_lambda_function.preprod alhau_preprod
terraform import aws_lambda_function.prod    ludohomekit
```

### 4. Plan and review carefully

```bash
terraform plan
```

Expected diffs on first plan:

- `layers` add (if the NR layer wasn't already attached)
- `environment.variables` add (NEW_RELIC_* values managed by `main.tf`)
- `handler` change to `newrelic-lambda-wrapper.handler` (if not already
  set)
- Possibly assume_role_policy alignment if the imported trust policy
  differs from the canonical one in `iam.tf`

If you see a diff that removes an env var you actually need, your
`env_vars` map is incomplete — fix the tfvars and re-plan.

If the existing IAM role has additional policies attached (beyond
basic execution), the import won't see them. Add corresponding
`aws_iam_role_policy_attachment` resources to `iam.tf` to keep them
managed.

### 5. Apply

```bash
terraform apply
```

## Day-to-day operations

- **Deploy code only** → `scripts/deploy.sh` (or GitHub Actions Deploy
  workflow). Terraform ignores it via `lifecycle.ignore_changes`.
- **Bump NR layer version** → edit `nr_lambda_layer_arn` default in
  `variables.tf` or override via `TF_VAR_nr_lambda_layer_arn`, then
  `terraform apply`.
- **Change an env var** → edit `terraform.tfvars`, `terraform apply`.
- **Add an NR-managed env var** → edit `main.tf` `local.nr_env_vars_base`.
- **Add a Lambda permission** → add an `aws_iam_role_policy` or
  `aws_iam_role_policy_attachment` in `iam.tf`.

## Caveats

- **Drift**: if someone changes the live function via the AWS console
  (e.g., adds an env var manually), the next `terraform plan` will
  show that as drift and propose to remove it. Either update tfvars
  to match, or revert the manual change.
- **Code deploys vs `terraform apply`**: both run safely in any order
  because they touch disjoint Lambda attributes (code vs config).
- **First `apply` after import** may report a `last_modified`
  change: harmless, Terraform is just refreshing the state timestamp.

## Architecture

```
terraform/
├── bootstrap/           # local state — creates the S3 bucket
├── dashboard/           # S3-backed — NR dashboard
└── lambda-config/       # S3-backed — IAM role + Lambda runtime config  ← you are here
```

Both `dashboard/` and `lambda-config/` use the same S3 bucket
(`alhau-tfstate`) under distinct state keys, so they never clobber
each other.
