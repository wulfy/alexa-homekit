# Pinning Terraform and provider versions guarantees reproducible runs.
# We require >= 1.10 because the dashboard root module uses native S3 state
# locking (use_lockfile), introduced in Terraform 1.10. This bootstrap module
# does not strictly need 1.10 itself, but we align all modules on the same
# minimum version for simplicity.
terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50"
    }
  }
}

# AWS credentials and region are read from the standard AWS env vars or
# ~/.aws/credentials. Region can also be overridden via the `region` input
# variable to avoid relying on shell configuration.
provider "aws" {
  region = var.region
}
