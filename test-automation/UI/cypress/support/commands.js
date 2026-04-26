const apiUrl = () => Cypress.env('apiUrl');

// Idempotent registration; ignore 400 if the user already exists from a previous run.
Cypress.Commands.add('registerUserViaApi', (user) => {
  return cy.request({
    method: 'POST',
    url: `${apiUrl()}/api/auth/register`,
    body: user,
    failOnStatusCode: false,
  });
});

// fresh runtime-unique user, signs in via API, seeds the AuthContext keys,
// and yields the resulting user. (for form-validation.cy.js, create and cancel appointment tests)
Cypress.Commands.add('registerAndLoginUniqueUser', ({ role = 'patient' } = {}) => {
  const ts = new Date().toISOString().slice(0, 23).replace(/[:.]/g, '-');
  const user = {
    name: `Cypress ${role} ${ts}`,
    email: `${role}.${ts}@alustudent.com`,
    password: 'userPass123!',
    role,
  };

  return cy
    .registerUserViaApi(user)
    .then(() =>
      cy.request({
        method: 'POST',
        url: `${apiUrl()}/api/auth/login`,
        body: { email: user.email, password: user.password },
      })
    )
    .then(({ body }) => {
      window.localStorage.setItem('qc_token', body.token);
      window.localStorage.setItem('qc_user', JSON.stringify(body.user));
      return cy.wrap({ ...user, id: body.user.id });
    });
});

// Seeds a scheduled appointment for the currently logged-in user
Cypress.Commands.add('createAppointmentViaApi', (overrides = {}) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 7);
  const defaultDate = d.toISOString().slice(0, 10);

  const payload = {
    doctorName: 'Dr. Amalitech',
    reason: 'Created appointment via API for test setup',
    date: defaultDate,
    ...overrides,
  };

  return cy
    .request({
      method: 'POST',
      url: `${apiUrl()}/api/appointments`,
      headers: { Authorization: `Bearer ${window.localStorage.getItem('qc_token')}` },
      body: payload,
    })
    .then(({ body }) => body);
});

// Registers a fresh patient and books a today-dated appointment; returns the created appointment record
Cypress.Commands.add('seedTodaysAppointmentAsNewPatient', (reasonSuffix = '') => {
  const today = new Date().toISOString().slice(0, 10);
  return cy
    .registerAndLoginUniqueUser({ role: 'patient' })
    .then(() =>
      cy.createAppointmentViaApi({
        date: today,
        reason: `Queue test ${reasonSuffix}`.trim(),
      })
    );
});

Cypress.Commands.add('loginAs', (userRef) => {
  cy.fixture('auth/users').then((users) => {
    const user = users[userRef];
    return cy
      .request({
        method: 'POST',
        url: `${apiUrl()}/api/auth/login`,
        body: { email: user.email, password: user.password },
      })
      .then(({ body }) => {
        // Seed the same keys AuthContext reads on init so the next visit loads as authenticated
        window.localStorage.setItem('qc_token', body.token);
        window.localStorage.setItem('qc_user', JSON.stringify(body.user));
      });
  });
});
