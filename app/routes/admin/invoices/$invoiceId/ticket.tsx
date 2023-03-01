import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useTransition } from "@remix-run/react";
import { Button } from "~/components/shared/Button";
import { CaughtError } from "~/components/shared/CaughtError";
import { Input } from "~/components/shared/Input";
import { Spinner } from "~/components/shared/Spinner";
import { UncaughtError } from "~/components/shared/UncaughtError";
import { addTicketToInvoiceSchema } from "~/schemas/invoiceSchemas";
import { requireAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { getSession } from "~/utils/session.server";
import { jsonWithToast, redirectWithToast } from "~/utils/toast.server";
import { badRequest, notFoundResponse } from "~/utils/utils";

export async function action({ params, request }: ActionArgs) {
  await requireAdmin(request);
  const session = await getSession(request);
  const { invoiceId } = params;
  if (!invoiceId) throw badRequest("Invoice ID is required");

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { id: true, tickets: { select: { id: true } } },
  });
  if (!invoice) throw notFoundResponse(`Invoice ${invoiceId} not found`);

  const form = Object.fromEntries(await request.formData());
  const result = addTicketToInvoiceSchema.safeParse(form);
  if (!result.success) {
    return jsonWithToast(
      { errors: { ...result.error.flatten().fieldErrors } },
      { status: 400 },
      session,
      {
        message: "Error adding ticket",
        type: "error",
      }
    );
  }
  const { ticketId } = result.data;
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { id: true },
  });
  if (!ticket) {
    return json(
      { errors: { ticketId: ["Ticket not found"] } },
      { status: 400 }
    );
  }
  if (invoice.tickets.some((t) => t.id === ticket.id)) {
    return json(
      {
        errors: {
          ticketId: ["Ticket already added to invoice"],
        },
      },
      { status: 400 }
    );
  }

  const updatedInvoice = await prisma.invoice.update({
    where: { id: invoice.id },
    data: { tickets: { connect: { id: ticket.id } } },
  });
  return redirectWithToast(
    `/admin/invoices/${updatedInvoice.id}/ticket`,
    session,
    {
      message: "Ticket added to invoice",
      type: "success",
    }
  );
}

export default function AddTicket() {
  const transition = useTransition();
  const actionData = useActionData<typeof action>();
  const busy =
    transition.state === "submitting" ||
    ((transition.type === "actionRedirect" ||
      transition.type === "actionReload") &&
      transition.state === "loading");

  return (
    <Form
      className="flex max-w-xs flex-col gap-3 sm:w-32"
      method="post"
      replace
    >
      <input type="hidden" name="actionType" value="ticket" />
      <Input
        label="Ticket Number"
        name="ticketId"
        placeholder="75226"
        errors={actionData?.errors.ticketId}
        disabled={busy}
        required
      />
      <Button type="submit" className="w-min" disabled={busy}>
        {busy && <Spinner className="mr-2" />}
        {busy ? "Adding..." : "Add"}
      </Button>
    </Form>
  );
}

export function CatchBoundary() {
  return <CaughtError />;
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <UncaughtError error={error} />;
}
