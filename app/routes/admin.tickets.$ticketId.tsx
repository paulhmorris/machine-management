import type { LoaderFunctionArgs } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { CaughtError } from "~/components/shared/CaughtError";
import { UncaughtError } from "~/components/shared/UncaughtError";
import { TicketDetails } from "~/components/tickets/TicketDetails";
import { TicketNav } from "~/components/tickets/TicketNav";
import { getTicketByIdWithAllRelations } from "~/models/ticket.server";
import { requireAdmin } from "~/utils/auth.server";
import { badRequest, notFoundResponse } from "~/utils/utils";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const { ticketId } = params;
  if (!ticketId) throw badRequest("Ticket ID is required");

  const ticket = await getTicketByIdWithAllRelations(Number(ticketId));
  if (!ticket) throw notFoundResponse(`Ticket ${ticketId} not found`);

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

export function CatchBoundary() {
  return <CaughtError />;
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <UncaughtError error={error} />;
}
