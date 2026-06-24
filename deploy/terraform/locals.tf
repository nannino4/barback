locals {
  domain_name          = trimsuffix(var.domain_name, ".")
  route53_domain_name  = "${local.domain_name}."
  mail_from_domain     = "${var.mail_from_subdomain}.${local.domain_name}"
  use_hosted_zone_data = var.hosted_zone_id == ""
  hosted_zone_id       = local.use_hosted_zone_data ? data.aws_route53_zone.primary[0].zone_id : var.hosted_zone_id

  common_tags = {
    Project     = "barback"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
