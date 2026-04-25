export const commonPage = {
  expectPath(path) {
    cy.location('pathname').should('eq', path);
  },

  expectAuthenticated() {
    cy.window().its('localStorage').invoke('getItem', 'qc_token').should('be.a', 'string');
  },

  expectUnauthenticated() {
    cy.window().its('localStorage').invoke('getItem', 'qc_token').should('be.null');
  },
};
