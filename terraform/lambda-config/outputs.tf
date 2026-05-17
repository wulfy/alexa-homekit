output "preprod_function_arn" {
  description = "ARN of the preprod Lambda after Terraform took it over."
  value       = aws_lambda_function.preprod.arn
}

output "prod_function_arn" {
  description = "ARN of the prod Lambda after Terraform took it over."
  value       = aws_lambda_function.prod.arn
}

output "preprod_last_modified" {
  description = "When AWS last updated the preprod function (useful to confirm deploy.sh runs)."
  value       = aws_lambda_function.preprod.last_modified
}

output "prod_last_modified" {
  description = "When AWS last updated the prod function."
  value       = aws_lambda_function.prod.last_modified
}
