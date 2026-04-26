import { appointmentFormPage } from '../../pageobjects/appointmentFormPage';
import { commonPage } from '../../pageobjects/commonPage';

describe('Appointments - Form validation', () => {
  let invalid;

  before(() => {
    cy.fixture('appointments/create-invalid').then((data) => {
      invalid = data;
    });
  });

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.registerAndLoginUniqueUser();
    appointmentFormPage.visitNew();
  });

  it('shows an error and stays on the form when all fields are empty', () => {
    // Form uses noValidate, so the empty submission reaches the API and the 400 surfaces in appointmentForm_error
    appointmentFormPage.submit();

    appointmentFormPage.elements.error().should('be.visible');
    commonPage.expectPath('/appointments/new');
  });

  it('rejects an appointment dated in the past', () => {
    appointmentFormPage.fillForm({
      doctorName: invalid.input.doctorName,
      date:       invalid.pastDate,
      time:       invalid.input.time,
      reason:     invalid.input.reason,
    });
    appointmentFormPage.submit();

    appointmentFormPage.elements.error().should('be.visible');
    commonPage.expectPath('/appointments/new');
  });
});
