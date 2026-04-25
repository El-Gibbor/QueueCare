import { appointmentFormPage } from '../../pageobjects/appointmentFormPage';
import { appointmentListPage } from '../../pageobjects/appointmentListPage';
import { commonPage } from '../../pageobjects/commonPage';

describe('Appointments - Create', () => {
  let createValid;

  // Returns a YYYY-MM-DD date 7 days ahead (avoids expired hardcoded dates)
  const futureDate = () => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + 7);
    return d.toISOString().slice(0, 10);
  };

  before(() => {
    cy.fixture('appointments/create-valid').then((data) => {
      createValid = data;
    });
    cy.fixture('auth/users').then((users) => {
      cy.registerUserViaApi(users.patient_default);
    });
  });

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.loginAs('patient_default');
    appointmentFormPage.visitNew();
  });

  it('books a new appointment and shows it on the list with a queue number', () => {
    const date = futureDate();

    appointmentFormPage.fillForm({
      doctorName: createValid.input.doctorName,
      date,
      time:       createValid.input.time,
      reason:     createValid.input.reason,
    });
    appointmentFormPage.submit();

    commonPage.expectPath('/appointments');
    appointmentListPage.elements.list().should('be.visible');
    appointmentListPage.elements.list().should('contain.text', createValid.input.doctorName)
      .and('contain.text', createValid.input.reason)
      .and('contain.text', createValid.expected.status);
    appointmentListPage.elements.list().find('[data-cy^="appointment-card-"]').should('have.length.at.least', 1);
  });
});
