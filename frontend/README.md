# Barback Frontend

This repository contains the React/Vite frontend for Barback.

## Installation

```bash
npm install
```

## Running the dev server

1. Create the local frontend environment file if it does not already exist:

    ```bash
    cp .env.example .env.local
    ```

2. Ensure `.env.local` contains the required dev values, especially:

    ```text
    VITE_API_BASE_URL=/api
    VITE_STRIPE_PUBLISHABLE_KEY=...
    VITE_GOOGLE_CLIENT_ID=...
    ```

3. Make sure `barback.it` resolves locally. Add this line to `/etc/hosts` if it
   is missing:

    ```text
    127.0.0.1 barback.it
    ```

4. Ensure the local HTTPS certificate files expected by `vite.config.ts` exist in
   the parent project directory:

    ```text
    ../barback.it.pem
    ../barback.it-key.pem
    ```

5. Start the Vite dev server:

    ```bash
    npm run dev
    ```

The frontend is served at:

```text
https://barback.it:5173
```

The Vite dev server proxies `/api` to the backend at `http://localhost:3000`.
Start the backend separately with `npm run start:dev` from the `backend/`
repository.

## Other commands

```bash
# production build
npm run build

# tests
npm run test

# lint and autofix
npm run lint
```
