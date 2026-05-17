# IAM execution role shared by both Lambdas.
#
# Both alhau_preprod and ludohomekit use the SAME execution role.
# We model that with a single aws_iam_role resource here and reference
# it from both aws_lambda_function blocks in functions.tf.
#
# The Lambda code only needs the basic execution role (CloudWatch Logs).
# All external calls are HTTPS (to Domoticz) or MySQL over TCP — neither
# requires AWS service permissions. If you later add S3/DynamoDB/etc.
# access, attach additional policies here.
#
# For from-scratch deployment, `terraform apply` creates this role.
# For an existing setup, import it before apply:
#
#   terraform import aws_iam_role.shared <existing-role-name>
#   terraform import aws_iam_role_policy_attachment.shared_basic_execution \
#     <existing-role-name>/arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
#
# Find the existing role name with:
#   aws lambda get-function-configuration --function-name <fn> \
#     --query 'Role' --output text
# and strip the ARN prefix to keep just the role name.
#
# ⚠️ If the existing role has policies attached beyond the basic
# execution role (common when the role was created by AWS Serverless
# Application Repository or similar), you'll need to add a matching
# aws_iam_role_policy_attachment for each one, otherwise `terraform
# apply` will detach them from the role. See README → "Adopt existing".

data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "shared" {
  name               = var.shared_iam_role_name
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

resource "aws_iam_role_policy_attachment" "shared_basic_execution" {
  role       = aws_iam_role.shared.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}
