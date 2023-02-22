import type { LoaderArgs } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";
import { TicketDetails } from "~/components/tickets/TicketDetails";
import { TicketNav } from "~/components/tickets/TicketNav";
import { getTicketById } from "~/models/ticket.server";
import { requireAdmin } from "~/utils/auth.server";
import { badRequest } from "~/utils/utils";

export async function loader({ request, params }: LoaderArgs) {
  await requireAdmin(request);
  const { ticketId } = params;
  invariant(ticketId, "Ticket ID is required");

  const ticket = await getTicketById(Number(ticketId));
  if (!ticket) {
    throw badRequest(`Ticket with id ${ticketId} not found`);
  }

  return typedjson({ ticket });
}

export default function TicketLayout() {
  const { ticket } = useTypedLoaderData<typeof loader>();

  return (
    <main className="h-full">
      <TicketDetails ticket={ticket} />
      <div className="pt-4 pb-8">
        <TicketNav />
      </div>
      <div className="pb-24">
        <Outlet />
      </div>
    </main>
  );
}
