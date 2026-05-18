variable "nr_account_id" {
  description = "New Relic account ID (e.g. 7960957)."
  type        = string
}

variable "nr_region" {
  description = "New Relic region — EU or US."
  type        = string
  default     = "EU"
}

variable "prod_app_name" {
  description = "appName of the prod Lambda in New Relic (matches NR Lambda layer naming)."
  type        = string
  default     = "ludohomekit"
}

variable "preprod_app_name" {
  description = "appName of the preprod Lambda in New Relic."
  type        = string
  default     = "alhau_preprod"
}

variable "notification_email" {
  description = <<EOT
Email address where alert notifications are sent. Set via
TF_VAR_notification_email in .envrc. Empty disables the email channel
(conditions still exist but no notifications go out — useful while
tuning thresholds).
EOT
  type        = string
  sensitive   = true
  default     = ""
}

variable "signal_loss_duration_seconds" {
  description = <<EOT
How long the throughput signal must be absent before NR opens an
incident. Default 28800s = 8h, large enough to absorb the natural
quiet periods of a public Alexa skill (nights, low-traffic days).
EOT
  type        = number
  default     = 28800
}
