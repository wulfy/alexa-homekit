# This module's only job is to create the S3 bucket that will host the
# *other* root module's tfstate. It uses a LOCAL state file (gitignored)
# because it must run before any remote state exists.
#
# We split the bucket configuration across several resources because the
# AWS provider has dedicated resources for each S3 feature (versioning,
# encryption, public access block, lifecycle). This is the modern,
# idiomatic style — older Terraform code often had inline blocks on
# aws_s3_bucket itself, but those are deprecated in provider v4+.

resource "aws_s3_bucket" "tfstate" {
  bucket = var.bucket_name

  tags = {
    Project   = "alexa-homekit"
    ManagedBy = "terraform"
    Purpose   = "tfstate-storage"
  }
}

# Versioning protects us from accidental state corruption: if a faulty
# apply writes a broken state, we can roll back to a previous version.
resource "aws_s3_bucket_versioning" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Server-side encryption with AES-256 is free (no KMS key needed).
# We do NOT use a KMS key because that would incur monthly cost and
# add complexity for a personal project. AES-256 is sufficient for
# tfstate encryption at rest.
resource "aws_s3_bucket_server_side_encryption_configuration" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block all forms of public access. Tfstate may contain sensitive data
# (resource attributes, sometimes credentials in older provider versions)
# so it MUST never be reachable from the public internet.
resource "aws_s3_bucket_public_access_block" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Purge noncurrent versions after N days to keep storage costs minimal.
# This is fine because we only need enough history to recover from a
# botched apply within a reasonable window.
resource "aws_s3_bucket_lifecycle_configuration" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  # The lifecycle rule depends on versioning being enabled first.
  depends_on = [aws_s3_bucket_versioning.tfstate]

  rule {
    id     = "expire-old-versions"
    status = "Enabled"

    filter {}

    noncurrent_version_expiration {
      noncurrent_days = var.lifecycle_noncurrent_days
    }
  }
}
