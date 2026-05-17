# We require >= 1.10 because we use native S3 state locking
# (use_lockfile attribute on the S3 backend, GA in Terraform 1.10).
# Before 1.10 we would have needed a DynamoDB table for locking.
terraform {
  required_version = ">= 1.10"

  required_providers {
    newrelic = {
      source  = "newrelic/newrelic"
      version = "~> 3.50"
    }
  }
}
