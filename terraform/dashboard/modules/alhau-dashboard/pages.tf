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
    default_values       = ["ludohomekit"]
    is_multi_selection   = false

    item {
      title = "prod"
      value = "ludohomekit"
    }

    item {
      title = "preprod"
      value = "alhau_preprod"
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
        query      = "FROM AwsLambdaInvocation SELECT count(*) WHERE provider.functionName = {{ instance }} TIMESERIES 5 minutes"
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
        query      = "FROM AwsLambdaInvocation SELECT percentage(count(*), WHERE error IS true) WHERE provider.functionName = {{ instance }} SINCE 1 hour ago"
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
        query      = "FROM AwsLambdaInvocation SELECT count(*) WHERE provider.coldStart IS true AND provider.functionName = {{ instance }} TIMESERIES"
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
        query      = "FROM Transaction SELECT percentile(duration * 1000, 50, 95, 99) WHERE appName = {{ instance }} TIMESERIES"
      }

      legend_enabled    = true
      y_axis_left_zero  = true
      ignore_time_range = false

      units {
        unit = "ms"
      }
    }

    widget_table {
      title  = "Recent errors"
      row    = 4
      column = 9
      width  = 4
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM TransactionError SELECT timestamp, appName, error.message, error.class WHERE appName = {{ instance }} SINCE 1 day ago LIMIT 50"
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
  # alexa.directive (custom attribute attached to each Transaction by
  # the Lambda code via newrelic.addCustomAttribute). Format is the
  # concatenation of the directive namespace and name, e.g.
  # 'Alexa.PowerController.TurnOn' or 'Alexa.Discovery.Discover'.
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
        query      = "FROM Transaction SELECT count(*) WHERE appName = {{ instance }} FACET alexa.directive TIMESERIES"
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
        query      = "FROM Transaction SELECT count(*) WHERE appName = {{ instance }} FACET alexa.directive SINCE 1 day ago LIMIT 10"
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
        query      = "FROM Transaction SELECT percentile(duration * 1000, 95) WHERE appName = {{ instance }} FACET alexa.directive TIMESERIES"
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
        query      = "FROM Transaction SELECT count(*) AS 'Discovery' WHERE appName = {{ instance }} AND alexa.directive LIKE 'Alexa.Discovery%' TIMESERIES"
      }

      nrql_query {
        account_id = var.account_id
        query      = "FROM Transaction SELECT count(*) AS 'Other directives' WHERE appName = {{ instance }} AND alexa.directive IS NOT NULL AND alexa.directive NOT LIKE 'Alexa.Discovery%' TIMESERIES"
      }
    }

    widget_line {
      title  = "Reads (ReportState polling) vs Writes (commands)"
      row    = 7
      column = 1
      width  = 8
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Transaction SELECT count(*) WHERE appName = {{ instance }} AND alexa.action.type IS NOT NULL FACET alexa.action.type TIMESERIES"
      }

      legend_enabled = true
    }

    widget_pie {
      title  = "Read/write split (last 24h)"
      row    = 7
      column = 9
      width  = 4
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Transaction SELECT count(*) WHERE appName = {{ instance }} AND alexa.action.type IS NOT NULL FACET alexa.action.type SINCE 1 day ago"
      }
    }
  }

  # ----------------------------------------------------------------------
  # PAGE 3 — Activité métier
  # Domain-level signals based on the agent's auto-instrumentation:
  # external calls to Domoticz, MySQL queries to the OAuth/users DB,
  # and per-directive response latency.
  # ----------------------------------------------------------------------
  page {
    name = "Activité métier"

    widget_line {
      title  = "External calls (Domoticz)"
      row    = 1
      column = 1
      width  = 6
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Transaction SELECT count(externalDuration) WHERE appName = {{ instance }} AND externalDuration IS NOT NULL TIMESERIES"
      }
    }

    widget_line {
      title  = "Domoticz call duration (avg ms)"
      row    = 1
      column = 7
      width  = 6
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Transaction SELECT average(externalDuration * 1000) WHERE appName = {{ instance }} AND externalDuration IS NOT NULL TIMESERIES"
      }

      units {
        unit = "ms"
      }
    }

    widget_line {
      title  = "DB query time (avg ms)"
      row    = 4
      column = 1
      width  = 6
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Transaction SELECT average(databaseDuration * 1000) WHERE appName = {{ instance }} AND databaseDuration IS NOT NULL TIMESERIES"
      }

      units {
        unit = "ms"
      }
    }

    widget_stacked_bar {
      title  = "Response time breakdown (avg ms)"
      row    = 4
      column = 7
      width  = 6
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Transaction SELECT average(databaseDuration * 1000) AS 'MySQL', average(externalDuration * 1000) AS 'Domoticz', average((duration - databaseDuration - externalDuration) * 1000) AS 'Other (handler logic)' WHERE appName = {{ instance }} TIMESERIES"
      }

      units {
        unit = "ms"
      }
    }

    widget_bar {
      title  = "Commands by Domoticz subtype (last 24h)"
      row    = 7
      column = 1
      width  = 6
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Transaction SELECT count(*) WHERE appName = {{ instance }} AND domoticz.subtype IS NOT NULL FACET domoticz.subtype SINCE 1 day ago LIMIT 20"
      }
    }

    widget_line {
      title  = "Domoticz call duration by subtype (avg ms)"
      row    = 7
      column = 7
      width  = 6
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Transaction SELECT average(externalDuration * 1000) WHERE appName = {{ instance }} AND domoticz.subtype IS NOT NULL FACET domoticz.subtype TIMESERIES"
      }

      legend_enabled = true

      units {
        unit = "ms"
      }
    }

    widget_table {
      title  = "Errors by component (caught + uncaught)"
      row    = 10
      column = 1
      width  = 12
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM TransactionError SELECT count(*) WHERE appName = {{ instance }} FACET component, error.class, error.message SINCE 1 day ago LIMIT 50"
      }

      initial_sorting {
        direction = "desc"
        name      = "count"
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
        query      = "FROM Log SELECT count(*) WHERE entity.name = {{ instance }} FACET level TIMESERIES"
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
        query      = "FROM Log SELECT timestamp, message, level WHERE entity.name = {{ instance }} AND level = 'error' SINCE 1 day ago LIMIT 100"
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
        query      = "FROM Log SELECT timestamp, message, level WHERE entity.name = {{ instance }} SINCE 1 hour ago LIMIT 200"
      }
    }
  }

  # ----------------------------------------------------------------------
  # PAGE 5 — Devices & Users
  # Fleet- and user-level signals. Relies on custom attributes attached
  # in the Lambda handler: alexa.endpointId (which device was acted on),
  # alexa.userId (DB id of the user behind the OAuth token),
  # discovery.deviceCount (devices returned by the last Discovery).
  # ----------------------------------------------------------------------
  page {
    name = "Devices & Users"

    widget_bar {
      title  = "Top 10 devices used (last 24h)"
      row    = 1
      column = 1
      width  = 6
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Transaction SELECT count(*) WHERE appName = {{ instance }} AND alexa.endpointId IS NOT NULL FACET alexa.endpointId SINCE 1 day ago LIMIT 10"
      }
    }

    widget_pie {
      title  = "Devices by Domoticz subtype (last 24h)"
      row    = 1
      column = 7
      width  = 6
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Transaction SELECT uniqueCount(domoticz.deviceId) WHERE appName = {{ instance }} AND domoticz.subtype IS NOT NULL FACET domoticz.subtype SINCE 1 day ago"
      }
    }

    widget_billboard {
      title  = "Discovery inventory (latest)"
      row    = 4
      column = 1
      width  = 4
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Transaction SELECT latest(discovery.deviceCount) WHERE appName = {{ instance }} AND discovery.deviceCount IS NOT NULL SINCE 1 day ago"
      }
    }

    widget_billboard {
      title  = "Distinct users (last 24h)"
      row    = 4
      column = 5
      width  = 4
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Transaction SELECT uniqueCount(alexa.userId) WHERE appName = {{ instance }} AND alexa.userId IS NOT NULL SINCE 1 day ago"
      }
    }

    widget_billboard {
      title  = "Devices used (last 24h)"
      row    = 4
      column = 9
      width  = 4
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Transaction SELECT uniqueCount(alexa.endpointId) WHERE appName = {{ instance }} AND alexa.endpointId IS NOT NULL SINCE 1 day ago"
      }
    }

    widget_line {
      title  = "Distinct users over time"
      row    = 7
      column = 1
      width  = 8
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Transaction SELECT uniqueCount(alexa.userId) WHERE appName = {{ instance }} AND alexa.userId IS NOT NULL TIMESERIES 1 hour"
      }

      y_axis_left_zero = true
    }

    widget_bar {
      title  = "Top users by invocation count (last 24h)"
      row    = 7
      column = 9
      width  = 4
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Transaction SELECT count(*) WHERE appName = {{ instance }} AND alexa.userId IS NOT NULL FACET alexa.userId SINCE 1 day ago LIMIT 10"
      }
    }
  }

  # ----------------------------------------------------------------------
  # PAGE 6 — APM Transactions
  # Same kind of signal as the "Alexa Traffic" and "Lambda Health" pages,
  # but sourced from the agent's auto-instrumented Transaction events
  # instead of our custom-metric timeslices. Useful as a cross-check —
  # if a widget on the custom-metric pages goes dark, the equivalent
  # widget here will tell you whether the issue is the metric pipeline
  # or the underlying Lambda invocation itself.
  #
  # appName in NR matches the Lambda function name when using the NR
  # Lambda layer (one per function: alhau_preprod, ludohomekit).
  # ----------------------------------------------------------------------
  page {
    name = "APM Transactions"

    widget_line {
      title  = "Throughput per env"
      row    = 1
      column = 1
      width  = 8
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Transaction SELECT count(*) WHERE appName IN (${local.lambda_in_clause}) FACET appName TIMESERIES"
      }

      legend_enabled = true
    }

    widget_billboard {
      title  = "Invocations (last 24h)"
      row    = 1
      column = 9
      width  = 4
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Transaction SELECT count(*) WHERE appName IN (${local.lambda_in_clause}) SINCE 1 day ago"
      }
    }

    widget_line {
      title  = "Duration p50 / p95 / p99"
      row    = 4
      column = 1
      width  = 8
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Transaction SELECT percentile(duration * 1000, 50, 95, 99) WHERE appName IN (${local.lambda_in_clause}) TIMESERIES"
      }

      legend_enabled    = true
      y_axis_left_zero  = true
      ignore_time_range = false

      units {
        unit = "ms"
      }
    }

    widget_billboard {
      title  = "Error rate (last hour)"
      row    = 4
      column = 9
      width  = 4
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM Transaction SELECT percentage(count(*), WHERE error IS true) WHERE appName IN (${local.lambda_in_clause}) SINCE 1 hour ago"
      }

      warning  = 1
      critical = 5
    }

    widget_area {
      title  = "Errors over time"
      row    = 7
      column = 1
      width  = 6
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM TransactionError SELECT count(*) WHERE appName IN (${local.lambda_in_clause}) FACET appName TIMESERIES"
      }

      legend_enabled = true
    }

    widget_table {
      title  = "Recent errors"
      row    = 7
      column = 7
      width  = 6
      height = 3

      nrql_query {
        account_id = var.account_id
        query      = "FROM TransactionError SELECT timestamp, appName, error.message, error.class WHERE appName IN (${local.lambda_in_clause}) SINCE 1 day ago LIMIT 50"
      }

      initial_sorting {
        direction = "desc"
        name      = "timestamp"
      }
    }

    widget_table {
      title  = "Slowest transactions (last 24h)"
      row    = 10
      column = 1
      width  = 12
      height = 4

      nrql_query {
        account_id = var.account_id
        query      = "FROM Transaction SELECT timestamp, appName, duration * 1000 AS 'duration_ms', error WHERE appName IN (${local.lambda_in_clause}) SINCE 1 day ago LIMIT 100"
      }

      initial_sorting {
        direction = "desc"
        name      = "duration_ms"
      }
    }
  }
}
