import type { ActionArgs } from "@remix-run/node";
import { Form, useTransition } from "@remix-run/react";
import { useState } from "react";
import invariant from "tiny-invariant";
import { TicketSelect } from "~/components/invoices/TicketSelect";
import { Button } from "~/components/shared/Button";
import { Checkbox } from "~/components/shared/Checkbox";
import { Select } from "~/components/shared/Select";
import { Spinner } from "~/components/shared/Spinner";
import { createCharge } from "~/models/charge.server";
import type { getInvoiceWithAllRelations } from "~/models/invoice.server";
import { addLaborSchema } from "~/schemas/invoice";
import { requireAdmin } from "~/utils/auth.server";
import { formatCurrency } from "~/utils/formatters";
import { getSession } from "~/utils/session.server";
import { jsonWithToast, redirectWithToast } from "~/utils/toast.server";
import { useMatchesData } from "~/utils/utils";

export async function action({ params, request }: ActionArgs) {
  await requireAdmin(request);
  const session = await getSession(request);
  const { invoiceId } = params;
  invariant(invoiceId, "Expected invoiceId");

  const form = Object.fromEntries(await request.formData());
  const result = addLaborSchema.safeParse(form);
  if (!result.success) {
    return jsonWithToast(
      { errors: { ...result.error.flatten().fieldErrors } },
      { status: 400 },
      session,
      {
        message: "Error adding labor",
        type: "error",
      }
    );
  }

  const { time, ticketId, chargeAmount, isWarranty } = result.data;
  await createCharge({
    invoiceId,
    ticketId,
    typeId: 1,
    description: `${time} minutes`,
    actualCost: chargeAmount,
    warrantyCovered: Boolean(isWarranty),
  });

  return redirectWithToast(`/admin/invoices/${invoiceId}/labor`, session, {
    message: "Labor added to invoice",
    type: "success",
  });
}

export default function AddLabor() {
  const transition = useTransition();
  const busy =
    transition.state === "submitting" || transition.state === "loading";
  const data = useMatchesData("routes/admin/invoices/$invoiceId") as {
    invoice: Awaited<ReturnType<typeof getInvoiceWithAllRelations>>;
  };
  const rate = data.invoice?.vendor.hourlyRate ?? 0;

  const [timeInMin, setTimeInMin] = useState(0);
  const total = ((timeInMin * rate) / 60).toFixed(2);

  return (
    <Form className="mt-4 flex max-w-xs flex-col gap-3" method="post" replace>
      <div>
        <input type="hidden" name="actionType" value="labor" />
        <input type="hidden" name="chargeAmount" value={total} />
        <TicketSelect tickets={data.invoice?.tickets ?? []} />
        <Select
          name="time"
          label="Time"
          defaultValue=""
          required
          onChange={(e) => setTimeInMin(Number(e.target.value))}
          className="sm:w-40"
        >
          <option value="" disabled>
            Select Time
          </option>
          {[...Array(18).keys()].map((i) => (
            <option key={i} value={i * 10 + 10}>
              {i * 10 + 10} mins
            </option>
          ))}
        </Select>
        <div className="mt-2 text-sm">
          <Checkbox
            id="isWarranty"
            name="isWarranty"
            label="Warranty Covered"
            defaultChecked={false}
          />
        </div>
        <div className="mt-2 flex items-center whitespace-nowrap text-sm">
          <span className="block text-gray-500">
            at {formatCurrency(data.invoice?.vendor.hourlyRate || 0)} / hr
          </span>
          &nbsp;
          <span className="font-medium text-cyan-700">
            = {formatCurrency(total)}
          </span>
        </div>
      </div>
      <Button type="submit" className="w-min" disabled={busy}>
        {busy && <Spinner className="mr-2" />}
        {busy ? "Adding..." : "Add"}
      </Button>
    </Form>
  );
}
