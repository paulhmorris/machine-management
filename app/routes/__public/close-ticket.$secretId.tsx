import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useSearchParams,
  useTransition,
} from "@remix-run/react";
import { z } from "zod";
import { Button } from "~/components/shared/Button";
import { Input } from "~/components/shared/Input";
import { Spinner } from "~/components/shared/Spinner";
import { Textarea } from "~/components/shared/Textarea";
import { prisma } from "~/utils/db.server";
import { sendTicketCloseEmail } from "~/utils/mail.server";

export async function loader({ params }: LoaderArgs) {
  const { secretId } = params;
  const ticket = await prisma.ticket.findUnique({
    where: { secretId },
  });
  if (!ticket) {
    return redirect("/");
  }
  return json({ ticket });
}

export async function action({ params, request }: ActionArgs) {
  const { secretId } = params;
  const ticket = await prisma.ticket.findUnique({
    where: { secretId },
  });
  if (!ticket) {
    return redirect("/");
  }

  const form = Object.fromEntries(await request.formData());
  const result = z
    .object({
      notes: z.string().max(255),
      techEmail: z.string().email(),
    })
    .safeParse(form);
  if (!result.success) {
    return json(
      { errors: { ...result.error.flatten().fieldErrors } },
      { status: 400 }
    );
  }

  const { notes, techEmail } = result.data;
  const closedTicket = await prisma.ticket.update({
    where: { id: ticket.id },
    data: { ticketStatusId: 8 },
  });
  await sendTicketCloseEmail(closedTicket.id, notes, techEmail);
  return redirect(`/close-ticket/${closedTicket.secretId}?thanks=true`);
}

export default function CloseTicket() {
  const { ticket } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const actionData = useActionData<typeof action>();
  const thanks = searchParams.get("thanks");
  const { state, type } = useTransition();
  const busy =
    state === "submitting" ||
    ((type === "actionRedirect" || type === "actionReload") &&
      state === "loading");

  return (
    <main>
      <h1 className="text-center">
        {thanks
          ? "Thanks! An email with an update has been sent to the team."
          : `Submit to resolve Ticket ${ticket.id}.`}
      </h1>
      {!thanks && (
        <>
          <Form className="mt-4 space-y-4" method="post">
            <Textarea
              name="notes"
              label="Comments"
              maxLength={255}
              errors={actionData?.errors?.notes}
              required
            />
            <Input
              name="techEmail"
              label="Your email"
              type="email"
              autoComplete="email"
              errors={actionData?.errors?.techEmail}
              required
            />
            <Button
              type="submit"
              variant="primary"
              className="mt-4"
              disabled={busy}
            >
              {busy && <Spinner className="mr-2" />}
              {busy ? "Submitting..." : "Submit"}
            </Button>
          </Form>
        </>
      )}
    </main>
  );
}
