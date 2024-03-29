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
import { addTripSchema } from "~/schemas/invoiceSchemas";
import { requireAdmin } from "~/utils/auth.server";
import { formatCurrency } from "~/utils/formatters";
import { getSession } from "~/utils/session.server";
import { jsonWithToast, redirectWithToast } from "~/utils/toast.server";
import { badRequest, getBusyState, useMatchesData } from "~/utils/utils";

export async function action({ params, request }: ActionFunctionArgs) {
  console.log("---------- hello");
  await requireAdmin(request);
  const session = await getSession(request);
  const { invoiceId } = params;
  if (!invoiceId) throw badRequest("Invoice ID is required");

  const form = Object.fromEntries(await request.formData());
  const result = addTripSchema.safeParse(form);
  if (!result.success) {
    return jsonWithToast({ errors: { ...result.error.flatten().fieldErrors } }, { status: 400 }, session, {
      message: "Error adding trip",
      type: "error",
    });
  }

  const { tripChargeDate, ticketId, chargeAmount } = result.data;
  await createCharge({
    invoiceId,
    actualCost: chargeAmount,
    description: `${dayjs(tripChargeDate).format("M/D/YYYY")}`,
    typeId: 2,
    ticketId,
  });

  return redirectWithToast(`/admin/invoices/${invoiceId}/trip`, session, {
    message: "Trip added to invoice",
    type: "success",
  });
}

export default function AddTrip() {
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const data = useMatchesData("routes/admin.invoices.$invoiceId") as {
    invoice: Awaited<ReturnType<typeof getInvoiceWithAllRelations>>;
  };
  const tripCharge = data.invoice?.vendor.tripCharge ?? 0;
  const busy = getBusyState(navigation);

  return (
    <Form className="flex max-w-xs flex-col gap-3 sm:w-40" method="post" replace>
      <input type="hidden" name="chargeAmount" value={tripCharge} />
      <TicketSelect tickets={data.invoice?.tickets || []} />
      <Input type="date" label="Trip Date" name="tripChargeDate" errors={actionData?.errors.tripChargeDate} required />
      <span className="mt-2 block text-sm text-gray-500">{formatCurrency(tripCharge)} / trip</span>
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
