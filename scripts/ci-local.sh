#!/usr/bin/env bash
set -euo pipefail
TARGET="${1:-all}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
case "$TARGET" in
  backend)
    cd "$ROOT_DIR/backend" && bash scripts/ci-local.sh
    ;;
  frontend)
    cd "$ROOT_DIR/frontend" && bash scripts/ci-local.sh
    ;;
  deploy)
    cd "$ROOT_DIR/deploy" && docker compose -f docker-compose.yml config >/dev/null
    ;;
  all)
    cd "$ROOT_DIR/backend" && bash scripts/ci-local.sh
    cd "$ROOT_DIR/frontend" && bash scripts/ci-local.sh
    cd "$ROOT_DIR/deploy" && docker compose -f docker-compose.yml config >/dev/null
    ;;
  *)
    echo "Usage: $0 [backend|frontend|deploy|all]"
    exit 1
    ;;
esac
