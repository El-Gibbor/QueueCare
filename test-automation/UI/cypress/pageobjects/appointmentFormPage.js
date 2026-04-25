export const appointmentFormPage = {
  visitNew: () => cy.visit('/appointments/new'),

  elements: {
    doctorName: () => cy.get('[data-cy="appointmentForm_TextField_doctorName"]'),
    date: () => cy.get('[data-cy="appointmentForm_DateInput_scheduledAt_date"]'),
    time: () => cy.get('[data-cy="appointmentForm_DateInput_scheduledAt_time"]'),
    reason: () => cy.get('[data-cy="appointmentForm_TextArea_reason"]'),
    submit: () => cy.get('[data-cy="appointmentForm_submit_button"]'),
    cancel: () => cy.get('[data-cy="appointmentForm_cancel_button"]'),
  },

  fillForm({ doctorName, date, time, reason }) {
    if (doctorName) this.elements.doctorName().clear().type(doctorName);
    if (date) this.elements.date().clear().type(date);
    if (time) this.elements.time().clear().type(time);
    if (reason) this.elements.reason().clear().type(reason);
  },

  submit() {
    this.elements.submit().click();
  },
};
