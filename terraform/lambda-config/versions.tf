terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50"
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
