#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ENVIRONMENT="${1:-dev}"
IMAGE_TAG="${2:-$(git rev-parse HEAD)}"
DOCKER_HUB_USERNAME="${DOCKER_HUB_USERNAME:-${DOCKERHUB_USERNAME:-}}"
DOCKER_HUB_TOKEN="${DOCKER_HUB_TOKEN:-${DOCKERHUB_TOKEN:-}}"

if [[ "$ENVIRONMENT" != "dev" && "$ENVIRONMENT" != "prod" ]]; then
  echo "Usage: $0 <dev|prod> [image-tag]"
  exit 1
fi

if [[ -z "$DOCKER_HUB_USERNAME" ]]; then
  echo "ERROR: DOCKER_HUB_USERNAME is required"
  exit 1
fi

if [[ "${SKIP_VALIDATE:-false}" != "true" ]]; then
  SKIP_NPM_CI="${SKIP_NPM_CI:-false}" bash scripts/ci-local.sh
fi

if [[ -n "$DOCKER_HUB_TOKEN" ]]; then
  echo "$DOCKER_HUB_TOKEN" | docker login -u "$DOCKER_HUB_USERNAME" --password-stdin
fi

IMAGE_BASE="$DOCKER_HUB_USERNAME/barback-backend"

docker build \
  --file Dockerfile \
  --target prod \
  --tag "$IMAGE_BASE:$IMAGE_TAG" \
  --tag "$IMAGE_BASE:$ENVIRONMENT" \
  .

docker push "$IMAGE_BASE:$IMAGE_TAG"
docker push "$IMAGE_BASE:$ENVIRONMENT"

echo "Published backend image:"
echo "  $IMAGE_BASE:$IMAGE_TAG"
echo "  $IMAGE_BASE:$ENVIRONMENT"
