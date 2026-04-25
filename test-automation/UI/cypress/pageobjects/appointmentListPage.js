export const appointmentListPage = {
  visit: () => cy.visit('/appointments'),

  elements: {
    list: () => cy.get('[data-cy="appointment-list"]'),
    cardById: (id) => cy.get(`[data-cy="appointment-card-${id}"]`),
    statusById: (id) => cy.get(`[data-cy="appointment-card-${id}__status"]`),
    cancelById: (id) => cy.get(`[data-cy="appointment-card-${id}__cancel"]`),
    editById: (id) => cy.get(`[data-cy="appointment-card-${id}__edit"]`),
    viewById: (id) => cy.get(`[data-cy="appointment-card-${id}__view"]`),
    newButton: () => cy.get('[data-cy="appointmentList_newAppointment_button"]'),
  },
};
