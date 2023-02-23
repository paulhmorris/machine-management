import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import { Button } from "~/components/shared/Button";
import { Checkbox } from "~/components/shared/Checkbox";
import { Input } from "~/components/shared/Input";
import { Select } from "~/components/shared/Select";
import { createCharge } from "~/models/charge.server";
import { addPartSchema } from "~/schemas/invoice";
import { requireAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { getSession } from "~/utils/session.server";
import { redirectWithToast } from "~/utils/toast.server";

export async function loader({ request }: LoaderArgs) {
  await requireAdmin(request);
  return json({
    parts: await prisma.part.findMany(),
  });
}

export async function action({ params, request }: ActionArgs) {
  await requireAdmin(request);
  const session = await getSession(request);
  const { invoiceId } = params;
  invariant(invoiceId, "Expected invoiceId");

  const form = Object.fromEntries(await request.formData());
  const result = addPartSchema.safeParse(form);
  if (!result.success) {
    return json({ errors: { ...result.error.flatten().fieldErrors } });
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
  const transition = useTransition();
  const actionData = useActionData<typeof action>();
  const busy = transition.state === "submitting";

  return (
    <Form
      className="mt-4 flex max-w-xs flex-col gap-3"
      method="post"
      noValidate
      replace
    >
      <div>
        <input type="hidden" name="actionType" value="part" />
        <fieldset className="flex gap-2">
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
              errors={actionData?.errors.chargeAmount}
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
        Add
      </Button>
    </Form>
  );
}
