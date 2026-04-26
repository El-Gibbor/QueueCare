import { queuePage } from '../../pageobjects/queuePage';

describe('Queue - Ordering', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("shows today's scheduled appointments to staff in queue-number order", () => {
    const seeded = [];

    cy.seedTodaysAppointmentAsNewPatient('first').then((a) => {
      seeded.push(a);
    });
    cy.seedTodaysAppointmentAsNewPatient('second').then((a) => {
      seeded.push(a);
    });

    cy.registerAndLoginUniqueUser({ role: 'staff' });
    queuePage.visit();
    queuePage.elements.list().should('be.visible');

    cy.then(() => {
      const [first, second] = seeded;
      expect(second.queueNumber, 'queueNumber increases for back-to-back same-day bookings')
        .to.be.greaterThan(first.queueNumber);

      queuePage.elements.rowByNumber(first.queueNumber).should('exist');
      queuePage.elements.rowByNumber(second.queueNumber).should('exist');

      queuePage.elements.allRows().then(($rows) => {
        const numbers = [...$rows].map((tr) =>
          Number(tr.getAttribute('data-cy').replace('queue-item-', ''))
        );
        expect(numbers, 'queue rows are sorted ascending by queueNumber').to.deep.equal(
          [...numbers].sort((x, y) => x - y)
        );
        expect(numbers.indexOf(first.queueNumber)).to.be.lessThan(
          numbers.indexOf(second.queueNumber)
        );
      });
    });
  });
});
