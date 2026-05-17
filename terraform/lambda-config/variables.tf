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

variable "preprod" {
  description = <<EOT
Configuration for the preprod Lambda.

`function_name` is the AWS Lambda function name.

`iam_role_name` is the IAM execution role name. Terraform creates it
from scratch (with the basic Lambda execution policy attached). When
adopting an existing function, set this to the existing role's name
and `terraform import` the role before applying — see README.

`env_vars` is the FULL map of application env vars currently set on the
function (DOMOTICZ_*, MYSQL_*, CRYPTOPASS, etc.). Terraform will merge
this with the NR-specific env vars from main.tf — anything missing here
will be REMOVED from the live function when apply runs. See README for
the one-shot capture command.
EOT
  type = object({
    function_name = string
    iam_role_name = string
    env_vars      = map(string)
  })
  sensitive = true
}

variable "prod" {
  description = "Same shape as `preprod`, but for the prod Lambda (ludohomekit)."
  type = object({
    function_name = string
    iam_role_name = string
    env_vars      = map(string)
  })
  sensitive = true
}
