# Deploy

Docker Compose runtime files and deploy helpers for Barback's shared `dev`
environment live here.

Canonical operations docs:

- Dev deploy flow: `../docs/operations/deploy-dev.md`
- Local CI/CD and image publishing: `../docs/cicd.md`
- Secrets workflow: `../docs/operations/secrets.md`
- Terraform operations: `../docs/operations/terraform.md`
- SES/email operations: `../docs/operations/aws-ses.md`

Preferred monorepo deploy helper:

```bash
BARBACK_EC2_HOST=<ec2-host-or-ip> \
BARBACK_EC2_USER=ec2-user \
BARBACK_EC2_KEY=/path/to/key.pem \
BARBACK_REMOTE_DEPLOY_DIR=/home/ec2-user/barback-deploy \
bash scripts/sync-runtime-and-deploy-dev.sh
```

Do not commit `.env*`, files under `secrets/*.env*`, SSH keys, or Terraform
state.
