# Barback Monorepo Migration Plan

This plan is for a future session. The goal is to replace the current
folder-monorepo made of three independent git repositories (`backend/`,
`frontend/`, `deploy/`) with one real git monorepo that contains all three
folders.

## Goals

- Preserve history for backend, frontend, and deploy.
- Keep paths unchanged: `backend/`, `frontend/`, `deploy/`.
- Keep local CI/CD scripts as the source of truth.
- Remove remote GitHub Actions CI in the new monorepo.
- Simplify AI-agent workflows by having one branch, one status, and one commit
  graph for full-stack changes.

## Recommended import strategy

Use `git filter-repo` in temporary clones, then merge the rewritten histories
into a new monorepo.

Why `git filter-repo`:

- It rewrites each repo so every historical commit appears under its final
  subdirectory (`backend/`, `frontend/`, or `deploy/`).
- It keeps `git log -- backend`, `git log -- frontend`, and `git log -- deploy`
  meaningful.
- It avoids copy-paste migration, which would lose history.

Do **not** run `git filter-repo` directly inside the existing working repos.
Use temporary clones only.

## Pre-migration checklist

1. Ensure current backend/frontend/deploy branches are clean.
2. Push or otherwise preserve all important branches.
3. Pause feature work during the migration.
4. Decide the initial monorepo default branch (`develop` recommended if that is
   still the integration branch, otherwise `main`).
5. Record old repository URLs/remotes for archival.

## Migration steps

Example paths assume a sibling directory named `barback-monorepo-migration`.

### 1. Create the new monorepo

```bash
mkdir barback-monorepo
cd barback-monorepo
git init
```

Add initial root files after imports, not before, to avoid unrelated root-file
conflicts.

### 2. Rewrite backend history into `backend/`

```bash
git clone /path/to/current/backend backend-filtered
cd backend-filtered
git filter-repo --to-subdirectory-filter backend
cd ../barback-monorepo
git remote add backend-filtered ../backend-filtered
git fetch backend-filtered
git merge backend-filtered/develop --allow-unrelated-histories -m "import backend history"
```

Use the correct source branch if not `develop`.

### 3. Rewrite frontend history into `frontend/`

```bash
git clone /path/to/current/frontend frontend-filtered
cd frontend-filtered
git filter-repo --to-subdirectory-filter frontend
cd ../barback-monorepo
git remote add frontend-filtered ../frontend-filtered
git fetch frontend-filtered
git merge frontend-filtered/develop --allow-unrelated-histories -m "import frontend history"
```

### 4. Rewrite deploy history into `deploy/`

```bash
git clone /path/to/current/deploy deploy-filtered
cd deploy-filtered
git filter-repo --to-subdirectory-filter deploy
cd ../barback-monorepo
git remote add deploy-filtered ../deploy-filtered
git fetch deploy-filtered
git merge deploy-filtered/main --allow-unrelated-histories -m "import deploy history"
```

### 5. Add root-level monorepo files

Recommended root files:

- `AGENTS.md` shared agent instructions.
- `README.md` explaining repo layout.
- `.gitignore` for shared/root ignores.
- `scripts/ci-local.sh` wrapper that can call backend/frontend/deploy checks.
- `scripts/publish-images.sh` wrapper that calls backend/frontend publish scripts.

Keep existing package-specific scripts in their folders.

### 6. Remove remote CI config if any exists

The target model is local CI/CD only. Ensure no `.github/workflows/*` files are
imported or recreate remote CI. If `.github` directories exist from history, they
can remain in history but should not exist at HEAD unless intentionally used for
non-CI metadata.

### 7. Validate the monorepo

Run:

```bash
git log --oneline -- backend | head
git log --oneline -- frontend | head
git log --oneline -- deploy | head

cd backend && bash scripts/ci-local.sh
cd ../frontend && bash scripts/ci-local.sh
cd ../deploy && docker compose -f docker-compose.yml config
```

Also verify Docker image publishing scripts from `backend/` and `frontend/` in a
non-prod environment.

### 8. Set up the new remote

```bash
git remote add origin <new-monorepo-url>
git push -u origin <default-branch>
```

### 9. Archive old repos

After the new monorepo is verified:

- Mark old backend/frontend/deploy repos as archived or read-only.
- Update local clones and documentation to point to the monorepo.
- Close or recreate any open branches in the monorepo.

## Post-migration branch model

Recommended:

- `main`: production-ready.
- `develop`: integration/dev environment.
- `feature/<short-name>`: full-stack feature branches from `develop`.
- `hotfix/<short-name>`: production fixes from `main`, merged back to both.

## Local CI/CD in the monorepo

Keep folder-specific scripts:

```bash
backend/scripts/ci-local.sh
backend/scripts/publish-image.sh
frontend/scripts/ci-local.sh
frontend/scripts/publish-image.sh
deploy/deploy-dev.sh
```

Add root wrappers for convenience:

```bash
scripts/ci-local.sh backend
scripts/ci-local.sh frontend
scripts/ci-local.sh all
scripts/publish-images.sh dev
```

The wrappers should use plain `docker build`, matching the current local-only CI
policy.

## Risks / notes

- Plain `docker build` builds for the local machine architecture. If the local
  machine architecture differs from EC2, published images may not run on EC2.
  Use an EC2-compatible build host or revisit multi-platform builds if this
  becomes a problem.
- `git filter-repo` rewrites history in the temporary clones. Do not run it in
  the existing working repos.
- A short feature freeze is recommended during migration to avoid branch drift.
