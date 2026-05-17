# Module `alhau-dashboard`

Defines the New Relic One dashboard for the Alexa HomeKit Lambda.

## Inputs

| Name | Type | Description |
|---|---|---|
| `account_id` | `number` | New Relic account ID used by every NRQL query. |
| `dashboard_name` | `string` | Display name in NR One. |
| `newrelic_app_name` | `string` | APM application name (matches `NEW_RELIC_APP_NAME`). |
| `lambda_prod_name` | `string` | AWS Lambda name (prod). |
| `lambda_preprod_name` | `string` | AWS Lambda name (preprod). |
| `metric_namespace` | `string` | Custom-metric prefix used by `config/metrics.js` (default `lambda.alhau`). |

## Outputs

| Name | Description |
|---|---|
| `permalink` | URL of the dashboard in NR One. |
| `guid` | Entity GUID of the dashboard. |

## Pages

1. **Lambda Health** — APM/Lambda signals: invocations, error rate, latency p50/p95/p99, cold starts, recent errors.
2. **Alexa Traffic** — Requests and latency by Alexa directive (`Alexa.PowerController.TurnOn`, …) based on `Custom/<ns>/request.*` metric timeslices.
3. **Activité métier** — Domoticz commands by subtype, top devices, DB lookups, Alexa response volumes.
4. **Logs** — Log volume by level, recent error logs, recent logs (all levels). Requires log forwarding to be enabled.

## NRQL data shape

The custom metrics are published via `newrelic.incrementMetric()` and `newrelic.recordMetric()` in `config/metrics.js`. They arrive as **metric timeslice data**, queried in NRQL via:

```nrql
FROM Metric SELECT sum(newrelic.timeslice.value)
WHERE metricTimesliceName LIKE 'Custom/lambda.alhau.%/request.%'
FACET metricTimesliceName
```

If a widget shows no data, validate the `metricTimesliceName` patterns in the New Relic Query Builder:

```nrql
FROM Metric SELECT uniques(metricTimesliceName)
WHERE metricTimesliceName LIKE 'Custom/lambda.alhau%' SINCE 1 day ago
```

then adjust the `like_*` locals in `main.tf`.

## Dashboard-level variable

A single `instance` filter (`prod` / `preprod`) is exposed at the top of the dashboard. As of this version, NRQL queries do not yet inject the `{{ instance }}` token explicitly — adding `WHERE provider.functionName = '{{ instance == "prod" ? "ludohomekit" : "alhau_preprod" }}'` -style mapping is a future improvement. The current widgets cover both envs by Lambda name in `IN (...)` clauses.
