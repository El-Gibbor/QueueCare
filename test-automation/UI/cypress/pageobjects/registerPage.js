export const registerPage = {
  visit: () => cy.visit('/register'),

  elements: {
    name:            () => cy.get('[data-cy="register_TextField_name"]'),
    email:           () => cy.get('[data-cy="register_EmailInput_email"]'),
    password:        () => cy.get('[data-cy="register_PasswordInput_password"]'),
    confirmPassword: () => cy.get('[data-cy="register_PasswordInput_confirmPassword"]'),
    role:            () => cy.get('[data-cy="register_Dropdown_role_select"]'),
    submit:          () => cy.get('[data-cy="register_submit_button"]'),
    error:           () => cy.get('[data-cy="register_error"]'),
  },

  fillForm({ name, email, password, confirmPassword, role }) {
    if (name)            this.elements.name().clear().type(name);
    if (email)           this.elements.email().clear().type(email);
    // log: false keeps the password out of the Cypress command log
    if (password)        this.elements.password().clear().type(password, { log: false });
    if (confirmPassword) this.elements.confirmPassword().clear().type(confirmPassword, { log: false });
    if (role)            this.elements.role().select(role);
  },

  submit() {
    this.elements.submit().click();
  },
};
