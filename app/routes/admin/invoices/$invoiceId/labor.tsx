import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useTransition } from "@remix-run/react";
import { useState } from "react";
import { Button } from "~/components/shared/Button";
import { Checkbox } from "~/components/shared/Checkbox";
import { Select } from "~/components/shared/Select";
import type { getInvoiceById } from "~/models/invoice.server";
import { requireAdmin } from "~/utils/auth.server";
import { formatCurrency } from "~/utils/formatters";
import { useMatchesData } from "~/utils/utils";

export async function action({ request }: ActionArgs) {
  await requireAdmin(request);
  return json({});
}

export default function AddLabor() {
  const transition = useTransition();
  const actionData = useActionData<typeof action>();
  const busy = transition.state === "submitting";
  const data = useMatchesData("routes/admin/invoices/$invoiceId") as {
    invoice: Awaited<ReturnType<typeof getInvoiceById>>;
  };
  const rate = data.invoice?.vendor.hourlyRate ?? 0;

  const [timeInMin, setTimeInMin] = useState(0);
  const total = ((timeInMin * rate) / 60).toFixed(2);

  return (
    <Form className="mt-4 flex max-w-xs flex-col gap-3" replace>
      <div>
        <input type="hidden" name="actionType" value="labor" />
        <input type="hidden" name="chargeAmount" value={total} />
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
            at {formatCurrency(0)} / hr
          </span>
          &nbsp;
          <span className="font-medium text-cyan-700">
            = {formatCurrency(0)}
          </span>
        </div>
      </div>
      <Button type="submit" className="w-min" disabled={busy}>
        Add
      </Button>
    </Form>
  );
}
