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

Use this flow for regular deploys after CI has pushed images.

### Standard procedure

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

6. Verify service health:
   - backend health endpoint: `http://127.0.0.1/api/health`
   - external checks on `https://<domain>`

## 4) Tag strategy

Expected image publishing behavior from CI:
- immutable tag: commit SHA
- moving tag: `dev`

Deploy can choose either:
- pin to SHA for reproducibility
- use `dev` for convenience

## 5) certbot renewals

- `certbot` service runs continuously in normal stack and performs periodic renewals.
- `certbot-init` is only for first issuance (or exceptional recovery/domain change).

## 6) Troubleshooting quick checks

1. DNS mismatch: verify domain resolves to correct EC2 IP
2. Port 80 blocked: ACME HTTP challenge cannot complete
3. Missing cert files: verify `/etc/letsencrypt/live/<domain>/fullchain.pem` and `privkey.pem` exist on the EC2 host
4. Wrong image tag: ensure selected tag exists in Docker Hub
5. Backend unhealthy: check container logs and app env file path

Useful commands:

```bash
docker compose --env-file .env.deploy.dev -f docker-compose.yml ps
docker compose --env-file .env.deploy.dev -f docker-compose.yml logs --tail=200
```
