# QueueCare UI Test Suite (Cypress)

End-to-end browser tests covering authentication, appointment CRUD, today's queue, and role-based authorization. Selectors target `data-cy` attributes exclusively, never CSS classes or text content.

## Layout

| File                       | Purpose                                                |
| -------------------------- | ------------------------------------------------------ |
| `cypress.config.js`        | Cypress configuration: `baseUrl`, fixtures, env vars   |
| `cypress/e2e/`             | Spec files grouped by domain                           |
| `cypress/fixtures/`        | Static JSON fixtures consumed by specs                 |
| `cypress/support/`         | Custom commands and global setup                       |

Spec folders under `cypress/e2e/`:

- `auth/`           login flows, including failure and empty-form cases
- `appointments/`   create, update, and cancel flows
- `queue/`          queue ordering and the staff mark-served action
- `authorization/`  role-based visibility checks

## Prerequisites

Cypress drives a real browser against the local stack. Two services must be running before tests start:

1. The backend on `http://localhost:3000`. See [`backend/README.md`](https://github.com/El-Gibbor/QueueCare/blob/main/backend/README.md).
2. The frontend dev server on `http://localhost:5173`. See [`frontend/README.md`](https://github.com/El-Gibbor/QueueCare/blob/main/frontend/README.md).


## Running

From this `UI/` directory:

```sh
npm install
npm run cypress:open                  # interactive runner (GUI)
npm run cypress:run                   # full suite, headless (terminal)
```

### Using the interactive runner (`npm run cypress:open`)

This is the recommended and easiest way for a you to step through the suite visually.

**1. Launcher window.** A Cypress launcher window opens. If this is the first time the runner is opened in this checkout, a setup wizard may appear; accept the defaults and proceed. On subsequent runs the launcher goes straight to the testing-type screen.

**2. Choose testing type.** Click the **E2E Testing** tile. Component testing is not configured and need for this project.

**3. Choose a browser.** Cypress detects installed browsers (typically Chrome, Edge, Firefox, and the bundled Electron). Select one and click **Start E2E Testing in [browser]**. A new browser window opens with the Cypress spec explorer on the left and an empty preview area on the right.

**4. The spec explorer.** The left pane lists every file under `cypress/e2e/`, grouped by domain folder:

```
cypress/e2e/
├── appointments/        create, update, cancel
├── auth/                login flows
├── authorization/       role visibility checks
└── queue/               queue ordering, mark served
```



**5. Run every spec at once -** hover the cursor anywhere over the spec list header `Cypress\e2e`. A blue **Run X specs** button appears (where `X` is the total spec count). Click it. Cypress executes every spec in sequence in the same browser window. The runner shows a per-test live log on the left and the application under test on the right.

The same button appears on each folder row when hovered. To run only the specs in `appointments/`, for example, hover the `appointments/` row and click the **Run X specs** button that appears on its right side. Folder-level execution covers only the specs immediately under that folder.

**6. Run a single spec -** Click any spec filename in the list. Cypress loads that spec into the runner and begins executing immediately.

**8. Returning to the spec list -** Click the **Specs** link in the runner's top navigation bar to go back to the spec explorer and pick another file or fire the **Run X specs** button again.

## Configuration

`cypress.config.js` sets:

| Key                       | Value                       | Purpose                                       |
| ------------------------- | --------------------------- | --------------------------------------------- |
| `baseUrl`                 | `http://localhost:5173`     | Where `cy.visit('/login')` resolves.          |
| `env.apiUrl`              | `http://localhost:3000`     | Used by `cy.request` setup helpers.           |
| `experimentalRunAllSpecs` | `true`                      | Enables the "Run all specs" button in the GUI.|
| `specPattern`             | `cypress/e2e/**/*.cy.js`    | Spec discovery glob.                          |

If the backend or frontend are running on different ports, override these values either by editing `cypress.config.js` or by passing the matching flags on the command line (`--config`, `--env`).

## Test data isolation

Specs that mutate state register a fresh user via `cy.request` in `beforeEach`, persist the token to `localStorage`, and then visit a page already authenticated. This avoids dependency on prior specs and keeps each spec runnable on its own. Generated emails embed a timestamp so re-runs do not collide with prior data in the persistent SQLite file used by the backend.
