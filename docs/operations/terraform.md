# Terraform Operations

Terraform under `deploy/terraform` manages AWS resources owned by Barback.

## Current focus

- Route53 DNS records for `barback.it`.
- SES domain identity, Easy DKIM, and custom MAIL FROM validation records.
- Optional import/management of the existing profile-picture/storage bucket.
- Optional runtime IAM credentials for backend SES/S3 access.

## AWS profile

Use a Barback-specific Terraform/admin AWS profile. Do not use profiles that
belong to other projects in the same AWS account.

Local setup:

```bash
cd deploy/terraform
cp terraform.tfvars.example terraform.tfvars
# edit terraform.tfvars and set the Barback AWS profile/settings
terraform init
terraform fmt -recursive
terraform validate
```

If the profile cannot list hosted zones, set `hosted_zone_id` in
`terraform.tfvars`.

## SES region

`ses_region` must match backend `SES_REGION`.

```env
EMAIL_TRANSPORT=ses
SES_REGION=eu-south-1
```

## Import existing SES identity

If the SES identity already exists, import before applying:

```bash
terraform import aws_ses_domain_identity.barback barback.it
terraform import aws_ses_domain_dkim.barback barback.it
terraform import aws_ses_domain_mail_from.barback barback.it
```

Then:

```bash
terraform plan
terraform apply
```

## Runtime credentials

Set this in `terraform.tfvars` to create IAM access keys for backend SES email
sending and S3 storage access:

```hcl
create_app_runtime_credentials = true
```

The generated access keys are sensitive Terraform outputs and are stored in local
Terraform state. Keep state out of Git and migrate to encrypted remote state with
locking before multiple operators use this module.

Export local runtime snippets as described in `docs/operations/secrets.md`.

## Storage bucket import

If Terraform should manage an existing storage bucket, first set the appropriate
`manage_*` variable in `terraform.tfvars`, then import the bucket and associated
configuration resources. Review `terraform plan` carefully before applying any
changes to imported resources.

## State

This module currently uses local Terraform state. Before shared operations,
create a backend such as S3 + DynamoDB locking through a separate bootstrap step.

## Related docs

- SES/email operations: `docs/operations/aws-ses.md`
- Secrets: `docs/operations/secrets.md`
- Dev deployment: `docs/operations/deploy-dev.md`
