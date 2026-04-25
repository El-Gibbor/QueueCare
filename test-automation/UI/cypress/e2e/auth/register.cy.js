import { registerPage } from '../../pageobjects/registerPage';
import { commonPage } from '../../pageobjects/commonPage';

describe('User Auth - Register', () => {
  let validBase;
  let existingUser;

  before(() => {
    cy.fixture('auth/register-valid').then((data) => {
      validBase = data;
    });
    // Pre-seed the default user so the duplicate-email test has a guaranteed conflict
    cy.fixture('auth/users').then((users) => {
      existingUser = users.patient_default;
      cy.registerUserViaApi(existingUser);
    });
  });

  beforeEach(() => {
    cy.clearLocalStorage();
    registerPage.visit();
  });

  it('registers a new patient and redirects to the login page', () => {
    // avoids collisions because the SQLite database persists between runs
    const uniqueEmail = `register.${Date.now()}@queuecare.test`;

    registerPage.fillForm({
      name:            validBase.name,
      email:           uniqueEmail,
      password:        validBase.password,
      confirmPassword: validBase.password,
      role:            validBase.role,
    });
    registerPage.submit();

    commonPage.expectPath('/login');
  });

  it('blocks submission and shows an error when passwords do not match', () => {
    registerPage.fillForm({
      name:            validBase.name,
      email:           `register.${Date.now()}@queuecare.test`,
      password:        validBase.password,
      confirmPassword: 'DifferentPass456!',
      role:            validBase.role,
    });
    registerPage.submit();

    registerPage.elements.error().should('be.visible').and('contain.text', 'Passwords do not match');
    commonPage.expectPath('/register');
  });

  it('shows an error when the email is already registered', () => {
    registerPage.fillForm({
      name:            existingUser.name,
      email:           existingUser.email,
      password:        existingUser.password,
      confirmPassword: existingUser.password,
      role:            existingUser.role,
    });
    registerPage.submit();

    registerPage.elements.error().should('be.visible');
    commonPage.expectPath('/register');
  });
});
