# QueueCare

A clinic appointment system built as a QA engineering assessment. Patients register, book and cancel appointments; staff and admin users view today's queue and mark patients as served. Queue numbers are assigned automatically per calendar date.

## Test Report

A concise summary of the UI and API test results and coverage for the application. View full report [here](https://github.com/El-Gibbor/QueueCare/blob/main/TEST_REPORT.md).

## Live demo

The frontend is deployed [here](https://queue-care-psi.vercel.app/). Backend is not deployed (so, ensure backend is running locally on port 3000 ); the deployed bundle calls `http://localhost:3000` directly from the browser.

## Sub-projects

The repository contains four sub-projects, each independently runnable
| Folder                    | Purpose                                                | README                                  |
| ------------------------- | ------------------------------------------------------ | --------------------------------------- |
| `backend/`                | Node.js + Express + SQLite HTTP API                    | [`backend/README.md`](https://github.com/El-Gibbor/QueueCare/blob/main/backend/README.md)|
| `frontend/`               | React 18 + Tailwind                    | [`frontend/README.md`](https://github.com/El-Gibbor/QueueCare/blob/main/frontend/README.md)|
| `test-automation/API/`    | Postman collection driven by Newman                    | [`test-automation/API/README.md`](https://github.com/El-Gibbor/QueueCare/blob/main/test-automation/API/README.md)|
| `test-automation/UI/`     | Cypress 15 end-to-end suite                            | [`test-automation/UI/README.md`](https://github.com/El-Gibbor/QueueCare/blob/main/test-automation/UI/README.md)|

## Prerequisites

- Node.js 22 or later
- npm 10 or later
- A free TCP port `3000` for the backend, and `5173` for the frontend dev server

## Quick start
The four sub-projects must be brought up in the order below. Each command block assumes a separate terminal.

### 1. Start the backend

```sh
cd backend
npm install
cp .env.example .env
npm start
```

The server should log `QueueCare backend listening on port 3000`. See [`backend/README.md`](https://github.com/El-Gibbor/QueueCare/blob/main/backend/README.md) for environment variables and database notes. The `.env` copy is mandatory; without it the JWT signing step at login fails.

### 2. Start the frontend
```sh
cd frontend
npm install
npm run dev
```

Vite serves the application at `http://localhost:5173` and proxies `/api` calls to the backend on port 3000.

### 3. Run the API test suite
```sh
cd test-automation/API
npm install
npm test
```
The full suite runs in roughly four seconds and produces a pass/fail summary via Newman. Individual sub-folders can be run in isolation using the following scripts: `test:happy`, `test:negative`, `test:edge`, and `test:teardown`. When invoked standalone, folder-level pre-request scripts automatically seed the required state.

To fully review all test scripts, including collection-level and folder-level pre-request scripts, import the collection into Postman. See the [API README](https://github.com/El-Gibbor/QueueCare/blob/main/test-automation/API/README.md#run-via-postman-gui) for a full guide on importing the collection and its environment, and running the suite via the Postman GUI.

### 4. Run the UI test suite
```sh
cd test-automation/UI
npm install
npm run cypress:open   # interactive GUI runner - check readme below
npm run cypress:run    # headless (terminal)
```
Both the UI and API suites require the backend running on port 3000. The UI suite additionally requires the frontend dev server running on port 5173. See the [UI README](https://github.com/El-Gibbor/QueueCare/blob/main/test-automation/UI/README.md) for instructions on running the specs via the Cypress GUI.
