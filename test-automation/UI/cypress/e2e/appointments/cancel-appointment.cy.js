import { appointmentListPage } from '../../pageobjects/appointmentListPage';
import { confirmDialogPage } from '../../pageobjects/confirmDialogPage';

describe('Appointments - Cancel', () => {
  before(() => {
    cy.fixture('auth/users').then((users) => {
      cy.registerUserViaApi(users.patient_default);
    });
  });

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.loginAs('patient_default');
  });

  it('cancels a scheduled appointment through the confirm dialog', () => {
    cy.createAppointmentViaApi().then((appointment) => {
      appointmentListPage.visit();

      appointmentListPage.elements.cardById(appointment.id).should('be.visible');
      appointmentListPage.elements.cancelById(appointment.id).click();

      confirmDialogPage.elements.dialog().should('be.visible');
      confirmDialogPage.confirm();

      appointmentListPage.elements.statusById(appointment.id).should('be.visible').and('contain.text', 'cancelled');
      // Cancel control is rendered only while status === 'scheduled', so it should be gone after confirmation
      appointmentListPage.elements.cancelById(appointment.id).should('not.exist');
    });
  });
});
