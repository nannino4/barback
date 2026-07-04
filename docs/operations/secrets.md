# Secrets Workflow

Runtime secrets are kept out of Git. This document is the canonical secret
workflow for local deploy files and EC2 runtime env files.

## Never commit

- `.env*` files, except committed examples.
- `deploy/secrets/*.env*`, except committed examples.
- Terraform state files.
- SSH private keys.
- Docker Hub tokens or cloud access keys.

## Local files

`deploy/secrets/` holds local copies/templates for runtime secrets.

Important files:

- `deploy/secrets/backend.dev.env.example` — committed template.
- `deploy/secrets/backend.dev.env` — actual local backend runtime secret file;
  gitignored; copied to EC2 for dev deploys.
- `deploy/secrets/backend.dev.aws.generated.env` — generated AWS-only snippet;
  gitignored.

Terraform state under `deploy/terraform/terraform.tfstate` is sensitive because
it can contain IAM access-key secrets for Terraform-managed runtime users.

## Backend runtime secrets

Backend dev runtime env generally includes:

- MongoDB URI;
- JWT secrets and expirations;
- OAuth client secrets;
- Stripe keys/webhook secrets;
- email transport credentials;
- S3/storage credentials;
- frontend URL and app-level config.

Use `deploy/secrets/backend.dev.env.example` as the template and merge generated
AWS values as needed.

## AWS-generated runtime snippet

When Terraform manages runtime SES/S3 credentials, regenerate the AWS snippet
from `deploy/terraform`:

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
  echo "S3_BUCKET=<dev-storage-bucket>"
  echo "S3_ACCESS_KEY_ID=$(terraform output -raw app_storage_access_key_id)"
  echo "S3_SECRET_ACCESS_KEY=$(terraform output -raw app_storage_secret_access_key)"
} > ../secrets/backend.dev.aws.generated.env
chmod 600 ../secrets/backend.dev.aws.generated.env
```

Review locally, then merge values into `deploy/secrets/backend.dev.env`.

## Copying secrets to EC2

Preferred flow: use the monorepo sync/deploy helper documented in
`docs/cicd.md` and `docs/operations/deploy-dev.md`. It copies the configured
local deploy env and backend env files to the runtime deploy directory.

Manual copy, if needed:

```bash
scp -i /path/to/key deploy/secrets/backend.dev.env \
  ec2-user@<host>:/tmp/backend.dev.env
ssh -i /path/to/key ec2-user@<host> \
  'mkdir -p /home/ec2-user/barback-deploy/secrets && mv /tmp/backend.dev.env /home/ec2-user/barback-deploy/secrets/backend.dev.env && chmod 600 /home/ec2-user/barback-deploy/secrets/backend.dev.env'
```

Use placeholders in documentation and command history where possible. Do not echo
secret values.

## Validate SES without printing secrets

From the repository root:

```bash
set -a
. deploy/secrets/backend.dev.aws.generated.env
set +a
cd backend
npm run email:test-ses
```

The helper sends to the SES simulator by default. Set `SES_TEST_TO=<email>` only
when intentionally testing a real recipient.

## Related docs

- SES/email operations: `docs/operations/aws-ses.md`
- Terraform: `docs/operations/terraform.md`
- Dev deploy: `docs/operations/deploy-dev.md`
