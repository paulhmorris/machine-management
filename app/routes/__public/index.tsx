import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import invariant from "tiny-invariant";
import { Button } from "~/components/shared/Button";
import { Input } from "~/components/shared/Input";

export async function action({ request }: ActionArgs) {
  const form = await request.formData();
  const machineId = form.get("machineId");
  invariant(typeof machineId === "string", "Expected machineId");

  if (typeof machineId !== "string" || machineId.length === 0) {
    return json(
      { errors: { machineId: "Machine number is required" } },
      { status: 400 }
    );
  }
  return redirect(`/report/${machineId}`);
}

export default function Index() {
  const machineIdRef = useRef<HTMLInputElement>(null);
  const actionData = useActionData<typeof action>();
  useEffect(() => {
    machineIdRef.current?.focus();
    if (actionData?.errors?.machineId) {
      machineIdRef.current?.focus();
    }
  }, [actionData]);

  return (
    <>
      <h1 className="text-center">Hey there!</h1>
      <p className="mt-4 text-center">
        If you need to report an issue, please <strong>scan the QR code</strong>{" "}
        on the machine. You can also enter the machine number below.
      </p>
      <Form
        action="/?index"
        method="post"
        className="mx-auto mt-8 w-full max-w-xs space-y-2"
      >
        <Input
          label="Machine Number"
          name="machineId"
          ref={machineIdRef}
          error={actionData?.errors.machineId}
          required
          placeholder="XYZ"
        />
        <Button type="submit" variant="primary" className="w-full">
          Make a report
        </Button>
      </Form>
    </>
  );
}
