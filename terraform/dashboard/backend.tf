# Remote state stored in the S3 bucket created by the bootstrap module.
#
# IMPORTANT: the `backend` block does not support variables — these
# values are recopied manually from the bootstrap outputs.
#
# `use_lockfile = true` (Terraform 1.10+) enables native S3 state locking.
# A `.tflock` file is created next to the state during apply, removing the
# need for a DynamoDB table. This is the modern, recommended pattern.
terraform {
  backend "s3" {
    bucket       = "alhau-tfstate"
    key          = "newrelic-dashboard/terraform.tfstate"
    region       = "eu-west-1"
    use_lockfile = true
    encrypt      = true
  }
}
