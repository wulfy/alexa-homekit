# Child modules declare provider *requirements* (compatibility) but inherit
# provider *configuration* from the caller. We pin the same version range
# as the root to keep them aligned.
terraform {
  required_version = ">= 1.10"

  required_providers {
    newrelic = {
      source  = "newrelic/newrelic"
      version = "~> 3.50"
    }
  }
}
