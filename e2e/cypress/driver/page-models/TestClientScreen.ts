export class TestClientScreen {
  static visit() {
    cy.visit(Cypress.env("frontend_base_url"));
  }

  static clickLoginLink() {
    cy.get("a").contains("Log In").click();
  }
}
