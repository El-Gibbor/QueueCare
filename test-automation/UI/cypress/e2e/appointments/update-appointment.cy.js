import { appointmentFormPage } from '../../pageobjects/appointmentFormPage';
import { appointmentListPage } from '../../pageobjects/appointmentListPage';
import { commonPage } from '../../pageobjects/commonPage';

describe('Appointments - Update', () => {
  let updateValid;

  before(() => {
    cy.fixture('appointments/update-valid').then((data) => {
      updateValid = data;
    });
  });

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.registerAndLoginUniqueUser();
  });

  it('updates a scheduled appointment doctor and reason and reflects the change on the list', () => {
    cy.createAppointmentViaApi().then((appointment) => {
      appointmentListPage.visit();
      appointmentListPage.elements.editById(appointment.id).click();

      cy.location('pathname').should('eq', `/appointments/${appointment.id}/edit`);
      // Wait for the form to prefill from getAppointmentById before overwriting
      appointmentFormPage.elements.doctorName().should('have.value', appointment.doctorName);

      appointmentFormPage.fillForm({
        doctorName: updateValid.doctorName,
        reason:     updateValid.reason,
      });
      appointmentFormPage.submit();

      commonPage.expectPath('/appointments');
      appointmentListPage.elements.cardById(appointment.id)
        .should('contain.text', updateValid.doctorName)
        .and('contain.text', updateValid.reason);
    });
  });
});
