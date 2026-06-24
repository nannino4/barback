#!/usr/bin/env bash

set -euo pipefail

REMOTE_HOST="${BARBACK_EC2_HOST:-}"
REMOTE_USER="${BARBACK_EC2_USER:-ec2-user}"
REMOTE_DEPLOY_DIR="${BARBACK_REMOTE_DEPLOY_DIR:-/home/ec2-user/barback-deploy}"
SSH_KEY="${BARBACK_EC2_KEY:-}"
SKIP_PULL="${SKIP_REMOTE_GIT_PULL:-false}"

if [[ -z "$REMOTE_HOST" ]]; then
  echo "ERROR: BARBACK_EC2_HOST is required"
  echo "Example: BARBACK_EC2_HOST=1.2.3.4 bash scripts/deploy-dev-remote.sh"
  exit 1
fi

ssh_args=()
if [[ -n "$SSH_KEY" ]]; then
  ssh_args+=("-i" "$SSH_KEY")
fi

remote_command="cd '$REMOTE_DEPLOY_DIR'"
if [[ "$SKIP_PULL" != "true" ]]; then
  remote_command+=" && git pull --ff-only"
fi
remote_command+=" && bash deploy-dev.sh"

ssh "${ssh_args[@]}" "$REMOTE_USER@$REMOTE_HOST" "$remote_command"
