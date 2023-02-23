import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useTransition } from "@remix-run/react";
import { Button } from "~/components/shared/Button";

import { Input } from "~/components/shared/Input";
import { requireAdmin } from "~/utils/auth.server";

export async function action({ request }: ActionArgs) {
  await requireAdmin(request);
  return json({});
}

export default function AddShipping() {
  const transition = useTransition();
  const actionData = useActionData<typeof action>();
  const busy = transition.state === "submitting";

  return (
    <Form className="mt-4 flex max-w-xs flex-col gap-3" replace>
      <input type="hidden" name="actionType" value="shipping" />
      <fieldset className="flex gap-2">
        <div className="sm:w-40">
          <Input
            type="date"
            label="Shipping Date"
            name="shippingDate"
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
            isCurrency
            required
          />
        </div>
      </fieldset>
      <Button type="submit" className="w-min" disabled={busy}>
        Add
      </Button>
    </Form>
  );
}
