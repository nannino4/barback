# Terraform

Terraform files for Barback-owned AWS resources live here.

Canonical Terraform operations doc: `../../docs/operations/terraform.md`.

Related docs:

- SES/email operations: `../../docs/operations/aws-ses.md`
- Secrets workflow: `../../docs/operations/secrets.md`
- Dev deployment: `../../docs/operations/deploy-dev.md`

Quick setup:

```bash
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform fmt -recursive
terraform validate
```

Use a Barback-specific AWS profile. Do not commit `terraform.tfvars`, Terraform
state, or generated secret outputs.
