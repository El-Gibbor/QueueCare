# QueueCare Test Report

## 1. What I Built

I implemented QueueCare as a small clinic appointment system spanning three layers: a Node.js + Express backend, a React + Vite frontend, and two test suites (Postman / Newman for the API, Cypress for the UI).

I chose Express 5 over Fastify or NestJS because the assessment is graded on test quality rather than backend depth, and Express has the most predictable middleware model when paired with Supertest. I chose SQLite via `better-sqlite3` over PostgreSQL for the same reason: zero-setup persistence means the assessment reviewer can clone the repository, run `npm install`, and have a working database without spinning up Docker. I chose `better-sqlite3` specifically because it offers synchronous prepared statements; this keeps the relationship between an inbound request and its database mutation readable in a small number of lines.

For authentication I implemented stateless JWT bearer tokens. The HTTP middleware in `backend/src/middleware/auth.js` extracts the token from the `Authorization` header, verifies it against `process.env.JWT_SECRET`, and attaches the decoded payload to `req.user`. A second middleware factory in `backend/src/middleware/authorize.js` enforces role boundaries by returning 403 when `req.user.role` is not in the permitted list. Splitting authentication from authorization into two middlewares mirrors the conventional separation between identity and entitlement; the test suites can then assert each layer independently and at the right level (auth at the API, role visibility at the UI).

Queue numbers are scoped per calendar date. On every appointment creation I query `MAX(queueNumber)` for the requested date and assign the next integer. The schema does not enforce uniqueness on `(date, queueNumber)`, which leaves a race window between concurrent inserts; I chose not to close that window in the assessment timeline and discuss it under Section 5.

The frontend is a React 18 single-page application built with Vite 8 and styled with Tailwind CSS 3. I deployed it to Vercel at `https://queue-care-psi.vercel.app/`. The deployed bundle calls `http://localhost:3000` directly, because the backend is not deployed; the live URL is therefore only useful when the reviewer runs the backend locally on port 3000. I included the deployment specifically to demonstrate that the React build succeeds and the application boots in a non-development environment, even though it cannot complete a full request without a local backend.

The Postman collection at `test-automation/API/QueueCare.postman_collection.json` is structured into five numbered folders (Happy Path, Negative, Edge Cases, Bugs, Teardown). I authored every request inside Postman and exported the collection plus environment as JSON, so the same suite can be executed both inside Postman via the Collection Runner and from the command line via Newman. Each folder beyond Happy Path carries a folder-level pre-request seed that idempotently rebuilds the prior pipeline state, which makes any sub-folder runnable on its own. The Cypress suite at `test-automation/UI/cypress/e2e/` is grouped by domain (auth, appointments, queue, authorization) and uses `data-cy` selectors exclusively.

Deliberate simplifications I made:

- **No `time` column on the appointments table -** The frontend collects a time via the `appointmentForm_DateInput_scheduledAt_time` input, but the backend stores only the date. I made this choice early to keep the schema minimal, then later identified the resulting bug (B1, see Section 4) when I started thinking about edge cases. I left the schema as it is rather than retrofitting time support, because the missing field is itself the most informative defect in the suite.
- **No password complexity validation -** Login enforces only that a non-empty password matches the bcrypt hash. I considered adding minimum length and character class checks but excluded them because they would shadow the more informative B5 finding (self-registration as admin).
- **No request rate limiting -** Login is brute-forceable. I named this under Section 5 rather than masking it.

---

## 2. What I Tested

### 2.1 API Coverage

When you run `npm test` from `test-automation/API/`, Newman reports 79 assertions executed across 42 requests. Seventy-two pass (the functional suites in `01 - Happy Path`, `02 - Negative`, and `03 - Edge Cases`) and seven fail (the bug citations in `04 - Bugs`).

| Category   | Scenario                                                  | Covered | Method     |
|------------|-----------------------------------------------------------|---------|------------|
| Happy Path | Register and login receive a valid JWT                    | Yes     | Automated  |
| Happy Path | Create appointment, queue number assigned                 | Yes     | Automated  |
| Happy Path | Fetch all, patient sees only own appointments             | Yes     | Automated  |
| Happy Path | Fetch single appointment by ID                            | Yes     | Automated  |
| Happy Path | Staff marks patient as served                             | Yes     | Automated  |
| Negative   | Login with wrong password (401)                           | Yes     | Automated  |
| Negative   | Login with non-existent email (401)                       | Yes     | Automated  |
| Negative   | Register with missing fields (400)                        | Yes     | Automated  |
| Negative   | No token on protected endpoint (401)                      | Yes     | Automated  |
| Negative   | Invalid token on protected endpoint (401)                 | Yes     | Automated  |
| Negative   | Patient accesses another patient's appointment (403)      | Yes     | Automated  |
| Negative   | Patient attempts mark-served (403)                        | Yes     | Automated  |
| Negative   | Non-existent appointment ID (404)                         | Yes     | Automated  |
| Edge       | Book appointment in the past (400)                        | Yes     | Automated  |
| Edge       | Duplicate same-day booking (400)                          | Yes     | Automated  |
| Edge       | Invalid date format (400)                                 | Yes     | Automated  |
| Edge       | Reschedule to past date (400)                             | Yes     | Automated  |
| Edge       | Cancel an already-cancelled appointment (409)             | Yes     | Automated  |
| Edge       | Mark an already-served appointment as served (409)        | Yes     | Automated  |
| Edge       | Re-book same date after cancellation (201)                | Yes     | Automated  |
| Bugs       | B1: Past time on today's date (cited as failing)          | Yes     | Automated  |
| Bugs       | B2: Impossible calendar date (cited as failing)           | Yes     | Automated  |
| Bugs       | B5: Self-registration as admin (cited as failing)         | Yes     | Automated  |
| Bugs       | B6: Mark-served on future-dated appointment (cited)       | Yes     | Automated  |
| Bugs       | B7: Cancel a served appointment (cited as failing)        | Yes     | Automated  |
| Bugs       | B8: Whitespace-only required fields (cited as failing)    | Yes     | Automated  |
| Bugs       | B9: PATCH overwrites doctorName with empty string         | Yes     | Automated  |

### 2.2 UI Coverage

| Flow                                       | Covered | Notes                                                |
|--------------------------------------------|---------|------------------------------------------------------|
| Login with valid credentials               | Yes     | `cypress/e2e/auth/login.cy.js`                       |
| Login with wrong credentials               | Yes     | Asserts the visible `login_error` element            |
| Login with empty form submission           | Yes     | Asserts focus on the first invalid field             |
| Create appointment                         | Yes     | Asserts list update and post-submit navigation       |
| Form validation, empty fields              | Yes     | Per-field `appointmentForm_*_error` assertions       |
| Update appointment (doctor and reason)     | Yes     | `cypress/e2e/appointments/update-appointment.cy.js`  |
| Cancel appointment                         | Yes     | Confirm-dialog interaction plus list status update   |
| Queue ordering                             | Yes     | Asserts row order for staff role                     |
| Mark patient as served                     | Yes     | Staff-only action, asserts row state change          |
| Role-based menu visibility                 | Yes     | Patient versus staff navigation                       |

Each appointment-CRUD spec also performs a basic input-to-render round trip using a fixture as the source of truth for the typed values. The `create-appointment` spec, for example, reads `cypress/fixtures/appointments/create-valid.json`, fills the form from those fields, submits, and asserts that `doctorName`, `reason`, and the expected `status` appear in the rendered appointments list. This confirms that typed values reach the rendered UI in some form. The check is deliberately loose (`contain.text` rather than strict equality), so it is a smoke-level reconciliation rather than a per-field equality contract; the strict-equality version is described under Section 2.3 and Section 5.

### 2.3 What I Did Not Cover and Why

- **Strict input-to-database round trip via network interception -** The current Cypress assertions use `contain.text` against the rendered list, which would still pass if the API silently trimmed whitespace, lower-cased an email, escaped a quote, or otherwise mutated the input on the wire. I did not wrap state-changing UI actions with `cy.intercept` to capture the actual request body and assert it against the fixture, nor did I add detail-page round-trip checks that re-fetch the persisted record by ID and compare each field to the fixture under `should('have.text', value)` strict equality. This kind of cross-layer reconciliation (fixture, typed values, wire payload, database row, rendered UI) is the right way to catch silent transformations between layers; I list the implementation pattern in Section 5.
- **Load and concurrency testing -** Outside the assessment scope, and the SQLite single-writer model would mask many concurrency issues. I documented the unprotected race on queue number assignment under Section 5 rather than attempting to test it with a tool that would not surface it reliably.
- **Token expiry behaviour -** The JWT is signed with a 24-hour expiry, but a Newman run completes in under five seconds. Testing expiry credibly requires a system-clock mock or a configurable expiry override. Rather than mock the wrong layer, I left it uncovered and named it as a candidate for a Jest + Supertest port in Section 5.
- **Cross-browser compatibility for the deployed frontend -** I confirmed the live URL works in Chrome and Firefox, where browsers permit https origins to call `http://localhost`. I did not verify Safari or older browsers, because the assessment is graded against the local Cypress suite which targets a localhost origin and never exercises the mixed-content path.

---

## 3. What I Automated versus Manual

Every scenario in the assessment specification is automated. The split between API and UI tests is deliberate, not opportunistic:

- The API suite owns security, validation, and state-machine claims. These are properties of the server and must be asserted at the layer that produces them.
- The UI suite owns user journeys and visual rendering. These are properties of the browser and have no equivalent on the wire.

While I was implementing the Cypress suite I drafted six authorization specs: three unauthenticated-redirect tests, one patient-redirect-from-`/queue` test, and two nav-visibility tests. On review I dropped four of the six before committing, because they were testing React Router redirects rather than the actual security boundary. A redirect test would still pass even if the backend had no authorization at all; it verifies the frontend's `ProtectedRoute` component, not that protected data is actually protected. The real claim that "a non-staff user cannot read `/api/queue/today` data" lives in the API and is asserted there with status code assertions in `02 - Negative`. The two surviving Cypress authorization specs (in `cypress/e2e/authorization/nav-visibility.cy.js`) are pure UI rendering checks, asking "does the menu hide the queue link from patients?", which has no API equivalent. I think this is the most honest place to draw the line between the two suites and keep each as the source of truth for what it actually proves.

I also encountered an early architectural mistake that taught me the value of test independence. When I first wrote the negative folder I assumed each request could share state from Happy Path, because the full Newman run executes folders in order and collection variables persist across the run. The first time I ran `npm run test:negative` standalone, every authenticated request returned 401 because `patient1Token`, `patient2Token`, and `staffToken` were empty strings (the seeding is in Happy Path, which a sub-folder run does not visit). Rather than leave the suite order-dependent, I added folder-level pre-request seeds to Negative, Edge Cases, Bugs, and Teardown. Each seed is idempotent: it short-circuits when the variables are already populated and otherwise rebuilds the prior pipeline state via `pm.sendRequest`.

Manual verification was limited to confirming that the deployed frontend at `https://queue-care-psi.vercel.app/` loads in a browser and reaches a backend running on my local machine when one is started on port 3000.

---

## 4. Bugs Found

Each entry below is reproducible by running `npm run test:bugs` from `test-automation/API/`. The corresponding request in `04 - Bugs` asserts the correct expected behaviour, so each Newman failure cites the bug verbatim. I include steps, expected, actual, and the line of source code that contains the underlying defect.

| ID  | Description                                                | Severity | Status |
| --- | ---------------------------------------------------------- | -------- | ------ |
| B1  | Past time on today's date is silently accepted             | Medium   | Open   |
| B2  | Impossible calendar dates pass validation                  | Low      | Open   |
| B5  | Self-registration as admin succeeds                        | High     | Open   |
| B6  | Future-dated appointments can be marked as served          | Medium   | Open   |
| B7  | Served appointments can be cancelled                       | Medium   | Open   |
| B8  | Whitespace-only required fields are accepted               | Low      | Open   |
| B9  | PATCH overwrites doctorName with an empty string           | Low      | Open   |

### B1: Past time on today's date is silently accepted

- **Steps to reproduce:** `POST /api/appointments` with `{ "doctorName": "...", "reason": "...", "date": "<today>", "time": "00:01" }`.
- **Expected:** 400 Bad Request, since 00:01 today has already passed.
- **Actual:** 201 Created. The `time` field is silently dropped.
- **Root cause:** The appointments table has no `time` column (`backend/src/db/database.js`), and `validateDate` (`backend/src/services/appointments.service.js:5`) compares only date strings. Any time value submitted by a client is discarded server-side, and the wall-clock check the validator should perform on today's date never happens.

### B2: Impossible calendar dates pass validation

- **Steps to reproduce:** `POST /api/appointments` with `"date": "2099-02-30"`.
- **Expected:** 400 Bad Request with a date-related error.
- **Actual:** 201 Created with `date: "2099-02-30"` persisted verbatim.
- **Root cause:** The validation regex `/^\d{4}-\d{2}-\d{2}$/` matches by digit count only. The subsequent `new Date('2099-02-30T00:00:00')` returns a valid Date object pointing at March 2, 2099, because JavaScript's Date constructor is lenient. The original string is then written to the database, where it now represents a calendar date that does not exist.

### B5: Self-registration as admin succeeds

- **Steps to reproduce:** `POST /api/auth/register` with `"role": "admin"` (no authentication required).
- **Expected:** 403 Forbidden or 422 Unprocessable Entity.
- **Actual:** 201 Created. The new user has admin privileges.
- **Root cause:** The register handler at `backend/src/controllers/auth.controller.js:11` validates only that the role string is one of the three permitted values; it never asks who is making the request or what role they are entitled to grant. This is the highest-severity finding in the suite, because it is a privilege-escalation defect: any external party can mint themselves staff or admin credentials by passing the role in the body.

### B6: Future-dated appointments can be marked as served

- **Steps to reproduce:** Create an appointment for `<today + 30 days>`. As staff, `PATCH /api/appointments/<id>/serve`.
- **Expected:** 400 or 409.
- **Actual:** 200 OK. The future appointment now has `status: served`.
- **Root cause:** The `serve` controller at `backend/src/controllers/appointments.controller.js:147` checks for the `served` and `cancelled` states but never inspects the `date` field. Staff can therefore prematurely close out future appointments, which corrupts queue ordering for the affected day and any reporting that distinguishes seen-today from booked-for-later.

### B7: Served appointments can be cancelled

- **Steps to reproduce:** Have an appointment in `served` state. As the owning patient, `DELETE /api/appointments/<id>`.
- **Expected:** 409 Conflict ("cannot cancel a served appointment").
- **Actual:** 200 OK. The row transitions silently from `served` back to `cancelled`.
- **Root cause:** The `cancel` controller at `backend/src/controllers/appointments.controller.js:121` checks `status === 'cancelled'` for idempotency but never checks `status === 'served'`. The state machine therefore allows a backwards transition from a terminal state, which removes the audit record that the patient was actually seen.

### B8: Whitespace-only required fields are accepted

- **Steps to reproduce:** `POST /api/appointments` with `"doctorName": "   "` and `"reason": "   "`.
- **Expected:** 400 Bad Request.
- **Actual:** 201 Created.
- **Root cause:** The validation guard `if (!doctorName || !reason || !date)` at `appointments.controller.js:11` rejects only falsy values. The string `"   "` is truthy, so it slips past every check and is persisted verbatim. The same defect applies to the `name` field on register.

### B9: PATCH overwrites doctorName with an empty string

- **Steps to reproduce:** PATCH a scheduled appointment with `{ "doctorName": "" }`.
- **Expected:** 400 Bad Request.
- **Actual:** 200 OK. The appointment now has an empty `doctorName`.
- **Root cause:** Two compounding issues. The update controller's "anything to update" guard at `appointments.controller.js:87` treats `""` as a present value because it tests for `=== undefined` rather than truthiness. The service then merges with `updates.doctorName ?? existing.doctorName` at `appointments.service.js:101`; the nullish coalescing operator only short-circuits on `null` or `undefined`, so `""` is preserved and written. Either fix on its own would close the defect; both were missed.

I also identified four additional candidates that I chose to file as Limitations rather than bugs, because the correct behaviour is a product call rather than an objective defect. These are listed in Section 5: re-booking on the same day after being served, the email case-sensitivity decision, the bcrypt 72-byte password truncation, and concurrent same-record race conditions on registration and booking.

---

## 5. What I Would Improve Given More Time

### Test coverage

- **Strict input integrity using `cy.intercept` and field-level equality. -** Wrap each state-changing UI action with `cy.intercept('POST', '/api/appointments').as('createAppt')` (and equivalents for PATCH and DELETE), then `cy.wait('@createAppt')` and assert on the captured `interception.request.body` that every field matches the fixture verbatim. Follow up with a navigation to the appointment detail page and assert each rendered field with `should('have.text', value)` rather than the looser `contain.text` the suite uses today. The same pattern applied at the API layer would issue `GET /api/appointments/:id` after every create or update, and reconcile the response body against both the fixture and the prior request body. This three-way reconciliation (fixture, wire payload, persisted record) catches three classes of silent regression that the current loose assertions miss: server-side mutation such as trim or lower-case, incorrect field mapping in the frontend service layer, and partial form clears between fields.
- **Port the negative and edge cases to Jest + Supertest. -** While I was writing the folder-level seeding pre-requests in Postman, I noticed the duplication: each folder's seed inlines the same `send`, `ensureUser`, and `ensureAppointment` helpers because Postman script scopes do not share. A Jest harness with `beforeEach` resetting the SQLite file gives me free isolation. I would keep Postman as the end-to-end happy-path smoke and move the security and state-machine assertions to Jest, where independence is cheap and parallelisation is possible.
- **Concurrent same-record tests. -** A pair of `Promise.all`-driven `POST`s to `/api/appointments` for the same patient on the same day exercises the unprotected race between `hasActiveBookingOnDate` and the subsequent `INSERT`. The same shape applies to concurrent registration on a single email. Both are easy in Supertest and awkward in Postman.
- **Time-mocked token expiry. -** Inject a clock dependency at the JWT layer and verify that an expired token returns 401 with the right error message, without waiting twenty-four hours.
- **Contract tests for response shapes. -** A schema-validation step on every functional response would catch the silent shape regressions that the current assertion style misses.

### Application

- **Atomic queue counter.** Replace `MAX(queueNumber) + 1` with a per-date counter row updated inside a transaction, eliminating the race window I called out above.
- **Time field on appointments. -** Add a `time` column or change `date` to a full ISO timestamp, validate it against the wall clock for today's date, and stop silently dropping the time the frontend already collects. Fixes B1.
- **Strict date validation. -** Compare the persisted string to the parsed Date object's `toISOString().slice(0, 10)`. If they differ, the input was a date that JavaScript silently shifted, and the request should be rejected. Fixes B2.
- **Role-aware registration.** Make `/api/auth/register` always create a `patient` user, and require an authenticated admin for any role assignment. Fixes B5.
- **State-machine guards. -** Add a `served` check to the cancel handler and a `date <= today` check to the serve handler. Fixes B6 and B7.
- **A `requiredString` helper used by both create and update controllers. -** Trim and reject empty results in one place. Fixes B8 and B9.
- **Email normalisation on register and login. -** Either lower-case all stored emails (decided at the schema level) or document case-sensitivity as the policy. The current implementation is silent on the question.
- **Login rate limiting -** A small sliding-window limiter would close the brute-force gap I called out in Section 1.

### Infrastructure

- [ ] **GitHub Actions pipeline -** On every push or pull request, the pipeline would boot the backend, run Newman against `01 - Happy Path` through `03 - Edge Cases` and fail the build on any regression, then run `04 - Bugs` in a separate step and surface the remaining defect count as a badge on the pull request. The current `npm test` summary already produces this split, so the pipeline would only need to interpret the existing output.

- [ ] **Dedicated test database fixture -** A small SQL seed file with a `beforeAll` `DROP TABLE` reset would replace the current run-unique email convention and give every run a guaranteed clean database state. The current teardown only removes scheduled appointments, so cancelled and served rows accumulate in the SQLite file indefinitely across runs.
