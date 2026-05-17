# The root module's job is to wire variables into the child module that
# actually defines the dashboard. Keeping the root thin (just the module
# call + provider config) is a common pattern: the root deals with
# "deployment context" (account, env), the child module deals with
# "what the dashboard looks like".

module "alhau_dashboard" {
  source = "./modules/alhau-dashboard"

  account_id          = var.nr_account_id
  dashboard_name      = var.dashboard_name
  newrelic_app_name   = var.newrelic_app_name
  lambda_prod_name    = var.lambda_prod_name
  lambda_preprod_name = var.lambda_preprod_name
  metric_namespace    = var.metric_namespace
}
