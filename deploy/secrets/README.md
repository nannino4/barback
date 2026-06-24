# Deploy secrets

This directory is for local copies/templates of Barback runtime secrets. Secret
files in this directory are intentionally gitignored (`*.env*`) except examples
and this README.

## Files

- `backend.dev.env.example` — committed template for the backend runtime env.
- `backend.dev.env` — actual local backend runtime secret file for the `dev`
  environment. Do not commit. This may be copied to EC2.
- `backend.dev.aws.generated.env` — generated AWS-only secret snippet from
  Terraform outputs. Do not commit.

Terraform state in `deploy/terraform/terraform.tfstate` is also sensitive and
contains IAM access-key secrets for Terraform-managed runtime users.

## Current email strategy

The backend sends mail using the AWS SES API, not SMTP:

```env
EMAIL_TRANSPORT=ses
SES_REGION=eu-south-1
SES_ACCESS_KEY_ID=...
SES_SECRET_ACCESS_KEY=...
EMAIL_FROM=noreply@barback.it
```

Why: this account already has SES production access in `eu-south-1`, and
`barback.it` is verified there. `eu-south-1` does not expose an SES SMTP endpoint,
so SMTP credentials are not used for deployed mail delivery.

`SMTP_*` keys are not required in deployed secret files when
`EMAIL_TRANSPORT=ses`.

## Regenerate AWS runtime secrets

From `deploy/terraform`:

```bash
terraform apply
umask 077
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
chmod 600 ../secrets/backend.dev.aws.generated.env
```

Then merge those values into `deploy/secrets/backend.dev.env` and, for the EC2
deploy target, into the remote file configured by `deploy/.env.deploy.dev`:

```env
BACKEND_ENV_FILE=/opt/barback/secrets/backend.dev.env
```

Example remote copy after reviewing the file locally:

```bash
scp -i ../ec2-key deploy/secrets/backend.dev.env \
  ec2-user@18.102.79.98:/tmp/backend.dev.env
ssh -i ../ec2-key ec2-user@18.102.79.98 \
  'sudo mkdir -p /opt/barback/secrets && sudo mv /tmp/backend.dev.env /opt/barback/secrets/backend.dev.env && sudo chmod 600 /opt/barback/secrets/backend.dev.env'
```

Only restart/redeploy the backend with this SES config after the backend image
contains SES API support.

## Validate SES without printing secrets

From the repository root:

```bash
set -a
. deploy/secrets/backend.dev.aws.generated.env
set +a
cd backend
npm run email:test-ses
```

The helper sends to `success@simulator.amazonses.com` by default. To send to a
real recipient after SES validation, set `SES_TEST_TO=<email>`. Do not echo
secret env values.
