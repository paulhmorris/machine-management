import type { LoaderArgs } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { typedjson } from "remix-typedjson";
import invariant from "tiny-invariant";
import { TicketDetails } from "~/components/tickets/TicketDetails";
import { TicketNav } from "~/components/tickets/TicketNav";
import { getTicketById } from "~/models/ticket.server";
import { requireAdmin } from "~/utils/auth.server";

export async function loader({ request, params }: LoaderArgs) {
  await requireAdmin(request);
  const { ticketId } = params;
  invariant(ticketId, "Ticket ID is required");

  const ticket = await getTicketById(Number(ticketId));
  if (!ticket) {
    throw new Response(`Ticket with id ${ticketId} not found`, { status: 404 });
  }

  return typedjson({ ticket });
}

export default function TicketLayout() {
  const { ticket } = useLoaderData<typeof loader>();
  return (
    <main>
      <TicketDetails ticket={ticket} />
      <TicketNav />
      <div className="mt-4">
        <Outlet />
      </div>
    </main>
  );
}
