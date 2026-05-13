# Single resource holding the whole dashboard. Pages and widgets are nested
# blocks of this resource — there is no way to split them across multiple
# Terraform resources, the New Relic API treats a dashboard as one entity.
#
# We host this resource in pages.tf (rather than main.tf) because main.tf
# is reserved for locals/helpers, keeping each file focused.

resource "newrelic_one_dashboard" "alhau" {
  name        = var.dashboard_name
  permissions = "private"
  description = "Alexa HomeKit Lambda — health, traffic and business metrics."

  # Dashboard-level variable: lets the user toggle between prod and preprod
  # at the top of the dashboard. Each NRQL query that filters on instance
  # references {{ instance }} (handled below in widgets where appropriate).
  variable {
    name                 = "instance"
    title                = "Environment"
    type                 = "enum"
    replacement_strategy = "default"
    default_values       = ["prod"]
    is_multi_selection   = false

    item {
      title = "prod"
      value = "prod"
    }

    item {
      title = "preprod"
      value = "preprod"
    }
  }

  # ----------------------------------------------------------------------
  # PAGE 1 — Lambda Health
  # APM- and AWS Lambda-level signals: invocations, errors, latency,
  # cold starts. Filtered by Lambda function name (covers both envs).
  # ----------------------------------------------------------------------
  page {
    name = "Lambda Health"

    widget_line {
      title  = "Invocations / 5 min"
      row    = 1
      column = 1
      width  = 4
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM AwsLambdaInvocation SELECT count(*) WHERE provider.functionName IN (${local.lambda_in_clause}) FACET provider.functionName TIMESERIES 5 minutes"
      }
    }

    widget_billboard {
      title  = "Error rate (last hour)"
      row    = 1
      column = 5
      width  = 4
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM AwsLambdaInvocation SELECT percentage(count(*), WHERE error IS true) WHERE provider.functionName IN (${local.lambda_in_clause}) SINCE 1 hour ago"
      }

      warning  = 1
      critical = 5
    }

    widget_line {
      title  = "Cold starts"
      row    = 1
      column = 9
      width  = 4
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM AwsLambdaInvocation SELECT count(*) WHERE provider.coldStart IS true AND provider.functionName IN (${local.lambda_in_clause}) TIMESERIES"
      }
    }

    widget_line {
      title  = "Transaction duration (p50 / p95 / p99)"
      row    = 4
      column = 1
      width  = 8
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Transaction SELECT percentile(duration, 50, 95, 99) WHERE appName = '${var.newrelic_app_name}' TIMESERIES"
      }

      legend_enabled    = true
      y_axis_left_zero  = true
      ignore_time_range = false
    }

    widget_table {
      title  = "Recent errors"
      row    = 4
      column = 9
      width  = 4
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM TransactionError SELECT timestamp, error.message, error.class WHERE appName = '${var.newrelic_app_name}' SINCE 1 day ago LIMIT 50"
      }

      initial_sorting {
        direction = "desc"
        name      = "timestamp"
      }
    }
  }

  # ----------------------------------------------------------------------
  # PAGE 2 — Alexa Traffic
  # Volumes and latency of incoming Alexa directives, broken down by
  # namespace + name (e.g. Alexa.PowerController.TurnOn).
  # ----------------------------------------------------------------------
  page {
    name = "Alexa Traffic"

    widget_stacked_bar {
      title  = "Requests by directive (timeseries)"
      row    = 1
      column = 1
      width  = 8
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Metric SELECT sum(newrelic.timeslice.value) WHERE metricTimesliceName LIKE '${local.like_request}' FACET metricTimesliceName TIMESERIES"
      }
    }

    widget_pie {
      title  = "Top 10 directives (last 24h)"
      row    = 1
      column = 9
      width  = 4
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Metric SELECT sum(newrelic.timeslice.value) WHERE metricTimesliceName LIKE '${local.like_request}' FACET metricTimesliceName SINCE 1 day ago LIMIT 10"
      }
    }

    widget_line {
      title  = "Latency p95 by directive"
      row    = 4
      column = 1
      width  = 8
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Metric SELECT percentile(newrelic.timeslice.value, 95) WHERE metricTimesliceName LIKE '${local.like_request}' FACET metricTimesliceName TIMESERIES"
      }

      legend_enabled    = true
      y_axis_left_zero  = true
      ignore_time_range = false

      units {
        unit = "ms"
      }
    }

    widget_area {
      title  = "Discovery vs Commands"
      row    = 4
      column = 9
      width  = 4
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Metric SELECT sum(newrelic.timeslice.value) AS 'Discovery' WHERE metricTimesliceName LIKE '${local.like_request}' AND metricTimesliceName LIKE '%Discovery%' TIMESERIES"
      }

      nrql_query {
        account_id = var.account_id
        query      = "FROM Metric SELECT sum(newrelic.timeslice.value) AS 'Other directives' WHERE metricTimesliceName LIKE '${local.like_request}' AND metricTimesliceName NOT LIKE '%Discovery%' TIMESERIES"
      }
    }
  }

  # ----------------------------------------------------------------------
  # PAGE 3 — Activité métier
  # Domain-level signals: which Domoticz device subtypes are commanded,
  # how often the app hits the OAuth/users DB, what kinds of Alexa
  # responses are sent back.
  # ----------------------------------------------------------------------
  page {
    name = "Activité métier"

    widget_bar {
      title  = "Commands by Domoticz subtype"
      row    = 1
      column = 1
      width  = 6
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Metric SELECT sum(newrelic.timeslice.value) WHERE metricTimesliceName LIKE '${local.like_command}' FACET metricTimesliceName SINCE 1 day ago LIMIT 20"
      }

      filter_current_dashboard = true
    }

    widget_pie {
      title  = "Top 10 device subtypes"
      row    = 1
      column = 7
      width  = 6
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Metric SELECT sum(newrelic.timeslice.value) WHERE metricTimesliceName LIKE '${local.like_command}' FACET metricTimesliceName SINCE 1 day ago LIMIT 10"
      }
    }

    widget_line {
      title  = "DB user-data lookups"
      row    = 4
      column = 1
      width  = 6
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Metric SELECT sum(newrelic.timeslice.value) WHERE metricTimesliceName LIKE '${local.like_database}' TIMESERIES"
      }
    }

    widget_stacked_bar {
      title  = "Alexa responses by directive name"
      row    = 4
      column = 7
      width  = 6
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Metric SELECT sum(newrelic.timeslice.value) WHERE metricTimesliceName LIKE '${local.like_answer}' FACET metricTimesliceName TIMESERIES"
      }
    }
  }

  # ----------------------------------------------------------------------
  # PAGE 4 — Logs
  # Quick triage view. Requires "Logs in Context" or log forwarding to
  # be enabled in the New Relic agent. The error-level table below is
  # the most useful starting point when triaging an incident.
  # ----------------------------------------------------------------------
  page {
    name = "Logs"

    widget_line {
      title  = "Log volume by level"
      row    = 1
      column = 1
      width  = 12
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Log SELECT count(*) WHERE entity.name = '${var.newrelic_app_name}' FACET level TIMESERIES"
      }

      legend_enabled = true
    }

    widget_log_table {
      title  = "Recent ERROR logs"
      row    = 4
      column = 1
      width  = 12
      height = 4

      nrql_query {
        account_id = var.account_id
        query      = "FROM Log SELECT timestamp, message, level WHERE entity.name = '${var.newrelic_app_name}' AND level = 'error' SINCE 1 day ago LIMIT 100"
      }
    }

    widget_log_table {
      title  = "Recent logs (all levels)"
      row    = 8
      column = 1
      width  = 12
      height = 4

      nrql_query {
        account_id = var.account_id
        query      = "FROM Log SELECT timestamp, message, level WHERE entity.name = '${var.newrelic_app_name}' SINCE 1 hour ago LIMIT 200"
      }
    }
  }
}
