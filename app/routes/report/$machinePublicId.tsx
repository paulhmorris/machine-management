import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useSearchParams,
  useTransition,
} from "@remix-run/react";
import { useRef } from "react";

import invariant from "tiny-invariant";
import { z } from "zod";
import { Button } from "~/components/shared/Button";
import { ButtonLink } from "~/components/shared/ButtonLink";
import { Input } from "~/components/shared/Input";
import { Spinner } from "~/components/shared/Spinner";
import { Textarea } from "~/components/shared/Textarea";
import {
  getErrorTypesForReport,
  getMachineForReport,
} from "~/models/machine.server";
import { reportSchema } from "~/schemas/reportSchemas";
import { prisma } from "~/utils/db.server";
import { badRequest, getSearchParam } from "~/utils/utils";

export async function loader({ params }: LoaderArgs) {
  const { machinePublicId } = params;
  invariant(machinePublicId, "Expected machinePublicId");
  const machine = await getMachineForReport(machinePublicId);
  if (!machine) {
    throw badRequest(`Machine with id ${machinePublicId} not found`);
  }
  const errorTypes = await getErrorTypesForReport();
  return json({ machine, errorTypes });
}

export async function action({ params, request }: ActionArgs) {
  const form = Object.fromEntries(await request.formData());
  const errorType = getSearchParam("error", request);
  invariant(typeof errorType === "string", "Expected errorId");
  const { machinePublicId } = params;
  invariant(machinePublicId, "Expected machinePublicId");

  try {
    const { notes, reporterEmail, machineId } = reportSchema.parse(form);
    const ticket = await prisma.ticket.create({
      data: {
        notes,
        reporterEmail,
        machine: { connect: { publicId: machineId } },
        status: { connect: { id: 1 } },
        assignedTo: { connect: { email: "tmfd@remix.run" } },
        errorType: { connect: { id: Number(errorType) } },
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
    return redirect(
      `/report/thanks${reporterEmail ? "?providedEmail=true" : ""}`
    );
  } catch (error) {
    if (error instanceof z.ZodError<typeof reportSchema>) {
      return json({ error: error.flatten() });
    }
  }
}

export default function MachineReport() {
  const { machine, errorTypes } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const transition = useTransition();
  const busy =
    transition.state === "submitting" ||
    ((transition.type === "actionRedirect" ||
      transition.type === "actionReload") &&
      transition.state === "loading");
  const errorParam = Number(searchParams.get("error"));
  const commentsRef = useRef<HTMLTextAreaElement>(null);

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
          <h2 className="mb-4 text-center">
            What issue is the machine having?
          </h2>
          {errorTypes.map((type) => {
            return (
              <ButtonLink
                key={type.id}
                to={`?error=${type.id}`}
                replace={true}
                variant={errorParam === type.id ? "primary" : "secondary"}
                className="py-5 font-extrabold"
                onClick={() => commentsRef.current?.focus()}
              >
                {type.name}
              </ButtonLink>
            );
          })}
          <div className="mt-4 space-y-4">
            <Textarea
              name="notes"
              label="Comments"
              ref={commentsRef}
              maxLength={255}
              required
            />
            <Input
              name="reporterEmail"
              label="Your email"
              type="email"
              autoComplete="email"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            className="mt-4"
            disabled={Boolean(!errorParam) || busy}
          >
            {busy && <Spinner className="mr-2" />}
            {busy ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </Form>
    </div>
  );
}
