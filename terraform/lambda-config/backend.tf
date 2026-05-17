# Remote state stored in the same S3 bucket as the dashboard module's
# state, under a distinct key so the two root modules don't clobber
# each other. The bucket itself is created by terraform/bootstrap/.
terraform {
  backend "s3" {
    bucket       = "alhau-tfstate"
    key          = "lambda-config/terraform.tfstate"
    region       = "eu-west-1"
    use_lockfile = true
    encrypt      = true
  }
}
