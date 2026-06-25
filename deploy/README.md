# Deploy Guide (Dev Environment)

This guide covers:
- one-time TLS bootstrap (Let’s Encrypt initial certificate issuance)
- day-to-day deploy flow for the shared `dev` EC2 environment

## Scope

- Environment: `dev` (shared non-production)
- Runtime host: single EC2
- Orchestration: Docker Compose
- TLS: Nginx + certbot
- Registry: Docker Hub

## Files in this folder

- `docker-compose.yml`: runtime stack definition
- `deploy-dev.sh`: manual full-stack deploy script
- `.env.deploy.dev.example`: example deploy env file template
- `nginx.bootstrap.conf`: temporary HTTP-only Nginx config for first certificate issuance
- `terraform/`: AWS IaC for DNS/SES/IAM runtime users and importable existing AWS resources
- `secrets/README.md`: documented gitignored runtime-secret workflow

## 1) Prerequisites (before first bootstrap)

1. Domain DNS points to EC2 Elastic IP
   - apex domain (`barback.it`) must resolve to this host
   - optional `www` should resolve too
2. EC2 security group allows inbound:
   - TCP 80
   - TCP 443
3. Docker and Docker Compose plugin are installed on EC2
4. Infrastructure repo is cloned on EC2 (example path: `/opt/barback`)
5. Deploy env file exists:
   - copy `.env.deploy.dev.example` to `.env.deploy.dev`
   - fill required values (`CERTBOT_*`, image tags, etc.)

## 2) One-time bootstrap (initial TLS certificate)

This must be done only once per new domain/certificate setup.

### Why this exists

Normal `nginx` expects certificate files to already exist. On a fresh host, those files are missing. The bootstrap flow starts a temporary HTTP-only Nginx (`nginx-bootstrap`) to serve ACME challenge files, then runs `certbot-init` once.

### Steps

1. Go to deploy directory on EC2
2. Ensure `.env.deploy.dev` is correctly filled
3. Start init profile services:

```bash
docker compose --env-file .env.deploy.dev -f docker-compose.yml --profile init up -d nginx-bootstrap
```

4. Run one-time certificate issuance:

```bash
docker compose --env-file .env.deploy.dev -f docker-compose.yml --profile init up certbot-init
```

5. Verify certificate files exist:
   - `/etc/letsencrypt/live/<domain>/fullchain.pem`
   - `/etc/letsencrypt/live/<domain>/privkey.pem`

6. Stop/remove bootstrap service:

```bash
docker compose --env-file .env.deploy.dev -f docker-compose.yml --profile init down
```

7. Start normal stack via deploy script (see next section)

> `certbot-init` uses `--keep-until-expiring`, so accidental reruns will not force immediate reissuance.

## 3) Common deploy steps (manual)

Use this flow for regular deploys after local CI has published images from the
backend and frontend repositories. Remote GitHub Actions CI is intentionally not
used for this project at the moment.

### Publish images locally first

From the source repositories on the development/agent machine:

```bash
cd backend
DOCKER_DEFAULT_PLATFORM=linux/amd64 DOCKER_HUB_USERNAME=<dockerhub-user> DOCKER_HUB_TOKEN=<token> bash scripts/publish-image.sh dev

cd ../frontend
DOCKER_DEFAULT_PLATFORM=linux/amd64 DOCKER_HUB_USERNAME=<dockerhub-user> DOCKER_HUB_TOKEN=<token> bash scripts/publish-image.sh dev
```

Both publish scripts default the immutable tag to the current commit SHA and also
push the moving `dev` tag. They use plain `docker build` (not Docker Buildx).

### Standard deploy procedure

1. SSH into EC2
2. Go to repo root (example: `/opt/barback`)
3. Update repository if needed:

```bash
git pull --ff-only
```

4. Set desired image tags in `.env.deploy.dev`
   - use commit SHA for controlled rollout
   - or `dev` for latest moving tag
5. Run deploy script:

```bash
bash deploy-dev.sh
```

### Agent-run remote deploy helper

From the local `deploy/` repository, an agent can trigger the EC2 deploy over SSH:

```bash
BARBACK_EC2_HOST=<ec2-host-or-ip> \
BARBACK_EC2_USER=ec2-user \
BARBACK_EC2_KEY=/path/to/key.pem \
BARBACK_REMOTE_DEPLOY_DIR=/home/ec2-user/barback-deploy \
  bash scripts/deploy-dev-remote.sh
```

Environment variables:

| Variable | Required | Default | Purpose |
|---|---:|---|---|
| `BARBACK_EC2_HOST` | Yes | - | EC2 hostname or IP |
| `BARBACK_EC2_USER` | No | `ec2-user` | SSH user |
| `BARBACK_EC2_KEY` | No | - | SSH private key path; omit if SSH agent/config handles auth |
| `BARBACK_REMOTE_DEPLOY_DIR` | No | `/home/ec2-user/barback-deploy` | Deploy repo path on EC2 |
| `SKIP_REMOTE_GIT_PULL` | No | `false` | Set `true` to skip `git pull --ff-only` before deploy |

The helper does not edit `.env.deploy.dev`; it deploys whatever image tags are
already configured on EC2 (often the moving `dev` tags).

6. Verify service health:
   - backend health endpoint: `http://127.0.0.1/api/health`
   - external checks on `https://<domain>`

## 4) Branch and tag strategy

The shared staging/demo environment should deploy from the `staging` branch. Use
`develop` for active integration, then fast-forward or merge `staging` to the
validated commit before publishing images and deploying.

Expected image publishing behavior from local publish scripts:
- immutable tag: commit SHA by default, or an explicit tag argument
- moving tag: `dev`

Deploy can choose either:
- pin to SHA for reproducibility
- use `dev` for convenience

## 5) certbot renewals

- `certbot` service runs continuously in the normal stack and checks for renewals every 12 hours.
- `certbot` logs renewal attempts to container logs; it is intentionally not run with `--quiet`.
- On successful renewal, certbot writes a marker file to the shared webroot volume.
- `nginx-reloader` watches that marker and sends `SIGHUP` to `barback-nginx-dev` so Nginx loads the renewed certificate without a full deploy.
- `certbot-init` is only for first issuance (or exceptional recovery/domain change).

Useful renewal checks:

```bash
docker compose --env-file .env.deploy.dev -f docker-compose.yml logs --tail=200 certbot
docker compose --env-file .env.deploy.dev -f docker-compose.yml logs --tail=200 nginx-reloader
openssl x509 -in /etc/letsencrypt/live/<domain>/fullchain.pem -noout -dates
echo | openssl s_client -connect <domain>:443 -servername <domain> 2>/dev/null \
  | openssl x509 -noout -dates
```

## 6) Troubleshooting quick checks

1. DNS mismatch: verify domain resolves to correct EC2 IP
2. Port 80 blocked: ACME HTTP challenge cannot complete
3. Missing cert files: verify `/etc/letsencrypt/live/<domain>/fullchain.pem` and `privkey.pem` exist on the EC2 host
4. Renewed cert not served: check `nginx-reloader` logs and verify the `barback-nginx-dev` container received a reload after renewal
5. Wrong image tag: ensure selected tag exists in Docker Hub
6. Backend unhealthy: check container logs and app env file path

Useful commands:

```bash
docker compose --env-file .env.deploy.dev -f docker-compose.yml ps
docker compose --env-file .env.deploy.dev -f docker-compose.yml logs --tail=200
```
