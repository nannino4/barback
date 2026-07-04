# Deploy secrets

This directory holds local templates/copies for Barback runtime secrets.

Canonical secret workflow: `../../docs/operations/secrets.md`.

Committed here:

- `backend.dev.env.example` — backend runtime env template.
- `README.md` — this pointer.

Gitignored here:

- `backend.dev.env`
- `backend.dev.aws.generated.env`
- any other `*.env*` runtime secret files.

Do not commit secrets or Terraform state.
