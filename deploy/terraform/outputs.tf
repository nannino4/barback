output "domain_name" {
  description = "Barback domain managed by this Terraform root module."
  value       = local.domain_name
}

output "hosted_zone_id" {
  description = "Route53 hosted zone ID used for DNS records."
  value       = local.hosted_zone_id
}

output "ses_region" {
  description = "SES region where the Barback identity is configured."
  value       = var.ses_region
}

output "ses_api_region" {
  description = "SES API region to configure in the backend."
  value       = var.ses_region
}

output "ses_from_address" {
  description = "Recommended default From address for application email."
  value       = "noreply@${local.domain_name}"
}

output "ses_mail_from_domain" {
  description = "Custom MAIL FROM domain configured for SES."
  value       = local.mail_from_domain
}

output "ses_verification_txt_record" {
  description = "SES domain-verification TXT record name."
  value       = aws_route53_record.ses_verification.fqdn
}

output "ses_dkim_cname_records" {
  description = "DKIM CNAME record names created for SES Easy DKIM."
  value       = aws_route53_record.ses_dkim[*].fqdn
}

output "app_email_access_key_id" {
  description = "AWS access key ID for backend SES API email sending."
  value       = var.create_app_runtime_credentials ? aws_iam_access_key.app_email_sender[0].id : null
  sensitive   = true
}

output "app_email_secret_access_key" {
  description = "AWS secret access key for backend SES API email sending."
  value       = var.create_app_runtime_credentials ? aws_iam_access_key.app_email_sender[0].secret : null
  sensitive   = true
}

output "app_storage_access_key_id" {
  description = "S3 access key ID for backend profile-picture storage."
  value       = var.create_app_runtime_credentials ? aws_iam_access_key.app_storage[0].id : null
  sensitive   = true
}

output "app_storage_secret_access_key" {
  description = "S3 secret access key for backend profile-picture storage."
  value       = var.create_app_runtime_credentials ? aws_iam_access_key.app_storage[0].secret : null
  sensitive   = true
}
