#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="${ROOT_DIR:-/opt/barback}"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT_DIR/deploy/docker-compose.dev.yml}"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/deploy/.env.deploy.dev}"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

required_vars=(
  "DOCKER_HUB_USERNAME"
  "BACKEND_IMAGE_TAG"
  "FRONTEND_IMAGE_TAG"
  "BACKEND_ENV_FILE"
  "CERTBOT_DOMAIN"
  "CERTBOT_WWW_DOMAIN"
  "CERTBOT_EMAIL"
  "LETSENCRYPT_LIVE_PATH"
)

for var in "${required_vars[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    echo "ERROR: Missing required environment variable: $var"
    exit 1
  fi
done

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "ERROR: Compose file not found: $COMPOSE_FILE"
  exit 1
fi

if [[ ! -f "$BACKEND_ENV_FILE" ]]; then
  echo "ERROR: Backend env file not found: $BACKEND_ENV_FILE"
  exit 1
fi

if [[ -n "${DOCKER_HUB_TOKEN:-}" ]]; then
  echo "$DOCKER_HUB_TOKEN" | docker login -u "$DOCKER_HUB_USERNAME" --password-stdin
fi

export DOCKER_HUB_USERNAME
export BACKEND_IMAGE_TAG
export FRONTEND_IMAGE_TAG
export BACKEND_ENV_FILE
export CERTBOT_DOMAIN
export CERTBOT_WWW_DOMAIN
export CERTBOT_EMAIL
export LETSENCRYPT_LIVE_PATH

docker compose -f "$COMPOSE_FILE" pull
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

echo "Waiting for backend health..."
for i in {1..30}; do
  if curl -fsS http://127.0.0.1/api/health >/dev/null 2>&1; then
    echo "Deploy successful"
    exit 0
  fi
  sleep 5
done

echo "ERROR: Health check failed after deploy"
docker compose -f "$COMPOSE_FILE" ps
exit 1
