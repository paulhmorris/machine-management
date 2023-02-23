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

export default function AddLabor() {
  const transition = useTransition();
  const actionData = useActionData<typeof action>();
  const busy = transition.state === "submitting";

  return (
    <Form className="mt-4 flex max-w-xs flex-col gap-3" replace>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input type="hidden" name="actionType" value="reimbursement" />
        <Input
          name="reimbursedUser"
          label="User's Name"
          placeholder="Trae Drose"
          className="sm:w-48"
          required
        />
        <Input
          type="number"
          label="Amount"
          name="chargeAmount"
          inputMode="decimal"
          placeholder="0.00"
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
