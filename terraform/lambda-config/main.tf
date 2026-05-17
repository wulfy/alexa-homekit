# Locals shared across both functions.
#
# `nr_env_vars` is merged with each function's `env_vars` map. The
# secrets (NEW_RELIC_LICENSE_KEY) come from sensitive variables and
# are stored only in the S3 tfstate (private bucket, gitignored
# .envrc).

locals {
  nr_env_vars_base = {
    NEW_RELIC_LICENSE_KEY     = var.nr_license_key
    NEW_RELIC_ACCOUNT_ID      = var.nr_account_id
    NEW_RELIC_LAMBDA_HANDLER  = "index.handler"
    NEW_RELIC_APM_LAMBDA_MODE = "true"
  }

  # Optional: forward CloudWatch logs to NR. Off by default — see the
  # nr_extension_send_function_logs variable.
  nr_env_vars_logs = var.nr_extension_send_function_logs ? {
    NEW_RELIC_EXTENSION_SEND_FUNCTION_LOGS = "true"
  } : {}

  # Optional: override the extension's data-collection wait window.
  # Set var.nr_data_collection_timeout = "" to leave it unset (use
  # extension defaults).
  nr_env_vars_timeout = var.nr_data_collection_timeout != "" ? {
    NEW_RELIC_DATA_COLLECTION_TIMEOUT = var.nr_data_collection_timeout
  } : {}

  nr_env_vars = merge(
    local.nr_env_vars_base,
    local.nr_env_vars_logs,
    local.nr_env_vars_timeout,
  )
}

# Placeholder zip used to satisfy the aws_lambda_function `filename`
# argument. Terraform never deploys this — see lifecycle.ignore_changes
# on the function resources in functions.tf. The actual function code
# is shipped by scripts/deploy.sh.
#
# Written inside .terraform/ so the generated zip is gitignored via the
# existing `**/.terraform/` rule (no need to touch .gitignore).
data "archive_file" "placeholder" {
  type        = "zip"
  output_path = "${path.module}/.terraform/placeholder.zip"
  source {
    content  = "// placeholder — function code is managed by scripts/deploy.sh"
    filename = "placeholder.js"
  }
}
