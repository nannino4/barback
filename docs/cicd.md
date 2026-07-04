# Local CI/CD and Deployment

Barback intentionally uses local CI/CD. GitHub Actions are not the source of
truth today: validation, Docker image publishing, and dev deployments are run
from the local developer/agent environment.

## Principles

- Validate changes locally before publishing images or deploying.
- Keep scripts inspectable and runnable without remote CI infrastructure.
- Use plain `docker build`, not Docker Buildx.
- The shared dev EC2 host is `linux/amd64`; set
  `DOCKER_DEFAULT_PLATFORM=linux/amd64` when publishing from Apple Silicon.
- Never print or commit secrets, env files, SSH keys, Terraform state, or runtime
  deploy secret files.

## Local validation

From the repository root:

```bash
bash scripts/ci-local.sh [backend|frontend|deploy|all]
```

Backend validation:

```bash
cd backend
bash scripts/ci-local.sh
```

Backend local CI runs:

1. `npm ci` unless `SKIP_NPM_CI=true`.
2. `npm run lint`.
3. `npm run test`.
4. `npm run build`.
5. `docker build --target prod -t barback-backend:local .`.

Frontend validation:

```bash
cd frontend
bash scripts/ci-local.sh
```

Frontend local CI runs:

1. `npm ci` unless `SKIP_NPM_CI=true`.
2. `npx playwright install chromium` unless
   `SKIP_PLAYWRIGHT_INSTALL=true`.
3. `npm run lint`.
4. `npm run test`.
5. `npm run test:e2e`.
6. `npm run build`.
7. `docker build --target nginx -t barback-frontend:local .`.

Notes:

- Lint scripts may run with `--fix`; check `git status` afterwards.
- Playwright Chromium should be installed after a fresh checkout or Playwright
  version update.

## Publish Docker images

Backend:

```bash
cd backend
DOCKER_DEFAULT_PLATFORM=linux/amd64 \
DOCKER_HUB_USERNAME=<dockerhub-user> \
DOCKER_HUB_TOKEN=<token> \
bash scripts/publish-image.sh dev
```

Frontend:

```bash
cd frontend
DOCKER_DEFAULT_PLATFORM=linux/amd64 \
DOCKER_HUB_USERNAME=<dockerhub-user> \
DOCKER_HUB_TOKEN=<token> \
bash scripts/publish-image.sh dev
```

Optional explicit immutable tag:

```bash
bash scripts/publish-image.sh dev my-tag
```

Defaults:

- environment: `dev`;
- immutable tag: current commit SHA;
- moving tag: selected environment (`dev` or `prod`).

The publish scripts run local validation first unless skipped:

```bash
SKIP_VALIDATE=true bash scripts/publish-image.sh dev
```

## Frontend build-time environment

Frontend `VITE_*` values are baked into static assets at build time.

- `.env.dev` is loaded for `VITE_BUILD_MODE=dev`.
- `.env.prod` is loaded for `VITE_BUILD_MODE=prod`.
- `.env.local` is for local Vite development.

Changing frontend `VITE_*` values requires rebuilding and republishing the
frontend image. EC2 Docker Compose runtime env changes do not alter already-built
frontend assets.

## Shared dev deploy flow

The preferred monorepo deploy helper copies only the runtime files and local
runtime secrets needed by the EC2 host, then runs the remote deploy script.

```bash
cd deploy
BARBACK_EC2_HOST=<ec2-host-or-ip> \
BARBACK_EC2_USER=ec2-user \
BARBACK_EC2_KEY=/path/to/key.pem \
BARBACK_REMOTE_DEPLOY_DIR=/home/ec2-user/barback-deploy \
bash scripts/sync-runtime-and-deploy-dev.sh
```

Important variables:

| Variable | Required | Default | Purpose |
|---|---:|---|---|
| `BARBACK_EC2_HOST` | Yes | - | EC2 hostname or IP |
| `BARBACK_EC2_USER` | No | `ec2-user` | SSH user |
| `BARBACK_EC2_KEY` | No | - | SSH private key path; omit if SSH config/agent handles auth |
| `BARBACK_REMOTE_DEPLOY_DIR` | No | `/home/ec2-user/barback-deploy` | Runtime deploy directory on EC2 |
| `BARBACK_LOCAL_DEPLOY_ENV_FILE` | No | `deploy/.env.deploy.dev` | Local deploy env copied as `.env.deploy.dev` |
| `BARBACK_LOCAL_BACKEND_ENV_FILE` | No | `deploy/secrets/backend.dev.env` | Local backend runtime env copied to EC2 |
| `SKIP_REMOTE_DEPLOY` | No | `false` | Set `true` to sync without deploying |

## Branch and tag strategy

- `develop`: active integration branch.
- `staging`: intended deployed state for shared dev/staging demos.
- Production branching is not finalized.

Recommended dev/staging deployment flow:

1. Merge or fast-forward `staging` to the validated commit.
2. Run local validation.
3. Publish backend and frontend images.
4. Deploy the selected image tags from `deploy/`.

Deploy can either pin SHA tags for reproducibility or use the moving `dev` tags
for convenience.

## More operations docs

- Runtime deploy details: `docs/operations/deploy-dev.md`
- Secrets workflow: `docs/operations/secrets.md`
- Terraform: `docs/operations/terraform.md`
- SES/email operations: `docs/operations/aws-ses.md`
