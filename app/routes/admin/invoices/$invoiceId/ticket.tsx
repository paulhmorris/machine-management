import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useTransition } from "@remix-run/react";
import invariant from "tiny-invariant";
import { Button } from "~/components/shared/Button";
import { Input } from "~/components/shared/Input";
import { addTicketToInvoiceSchema } from "~/schemas/invoice";
import { requireAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { badRequest } from "~/utils/utils";

export async function action({ params, request }: ActionArgs) {
  await requireAdmin(request);
  const { invoiceId } = params;
  invariant(typeof invoiceId === "string", "Expected invoiceId");
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { id: true, tickets: { select: { id: true } } },
  });
  if (!invoice) {
    throw badRequest(`Invoice ${invoiceId} not found`);
  }

  const form = Object.fromEntries(await request.formData());
  // Add Ticket
  const { ticketId } = addTicketToInvoiceSchema.parse(form);

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { id: true },
  });
  if (!ticket) {
    return json(
      { errors: { ticketId: { _errors: ["Ticket not found"] } } },
      { status: 400 }
    );
  }
  if (invoice.tickets.some((t) => t.id === ticket.id)) {
    return json(
      {
        errors: {
          ticketId: { _errors: ["Ticket already added to invoice"] },
        },
      },
      { status: 400 }
    );
  }

  const updatedInvoice = await prisma.invoice.update({
    where: { id: invoice.id },
    data: { tickets: { connect: { id: ticket.id } } },
  });
  return json({ updatedInvoice });
}

export default function AddTicket() {
  const transition = useTransition();
  const actionData = useActionData<typeof action>();
  const busy = transition.state === "submitting";

  return (
    <Form className="mt-4 flex max-w-xs flex-col gap-3 sm:w-32" replace>
      <input type="hidden" name="actionType" value="ticket" />
      <Input
        label="Ticket Number"
        name="ticketId"
        placeholder="75226"
        // @ts-expect-error Having trouble with typing action
        // eslint-disable-next-line
        error={actionData?.ticketId}
        disabled={busy}
        required
      />
      <Button type="submit" className="w-min" disabled={busy}>
        Add
      </Button>
    </Form>
  );
}
