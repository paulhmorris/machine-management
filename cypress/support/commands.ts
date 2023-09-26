import { faker } from "@faker-js/faker";

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Logs in with a random user. Yields the user and adds an alias to the user
       *
       * @returns {typeof login}
       * @memberof Chainable
       * @example
       *    cy.login()
       * @example
       *    cy.login({ email: 'whatever@example.com' })
       */
      login: typeof login;

      /**
       * Deletes the current @user
       *
       * @returns {typeof cleanupUser}
       * @memberof Chainable
       * @example
       *    cy.cleanupUser()
       * @example
       *    cy.cleanupUser({ email: 'whatever@example.com' })
       */
      cleanupUser: typeof cleanupUser;

      /**
       * Deletes the current @user
       *
       * @returns {typeof cleanupMachine}
       * @memberof Chainable
       * @example
       *    cy.cleanupMachine()
       * @example
       *    cy.cleanupMachine({ publicId: 'ABC123' })
       */
      cleanupMachine: typeof cleanupMachine;

      /**
       * Extends the standard visit command to wait for the page to load
       *
       * @returns {typeof visitAndCheck}
       * @memberof Chainable
       * @example
       *    cy.visitAndCheck('/')
       *  @example
       *    cy.visitAndCheck('/', 500)
       */
      visitAndCheck: typeof visitAndCheck;
    }
  }
}

function login({
  email = faker.internet.email(undefined, undefined, "example.com"),
  password = faker.internet.password(),
}: {
  email?: string;
  password?: string;
} = {}) {
  cy.then(() => ({ email })).as("user");
  cy.exec(
    `npx ts-node --require tsconfig-paths/register ./cypress/support/create-user.ts "${email}" "${password}"`
  ).then(({ stdout }) => {
    const cookieValue = stdout.replace(/.*<cookie>(?<cookieValue>.*)<\/cookie>.*/s, "$<cookieValue>").trim();
    cy.setCookie("__session", cookieValue);
  });
  return cy.get("@user");
}

function cleanupUser({ email }: { email?: string } = {}) {
  if (email) {
    deleteUserByEmail(email);
  } else {
    cy.get("@user").then((user) => {
      const email = (user as { email?: string }).email;
      if (email) {
        deleteUserByEmail(email);
      }
    });
  }
  cy.clearCookie("__session");
}

function deleteUserByEmail(email: string) {
  cy.exec(`npx ts-node --require tsconfig-paths/register ./cypress/support/delete-user.ts "${email}"`);
  cy.clearCookie("__session");
}

function cleanupMachine({ publicId }: { publicId?: string } = {}) {
  if (publicId) {
    deleteMachineByPublicId(publicId);
  } else {
    cy.get("@machine").then((machine) => {
      const publicId = (machine as { publicId?: string }).publicId;
      if (publicId) {
        deleteMachineByPublicId(publicId);
      }
    });
  }
}

function deleteMachineByPublicId(publicId: string) {
  cy.exec(`npx ts-node --require tsconfig-paths/register ./cypress/support/delete-machine.ts ${publicId}`);
}

// We're waiting a second because of this issue happen randomly
// https://github.com/cypress-io/cypress/issues/7306
// Also added custom types to avoid getting detached
// https://github.com/cypress-io/cypress/issues/7306#issuecomment-1152752612
// ===========================================================
function visitAndCheck(url: string, waitTime = 1000) {
  cy.visit(url);
  cy.location("pathname").should("contain", url).wait(waitTime);
}

Cypress.Commands.add("login", login);
Cypress.Commands.add("cleanupUser", cleanupUser);
Cypress.Commands.add("visitAndCheck", visitAndCheck);
Cypress.Commands.add("cleanupMachine", cleanupMachine);
