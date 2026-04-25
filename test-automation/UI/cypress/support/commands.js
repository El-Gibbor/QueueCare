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
