data "aws_route53_zone" "primary" {
  count = local.use_hosted_zone_data ? 1 : 0

  name         = local.route53_domain_name
  private_zone = false
}

resource "aws_route53_record" "dmarc" {
  zone_id = local.hosted_zone_id
  name    = "_dmarc.${local.domain_name}"
  type    = "TXT"
  ttl     = 300
  records = [var.dmarc_record]

  allow_overwrite = true
}
