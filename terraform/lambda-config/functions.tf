# Lambda runtime configuration for both env (preprod + prod).
#
# What Terraform owns here:
#   - handler          (newrelic-lambda-wrapper.handler — the NR layer wrapper)
#   - runtime          (nodejs24.x)
#   - layers           (the NR Lambda Layer)
#   - environment      (full merged map of app vars + NR vars)
#
# What Terraform does NOT own:
#   - The code zip itself — managed by scripts/deploy.sh which calls
#     `aws lambda update-function-code`. We point at a placeholder zip
#     and ignore all code-related attributes via lifecycle.
#   - The IAM role policy — Terraform references the existing role ARN
#     and never modifies its attached policies.
#
# Before the first `terraform apply`, you MUST import each function:
#
#   terraform import aws_lambda_function.preprod alhau_preprod
#   terraform import aws_lambda_function.prod    ludohomekit
#
# This brings the existing AWS state into Terraform without recreating
# the functions. See README.md for the full bootstrapping sequence.

resource "aws_lambda_function" "preprod" {
  function_name = var.preprod.function_name
  role          = aws_iam_role.shared.arn
  runtime       = "nodejs24.x"
  handler       = "newrelic-lambda-wrapper.handler"

  filename         = data.archive_file.placeholder.output_path
  source_code_hash = data.archive_file.placeholder.output_base64sha256

  layers = [var.nr_lambda_layer_arn]

  environment {
    variables = merge(var.preprod.env_vars, local.nr_env_vars)
  }

  lifecycle {
    ignore_changes = [
      filename,
      s3_bucket,
      s3_key,
      s3_object_version,
      source_code_hash,
      last_modified,
    ]
  }
}

resource "aws_lambda_function" "prod" {
  function_name = var.prod.function_name
  role          = aws_iam_role.shared.arn
  runtime       = "nodejs24.x"
  handler       = "newrelic-lambda-wrapper.handler"

  filename         = data.archive_file.placeholder.output_path
  source_code_hash = data.archive_file.placeholder.output_base64sha256

  layers = [var.nr_lambda_layer_arn]

  environment {
    variables = merge(var.prod.env_vars, local.nr_env_vars)
  }

  lifecycle {
    ignore_changes = [
      filename,
      s3_bucket,
      s3_key,
      s3_object_version,
      source_code_hash,
      last_modified,
    ]
  }
}
