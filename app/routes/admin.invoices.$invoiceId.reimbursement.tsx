import type { ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { TicketSelect } from "~/components/invoices/TicketSelect";
import { Button } from "~/components/shared/Button";
import { Input } from "~/components/shared/Input";
import { Spinner } from "~/components/shared/Spinner";
import { createCharge } from "~/models/charge.server";
import type { getInvoiceWithAllRelations } from "~/models/invoice.server";
import { addReimbursementSchema } from "~/schemas/invoiceSchemas";
import { requireAdmin } from "~/utils/auth.server";
import { getSession } from "~/utils/session.server";
import { jsonWithToast, redirectWithToast } from "~/utils/toast.server";
import { badRequest, getBusyState, useMatchesData } from "~/utils/utils";

export async function action({ params, request }: ActionFunctionArgs) {
  await requireAdmin(request);
  const session = await getSession(request);
  const { invoiceId } = params;
  if (!invoiceId) throw badRequest("Invoice ID is required");

  const form = Object.fromEntries(await request.formData());
  const result = addReimbursementSchema.safeParse(form);
  if (!result.success) {
    return jsonWithToast({ errors: { ...result.error.flatten().fieldErrors } }, { status: 400 }, session, {
      message: "Error adding reimbursement",
      type: "error",
    });
  }

  const { reimbursedUser, ticketId, chargeAmount } = result.data;
  await createCharge({
    invoiceId,
    actualCost: chargeAmount,
    description: reimbursedUser,
    typeId: 5,
    ticketId,
  });

  return redirectWithToast(`/admin/invoices/${invoiceId}/reimbursement`, session, {
    message: "Reimbursement added to invoice",
    type: "success",
  });
}

export default function AddLabor() {
  const data = useMatchesData("routes/admin.invoices.$invoiceId") as {
    invoice: Awaited<ReturnType<typeof getInvoiceWithAllRelations>>;
  };
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const busy = getBusyState(navigation);

  return (
    <Form className="flex max-w-xs flex-col gap-3" method="post" replace>
      <TicketSelect tickets={data.invoice?.tickets ?? []} />
      <div className="flex flex-col gap-2 sm:flex-row">
        <input type="hidden" name="actionType" value="reimbursement" />
        <Input
          name="reimbursedUser"
          label="User's Name"
          placeholder="Trae Drose"
          className="sm:w-48"
          errors={actionData?.errors.reimbursedUser}
          required
        />
        <Input
          type="number"
          label="Amount"
          name="chargeAmount"
          inputMode="decimal"
          placeholder="0.00"
          errors={actionData?.errors.chargeAmount}
          isCurrency
          required
        />
      </div>
      <Button type="submit" className="w-min" disabled={busy}>
        {busy && <Spinner className="mr-2" />}
        {busy ? "Adding..." : "Add"}
      </Button>
    </Form>
  );
}
