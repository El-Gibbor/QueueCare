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
