export const confirmDialogPage = {
  elements: {
    dialog:  () => cy.get('[data-cy="confirmDialog"]'),
    title:   () => cy.get('[data-cy="confirmDialog_title"]'),
    confirm: () => cy.get('[data-cy="confirmDialog_confirm_button"]'),
    cancel:  () => cy.get('[data-cy="confirmDialog_cancel_button"]'),
  },

  confirm() { this.elements.confirm().click(); },
  dismiss() { this.elements.cancel().click(); },
};
