export class db {
  static reinit() {
    cy.exec('node scripts/reset-db');
  }
}
