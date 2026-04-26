export const navPage = {
  elements: {
    appointments: () => cy.get('[data-cy="nav_appointments"]'),
    queue:        () => cy.get('[data-cy="nav_queue"]'),
    logout:       () => cy.get('[data-cy="nav_logout"]'),
  },
};
