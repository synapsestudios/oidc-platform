import '@testing-library/cypress/add-commands';

const setLoginCookie: typeof cy.setLoginCookie = (jwt) => {
  return cy.setCookie('token', jwt);
};
Cypress.Commands.add('setLoginCookie', setLoginCookie);