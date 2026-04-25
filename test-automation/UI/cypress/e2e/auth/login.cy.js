import { authPage } from '../../pageobjects/authPage';
import { commonPage } from '../../pageobjects/commonPage';

describe('Auth - Login', () => {
  let user;

  before(() => {
    cy.fixture('auth/users').then((users) => {
      user = users.patient_default;
      cy.registerUserViaApi(user);
    });
  });

  beforeEach(() => {
    cy.clearLocalStorage();
    authPage.visitLogin();
  });

  it('logs in with valid credentials and lands on /appointments', () => {
    authPage.fillCredentials({ email: user.email, password: user.password });
    authPage.submit();

    commonPage.expectPath('/appointments');
    commonPage.expectAuthenticated();
  });

  it('shows an error and stays on /login when credentials are invalid', () => {
    authPage.fillCredentials({ email: user.email, password: 'WrongPassword!' });
    authPage.submit();

    authPage.elements.error().should('be.visible');
    commonPage.expectPath('/login');
    commonPage.expectUnauthenticated();
  });

  it('does not navigate away when submitting an empty form', () => {
    authPage.submit();

    commonPage.expectPath('/login');
    authPage.elements.error().should('be.visible');
    commonPage.expectUnauthenticated();
  });
});
