# Locals used by widgets across pages.
#
# The dashboard sources all its data from agent auto-instrumented events
# (Transaction, TransactionError, AwsLambdaInvocation, Metric goldenmetrics)
# rather than the legacy timeslice custom metrics emitted by
# newrelic.incrementMetric(). The timeslice format is being phased out
# at New Relic and is not queryable via standard NRQL filters on our
# account, so we use the supported events instead.
#
# Per-directive breakdowns (e.g. Alexa.PowerController.TurnOn) come from
# the `alexa.directive` custom attribute that index.js attaches to every
# Transaction via newrelic.addCustomAttribute().

locals {
  lambda_function_names = [
    var.lambda_prod_name,
    var.lambda_preprod_name,
  ]

  # NRQL-friendly representation: "'ludohomekit', 'alhau_preprod'"
  lambda_in_clause = join(", ", [for n in local.lambda_function_names : format("'%s'", n)])
}
