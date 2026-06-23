# Barback Frontend - Local CI/CD Guide

This repository uses **local CI/CD only**. GitHub Actions has been removed on
purpose: validation, Docker image publishing, and deployment are run from the
local development/agent environment.

## Goals

- Keep CI behavior simple and inspectable for a solo/AI-agent workflow.
- Validate frontend changes locally before publishing images.
- Build and push frontend Docker images from the local machine.
- Keep deployment execution manual from the EC2 host.

## Environments

- `local`: developer/agent machine.
- `dev`: shared non-production EC2 environment.
- `prod`: future production environment.

## Local validation

From `frontend/`:

```bash
npm run ci:local
```

This runs, in order:

1. `npm ci` unless `SKIP_NPM_CI=true` is set.
2. `npm run lint`.
3. `npm run test`.
4. `npm run build`.
5. `docker build --target nginx -t barback-frontend:local .`

Notes:

- `npm run lint` currently runs ESLint with `--fix`, so it may modify files.
  Check `git status` after running local CI.
- Docker images are built with plain `docker build`, not Docker Buildx.
- If publishing from a machine with a different CPU architecture than the EC2
  host, make sure the resulting image architecture is compatible with the host.

## Publish frontend image locally

From `frontend/`:

```bash
export DOCKER_HUB_USERNAME=<dockerhub-user>
export DOCKER_HUB_TOKEN=<dockerhub-token> # optional if already logged in
npm run publish:image -- dev
```

Optional explicit tag:

```bash
npm run publish:image -- dev my-tag
```

Defaults:

- Environment: `dev`.
- Immutable tag: current commit SHA (`git rev-parse HEAD`).
- Moving tag: selected environment (`dev` or `prod`).
- `VITE_BUILD_MODE` is set from the selected environment for image builds.

The script runs local validation first unless skipped:

```bash
SKIP_VALIDATE=true npm run publish:image -- dev
```

Published tags:

```text
<DOCKER_HUB_USERNAME>/barback-frontend:<tag>
<DOCKER_HUB_USERNAME>/barback-frontend:<environment>
```

## Frontend environment files

Frontend environment variables are build-time values for static assets:

- `.env.dev` is loaded for `VITE_BUILD_MODE=dev`.
- `.env.prod` is loaded for `VITE_BUILD_MODE=prod`.
- `.env.local` is for local-only Vite development.

Changing `VITE_*` values requires rebuilding and republishing the frontend image.
Deployment via EC2 `docker compose` does not change already-built frontend
`VITE_*` values.

## Manual deploy from EC2

Deployment remains manual from the `deploy/` repository on EC2:

1. Publish backend and frontend images locally.
2. SSH into EC2.
3. Update the deploy repository if needed.
4. Set `BACKEND_IMAGE_TAG` and `FRONTEND_IMAGE_TAG` in `.env.deploy.dev`.
5. Run `deploy-dev.sh`.

See `deploy/README.md` for the full deploy flow.

## Required local environment variables

| Variable | Required | Purpose |
|---|---:|---|
| `DOCKER_HUB_USERNAME` | Yes | Docker Hub namespace for image push |
| `DOCKER_HUB_TOKEN` | No | Docker Hub token; only needed if not already logged in |

The script also accepts the old names `DOCKERHUB_USERNAME` and
`DOCKERHUB_TOKEN` as fallbacks.

## Why no remote CI?

This is currently a solo project optimized for AI-agent-native development.
Local scripts are the source of truth and should be run before publishing or
merging. Remote CI can be reintroduced later if branch protection, external
contributors, or stronger auditability become important.
