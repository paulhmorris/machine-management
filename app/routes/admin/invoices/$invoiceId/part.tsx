import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { Button } from "~/components/shared/Button";
import { Checkbox } from "~/components/shared/Checkbox";
import { Input } from "~/components/shared/Input";
import { Select } from "~/components/shared/Select";
import { requireAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

export async function loader({ request }: LoaderArgs) {
  await requireAdmin(request);
  return json({
    parts: await prisma.part.findMany(),
  });
}

export async function action({ request }: ActionArgs) {
  await requireAdmin(request);
  return json({});
}

export default function AddPart() {
  const { parts } = useLoaderData<typeof loader>();
  const transition = useTransition();
  const actionData = useActionData<typeof action>();
  const busy = transition.state === "submitting";

  return (
    <Form className="mt-4 flex max-w-xs flex-col gap-3" replace>
      <div>
        <input type="hidden" name="actionType" value="part" />
        <fieldset className="flex gap-2">
          <div className="sm:w-40">
            <Select name="partId" label="Part" defaultValue="" required>
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
