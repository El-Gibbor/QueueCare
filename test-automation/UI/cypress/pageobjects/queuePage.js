export const queuePage = {
  visit: () => cy.visit('/queue'),

  elements: {
    list: () => cy.get('[data-cy="queue-list"]'),
    rowByNumber: (n) => cy.get(`[data-cy="queue-item-${n}"]`),
    statusByNumber: (n) => cy.get(`[data-cy="queue-item-${n}__status"]`),
    patientNameByNumber: (n) => cy.get(`[data-cy="queue-item-${n}__patientName"]`),
    markServedByNumber: (n) => cy.get(`[data-cy="queue_markServed_button_${n}"]`),
    refresh: () => cy.get('[data-cy="queue_refresh_button"]'),
    emptyState: () => cy.get('[data-cy="queue_empty_state"]'),
    // Filtered to <tr> so cells like queue-item-N__status (also data-cy^="queue-item-") are not matched
    allRows:             () => cy.get('tr[data-cy^="queue-item-"]'),
  },
};
