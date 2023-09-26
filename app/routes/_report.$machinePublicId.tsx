import { RadioGroup } from "@headlessui/react";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigation } from "@remix-run/react";
import { useRef } from "react";

import { Button } from "~/components/shared/Button";
import { CaughtError } from "~/components/shared/CaughtError";
import { Spinner } from "~/components/shared/Spinner";
import { Textarea } from "~/components/shared/Textarea";
import { UncaughtError } from "~/components/shared/UncaughtError";
import { getErrorTypesForReport, getMachineForReport } from "~/models/machine.server";
import { reportSchema } from "~/schemas/reportSchemas";
import { prisma } from "~/utils/db.server";
import { badRequest, classNames, getBusyState, notFoundResponse } from "~/utils/utils";

export const meta: MetaFunction = () => {
  return [{ title: "Report a Machine Issue" }];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const { machinePublicId } = params;
  if (!machinePublicId) throw badRequest("Machine ID is required");
  const machine = await getMachineForReport(machinePublicId);
  if (!machine) throw notFoundResponse(`Machine with id ${machinePublicId} not found`);
  const errorTypes = await getErrorTypesForReport();
  return json({ machine, errorTypes });
}

export async function action({ params, request }: ActionFunctionArgs) {
  const form = Object.fromEntries(await request.formData());
  const { machinePublicId } = params;
  if (!machinePublicId) throw badRequest("Machine ID is required");

  const result = reportSchema.safeParse(form);
  if (!result.success) {
    return json({ errors: { ...result.error.flatten().fieldErrors } }, { status: 400 });
  }
  const { notes, machineId, error } = result.data;
  const ticket = await prisma.ticket.create({
    data: {
      notes,
      machine: { connect: { publicId: machineId } },
      status: { connect: { id: 1 } },
      assignedTo: { connect: { email: "tmfd@remix.run" } },
      errorType: { connect: { id: error } },
    },
  });
  await prisma.ticketEvent.create({
    data: {
      assignedTo: { connect: { email: "tmfd@remix.run" } },
      createdBy: { connect: { email: "tmfd@remix.run" } },
      ticket: { connect: { id: ticket.id } },
      status: { connect: { id: 1 } },
      comments: notes,
    },
  });
  return redirect(`/report/thanks`);
}

export default function MachineReport() {
  const { machine, errorTypes } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const busy = getBusyState(navigation);
  const commentsRef = useRef<HTMLTextAreaElement>(null);
  const actionData = useActionData<typeof action>();

  return (
    <div className="pb-12">
      <div className="border-b border-gray-200 pb-4 text-center text-xl font-bold">
        <h1 className="text-xl">Machine {machine.publicId}</h1>
        <p>Location: {machine.pocket.location.name}</p>
        <p>Type: {machine.type.name}</p>
      </div>
      <Form method="post" className="text-left">
        <input type="hidden" name="machineId" value={machine.publicId} />
        <div className="mt-4 flex flex-col gap-2">
          <RadioGroup name="error" aria-required>
            <RadioGroup.Label as="h2" className="mb-4 text-center">
              What issue is the machine having?
            </RadioGroup.Label>
            <ul className="mt-4 flex flex-col gap-2">
              {errorTypes.map((type) => {
                return (
                  <RadioGroup.Option
                    key={type.id}
                    value={type.id}
                    onSelect={() => commentsRef.current?.focus()}
                    className={({ checked }) =>
                      classNames(
                        "inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border px-4 py-4 text-base font-bold shadow-sm transition duration-75 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:py-2 sm:text-sm",
                        checked
                          ? "border-cyan-700 bg-cyan-700 text-white hover:border-cyan-800 hover:bg-cyan-800"
                          : "border-gray-300 bg-white hover:bg-gray-50"
                      )
                    }
                  >
                    <RadioGroup.Label as="span">{type.name}</RadioGroup.Label>
                  </RadioGroup.Option>
                );
              })}
            </ul>
            {actionData?.errors.error && (
              <p className="mt-1 text-center text-sm font-medium text-red-500">{actionData.errors.error}</p>
            )}
          </RadioGroup>
          <div className="mt-4 space-y-4">
            <Textarea
              name="notes"
              label="Comments"
              ref={commentsRef}
              maxLength={255}
              errors={actionData?.errors.notes}
              required
            />
          </div>
          <Button type="submit" variant="primary" className="mt-4" disabled={busy}>
            {busy && <Spinner className="mr-2" />}
            {busy ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </Form>
    </div>
  );
}

export function CatchBoundary() {
  return <CaughtError />;
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <UncaughtError error={error} />;
}
