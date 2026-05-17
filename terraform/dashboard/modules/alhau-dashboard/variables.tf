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
