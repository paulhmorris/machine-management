import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { CaughtError } from "~/components/shared/CaughtError";
import { UncaughtError } from "~/components/shared/UncaughtError";
import { badRequest } from "~/utils/utils";

export function loader({ params }: LoaderArgs) {
  const ticketId = params.ticketId;
  if (!ticketId) throw badRequest("Ticket ID is required");
  return redirect(`/admin/tickets/${ticketId}/events`);
}

export function CatchBoundary() {
  return <CaughtError />;
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <UncaughtError error={error} />;
}
