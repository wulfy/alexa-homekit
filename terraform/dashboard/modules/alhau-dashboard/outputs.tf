output "permalink" {
  description = "URL of the dashboard in New Relic One."
  value       = newrelic_one_dashboard.alhau.permalink
}

output "guid" {
  description = "Entity GUID of the dashboard."
  value       = newrelic_one_dashboard.alhau.guid
}
