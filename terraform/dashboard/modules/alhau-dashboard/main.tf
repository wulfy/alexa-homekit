# Locals used by widgets across pages. Centralizing these strings here
# avoids subtle drift between pages and makes it obvious what query
# fragment is reused where.
#
# Note on metric data shape: the app uses newrelic.incrementMetric() and
# newrelic.recordMetric() (see config/metrics.js). Both publish *metric
# timeslice data*, which is queried in NRQL as:
#
#   FROM Metric WHERE metricTimesliceName LIKE 'Custom/<ns>/<key>'
#   SELECT sum(newrelic.timeslice.value)            -- for counters
#   SELECT percentile(newrelic.timeslice.value, 95) -- for ms timings
#
# This is DIFFERENT from custom events (FROM <EventName> ...).
# If the queries below return no data after `apply`, the most likely
# cause is a mismatch in metricTimesliceName — verify with the New Relic
# Query Builder by running:
#
#   FROM Metric SELECT uniques(metricTimesliceName)
#   WHERE metricTimesliceName LIKE 'Custom/lambda.alhau%' SINCE 1 day ago
#
# and adjust the `like_*` locals below.

locals {
  lambda_function_names = [
    var.lambda_prod_name,
    var.lambda_preprod_name,
  ]

  # NRQL-friendly representation: "'ludohomekit', 'alhau_preprod'"
  lambda_in_clause = join(", ", [for n in local.lambda_function_names : format("'%s'", n)])

  # LIKE patterns for metric timeslices. The `%` after the namespace covers
  # the per-instance suffix (e.g. lambda.alhau.prod, lambda.alhau.preprod).
  like_request  = "Custom/${var.metric_namespace}.%/request.%"
  like_answer   = "Custom/${var.metric_namespace}.%/calls.answer.%"
  like_command  = "Custom/${var.metric_namespace}.%/calls.command.%"
  like_database = "Custom/${var.metric_namespace}.%/calls.database.%"
}
