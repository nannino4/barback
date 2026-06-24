variable "aws_profile" {
  description = "AWS CLI profile to use for Barback infrastructure. Use a Barback-specific admin/terraform profile, not profiles for other projects."
  type        = string
  default     = "default"
}

variable "aws_region" {
  description = "Primary AWS region for regional Barback resources."
  type        = string
  default     = "eu-south-1"
}

variable "ses_region" {
  description = "AWS SES API region used by the backend email configuration."
  type        = string
  default     = "eu-south-1"
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
  default     = "dev"
}

variable "domain_name" {
  description = "Primary public domain name."
  type        = string
  default     = "barback.it"
}

variable "hosted_zone_id" {
  description = "Route53 public hosted zone ID for domain_name. Leave empty to look it up by name. Supplying this avoids route53:ListHostedZones requirements."
  type        = string
  default     = ""
}

variable "mail_from_subdomain" {
  description = "Subdomain used as SES custom MAIL FROM domain."
  type        = string
  default     = "mail"
}

variable "dmarc_record" {
  description = "DMARC TXT record content for _dmarc.domain_name. Start with p=none while validating mail flow."
  type        = string
  default     = "v=DMARC1; p=none;"
}

variable "create_app_runtime_credentials" {
  description = "Set true to create IAM access keys used by the backend for SES API email and S3 profile-picture storage. Secrets are stored in Terraform state."
  type        = bool
  default     = false
}

variable "manage_profile_pictures_bucket" {
  description = "Set true after importing the existing profile-picture S3 resources into Terraform state."
  type        = bool
  default     = false
}

variable "profile_pictures_bucket_name" {
  description = "Existing S3 bucket used by Barback for user profile pictures."
  type        = string
  default     = "amazon-s3-barback-dev"
}

variable "profile_pictures_allowed_origins" {
  description = "CORS allowed origins for profile-picture uploads/downloads."
  type        = list(string)
  default = [
    "http://localhost:5173",
    "https://barback.it",
  ]
}

variable "profile_pictures_cloudfront_distribution_arn" {
  description = "CloudFront distribution ARN allowed to read private objects from the profile-picture bucket."
  type        = string
  default     = "arn:aws:cloudfront::812064793643:distribution/E14WOM64LPPM1R"
}
