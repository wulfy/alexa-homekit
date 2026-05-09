variable "bucket_name" {
  description = "Name of the S3 bucket that will host the dashboard module's tfstate. Must be globally unique across AWS."
  type        = string
}

variable "region" {
  description = "AWS region in which the bucket is created. Should match the dashboard module's backend region."
  type        = string
  default     = "eu-west-1"
}

variable "lifecycle_noncurrent_days" {
  description = "Number of days a noncurrent version of an object is kept before being permanently deleted. Lower values save storage cost but reduce the recovery window."
  type        = number
  default     = 90
}
