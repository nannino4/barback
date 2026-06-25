#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

REMOTE_HOST="${BARBACK_EC2_HOST:-}"
REMOTE_USER="${BARBACK_EC2_USER:-ec2-user}"
REMOTE_DEPLOY_DIR="${BARBACK_REMOTE_DEPLOY_DIR:-/home/ec2-user/barback-deploy}"
SSH_KEY="${BARBACK_EC2_KEY:-}"
LOCAL_DEPLOY_ENV_FILE="${BARBACK_LOCAL_DEPLOY_ENV_FILE:-$DEPLOY_DIR/.env.deploy.dev}"
LOCAL_BACKEND_ENV_FILE="${BARBACK_LOCAL_BACKEND_ENV_FILE:-$DEPLOY_DIR/secrets/backend.dev.env}"
SKIP_DEPLOY="${SKIP_REMOTE_DEPLOY:-false}"

if [[ -z "$REMOTE_HOST" ]]; then
  echo "ERROR: BARBACK_EC2_HOST is required"
  echo "Example: BARBACK_EC2_HOST=barback.it BARBACK_EC2_KEY=../ec2-key bash scripts/sync-runtime-and-deploy-dev.sh"
  exit 1
fi

required_local_files=(
  "$DEPLOY_DIR/docker-compose.yml"
  "$DEPLOY_DIR/deploy-dev.sh"
  "$DEPLOY_DIR/nginx.bootstrap.conf"
  "$LOCAL_DEPLOY_ENV_FILE"
  "$LOCAL_BACKEND_ENV_FILE"
)

for file in "${required_local_files[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "ERROR: Required local deploy file not found: $file"
    exit 1
  fi
done

ssh_args=()
scp_args=()
if [[ -n "$SSH_KEY" ]]; then
  ssh_args+=("-i" "$SSH_KEY")
  scp_args+=("-i" "$SSH_KEY")
fi

remote_target="$REMOTE_USER@$REMOTE_HOST"
remote_tmp_dir="$(ssh "${ssh_args[@]}" "$remote_target" 'mktemp -d /tmp/barback-deploy-sync.XXXXXX')"
cleanup_remote_tmp() {
  ssh "${ssh_args[@]}" "$remote_target" "rm -rf '$remote_tmp_dir'" >/dev/null 2>&1 || true
}
trap cleanup_remote_tmp EXIT

echo "Copying runtime deploy files to $remote_target:$REMOTE_DEPLOY_DIR"
scp "${scp_args[@]}" \
  "$DEPLOY_DIR/docker-compose.yml" \
  "$DEPLOY_DIR/deploy-dev.sh" \
  "$DEPLOY_DIR/nginx.bootstrap.conf" \
  "$LOCAL_DEPLOY_ENV_FILE" \
  "$LOCAL_BACKEND_ENV_FILE" \
  "$remote_target:$remote_tmp_dir/"

remote_install_command=$(cat <<EOF
set -euo pipefail
mkdir -p '$REMOTE_DEPLOY_DIR/secrets'
install -m 0644 '$remote_tmp_dir/docker-compose.yml' '$REMOTE_DEPLOY_DIR/docker-compose.yml'
install -m 0755 '$remote_tmp_dir/deploy-dev.sh' '$REMOTE_DEPLOY_DIR/deploy-dev.sh'
install -m 0644 '$remote_tmp_dir/nginx.bootstrap.conf' '$REMOTE_DEPLOY_DIR/nginx.bootstrap.conf'
install -m 0600 '$remote_tmp_dir/$(basename "$LOCAL_DEPLOY_ENV_FILE")' '$REMOTE_DEPLOY_DIR/.env.deploy.dev'
install -m 0600 '$remote_tmp_dir/$(basename "$LOCAL_BACKEND_ENV_FILE")' '$REMOTE_DEPLOY_DIR/secrets/backend.dev.env'
EOF
)

ssh "${ssh_args[@]}" "$remote_target" "$remote_install_command"

echo "Runtime deploy files synced."

if [[ "$SKIP_DEPLOY" == "true" ]]; then
  echo "SKIP_REMOTE_DEPLOY=true; not running remote deploy."
  exit 0
fi

ssh "${ssh_args[@]}" "$remote_target" "cd '$REMOTE_DEPLOY_DIR' && bash deploy-dev.sh"
