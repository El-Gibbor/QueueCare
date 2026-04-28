# QueueCare API Test Suite (Postman + Newman)
I wrote this suite end-to-end in Postman and exported it as JSON so the same suite can be executed both inside Postman (via the Collection Runner) and from the command line (via Newman). The two JSON files in this directory, `QueueCare.postman_collection.json` and `QueueCare.postman_environment.json`, are direct exports of the working collection and environment. If you prefer Postman's interactive runner, import both files into Postman and follow the import, review, and execution walkthrough in the collection's top-level description (visible in Postman after import).

A deployed copy of the QueueCare frontend is reachable from [here](https://queue-care-psi.vercel.app/) for manual UI exploration. It is unrelated to this API suite. The Postman collection exercises HTTP endpoints directly, so `baseUrl` resolves to a backend hostname, never to a frontend URL.

## Layout

| File | Purpose |
| --- | --- |
| `QueueCare.postman_collection.json` | The collection (folders, requests, scripts) |
| `QueueCare.postman_environment.json` | Environment variables (`baseUrl`) |
| `package.json` | Newman dev dependency and run scripts |

## Tested across three scenario classes

| Folder | Purpose |
| --- | --- |
| `01 - Happy Path` &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Every endpoint with valid input and the expected 2xx outcome |
| `02 - Negative` | Auth failures (401), role boundaries (403), missing resources (404), validation (400) |
| `03 - Edge Cases` | Past dates, duplicates, format errors, idempotency rules (409), re-book after cancel |
| `04 - Bugs` | Reproducible defects in the API. Each request asserts the correct expected behaviour, so a failing assertion is a citation for an open bug |
| `99 - Teardown` | Cancels test-owned appointments still in `scheduled` state |

## Running

### Prerequisite: backend on port 3000

The test suite assumes the QueueCare backend is reachable at `http://localhost:3000`. That value is baked into `QueueCare.postman_environment.json`. Before running anything below, start the backend and confirm it is listening on 3000:

```sh
# from the backend/ directory
npm install
npm start                          # logs: "QueueCare backend listening on port 3000"
```

The backend reads `PORT` from `backend/.env` (created by copying `.env.example`) and falls back to `3000` if unset. If port 3000 is already taken on your machine the backend will exit with `EADDRINUSE`; either free the port, or set `PORT=<your-port>` in `backend/.env` to move the backend elsewhere.

Whenever the backend's port is not 3000, point Newman at the matching URL using one of:

- **Permanent change -** Open `QueueCare.postman_environment.json`, locate the object in the top-level `values` array whose `"key"` is `"baseUrl"`, set its `"value"` to `http://localhost:<your-port>`, and save the file. Use the same port that is in `.env`.
- **Per-run CLI override (one-off) -** Append `--env-var baseUrl=http://localhost:<your-port>` to the `newman` invocation. The collection's environment file is not modified.

### Run the suite

From this `API` directory (`test-automation/API`):

```sh
npm install
npm test                  # full collection (sequential: Happy -> Negative -> Edge -> Bugs -> Teardown)
npm run test:happy        # only Happy Path
npm run test:negative     # only Negative
npm run test:edge         # only Edge Cases
npm run test:bugs         # only Bugs (expected to fail; cites open defects)
npm run test:teardown     # only Teardown
```

**NB:** Each sub-folder is runnable standalone. Negative, Edge, Bugs, and Teardown carry folder-level pre-request scripts that idempotently seed the prior pipeline state (registers users, mints tokens, creates appointments, marks-served / cancels as required) when collection variables are empty. On a full run those helpers find every variable already populated by Happy Path and short-circuit, so the cost is paid only when targeting a sub-folder.

`npm test` reports both passing functional assertions and the failing bug-citation assertions in the `04 - Bugs` folder. The bug-citation failures are intentional and document open defects; see the folder description after import in Postman, or the test report's 'Bugs Found' section, for the full mapping between each failed assertion and the underlying defect.

## Test data isolation

A collection-level pre-request script generates unique identifiers once per run, keyed off `Date.now()`:

| Variable | Example |
| --- | --- |
| `runId` | `2026-04-26T01-23-45-678` |
| `patient1Email` | `patient1.2026-04-26T01-23-45-678@alustudent.com` |
| `patient2Email` | `patient2.2026-04-26T01-23-45-678@alustudent.com` |
| `staffEmail` | `staff.2026-04-26T01-23-45-678@alustudent.com` |
| `appointmentDate` | today + 7 days, `YYYY-MM-DD` |

This means re-runs do not collide with prior data in the persistent SQLite file. Each Newman invocation starts a fresh process, so the collection variables reset automatically. In the Postman GUI, the same persistence behaviour applies *within* a session.

## Variables

Collection-scoped (set automatically by scripts; do not edit manually):

- `runId`, `patient1Email`, `patient1Password`, `patient1Token`, `patient1Id`
- `patient2Email`, `patient2Password`, `patient2Token`, `patient2Id`
- `staffEmail`, `staffPassword`, `staffToken`, `staffId`
- `appointmentId`, `appointmentQueueNumber`, `appointmentDate`
- `secondAppointmentId` (used by edge cases that require a second appointment)

Environment-scoped:

- `baseUrl`: defaults to `http://localhost:3000`

