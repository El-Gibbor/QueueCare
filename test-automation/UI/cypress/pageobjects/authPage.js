export const authPage = {
  visitLogin: () => cy.visit('/login'),

  elements: {
    email:    () => cy.get('[data-cy="login_EmailInput_email"]'),
    password: () => cy.get('[data-cy="login_PasswordInput_password"]'),
    submit:   () => cy.get('[data-cy="login_submit_button"]'),
    error:    () => cy.get('[data-cy="login_error"]'),
    register: () => cy.get('[data-cy="nav_register"]')
  },

  fillCredentials({ email, password }) {
    if (email)    this.elements.email().clear().type(email);
    // log: false keeps the password out of the Cypress command log
    if (password) this.elements.password().clear().type(password, { log: false });
  },

  submit() {
    this.elements.submit().click();
  },
};
