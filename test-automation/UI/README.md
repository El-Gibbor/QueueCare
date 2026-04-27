# QueueCare UI Test Suite (Cypress)

End-to-end browser tests covering authentication, appointment CRUD, today's queue, and role-based authorization. Selectors target `data-cy` attributes exclusively, never CSS classes or text content.

## Layout

| File                       | Purpose                                                |
| -------------------------- | ------------------------------------------------------ |
| `cypress.config.js`        | Cypress configuration: `baseUrl`, fixtures, env vars   |
| `cypress/e2e/`             | Spec files grouped by domain                           |
| `cypress/fixtures/`        | Static JSON fixtures consumed by specs                 |
| `cypress/support/`         | Custom commands and global setup                       |
| `package.json`             | Cypress dev dependency and run scripts                 |

Spec folders under `cypress/e2e/`:

- `auth/`           login flows, including failure and empty-form cases
- `appointments/`   create, update, and cancel flows
- `queue/`          queue ordering and the staff mark-served action
- `authorization/`  role-based visibility checks

## Prerequisites

The Cypress suite drives a real browser against a running stack. Two services must be reachable before tests start:

1. The backend on `http://localhost:3000`. See [`backend/README.md`](https://github.com/El-Gibbor/QueueCare/blob/main/backend/README.md).
2. The frontend on `http://localhost:5173`. See [`frontend/README.md`](https://github.com/El-Gibbor/QueueCare/blob/main/frontend/README.md).

The deployed frontend at [https://queue-care-psi.vercel.app/](https://queue-care-psi.vercel.app/) is intended for manual exploration only. Cypress targets the local Vite dev server because tests rely on the proxy and on deterministic build output, and because HTTPS-to-HTTP requests from a deployed origin are subject to browser policies that do not apply when the runner and the page share a localhost origin.

## Running

From this `UI/` directory:

```sh
npm install
npm run cypress:run                   # full suite, headless
npm run cypress:open                  # interactive runner
npm run test:login                    # only the login spec
```

`cypress:run` exits non-zero on the first failed spec, suitable for CI. `cypress:open` is the development workflow.

## Configuration

`cypress.config.js` sets:

| Key            | Value                       | Purpose                                     |
| -------------- | --------------------------- | ------------------------------------------- |
| `baseUrl`      | `http://localhost:5173`     | Where `cy.visit('/login')` resolves.        |
| `env.apiUrl`   | `http://localhost:3000`     | Used by `cy.request` setup helpers.         |
| `specPattern`  | `cypress/e2e/**/*.cy.js`    | Spec discovery glob.                        |
| `video`        | `false`                     | Skip video capture for faster local runs.   |

If the backend or the frontend are running on different ports, override these values either by editing `cypress.config.js` or by passing Cypress environment variables on the command line.

## Test data isolation

Specs that mutate state register a fresh user via `cy.request` in `beforeEach`, persist the token to `localStorage`, and then visit a page already authenticated. This avoids dependency on prior specs and keeps each spec runnable on its own. Generated emails embed a timestamp so re-runs do not collide with prior data in the persistent SQLite file used by the backend.
