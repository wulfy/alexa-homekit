# These outputs are printed at the end of `terraform apply` and must be
# manually copied into terraform/dashboard/backend.tf, because the `backend`
# block does NOT support variables (a known Terraform limitation).

output "bucket_name" {
  description = "Name of the bucket. Copy into terraform/dashboard/backend.tf as the `bucket` argument."
  value       = aws_s3_bucket.tfstate.id
}

output "region" {
  description = "Region of the bucket. Copy into terraform/dashboard/backend.tf as the `region` argument."
  value       = var.region
}

output "post_apply_instructions" {
  description = "What to do after applying this module."
  value       = <<-EOT
    Bootstrap complete. Next steps:

      1. Edit terraform/dashboard/backend.tf and set:
         - bucket = "${aws_s3_bucket.tfstate.id}"
         - region = "${var.region}"

      2. cd terraform/dashboard && terraform init
  EOT
}
