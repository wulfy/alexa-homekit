# One alert policy that groups every condition for this project.
# A single policy means a single workflow handles routing — simpler
# than splitting prod/preprod into separate policies.
resource "newrelic_alert_policy" "alhau" {
  account_id          = var.nr_account_id
  name                = "ALHAU — Alexa HomeKit"
  incident_preference = "PER_CONDITION_AND_TARGET"
}
