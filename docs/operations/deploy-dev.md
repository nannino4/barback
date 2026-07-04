# Dev Environment Deployment

This guide covers the shared non-production `dev` environment.

## Scope

- Runtime host: single EC2 instance.
- Orchestration: Docker Compose.
- TLS: Nginx + certbot.
- Registry: Docker Hub.
- CI/CD: local scripts, no remote GitHub Actions.

## Runtime files on EC2

The EC2 host does not need the full monorepo. The runtime deploy directory,
default `/home/ec2-user/barback-deploy`, needs:

- `docker-compose.yml`
- `deploy-dev.sh`
- `.env.deploy.dev` — gitignored deploy/runtime settings
- `secrets/backend.dev.env` — gitignored backend runtime secrets
- `nginx.bootstrap.conf` — only for first TLS bootstrap or certificate recovery

The host also needs Docker, the Docker Compose plugin, persistent Let’s Encrypt
host directories, and Docker volumes.

## One-time TLS bootstrap

Normal Nginx expects certificate files to exist. On a new host, start the
HTTP-only bootstrap Nginx profile, issue certs with certbot, then start the
normal stack.

```bash
docker compose --env-file .env.deploy.dev -f docker-compose.yml --profile init up -d nginx-bootstrap
docker compose --env-file .env.deploy.dev -f docker-compose.yml --profile init up certbot-init
docker compose --env-file .env.deploy.dev -f docker-compose.yml --profile init down
```

Verify certificate files exist under:

```text
/etc/letsencrypt/live/<domain>/fullchain.pem
/etc/letsencrypt/live/<domain>/privkey.pem
```

## Normal deploy

1. Run local validation.
2. Publish backend and frontend images.
3. Sync runtime files and secrets to EC2.
4. Run the remote deploy script.
5. Verify health.

Preferred monorepo helper:

```bash
cd deploy
BARBACK_EC2_HOST=<ec2-host-or-ip> \
BARBACK_EC2_USER=ec2-user \
BARBACK_EC2_KEY=/path/to/key.pem \
BARBACK_REMOTE_DEPLOY_DIR=/home/ec2-user/barback-deploy \
bash scripts/sync-runtime-and-deploy-dev.sh
```

See `docs/cicd.md` for image publishing commands and deploy variables.

## Health checks

After deploy:

```bash
docker compose --env-file .env.deploy.dev -f docker-compose.yml ps
docker compose --env-file .env.deploy.dev -f docker-compose.yml logs --tail=200
```

Check:

- backend health endpoint from host/network as appropriate;
- external `https://<domain>` loads;
- frontend can call `/api`;
- critical auth/inventory flows still work.

## Certbot renewals

- `certbot` runs in the normal stack and checks renewal every 12 hours.
- On successful renewal, certbot writes a marker file.
- `nginx-reloader` watches the marker and sends `SIGHUP` to Nginx.

Useful checks:

```bash
docker compose --env-file .env.deploy.dev -f docker-compose.yml logs --tail=200 certbot
docker compose --env-file .env.deploy.dev -f docker-compose.yml logs --tail=200 nginx-reloader
openssl x509 -in /etc/letsencrypt/live/<domain>/fullchain.pem -noout -dates
echo | openssl s_client -connect <domain>:443 -servername <domain> 2>/dev/null \
  | openssl x509 -noout -dates
```

## Troubleshooting

Common issues:

1. DNS does not resolve to the EC2 host.
2. Port 80/443 blocked by security group or host firewall.
3. Missing certificate files on first normal Nginx startup.
4. Renewed cert not served because Nginx reload failed.
5. Wrong image tag selected or missing in Docker Hub.
6. Backend unhealthy due to missing/invalid runtime env.

## Related docs

- CI/CD: `docs/cicd.md`
- Secrets: `docs/operations/secrets.md`
- Terraform: `docs/operations/terraform.md`
