# Barback

Barback is an inventory-management product for cocktail bars.

## Repository layout

- `backend/` — NestJS + MongoDB API. All routes are prefixed `/api`.
- `frontend/` — React + Vite + TypeScript SPA.
- `deploy/` — Docker Compose deployment for the shared dev EC2 host, plus Terraform IaC under `deploy/terraform/`.

## Local CI/CD

Remote GitHub Actions CI is intentionally not used. Run local shell scripts:

```bash
cd backend && bash scripts/ci-local.sh
cd frontend && bash scripts/ci-local.sh
```

Publish images locally:

```bash
cd backend && DOCKER_HUB_USERNAME=<user> DOCKER_HUB_TOKEN=<token> bash scripts/publish-image.sh dev
cd frontend && DOCKER_HUB_USERNAME=<user> DOCKER_HUB_TOKEN=<token> bash scripts/publish-image.sh dev
```

Deploy from `deploy/` or via `deploy/scripts/deploy-dev-remote.sh`.
