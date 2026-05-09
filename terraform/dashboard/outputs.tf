output "dashboard_permalink" {
  description = "Direct URL to the dashboard in New Relic One. Open this after `apply` to verify the result."
  value       = module.alhau_dashboard.permalink
}

output "dashboard_guid" {
  description = "Entity GUID of the dashboard, useful if you later want to link other resources (alerts, etc.) to it."
  value       = module.alhau_dashboard.guid
}
