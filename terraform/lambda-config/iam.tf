# IAM execution roles for the Lambdas.
#
# The Lambda code only needs the basic execution role (CloudWatch Logs).
# All external calls are HTTPS (to Domoticz) or MySQL over TCP — neither
# requires AWS service permissions. If you later add S3/DynamoDB/etc.
# access, attach additional policies here.
#
# For from-scratch deployment, `terraform apply` creates these roles.
# For an existing setup, import them before apply:
#
#   terraform import aws_iam_role.preprod <existing-role-name>
#   terraform import aws_iam_role.prod    <existing-role-name>
#
# (Find existing role names with `aws lambda get-function-configuration
#  --function-name <fn> --query 'Role' --output text` and strip the ARN
#  prefix to keep just the role name.)

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

resource "aws_iam_role" "preprod" {
  name               = var.preprod.iam_role_name
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

resource "aws_iam_role_policy_attachment" "preprod_basic_execution" {
  role       = aws_iam_role.preprod.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role" "prod" {
  name               = var.prod.iam_role_name
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
}

resource "aws_iam_role_policy_attachment" "prod_basic_execution" {
  role       = aws_iam_role.prod.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}
