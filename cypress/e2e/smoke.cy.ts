import { faker } from "@faker-js/faker";

describe("Admin smoke tests", () => {
  afterEach(() => {
    cy.cleanupUser();
  });

  it("should allow you to login and logout", () => {
    const loginForm = {
      email: `${faker.internet.userName()}@example.com`,
      password: faker.internet.password(),
    };
    cy.then(() => ({ email: loginForm.email })).as("user");
    cy.exec(
      `npx ts-node --require tsconfig-paths/register ./cypress/support/create-user.ts "${loginForm.email}" "${loginForm.password}"`
    );
    cy.visitAndCheck("/login");

    cy.findByRole("textbox", { name: /username/i }).type(loginForm.email);
    cy.findByLabelText(/password/i).type(loginForm.password);
    cy.findByRole("button", { name: /Log In/i }).click();

    cy.findByRole("link", { name: /Tickets/i }).click();
    cy.findByRole("button", { name: /Logout/i }).click();
    cy.findByRole("button", { name: /Log In/i });
  });

  it("should allow you to add a machine and report a ticket to it", () => {
    const testMachineId = faker.random.alphaNumeric(8).toUpperCase();

    cy.login();
    cy.visitAndCheck("/admin/machines");

    cy.findByRole("link", { name: /add machine/i }).click();

    cy.findByRole("textbox", { name: /Machine Id/i }).type(testMachineId);
    cy.findByRole("textbox", { name: /Serial/i }).type("Test Serial Number");
    cy.findByRole("combobox", { name: /Campus/i }).select(1);
    cy.findByRole("combobox", { name: /Location/i }).select(1);
    cy.findByRole("combobox", { name: /Pocket/i }).select(1);
    cy.findByRole("button", { name: /Create Machine/i }).click();
    const machineHeading = `Machine ${testMachineId}`;
    cy.findByRole("heading", { name: new RegExp(machineHeading, "i") }).should(
      "exist"
    );

    cy.visitAndCheck(`/report/${testMachineId}`);

    cy.findByRole("heading", { name: new RegExp(machineHeading, "i") }).should(
      "exist"
    );
    cy.findByRole("link", { name: /Shakes violently/i }).click();
    cy.findByRole("textbox", { name: /Comments/i })
      .should("have.focus")
      .type("Test Comment");
    cy.findByRole("link", { name: /Shakes violently/i }).should(
      "have.class",
      "border-cyan-700"
    );

    cy.findByRole("button", { name: /Submit/i }).click();
    cy.url().should("include", "/thanks");
    cy.findByRole("heading", { name: /Thanks/i }).should("exist");
    cy.cleanupMachine({ publicId: testMachineId });
  });
});

describe("Public smoke tests", () => {
  const testMachineId = faker.random.alphaNumeric(8).toUpperCase();
  afterEach(() => {
    cy.cleanupMachine({ publicId: testMachineId });
  });

  it("should allow you to report a machine from the public", () => {
    cy.exec(
      `npx ts-node --require tsconfig-paths/register ./cypress/support/create-machine.ts "${testMachineId}"`
    );
    cy.visitAndCheck(`/report/${testMachineId}`);

    cy.findByRole("heading", {
      name: new RegExp(`Machine ${testMachineId}`, "i"),
    }).should("exist");
    cy.findByRole("link", { name: /Shakes violently/i }).click();
    cy.findByRole("textbox", { name: /Comments/i })
      .should("have.focus")
      .type("Test Comment");
    cy.findByRole("link", { name: /Shakes violently/i }).should(
      "have.class",
      "border-cyan-700"
    );

    cy.findByRole("button", { name: /Submit/i }).click();
    cy.url().should("include", "/thanks");
    cy.findByRole("heading", { name: /Thanks/i }).should("exist");
  });

  it("should not allow you to report to a non-existent machine", () => {
    cy.visit("/report/doesnotexist", { failOnStatusCode: false });
    cy.findByRole("heading", { name: /Machine/i }).should("not.exist");
  });
});
