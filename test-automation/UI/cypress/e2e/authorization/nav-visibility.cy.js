import { navPage } from '../../pageobjects/navPage';

describe('Authorization - Nav visibility by role', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('Does not render the queue nav link for a patient', () => {
    cy.registerAndLoginUniqueUser({ role: 'patient' });
    cy.visit('/appointments');
    navPage.elements.appointments().should('be.visible');
    navPage.elements.queue().should('not.exist');
  });

  it('Renders the queue nav link for a staff', () => {
    cy.registerAndLoginUniqueUser({ role: 'staff' });
    cy.visit('/appointments');
    navPage.elements.queue().should('be.visible');
  });
});
