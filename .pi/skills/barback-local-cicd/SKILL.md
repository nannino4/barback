---
name: barback-local-cicd
description: Local-only CI/CD and deployment workflow for Barback. Use when validating changes, publishing Docker images, editing CI/deploy docs or scripts, or deploying the shared dev EC2 environment.
---

# Barback Local CI/CD

Remote GitHub Actions CI is intentionally not used. Local scripts are the source
of truth for validation, Docker image publishing, and manual deploys.

## Local validation

Backend:

```bash
cd backend
bash scripts/ci-local.sh
```

Frontend:

```bash
cd frontend
bash scripts/ci-local.sh
```

Root convenience wrapper:

```bash
bash scripts/ci-local.sh [backend|frontend|deploy|all]
```

Notes:

- Lint commands run with `--fix`; check `git status` afterwards.
- Frontend local CI installs Playwright Chromium unless
  `SKIP_PLAYWRIGHT_INSTALL=true` is set, then runs Playwright E2E smoke tests.
- Docker images are built with plain `docker build`, not Docker Buildx.

## Publish images

Backend:

```bash
cd backend
DOCKER_DEFAULT_PLATFORM=linux/amd64 \
DOCKER_HUB_USERNAME=<user> \
DOCKER_HUB_TOKEN=<token> \
bash scripts/publish-image.sh dev
```

Frontend:

```bash
cd frontend
DOCKER_DEFAULT_PLATFORM=linux/amd64 \
DOCKER_HUB_USERNAME=<user> \
DOCKER_HUB_TOKEN=<token> \
bash scripts/publish-image.sh dev
```

Use `DOCKER_DEFAULT_PLATFORM=linux/amd64` when publishing from Apple Silicon for
the shared dev EC2 host.

## Manual dev deploy

1. Publish backend and frontend images locally.
2. SSH into EC2.
3. Update the deploy repo if needed.
4. Set `BACKEND_IMAGE_TAG` and `FRONTEND_IMAGE_TAG` in `.env.deploy.dev`.
5. Run:

```bash
cd deploy
bash deploy-dev.sh
```

Agent-triggered remote deploy helper:

```bash
cd deploy
BARBACK_EC2_HOST=<host> \
BARBACK_EC2_USER=ec2-user \
BARBACK_EC2_KEY=/path/to/key.pem \
BARBACK_REMOTE_DEPLOY_DIR=/home/ec2-user/barback-deploy \
bash scripts/deploy-dev-remote.sh
```

Do not print secrets. Do not commit `.env*`, Terraform state, SSH keys, or files
under `deploy/secrets/*.env*`.

Reference docs:

- `README.md`
- `backend/docs/CICD.md`
- `frontend/docs/CICD.md`
- `deploy/README.md`
- `deploy/secrets/README.md`
