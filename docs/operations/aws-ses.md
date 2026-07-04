# AWS SES and Email Operations

The deployed `dev` environment sends email through the AWS SES API.

## Current strategy

- Active SES region: `eu-south-1`.
- Transport: `EMAIL_TRANSPORT=ses`.
- SMTP is not used in deployed environments because `eu-south-1` does not expose
  an SES SMTP endpoint.
- SMTP remains supported for local/test inboxes.

## Required backend env

```env
EMAIL_TRANSPORT=ses
SES_REGION=eu-south-1
SES_ACCESS_KEY_ID=...
SES_SECRET_ACCESS_KEY=...
EMAIL_FROM=noreply@barback.it
EMAIL_APP_NAME=Barback
FRONTEND_URL=https://barback.it
```

## Terraform-managed resources

Terraform under `deploy/terraform` manages/adopts:

- SES domain identity;
- SES Easy DKIM records;
- custom MAIL FROM domain;
- DMARC DNS record;
- optional runtime IAM credentials for SES/S3.

## Validate domain state

From `deploy/terraform`:

```bash
./check-ses-domain.sh barback-terraform eu-south-1 barback.it
```

Expected state:

- verified for sending;
- DKIM status success;
- MAIL FROM status success;
- account out of SES sandbox if sending to arbitrary recipients.

## Validate sending

From the repository root:

```bash
set -a
. deploy/secrets/backend.dev.aws.generated.env
set +a
cd backend
npm run email:test-ses
```

Use the SES simulator by default. Do not print secret env values.

## Related docs

- Feature behavior: `docs/features/email-notifications.md`
- Secrets: `docs/operations/secrets.md`
- Terraform: `docs/operations/terraform.md`
- Backend implementation: `backend/docs/email-implementation.md`
