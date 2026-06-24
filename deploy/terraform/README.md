# Barback Terraform

Terraform root module for AWS resources owned by Barback.

Current focus:

- Route53 DNS records for `barback.it`
- SES domain identity, Easy DKIM, and custom MAIL FROM validation records
- Optional import of the existing profile-picture S3 bucket configuration

## Important AWS profile note

This AWS account contains multiple projects. Use a Barback-specific Terraform/admin
profile for this directory. Do not use profiles created for other projects.

Use the local `barback-terraform` profile for this module. It is a dedicated
Barback IAM user; avoid using profiles that belong to other projects.

Minimum permissions needed for the SES/DNS work:

- `route53:ListHostedZones`, `route53:GetHostedZone`,
  `route53:ListResourceRecordSets`, `route53:ChangeResourceRecordSets`,
  `route53:GetChange`
- `ses:GetIdentityVerificationAttributes`, `ses:VerifyDomainIdentity`,
  `ses:GetIdentityDkimAttributes`, `ses:VerifyDomainDkim`,
  `ses:SetIdentityMailFromDomain`, `ses:GetIdentityMailFromDomainAttributes`
- or equivalent SESv2 permissions if your admin policy is SESv2-based

## Local setup

```bash
cd deploy/terraform
cp terraform.tfvars.example terraform.tfvars
# edit terraform.tfvars and set aws_profile to a Barback Terraform/admin profile
terraform init
terraform fmt -recursive
terraform validate
```

If the profile does not have `route53:ListHostedZones*`, set `hosted_zone_id` in
`terraform.tfvars`.

## SES region

`ses_region` must match backend `SES_REGION`. The backend sends email through
the AWS SES API instead of SMTP because `eu-south-1` has SES API support and
production access for this account, but no SES SMTP endpoint.

```env
EMAIL_TRANSPORT=ses
SES_REGION=eu-south-1
```

## Import/adopt the existing SES identity

If `barback.it` already exists in SES, import it before applying:

```bash
terraform import aws_ses_domain_identity.barback barback.it
terraform import aws_ses_domain_dkim.barback barback.it
# If a custom MAIL FROM domain already exists:
terraform import aws_ses_domain_mail_from.barback barback.it
```

Then run:

```bash
terraform plan
terraform apply
```

Terraform will create/adopt these DNS records in Route53:

- `_amazonses.barback.it` TXT for SES identity verification
- three `*._domainkey.barback.it` CNAMEs for Easy DKIM
- `mail.barback.it` MX/TXT for SES custom MAIL FROM
- `_dmarc.barback.it` TXT, currently `v=DMARC1; p=none;`

`allow_overwrite = true` is set on these DNS records so Terraform can take over
existing values safely, but importing pre-existing records is still preferred
when possible.

## Validate SES after apply

```bash
./check-ses-domain.sh barback-terraform eu-south-1 barback.it
```

Expected final state in `aws sesv2 get-email-identity`:

- `VerifiedForSendingStatus: true`
- DKIM status: `SUCCESS`
- MAIL FROM status: `SUCCESS`

Also verify the account is out of the SES sandbox in the same `ses_region` if you
need to send to arbitrary recipients.

## Optional: backend runtime credentials

Set this in `terraform.tfvars` to create IAM access keys for backend SES API
email sending and S3 profile-picture storage:

```hcl
create_app_runtime_credentials = true
```

The generated SES and S3 access keys are sensitive Terraform outputs and are
stored in local Terraform state. Keep `terraform.tfstate` out of Git and migrate
to encrypted remote state before sharing operations.

After apply, export a local env snippet with:

```bash
{
  echo "EMAIL_TRANSPORT=ses"
  echo "SES_REGION=$(terraform output -raw ses_api_region)"
  echo "SES_ACCESS_KEY_ID=$(terraform output -raw app_email_access_key_id)"
  echo "SES_SECRET_ACCESS_KEY=$(terraform output -raw app_email_secret_access_key)"
  echo "EMAIL_FROM=$(terraform output -raw ses_from_address)"
  echo "S3_REGION=eu-south-1"
  echo "S3_BUCKET=amazon-s3-barback-dev"
  echo "S3_ACCESS_KEY_ID=$(terraform output -raw app_storage_access_key_id)"
  echo "S3_SECRET_ACCESS_KEY=$(terraform output -raw app_storage_secret_access_key)"
} > ../secrets/backend.dev.aws.generated.env
```

Copy the values into the EC2 backend env file used by Docker Compose.

## Optional: import existing profile-picture S3 bucket

Discovered existing Barback resources:

- Route53 hosted zone: `Z05215372PSC9C9M6SH5N`
- SES verified region: `eu-south-1`
- Stale failed SES identity in `us-east-1` was removed; `eu-south-1` is the active SES region.
- S3 bucket: `amazon-s3-barback-dev`
- CloudFront distribution allowed by the bucket policy: `E14WOM64LPPM1R`
- CloudFront OAC: `E2143WKP3644GH`
- Dev EC2 public IP: `18.102.79.98`
- Dev EC2 instance: `i-0bfbba6dcf24056d1`

To manage the S3 bucket configuration in Terraform, first set:

```hcl
manage_profile_pictures_bucket = true
```

Then import the existing resources:

```bash
terraform import 'aws_s3_bucket.profile_pictures[0]' amazon-s3-barback-dev
terraform import 'aws_s3_bucket_public_access_block.profile_pictures[0]' amazon-s3-barback-dev
terraform import 'aws_s3_bucket_server_side_encryption_configuration.profile_pictures[0]' amazon-s3-barback-dev
terraform import 'aws_s3_bucket_cors_configuration.profile_pictures[0]' amazon-s3-barback-dev
terraform import 'aws_s3_bucket_policy.profile_pictures[0]' amazon-s3-barback-dev
```

Run `terraform plan` and review any drift before applying.

## State

This module currently uses local Terraform state. Before multiple machines or
operators use it, move state to a dedicated backend, for example S3 + DynamoDB
locking, created with a separate bootstrap step.
