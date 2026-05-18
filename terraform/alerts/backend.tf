# Remote state in the same S3 bucket as the other modules, under a
# dedicated key so the alert state stays isolated.
terraform {
  backend "s3" {
    bucket       = "alhau-tfstate"
    key          = "alerts/terraform.tfstate"
    region       = "eu-west-1"
    use_lockfile = true
    encrypt      = true
  }
}
