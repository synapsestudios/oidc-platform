/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    /**
     * Set an id_token cookie so that a user is logged in
     */
    setLoginCookie(jwt: string): Cypress.Chainable<Cypress.Cookie>;
  }
}
