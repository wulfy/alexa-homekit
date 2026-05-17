terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source = "hashicorp/aws"
      # Need >= 5.80 for nodejs24.x runtime validation (latest runtimes
      # are added in minor releases). Allowing 6.x too, which is mature
      # as of 2026.
      version = ">= 5.80, < 7.0"
    }
    # archive provider is used to materialise a placeholder zip for the
    # aws_lambda_function `filename` argument. The actual function code
    # is deployed by scripts/deploy.sh — see lifecycle.ignore_changes in
    # functions.tf.
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }
}
