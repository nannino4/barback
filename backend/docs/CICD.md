# Barback Backend - CI/CD Guide

This document describes the CI/CD pipeline for the backend repository.

## Goals

- Run backend tests automatically
- Build and publish backend Docker image to Docker Hub
- Keep deployment execution manual from EC2 when desired

## Environments Naming

- `local`: developer machine
- `dev`: shared non-production EC2 environment
- `prod`: future

## Workflows

### CI workflow
File: [backend/.github/workflows/ci.yml](../.github/workflows/ci.yml)

Trigger:
- Pull requests
- Pushes to `main`, `develop`, `feature/**`, `hotfix/**`

Steps in order:
1. **Checkout source** (`actions/checkout`)
2. **Set up Docker Buildx** (`docker/setup-buildx-action`)
3. **Build Docker `test` stage**
   - Runs backend test suite from Dockerfile test stage.
4. **Build Docker runtime stage (`prod`)**
   - Validates deployable backend image.

### Dev image publish workflow
File: [backend/.github/workflows/ci.yml](../.github/workflows/ci.yml)

Trigger:
- Push to `develop`
- Manual dispatch with optional `image_tag`

Steps in order:
1. Compute deploy tag (commit SHA by default)
2. Run backend Docker `test` stage
3. Login to Docker Hub
4. Build and push backend image tags (`<sha>` and `dev`)

### Manual deploy from EC2

Deployment is intentionally manual.

1. SSH into EC2
2. Update infra repository if needed
3. Set image tags (typically commit SHA from CI output, or `dev`)
4. Run shared deploy script: [deploy/deploy-dev.sh](../../deploy/deploy-dev.sh)

Example:
- Copy [deploy/.env.deploy.dev.example](../../deploy/.env.deploy.dev.example) to `/opt/barback/deploy/.env.deploy.dev`
- Set `BACKEND_IMAGE_TAG` and `FRONTEND_IMAGE_TAG`
- Run `bash /opt/barback/deploy/deploy-dev.sh`

### Required Secrets Checklist

| Secret | Required | Purpose | Example |
|---|---|---|---|
| `DOCKERHUB_USERNAME` | Yes | Docker Hub namespace for image push | `mydockeruser` |
| `DOCKERHUB_TOKEN` | Yes | Docker Hub token for CI push | `dckr_pat_xxx` |

## Secrets used by manual deploy script on EC2

These are **not** GitHub secrets in this model; they live on EC2 in `/opt/barback/deploy/.env.deploy.dev`:

- `DOCKER_HUB_USERNAME`
- `DOCKER_HUB_TOKEN` (optional for private pull)
- `BACKEND_IMAGE_TAG`
- `FRONTEND_IMAGE_TAG`
- `BACKEND_ENV_FILE`
- `SMTP_HOST` (e.g. `email-smtp.eu-west-1.amazonaws.com` for AWS SES)
- `SMTP_PORT`
- `SMTP_USER` (SMTP username)
- `SMTP_PASS` (SMTP password)
- `EMAIL_FROM`
- `EMAIL_APP_NAME` (optional branding, default `Barback`)
- `CERTBOT_DOMAIN`
- `CERTBOT_WWW_DOMAIN`
- `CERTBOT_EMAIL`
- `LETSENCRYPT_LIVE_PATH`
- `ROOT_DIR` (optional)
- `COMPOSE_FILE` (optional)
