#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ "${SKIP_NPM_CI:-false}" != "true" ]]; then
  npm ci
fi

npm run lint
npm run test
npm run build

docker build \
  --file Dockerfile \
  --target nginx \
  --build-arg VITE_BUILD_MODE="${VITE_BUILD_MODE:-dev}" \
  --tag barback-frontend:local \
  .
