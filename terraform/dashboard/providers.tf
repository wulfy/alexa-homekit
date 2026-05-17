# The New Relic provider authenticates via env vars by default:
#   - NEW_RELIC_API_KEY (User API key, distinct from the License Key
#     used by the runtime agent)
#   - NEW_RELIC_REGION (US or EU — set to "EU" for European accounts)
#
# We pass `account_id` explicitly so it is documented in code and
# can come from the shared.tfvars (.envrc TF_VAR_nr_account_id) without
# leaking into the rest of the codebase.
provider "newrelic" {
  account_id = var.nr_account_id
  region     = var.nr_region
}
