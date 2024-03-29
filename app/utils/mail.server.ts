import type { PasswordReset, Ticket, User } from "@prisma/client";
import dayjs from "dayjs";
import { createTestAccount, createTransport, getTestMessageUrl } from "nodemailer";
import { getMachineForRequestEmail as getMachineForEmail } from "~/models/machine.server";
import { getTicketByIdWithAllRelations } from "~/models/ticket.server";
import { badRequest } from "~/utils/utils";

type MachineReportEmailData = {
  ticketId: Ticket["id"];
  notes: string | undefined;
};
export async function sendMachineReportEmail({ ticketId, notes }: MachineReportEmailData) {
  const ticket = await getTicketByIdWithAllRelations(ticketId);
  if (!ticket) {
    return badRequest("Ticket not found, unable to send email.");
  }
  const machine = await getMachineForEmail(ticket.machine.publicId);
  if (!machine) {
    return badRequest("Machine or ticket not found, unable to send email.");
  }
  const testAccount = await createTestAccount();
  const campusName = machine.pocket.location.campus.name;

  // create reusable transporter object using the default SMTP transport
  const transporter = createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  if (!ticket.assignedTo) {
    throw new Error("Ticket is not assigned to anyone!");
  }

  try {
    const info = await transporter.sendMail({
      from: '"Fred Foo 👻" <foo@example.com>',
      to: ticket.assignedTo.email,
      subject: `${campusName}: Work Order - ${ticketId}`,
      html: `
      Latest Comment: ${notes ?? "No notes"}
      <br />
      Campus: ${campusName}
      <br />
      Location: ${machine.pocket.location.name}
      <br />
      Floor/Level: ${machine.pocket.floor ?? "Unknown"}
      <br />
      Machine Type: ${machine.type.name}
      <br />
      Machine Position: ${machine.pocket.position ?? "Unknown"}
      <br />
      Machine ID: ${machine.publicId}
      <br />
      S/N: ${machine.serialNumber ?? "Unknown"}
      <br />
      Date of error: ${dayjs(ticket.reportedOn).format("MM/DD/YYYY h:mm A")}
      <br />
      Problem: ${ticket.errorType.name}
      <br />
      Machine Error Code: "Not Implemented!"
      <br />
      Notes: ${ticket.notes ?? "No notes"}
      <br />
      <br />
      <a href="${process.env.URL}/close-ticket/${ticket.secretId}">Resolve this ticket</a>
      `,
    });
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", getTestMessageUrl(info));
  } catch (error) {
    console.error(error);
  }
}

export async function sendTicketCloseEmail(ticketId: Ticket["id"], notes: string, email: string) {
  const ticket = await getTicketByIdWithAllRelations(ticketId);
  if (!ticket) {
    return badRequest("Ticket not found, unable to send email.");
  }
  const machine = await getMachineForEmail(ticket.machine.publicId);
  if (!machine) {
    return badRequest("Machine or ticket not found, unable to send email.");
  }
  const testAccount = await createTestAccount();
  const campusName = machine.pocket.location.campus.name;

  // create reusable transporter object using the default SMTP transport
  const transporter = createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  try {
    const info = await transporter.sendMail({
      from: '"Fred Foo 👻" <foo@example.com>',
      to: "tmfd@remix.run",
      subject: `${campusName}: Ticket ${ticketId} Resolved by Tech`,
      html: `
      Closed By: ${email}
      <br />
      Campus: ${campusName}
      <br />
      Location: ${machine.pocket.location.name}
      <br />
      Floor/Level: ${machine.pocket.floor ?? "Unknown"}
      <br />
      Machine Type: ${machine.type.name}
      <br />
      Machine Position: ${machine.pocket.position ?? "Unknown"}
      <br />
      Machine ID: ${machine.publicId}
      <br />
      `,
    });
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", getTestMessageUrl(info));
  } catch (error) {
    console.error(error);
  }
}

export async function sendPasswordResetEmail({
  email,
  token,
}: {
  email: User["email"];
  token: PasswordReset["token"];
}) {
  const testAccount = await createTestAccount();
  const transporter = createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  try {
    const info = await transporter.sendMail({
      from: '"Fred Foo 👻" <foo@example.com>',
      to: email,
      subject: "Machine Manager: Password Reset",
      html: `
        <a href="${process.env.URL}/new-password?token=${token}">Reset your password</a>
      `,
    });
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", getTestMessageUrl(info));
  } catch (error) {
    console.error(error);
  }
}

export async function sendPasswordSetupEmail({
  email,
  token,
}: {
  email: User["email"];
  token: PasswordReset["token"];
}) {
  const testAccount = await createTestAccount();
  const transporter = createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  try {
    const info = await transporter.sendMail({
      from: '"Fred Foo 👻" <foo@example.com>',
      to: email,
      subject: "Machine Manager: Password Setup",
      html: `
        <a href="${process.env.URL}/setup-password?token=${token}">Setup your password</a>
      `,
    });
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", getTestMessageUrl(info));
  } catch (error) {
    console.error(error);
  }
}
