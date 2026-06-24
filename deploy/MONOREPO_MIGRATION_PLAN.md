# Barback Monorepo Migration Plan

This document is intentionally self-contained so an AI agent can execute the
migration in a future session without additional context.

## Current state

Barback currently behaves like a monorepo by folder, but it is **not one git
repository**. These folders are independent git repositories:

```text
barback/
├── backend/   # independent git repo, NestJS API
├── frontend/  # independent git repo, React/Vite SPA
└── deploy/    # independent git repo, EC2 Docker Compose deployment
```

The target state is one real git repository:

```text
barback-monorepo/
├── backend/
├── frontend/
├── deploy/
├── AGENTS.md
├── README.md
└── scripts/   # optional root convenience wrappers
```

## Goals

- Preserve git history for `backend`, `frontend`, and `deploy`.
- Keep the same folder names: `backend/`, `frontend/`, `deploy/`.
- Use local CI/CD only. Do not add GitHub Actions workflows.
- Keep folder-level shell scripts as the source of truth:
  - `backend/scripts/ci-local.sh`
  - `backend/scripts/publish-image.sh`
  - `frontend/scripts/ci-local.sh`
  - `frontend/scripts/publish-image.sh`
  - `deploy/deploy-dev.sh`
  - `deploy/scripts/deploy-dev-remote.sh`
- Make future full-stack branches/commits possible from one repo.

## Important policy decisions

- Remote CI has intentionally been removed. Do not recreate `.github/workflows`.
- Docker images are built with plain `docker build`, not Docker Buildx.
- Deployment remains manual/agent-triggered through `deploy/deploy-dev.sh` or
  `deploy/scripts/deploy-dev-remote.sh`.
- The project is solo/AI-agent-native, so the migration can prioritize simplicity
  over enterprise branch-protection workflows.

## Why use `git filter-repo`?

A copy-paste migration would lose file history. `git filter-repo` rewrites each
source repository so every historical commit appears under its final subfolder.
For example, backend history becomes history of `backend/...` files.

After migration, these commands should work meaningfully:

```bash
git log --oneline -- backend
git log --oneline -- frontend
git log --oneline -- deploy
```

Do **not** run `git filter-repo` in the original working repositories. Use
throwaway temporary clones only.

## Required tools

- `git`
- `git-filter-repo`
- `node` / `npm`
- `docker` and Docker Compose plugin

Install `git-filter-repo` if missing:

```bash
# macOS Homebrew
brew install git-filter-repo

# or pipx
pipx install git-filter-repo

# verify
git filter-repo --help >/dev/null
```

## Variables used by the commands below

Adjust these at the start of the migration session:

```bash
# Existing folder-monorepo root. In the current machine this has been:
export SOURCE_ROOT="/Users/nannino/Coding/personal_projects/barback"

# Temporary migration workspace. This can be anywhere outside SOURCE_ROOT.
export MIGRATION_ROOT="$HOME/barback-monorepo-migration"

# New monorepo working directory to create.
export MONOREPO_DIR="$MIGRATION_ROOT/barback"

# Source branches to import.
# If feature/local-ci-and-monorepo-plan has already been merged, use develop for
# backend/frontend and main or develop for deploy as appropriate.
export BACKEND_BRANCH="feature/local-ci-and-monorepo-plan"
export FRONTEND_BRANCH="feature/local-ci-and-monorepo-plan"
export DEPLOY_BRANCH="feature/local-ci-and-monorepo-plan"

# Final default branch in the new monorepo.
export DEFAULT_BRANCH="develop"
```

Before running the migration, verify the source branches exist:

```bash
git -C "$SOURCE_ROOT/backend" rev-parse --verify "$BACKEND_BRANCH"
git -C "$SOURCE_ROOT/frontend" rev-parse --verify "$FRONTEND_BRANCH"
git -C "$SOURCE_ROOT/deploy" rev-parse --verify "$DEPLOY_BRANCH"
```

If a branch does not exist because the work was already merged, set the variable
to the merged branch, usually `develop` for backend/frontend and `main` or
`develop` for deploy.

## Pre-migration checklist

Run these checks before creating the monorepo:

```bash
git -C "$SOURCE_ROOT/backend" status --short --branch
git -C "$SOURCE_ROOT/frontend" status --short --branch
git -C "$SOURCE_ROOT/deploy" status --short --branch
```

All three source repos should be clean, or the agent must stop and ask what to do
with uncommitted changes.

Also verify the local CI scripts exist in the source branches:

```bash
test -x "$SOURCE_ROOT/backend/scripts/ci-local.sh"
test -x "$SOURCE_ROOT/backend/scripts/publish-image.sh"
test -x "$SOURCE_ROOT/frontend/scripts/ci-local.sh"
test -x "$SOURCE_ROOT/frontend/scripts/publish-image.sh"
test -x "$SOURCE_ROOT/deploy/scripts/deploy-dev-remote.sh"
```

## Migration procedure

### 1. Create a clean migration workspace

```bash
rm -rf "$MIGRATION_ROOT"
mkdir -p "$MIGRATION_ROOT"
cd "$MIGRATION_ROOT"
```

### 2. Create the new monorepo

```bash
mkdir -p "$MONOREPO_DIR"
cd "$MONOREPO_DIR"
git init
git checkout -b "$DEFAULT_BRANCH"
```

Do not add root files yet. Import histories first to avoid unrelated root-file
conflicts.

### 3. Import backend history into `backend/`

```bash
cd "$MIGRATION_ROOT"
git clone "$SOURCE_ROOT/backend" backend-filtered
cd backend-filtered
git checkout "$BACKEND_BRANCH"
git filter-repo --to-subdirectory-filter backend

cd "$MONOREPO_DIR"
git remote add backend-filtered "$MIGRATION_ROOT/backend-filtered"
git fetch backend-filtered
git merge "backend-filtered/$BACKEND_BRANCH" \
  --allow-unrelated-histories \
  -m "import backend history"
git remote remove backend-filtered
```

### 4. Import frontend history into `frontend/`

```bash
cd "$MIGRATION_ROOT"
git clone "$SOURCE_ROOT/frontend" frontend-filtered
cd frontend-filtered
git checkout "$FRONTEND_BRANCH"
git filter-repo --to-subdirectory-filter frontend

cd "$MONOREPO_DIR"
git remote add frontend-filtered "$MIGRATION_ROOT/frontend-filtered"
git fetch frontend-filtered
git merge "frontend-filtered/$FRONTEND_BRANCH" \
  --allow-unrelated-histories \
  -m "import frontend history"
git remote remove frontend-filtered
```

### 5. Import deploy history into `deploy/`

```bash
cd "$MIGRATION_ROOT"
git clone "$SOURCE_ROOT/deploy" deploy-filtered
cd deploy-filtered
git checkout "$DEPLOY_BRANCH"
git filter-repo --to-subdirectory-filter deploy

cd "$MONOREPO_DIR"
git remote add deploy-filtered "$MIGRATION_ROOT/deploy-filtered"
git fetch deploy-filtered
git merge "deploy-filtered/$DEPLOY_BRANCH" \
  --allow-unrelated-histories \
  -m "import deploy history"
git remote remove deploy-filtered
```

### 6. Add root-level monorepo files

Create or copy these files at the monorepo root.

#### Root `AGENTS.md`

Use the latest root `AGENTS.md` from the old folder-monorepo if present:

```bash
if [[ -f "$SOURCE_ROOT/AGENTS.md" ]]; then
  cp "$SOURCE_ROOT/AGENTS.md" "$MONOREPO_DIR/AGENTS.md"
else
  cp "$MONOREPO_DIR/backend/AGENTS.md" "$MONOREPO_DIR/AGENTS.md"
fi
```

Then update it manually if needed so it says this is now a real git monorepo, not
three independent repositories.

#### Root `.gitignore`

Create a minimal root `.gitignore`:

```bash
cat > "$MONOREPO_DIR/.gitignore" <<'EOF'
.DS_Store
.env
.env.*
!.env.example
!.env.*.example
node_modules/
dist/
coverage/
EOF
```

Do not ignore deploy example env files or documentation.

#### Root `README.md`

Create a short root README:

```bash
cat > "$MONOREPO_DIR/README.md" <<'EOF'
# Barback

Barback is an inventory-management product for cocktail bars.

## Repository layout

- `backend/` — NestJS + MongoDB API. All routes are prefixed `/api`.
- `frontend/` — React + Vite + TypeScript SPA.
- `deploy/` — Docker Compose deployment for the shared dev EC2 host.

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
EOF
```

#### Optional root convenience scripts

Create optional wrappers after the migration. They should call the folder scripts
instead of duplicating logic. Example root script:

```bash
mkdir -p "$MONOREPO_DIR/scripts"
cat > "$MONOREPO_DIR/scripts/ci-local.sh" <<'EOF'
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
EOF
chmod +x "$MONOREPO_DIR/scripts/ci-local.sh"
```

Commit root files:

```bash
cd "$MONOREPO_DIR"
git add AGENTS.md README.md .gitignore scripts || true
git commit -m "chore: add monorepo root files"
```

### 7. Ensure remote CI does not exist at HEAD

Remote CI should not exist in the new monorepo. Check:

```bash
find "$MONOREPO_DIR" -path '*/.github/workflows/*' -type f -print
```

If any workflow files exist at HEAD, remove them and commit:

```bash
rm -rf "$MONOREPO_DIR/.github" \
       "$MONOREPO_DIR/backend/.github" \
       "$MONOREPO_DIR/frontend/.github" \
       "$MONOREPO_DIR/deploy/.github"
cd "$MONOREPO_DIR"
git add -A
git commit -m "ci: remove remote workflow files" || true
```

### 8. Validate imported history and current tree

Run lightweight history checks:

```bash
cd "$MONOREPO_DIR"
git log --oneline -- backend | head
git log --oneline -- frontend | head
git log --oneline -- deploy | head

test -d backend/.git && { echo "ERROR: nested backend .git exists"; exit 1; } || true
test -d frontend/.git && { echo "ERROR: nested frontend .git exists"; exit 1; } || true
test -d deploy/.git && { echo "ERROR: nested deploy .git exists"; exit 1; } || true
```

Run validation. This may take time and may build Docker images:

```bash
cd "$MONOREPO_DIR/backend" && bash scripts/ci-local.sh
cd "$MONOREPO_DIR/frontend" && bash scripts/ci-local.sh
cd "$MONOREPO_DIR/deploy" && docker compose -f docker-compose.yml config >/dev/null
```

If the user explicitly says not to run full validation, only run syntax/static
checks and document that full validation was skipped.

### 9. Create the new remote

Only do this if the user has provided a new monorepo remote URL.

```bash
cd "$MONOREPO_DIR"
git remote add origin <new-monorepo-url>
git push -u origin "$DEFAULT_BRANCH"
```

If no remote URL is provided, stop after local validation and report the path of
`$MONOREPO_DIR`.

### 10. Archive old repos after verification

Do this only after the user confirms the monorepo is correct:

- Mark old backend/frontend/deploy remotes as archived or read-only.
- Stop using the old folder repositories for new work.
- Recreate any active feature branches in the new monorepo if needed.
- Update local documentation/bookmarks to point to the new monorepo.

## Post-migration branch model

Recommended:

- `main`: production-ready.
- `develop`: integration/dev environment.
- `feature/<short-name>`: full-stack feature branches from `develop`.
- `hotfix/<short-name>`: urgent production fixes from `main`, merged back to both
  `main` and `develop`.

## Post-migration local CI/CD usage

Folder scripts remain the source of truth:

```bash
cd backend && bash scripts/ci-local.sh
cd frontend && bash scripts/ci-local.sh
cd backend && bash scripts/publish-image.sh dev
cd frontend && bash scripts/publish-image.sh dev
cd deploy && bash scripts/deploy-dev-remote.sh
```

If root wrappers were created:

```bash
bash scripts/ci-local.sh all
bash scripts/ci-local.sh backend
bash scripts/ci-local.sh frontend
bash scripts/ci-local.sh deploy
```

## Risks / notes

- Plain `docker build` builds for the local machine architecture. If the local
  machine architecture differs from EC2, published images may not run on EC2. Use
  an EC2-compatible build host or revisit multi-platform builds if this becomes a
  problem.
- `git filter-repo` rewrites history in temporary clones. Never run it directly
  in the original working repositories.
- A short feature freeze is recommended during migration to avoid branch drift.
- If source branches are merged before migration, update `BACKEND_BRANCH`,
  `FRONTEND_BRANCH`, and `DEPLOY_BRANCH` before importing.
