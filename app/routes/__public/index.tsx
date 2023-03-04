import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useTransition } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { z } from "zod";
import { Button } from "~/components/shared/Button";
import { CaughtError } from "~/components/shared/CaughtError";
import { Input } from "~/components/shared/Input";
import { Spinner } from "~/components/shared/Spinner";
import { UncaughtError } from "~/components/shared/UncaughtError";
import { prisma } from "~/utils/db.server";
import { getBusyState } from "~/utils/utils";

const machineSearchSchema = z.object({
  machineId: z.string().min(1, "Machine number is required"),
});

export async function action({ request }: ActionArgs) {
  const form = Object.fromEntries(await request.formData());
  const result = machineSearchSchema.safeParse(form);
  if (!result.success) {
    return json(
      { errors: { ...result.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }

  const machine = await prisma.machine.findUnique({
    where: { publicId: result.data.machineId.trim() },
  });
  if (!machine) {
    return json(
      { errors: { machineId: ["Couldn't find that machine"] } },
      { status: 404 }
    );
  }
  return redirect(`/report/${machine.publicId}`);
}

export default function Index() {
  const transition = useTransition();
  const busy = getBusyState(transition);
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
        method="post"
        action="?index"
        className="mx-auto mt-8 w-full max-w-xs space-y-2"
        noValidate
      >
        <Input
          label="Machine Number"
          name="machineId"
          ref={machineIdRef}
          errors={actionData?.errors.machineId}
          placeholder="ABCXYZ"
          required
        />
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={busy}
        >
          {busy && <Spinner className="mr-2" />}
          {busy ? "Searching..." : "Make a Report"}
        </Button>
      </Form>
    </>
  );
}

export function CatchBoundary() {
  return <CaughtError />;
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <UncaughtError error={error} />;
}
