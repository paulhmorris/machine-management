import type { ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import dayjs from "dayjs";
import { TicketSelect } from "~/components/invoices/TicketSelect";
import { Button } from "~/components/shared/Button";
import { CaughtError } from "~/components/shared/CaughtError";

import { Input } from "~/components/shared/Input";
import { Spinner } from "~/components/shared/Spinner";
import { UncaughtError } from "~/components/shared/UncaughtError";
import { createCharge } from "~/models/charge.server";
import type { getInvoiceWithAllRelations } from "~/models/invoice.server";
import { addShippingSchema } from "~/schemas/invoiceSchemas";
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
  const result = addShippingSchema.safeParse(form);
  if (!result.success) {
    return jsonWithToast({ errors: { ...result.error.flatten().fieldErrors } }, { status: 400 }, session, {
      message: "Error adding shipping",
      type: "error",
    });
  }

  const { shippingDate, ticketId, chargeAmount } = result.data;
  await createCharge({
    invoiceId,
    actualCost: chargeAmount,
    description: `${dayjs(shippingDate).format("M/D/YYYY")}`,
    typeId: 2,
    ticketId,
  });

  return redirectWithToast(`/admin/invoices/${invoiceId}/shipping`, session, {
    message: "Shipping added to invoice",
    type: "success",
  });
}

export default function AddShipping() {
  const data = useMatchesData("routes/admin.invoices.$invoiceId") as {
    invoice: Awaited<ReturnType<typeof getInvoiceWithAllRelations>>;
  };
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const busy = getBusyState(navigation);

  return (
    <Form className="flex max-w-xs flex-col gap-3" method="post" replace>
      <TicketSelect tickets={data.invoice?.tickets ?? []} />
      <fieldset className="flex gap-2">
        <div className="sm:w-40">
          <Input
            type="date"
            label="Shipping Date"
            name="shippingDate"
            errors={actionData?.errors.shippingDate}
            required
          />
        </div>
        <div className="sm:w-32">
          <Input
            type="number"
            label="Shipping Cost"
            name="chargeAmount"
            inputMode="decimal"
            placeholder="0.00"
            errors={actionData?.errors.chargeAmount}
            isCurrency
            required
          />
        </div>
      </fieldset>
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
