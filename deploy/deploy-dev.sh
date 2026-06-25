#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="${ROOT_DIR:-/home/ec2-user/barback-deploy}"
COMPOSE_FILE="${COMPOSE_FILE:-$ROOT_DIR/docker-compose.yml}"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/.env.deploy.dev}"

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

docker compose -f "$COMPOSE_FILE" pull
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans --force-recreate
