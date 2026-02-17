# Barback Frontend - CI/CD Guide

This document describes the CI/CD pipeline for the frontend repository.

## Goals

- Run tests and build validation automatically
- Build and publish Docker images to Docker Hub
- Keep deployment execution manual from EC2 when desired

## Environments Naming

- `local`: developer machine
- `dev`: shared non-production EC2 environment
- `prod`: future

## Workflows

### CI workflow
File: [frontend/.github/workflows/ci.yml](../.github/workflows/ci.yml)

Trigger:
- Pull requests
- Pushes to `main`, `develop`, `feature/**`, `hotfix/**`

Steps in order:
1. **Checkout source** (`actions/checkout`)
   - Downloads repository content into the runner workspace.
2. **Set up Docker Buildx** (`docker/setup-buildx-action`)
   - Enables advanced Docker builds and layer caching.
3. **Build Docker `test` stage** (`docker/build-push-action`)
   - Runs tests because `RUN npm test` is inside the `test` stage of `frontend/Dockerfile`.
4. **Build Docker runtime stage (`nginx`)**
   - Validates that the deployable image can be built successfully.

### Dev image publish workflow
File: [frontend/.github/workflows/ci.yml](../.github/workflows/ci.yml)

Trigger:
- Push to `develop`
- Manual dispatch (`workflow_dispatch`) with optional `image_tag`

Steps in order:
1. Compute deploy tag (commit SHA by default)
2. Run Docker `test` stage again as a deployment gate
3. Login to Docker Hub
4. Build and push runtime image tags:
   - immutable tag: `<sha>`
   - moving tag: `dev`

### Manual deploy from EC2

Deployment is intentionally manual.

1. SSH into EC2
2. Update infra repository if needed
3. Set image tags (typically commit SHA from CI output, or `dev`)
4. Run shared deploy script: [deploy/deploy-dev.sh](../../deploy/deploy-dev.sh)

Example:
- Copy [deploy/.env.deploy.dev.example](../../deploy/.env.deploy.dev.example) to `/opt/barback/deploy/.env.deploy.dev`
- Set `FRONTEND_IMAGE_TAG` and `BACKEND_IMAGE_TAG`
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
- `FRONTEND_IMAGE_TAG`
- `BACKEND_IMAGE_TAG`
- `BACKEND_ENV_FILE`
- `CERTBOT_DOMAIN`
- `CERTBOT_WWW_DOMAIN`
- `CERTBOT_EMAIL`
- `LETSENCRYPT_LIVE_PATH`
- `ROOT_DIR` (optional)
- `COMPOSE_FILE` (optional)
