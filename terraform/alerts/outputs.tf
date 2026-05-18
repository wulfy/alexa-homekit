output "policy_id" {
  description = "ID of the alert policy — useful to attach more conditions externally."
  value       = newrelic_alert_policy.alhau.id
}

output "policy_name" {
  description = "Friendly name of the alert policy."
  value       = newrelic_alert_policy.alhau.name
}
