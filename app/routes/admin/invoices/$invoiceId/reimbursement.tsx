import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useTransition } from "@remix-run/react";
import invariant from "tiny-invariant";
import { Button } from "~/components/shared/Button";
import { Input } from "~/components/shared/Input";
import { createCharge } from "~/models/charge.server";
import { addReimbursementSchema } from "~/schemas/invoice";
import { requireAdmin } from "~/utils/auth.server";
import { getSession } from "~/utils/session.server";
import { redirectWithToast } from "~/utils/toast.server";

export async function action({ params, request }: ActionArgs) {
  await requireAdmin(request);
  const session = await getSession(request);
  const { invoiceId } = params;
  invariant(invoiceId, "Expected invoiceId");

  const form = Object.fromEntries(await request.formData());
  const result = addReimbursementSchema.safeParse(form);
  if (!result.success) {
    return json({ errors: { ...result.error.flatten().fieldErrors } });
  }

  const { reimbursedUser, ticketId, chargeAmount } = result.data;
  await createCharge({
    invoiceId,
    actualCost: chargeAmount,
    description: reimbursedUser,
    typeId: 5,
    ticketId,
  });

  return redirectWithToast(
    `/admin/invoices/${invoiceId}/reimbursement`,
    session,
    {
      message: "Reimbursement added to invoice",
      type: "success",
    }
  );
}

export default function AddLabor() {
  const transition = useTransition();
  const actionData = useActionData<typeof action>();
  const busy = transition.state === "submitting";

  return (
    <Form className="mt-4 flex max-w-xs flex-col gap-3" method="post" replace>
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
        Add
      </Button>
    </Form>
  );
}
