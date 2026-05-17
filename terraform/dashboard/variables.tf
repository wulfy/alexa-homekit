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
