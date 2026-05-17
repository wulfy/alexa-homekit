variable "aws_region" {
  description = "AWS region where the Lambdas live."
  type        = string
  default     = "eu-west-1"
}

# --- New Relic --------------------------------------------------------

variable "nr_lambda_layer_arn" {
  description = <<EOT
ARN of the New Relic Lambda layer. Default targets Node.js 24 in eu-west-1.
Bump the version (last segment) as new layers are published — see
https://layers.newrelic-external.com.
EOT
  type        = string
  default     = "arn:aws:lambda:eu-west-1:451483290750:layer:NewRelicNodeJS24X:27"
}

variable "nr_license_key" {
  description = <<EOT
New Relic License key (a.k.a. Ingest key). EU keys start with `eu01xx`.
Find it at https://one.eu.newrelic.com/api-keys (type "License key").
This is a secret — set via TF_VAR_nr_license_key in .envrc, never commit.
EOT
  type        = string
  sensitive   = true
}

variable "nr_account_id" {
  description = "New Relic account ID. Same value as terraform/dashboard/'s nr_account_id."
  type        = string
}

variable "nr_extension_send_function_logs" {
  description = <<EOT
When true, the NR Lambda Extension forwards CloudWatch Lambda logs to
NR (so they appear in `FROM Log WHERE entity.name = ...`). False keeps
logs out of NR ingest — recommended on the free tier given verbose
prodLogger output.
EOT
  type        = bool
  default     = false
}

variable "nr_data_collection_timeout" {
  description = <<EOT
How long the NR Lambda Extension waits for agent telemetry after the
handler returns before flushing. Default 30s — covers slow Alexa
requests (e.g. Domoticz timing out on flaky home networks) without
delaying the user-visible response. Set to "" to use the extension's
own default (~100ms in Standard mode).
EOT
  type        = string
  default     = "30s"
}

# --- Per-function configuration --------------------------------------

variable "lambda_timeout" {
  description = <<EOT
Per-invocation timeout (seconds) for both Lambdas. Alexa demands a
response within 8s for a good user experience and absolute max ~8s
before the skill fails — 30s is a generous buffer for slow Domoticz
hops, async DB lookups, etc. Lambda's hard max is 900s.
EOT
  type        = number
  default     = 30
}

variable "lambda_memory_size" {
  description = <<EOT
Memory allocation (MB) for both Lambdas. 128 MB is sufficient for the
current workload (Node 24 + NR Lambda layer fit in this with ~10 MB
headroom). Lambda scales CPU proportionally to memory — bump to 256
or 512 if you notice latency creeping up at cold starts.
EOT
  type        = number
  default     = 128
}

variable "shared_iam_role_name" {
  description = <<EOT
Name of the IAM execution role shared by both Lambdas (preprod and
prod). Terraform creates this role from-scratch (with the basic Lambda
execution policy attached); when adopting an existing setup, set this
to the existing shared role's name and `terraform import` it before
applying — see README.

We model this as a single shared role because the two Lambdas in this
project use the same execution role. If you later need distinct roles
per environment, split this into two `aws_iam_role` resources in
iam.tf and reference each from the matching `aws_lambda_function`.
EOT
  type        = string
}

variable "preprod" {
  description = <<EOT
Configuration for the preprod Lambda.

`function_name` is the AWS Lambda function name.

`env_vars` is the FULL map of application env vars currently set on the
function (DOMOTICZ_*, MYSQL_*, CRYPTOPASS, etc.). Terraform will merge
this with the NR-specific env vars from main.tf — anything missing here
will be REMOVED from the live function when apply runs. See README for
the one-shot capture command.
EOT
  type = object({
    function_name = string
    env_vars      = map(string)
  })
  sensitive = true
}

variable "prod" {
  description = "Same shape as `preprod`, but for the prod Lambda (ludohomekit)."
  type = object({
    function_name = string
    env_vars      = map(string)
  })
  sensitive = true
}
