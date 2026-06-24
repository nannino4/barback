#!/usr/bin/env bash
set -euo pipefail

PROFILE="${AWS_PROFILE:-${1:-default}}"
REGION="${AWS_REGION:-${2:-eu-west-1}}"
DOMAIN="${DOMAIN_NAME:-${3:-barback.it}}"
MAIL_FROM_DOMAIN="${MAIL_FROM_DOMAIN:-mail.${DOMAIN}}"

printf 'AWS profile: %s\n' "${PROFILE}"
printf 'SES region:  %s\n' "${REGION}"
printf 'Domain:      %s\n\n' "${DOMAIN}"

aws sesv2 get-email-identity \
  --profile "${PROFILE}" \
  --region "${REGION}" \
  --email-identity "${DOMAIN}" \
  --query '{IdentityType:IdentityType,VerifiedForSendingStatus:VerifiedForSendingStatus,DkimAttributes:DkimAttributes,MailFromAttributes:MailFromAttributes}' \
  --output json

printf '\nDNS checks:\n'
for name in \
  "_amazonses.${DOMAIN}" \
  "_dmarc.${DOMAIN}" \
  "${MAIL_FROM_DOMAIN}"
do
  printf '\n== %s TXT ==\n' "${name}"
  dig +short TXT "${name}" || true
  printf '== %s MX ==\n' "${name}"
  dig +short MX "${name}" || true
  printf '== %s CNAME ==\n' "${name}"
  dig +short CNAME "${name}" || true
done
