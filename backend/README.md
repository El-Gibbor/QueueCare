# QueueCare Backend (Node.js + Express + SQLite)

Implements registration, login, appointment CRUD, today's queue, and the staff-only mark-served action. Authentication is JWT based; persistence is a single SQLite file accessed through `better-sqlite3`.

## Setup

From this `backend/` directory:

```sh
npm install
cp .env.example .env
```

The second step is required. Without `.env` the server starts but `process.env.JWT_SECRET` is undefined, and the login endpoint crashes the first time a token is signed.

Open the new `.env` file and confirm that `JWT_SECRET` is set to any non-empty string. The committed default (`change_me_to_a_long_random_string`) is acceptable for reviewing this assesment.

## Environment variables

| Variable         | Default                            | Purpose                                                  |
| ---------------- | ---------------------------------- | -------------------------------------------------------- |
| `PORT`           | `3000`                             | Port the HTTP server listens on.                         |
| `JWT_SECRET`     | (none; required in `.env`)         | Symmetric key used to sign and verify JWT access tokens. |
| `JWT_EXPIRES_IN` | `24h`                              | Token lifetime, in any value accepted by `jsonwebtoken`. |
| `DB_PATH`        | `./queuecare.db`                   | Path to the SQLite database file.                        |
| `NODE_ENV`       | `development`                      | Standard Node environment flag.                          |

`PORT` falls back to `3000` if the variable is unset (see `src/server.js`). The other variables come from `.env` and have no in-code fallback.

## Running

```sh
npm start                  # production mode (node)
npm run dev                # development mode (nodemon, restarts on changes)
```

A successful start prints:

```
QueueCare backend listening on port 3000
```

If port 3000 is already in use the process exits with `EADDRINUSE`. Either free the port or set `PORT=<other>` in `.env`. If you change the port, the API test suite at `test-automation/API/` requires a matching update to its `baseUrl` (see [`test-automation/API/README.md`](https://github.com/El-Gibbor/QueueCare/blob/main/test-automation/API/README.md)).

## Database

`better-sqlite3` opens (and creates if missing) the file at `DB_PATH`. The schema is initialised on first run from `src/db/database.js`. Two tables are used: `users` and `appointments`. The database file is gitignored, so each developer carries their own local data.

To reset the state during review, stop the server and delete the database files:

```sh
rm queuecare.db queuecare.db-shm queuecare.db-wal
```

The next start will recreate an empty schema.

## API surface

All endpoints live under the `/api` prefix. Authentication endpoints are public; every other endpoint requires `Authorization: Bearer <token>`.

| Method | Path                              | Roles permitted | Notes                                  |
| ------ | --------------------------------- | --------------- | -------------------------------------- |
| POST   | `/api/auth/register`              | public          | Body: name, email, password, role.     |
| POST   | `/api/auth/login`                 | public          | Returns `{ token, user }`.             |
| POST   | `/api/appointments`               | any             | Patient creates own appointment.       |
| GET    | `/api/appointments`               | any             | Patient sees own; staff/admin see all. |
| GET    | `/api/appointments/:id`           | any             | 403 if patient does not own the row.   |
| PATCH  | `/api/appointments/:id`           | any             | 403 if patient does not own the row.   |
| DELETE | `/api/appointments/:id`           | any             | Cancellation; idempotent re-attempt yields 409. |
| PATCH  | `/api/appointments/:id/serve`     | staff, admin    | Marks an appointment as served.        |
| GET    | `/api/queue/today`                | staff, admin    | Today's queue ordered by queue number. |
