resource "aws_ses_domain_identity" "barback" {
  provider = aws.ses

  domain = local.domain_name
}

resource "aws_route53_record" "ses_verification" {
  zone_id = local.hosted_zone_id
  name    = "_amazonses.${local.domain_name}"
  type    = "TXT"
  ttl     = 300
  records = [aws_ses_domain_identity.barback.verification_token]

  allow_overwrite = true
}

resource "aws_ses_domain_identity_verification" "barback" {
  provider = aws.ses

  domain = aws_ses_domain_identity.barback.id

  depends_on = [aws_route53_record.ses_verification]

  timeouts {
    create = "45m"
  }
}

resource "aws_ses_domain_dkim" "barback" {
  provider = aws.ses

  domain = aws_ses_domain_identity.barback.domain
}

resource "aws_route53_record" "ses_dkim" {
  count = 3

  zone_id = local.hosted_zone_id
  name    = "${element(aws_ses_domain_dkim.barback.dkim_tokens, count.index)}._domainkey.${local.domain_name}"
  type    = "CNAME"
  ttl     = 300
  records = ["${element(aws_ses_domain_dkim.barback.dkim_tokens, count.index)}.dkim.${var.ses_region}.amazonses.com"]

  allow_overwrite = true
}

resource "aws_ses_domain_mail_from" "barback" {
  provider = aws.ses

  domain           = aws_ses_domain_identity.barback.domain
  mail_from_domain = local.mail_from_domain

  behavior_on_mx_failure = "RejectMessage"
}

resource "aws_route53_record" "ses_mail_from_mx" {
  zone_id = local.hosted_zone_id
  name    = local.mail_from_domain
  type    = "MX"
  ttl     = 300
  records = ["10 feedback-smtp.${var.ses_region}.amazonses.com"]

  allow_overwrite = true
}

resource "aws_route53_record" "ses_mail_from_spf" {
  zone_id = local.hosted_zone_id
  name    = local.mail_from_domain
  type    = "TXT"
  ttl     = 300
  records = ["v=spf1 include:amazonses.com -all"]

  allow_overwrite = true
}
