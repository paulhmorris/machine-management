import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

export function loader({ params }: LoaderArgs) {
  const ticketId = params.ticketId;
  invariant(typeof ticketId === "string", "ticketId is required");
  return redirect(`/admin/tickets/${ticketId}/events`);
}
