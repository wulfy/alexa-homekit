# Notification pipeline: destination → channel → workflow.
# The whole chain is only created if notification_email is provided
# (count = 0 disables the resource cleanly).

resource "newrelic_notification_destination" "email" {
  count      = var.notification_email == "" ? 0 : 1
  account_id = var.nr_account_id
  name       = "ALHAU — email destination"
  type       = "EMAIL"

  property {
    key   = "email"
    value = var.notification_email
  }
}

resource "newrelic_notification_channel" "email" {
  count          = var.notification_email == "" ? 0 : 1
  account_id     = var.nr_account_id
  name           = "ALHAU — email channel"
  type           = "EMAIL"
  destination_id = newrelic_notification_destination.email[0].id
  product        = "IINT"

  property {
    key   = "subject"
    value = "{{ issueTitle }}"
  }
}

# The workflow ties the alert policy to the notification channel.
# muting_rules_handling = NOTIFY_ALL_ISSUES means muting rules in NR UI
# are ignored — flip to DONT_NOTIFY_FULLY_MUTED_ISSUES if you start
# using muting windows (e.g. silent during a known maintenance).
resource "newrelic_workflow" "alhau" {
  count                 = var.notification_email == "" ? 0 : 1
  account_id            = var.nr_account_id
  name                  = "ALHAU — alert workflow"
  enrichments_enabled   = true
  destinations_enabled  = true
  workflow_enabled      = true
  muting_rules_handling = "NOTIFY_ALL_ISSUES"

  issues_filter {
    name = "policyId filter"
    type = "FILTER"

    predicate {
      attribute = "labels.policyIds"
      operator  = "EXACTLY_MATCHES"
      values    = [newrelic_alert_policy.alhau.id]
    }
  }

  destination {
    channel_id = newrelic_notification_channel.email[0].id
  }
}
