import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useTransition } from "@remix-run/react";
import { Button } from "~/components/shared/Button";
import { Input } from "~/components/shared/Input";
import type { getInvoiceById } from "~/models/invoice.server";
import { requireAdmin } from "~/utils/auth.server";
import { formatCurrency } from "~/utils/formatters";
import { useMatchesData } from "~/utils/utils";

export async function action({ request }: ActionArgs) {
  await requireAdmin(request);
  return json({});
}

export default function AddTrip() {
  const transition = useTransition();
  const actionData = useActionData<typeof action>();
  const data = useMatchesData("routes/admin/invoices/$invoiceId") as {
    invoice: Awaited<ReturnType<typeof getInvoiceById>>;
  };
  const tripCharge = data.invoice?.vendor.tripCharge ?? 0;
  const busy = transition.state === "submitting";

  return (
    <Form className="mt-4 flex max-w-xs flex-col gap-3 sm:w-40" replace>
      <input type="hidden" name="actionType" value="trip" />
      <input type="hidden" name="chargeAmount" value={tripCharge} />
      <Input type="date" label="Trip Date" name="tripChargeDate" required />
      <span className="mt-2 block text-sm text-gray-500">
        {formatCurrency(tripCharge)} / trip
      </span>
      <Button type="submit" className="w-min" disabled={busy}>
        Add
      </Button>
    </Form>
  );
}
