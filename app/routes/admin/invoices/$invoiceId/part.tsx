import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { TicketSelect } from "~/components/invoices/TicketSelect";
import { Button } from "~/components/shared/Button";
import { CaughtError } from "~/components/shared/CaughtError";
import { Checkbox } from "~/components/shared/Checkbox";
import { Input } from "~/components/shared/Input";
import { Select } from "~/components/shared/Select";
import { Spinner } from "~/components/shared/Spinner";
import { UncaughtError } from "~/components/shared/UncaughtError";
import { createCharge } from "~/models/charge.server";
import type { getInvoiceWithAllRelations } from "~/models/invoice.server";
import { getAllParts } from "~/models/part.server";
import { addPartSchema } from "~/schemas/invoiceSchemas";
import { requireAdmin } from "~/utils/auth.server";
import { getSession } from "~/utils/session.server";
import { jsonWithToast, redirectWithToast } from "~/utils/toast.server";
import { badRequest, getBusyState, useMatchesData } from "~/utils/utils";

export async function loader({ request }: LoaderArgs) {
  await requireAdmin(request);
  return json({
    parts: await getAllParts(),
  });
}

export async function action({ params, request }: ActionArgs) {
  await requireAdmin(request);
  const session = await getSession(request);
  const { invoiceId } = params;
  if (!invoiceId) throw badRequest("Invoice ID is required");

  const form = Object.fromEntries(await request.formData());
  const result = addPartSchema.safeParse(form);
  if (!result.success) {
    return jsonWithToast(
      { errors: { ...result.error.flatten().fieldErrors } },
      { status: 400 },
      session,
      {
        message: "Error adding part",
        type: "error",
      }
    );
  }

  const { partId, ticketId, chargeAmount, isWarranty } = result.data;
  await createCharge({
    invoiceId,
    ticketId,
    partId,
    typeId: 3,
    actualCost: chargeAmount,
    warrantyCovered: Boolean(isWarranty),
  });

  return redirectWithToast(`/admin/invoices/${invoiceId}/part`, session, {
    message: "Part added to invoice",
    type: "success",
  });
}

export default function AddPart() {
  const { parts } = useLoaderData<typeof loader>();
  const data = useMatchesData("routes/admin/invoices/$invoiceId") as {
    invoice: Awaited<ReturnType<typeof getInvoiceWithAllRelations>>;
  };
  const transition = useTransition();
  const actionData = useActionData<typeof action>();
  const busy = getBusyState(transition);

  return (
    <Form className="flex max-w-xs flex-col gap-3" method="post" replace>
      <div>
        <input type="hidden" name="actionType" value="part" />
        <TicketSelect tickets={data.invoice?.tickets ?? []} />
        <fieldset className="mt-2 flex gap-2">
          <div className="sm:w-40">
            <Select
              name="partId"
              label="Part"
              defaultValue=""
              errors={actionData?.errors.partId}
              required
            >
              <option value="" disabled>
                Select Part
              </option>
              {parts.map((part) => (
                <option key={part.id} value={part.id}>
                  {part.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:w-32">
            <Input
              type="number"
              label="Part Cost"
              name="chargeAmount"
              inputMode="decimal"
              placeholder="0.00"
              errors={actionData?.errors?.chargeAmount}
              isCurrency
              required
            />
          </div>
        </fieldset>
        <div className="mt-2 whitespace-nowrap text-sm">
          <Checkbox
            id="isWarranty"
            name="isWarranty"
            label="Warranty Covered"
            defaultChecked={false}
          />
        </div>
      </div>
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
