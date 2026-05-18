# Alert conditions for the Alhau project.
#
# Three conditions covering what the NR auto-defaults provide PLUS the
# prod-only throughput watcher with a tolerant signal-loss window.
#
# ─────────────────────────────────────────────────────────────────────
# Important — deduplicating with NR's auto-created defaults
# ─────────────────────────────────────────────────────────────────────
# When the NR Lambda layer first reports telemetry, NR auto-creates
# default conditions ("High response time", "High error percentage",
# "Low throughput") on a synthetic policy. They duplicate what's
# defined here. After `terraform apply`, delete those auto-defaults
# in the NR UI (Alerts → Alert conditions → filter by appName) to
# avoid getting two notifications for the same incident.

# ─────────────────────────────────────────────────────────────────────
# 1. Throughput — prod ONLY, signal-loss based
# ─────────────────────────────────────────────────────────────────────
# The threshold is set very low (below 0.1) so it almost never fires
# on a regular dip. The real trigger is `expiration` — if the signal
# goes silent for var.signal_loss_duration_seconds (default 8h), an
# incident is opened. That's the "the Lambda is dead" signal.
resource "newrelic_nrql_alert_condition" "prod_throughput_signal_loss" {
  account_id                   = var.nr_account_id
  policy_id                    = newrelic_alert_policy.alhau.id
  type                         = "static"
  name                         = "Prod — throughput signal lost (> ${var.signal_loss_duration_seconds / 60} min)"
  enabled                      = true
  violation_time_limit_seconds = 86400
  aggregation_method           = "EVENT_FLOW"
  aggregation_delay            = 60

  nrql {
    query = "SELECT average(`newrelic.goldenmetrics.apm.application.throughput`) FROM Metric WHERE appName = '${var.prod_app_name}'"
  }

  critical {
    operator              = "below"
    threshold             = 0.1
    threshold_duration    = 300
    threshold_occurrences = "ALL"
  }

  expiration {
    open_violation_on_expiration   = true
    expiration_duration            = var.signal_loss_duration_seconds
    close_violations_on_expiration = false
  }
}

# ─────────────────────────────────────────────────────────────────────
# 2. High Response Time — both envs (replaces NR's "High Response Time")
# ─────────────────────────────────────────────────────────────────────
# 3 seconds is the practical UX limit for Alexa skills — beyond that
# users get the "skill having trouble" prompt. FACET appName so prod
# and preprod fire separate incidents (you can mute one without
# touching the other).
resource "newrelic_nrql_alert_condition" "high_response_time" {
  account_id                   = var.nr_account_id
  policy_id                    = newrelic_alert_policy.alhau.id
  type                         = "static"
  name                         = "High response time (> 3s)"
  enabled                      = true
  violation_time_limit_seconds = 86400
  aggregation_method           = "EVENT_FLOW"
  aggregation_delay            = 60

  nrql {
    query = "SELECT average(`newrelic.goldenmetrics.apm.application.responseTimeMs`) FROM Metric WHERE appName IN ('${var.prod_app_name}', '${var.preprod_app_name}') FACET appName"
  }

  critical {
    operator              = "above"
    threshold             = 3000
    threshold_duration    = 300
    threshold_occurrences = "ALL"
  }
}

# ─────────────────────────────────────────────────────────────────────
# 3. High Error Percentage — both envs
# ─────────────────────────────────────────────────────────────────────
# Lambda invocations that error out (including Domoticz socket hang ups
# in pratique). 5% is a reasonable bar — below that, transient network
# glitches are normal; above, something systemic is broken.
resource "newrelic_nrql_alert_condition" "high_error_percentage" {
  account_id                   = var.nr_account_id
  policy_id                    = newrelic_alert_policy.alhau.id
  type                         = "static"
  name                         = "High error percentage (> 5%)"
  enabled                      = true
  violation_time_limit_seconds = 86400
  aggregation_method           = "EVENT_FLOW"
  aggregation_delay            = 60

  nrql {
    query = "SELECT percentage(count(*), WHERE error IS true) FROM Transaction WHERE appName IN ('${var.prod_app_name}', '${var.preprod_app_name}') FACET appName"
  }

  critical {
    operator              = "above"
    threshold             = 5
    threshold_duration    = 300
    threshold_occurrences = "ALL"
  }
}
