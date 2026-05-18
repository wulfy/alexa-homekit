# Terraform — New Relic alerts

Manages alert conditions + notification workflow for the ALHAU project.
Three conditions today:

| Condition | Scope | Threshold | Trigger |
|---|---|---|---|
| `prod_throughput_signal_loss` | prod only | `< 0.1 req/min` | Mostly via `expiration` — opens incident after 8h of no signal |
| `high_response_time` | prod + preprod (FACETed) | `> 3000 ms` | 5 min sustained |
| `high_error_percentage` | prod + preprod (FACETed) | `> 5 %` | 5 min sustained |

All three live under a single policy `ALHAU — Alexa HomeKit`. A workflow
routes incidents to one email destination (`var.notification_email`).

## Prerequisites

- Terraform >= 1.10
- The `alhau-tfstate` S3 bucket from `terraform/bootstrap/`
- `terraform/.envrc` sourced with `NEW_RELIC_API_KEY` + `TF_VAR_nr_account_id`
  + `TF_VAR_notification_email`

## Bootstrap

```bash
cd terraform/alerts

# Set the destination email (in terraform/.envrc, NOT committed):
echo 'export TF_VAR_notification_email="you@example.com"' >> ../.envrc
source ../.envrc

terraform init
terraform plan        # review conditions
terraform apply
```

## Clean up the NR auto-defaults

When the NR Lambda layer first reported telemetry, NR auto-created a
default policy with conditions that overlap what we manage here. After
this module's `apply`, **delete the auto-defaults** to avoid two
notifications per incident:

1. NR UI → **Alerts** → **Alert conditions**
2. Filter by `appName = ludohomekit` or `alhau_preprod`
3. Find conditions on policies you didn't create (typically named
   "Low throughput", "High response time", "Apdex below threshold")
4. Disable or delete them

The conditions inside our `ALHAU — Alexa HomeKit` policy are the
keepers.

## Tweaking thresholds

Pick a parameter in `variables.tf` or inline in `conditions.tf` and
edit. Examples:

- **Less sensitive throughput** → bump `signal_loss_duration_seconds`
  to 43200 (12h) or 86400 (24h)
- **Tighter response time SLO** → change the `3000` to `2000` in
  `conditions.tf`
- **Looser error rate** → change `5` to `10` in `conditions.tf`

After edit: `terraform apply`.

## Disable notifications temporarily

Set `TF_VAR_notification_email=""` then `terraform apply`. The
destination, channel and workflow are torn down; conditions still fire
internally (visible in NR UI under Alerts → Issues) but nothing reaches
your inbox.

## Should I manage alerts for ALL my projects in one place?

You have multiple NR-monitored projects (this Alexa Lambda, the Kimsufi
apps, the Coolify VPS). Two patterns:

| | Per-project (recommended) | Centralised |
|---|---|---|
| Where the TF lives | In each project's repo | In a separate `nr-monitoring/` repo |
| State file | One per project (different S3 keys, same bucket) | One global state |
| Pros | Monitoring colocated with code, separate review cycles, can delete a project cleanly | Single source of truth for alert patterns |
| Cons | Need to copy similar files across projects | Touching prod changes risks affecting other projects |

For your situation (3 distinct projects, ~personal scale), **per-project
is the better default**. Each project repo gets its own `terraform/alerts/`
module pointing to the same NR account. The provider config is identical;
only the conditions differ.

If you find yourself copy-pasting the same conditions across 3 repos,
that's the moment to extract a Terraform module (a published one, or a
local module you `git submodule` into each project). Premature
otherwise.

## Architecture

```
terraform/
├── bootstrap/           # local state — creates the S3 bucket
├── dashboard/           # S3-backed — NR dashboard
├── lambda-config/       # S3-backed — Lambda runtime config
└── alerts/              # S3-backed — alert conditions + workflow  ← you are here
```

All four modules share the same S3 bucket (`alhau-tfstate`) under
distinct state keys.
