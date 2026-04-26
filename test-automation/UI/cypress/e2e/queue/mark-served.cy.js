import { queuePage } from '../../pageobjects/queuePage';

describe('Queue - Mark served', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('lets staff mark a patient as served and removes the action button', () => {
    cy.seedTodaysAppointmentAsNewPatient().then((appointment) => {
      cy.registerAndLoginUniqueUser({ role: 'staff' });
      queuePage.visit();

      queuePage.elements.list().should('be.visible');
      queuePage.elements.markServedByNumber(appointment.queueNumber).click();

      queuePage.elements.statusByNumber(appointment.queueNumber)
        .should('contain.text', 'served');
      // Action button only renders while status !== 'served'
      queuePage.elements.markServedByNumber(appointment.queueNumber).should('not.exist');
    });
  });
});
