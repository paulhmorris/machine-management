import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";
import { TableHeader } from "~/components/tables";
import { TicketFilter } from "~/components/tickets/TicketFilter";
import { TicketTable } from "~/components/tickets/TicketTable";
import { useSortableData } from "~/hooks/useSortableData";
import {
  getAllTicketsWithCount,
  getTicketStatuses,
} from "~/models/ticket.server";
import { requireAdmin } from "~/utils/auth.server";
import { getAllSearchParams, getSearchParam } from "~/utils/utils";

export async function loader({ request }: LoaderArgs) {
  await requireAdmin(request);
  const dateFrom = getSearchParam("dateFrom", request) ?? undefined;
  const dateTo = getSearchParam("dateTo", request) ?? undefined;
  const urlStatuses = getAllSearchParams("status", request);

  const ticketStatuses = await getTicketStatuses();
  const defaultStatuses = ticketStatuses
    .filter((s) => s.name !== "Closed")
    .map((s) => s.id.toString());
  const statuses = urlStatuses.length ? urlStatuses : defaultStatuses;

  const oneYearAgo = dayjs().subtract(1, "year").toDate();
  const ticketResponse = await getAllTicketsWithCount({
    where: {
      status: {
        id: { in: statuses.map((s) => Number(s)) },
      },
      updatedAt: {
        gte: dateFrom ? new Date(dateFrom) : oneYearAgo,
        lte: dateTo ? new Date(dateTo) : undefined,
      },
    },
  });
  const tickets = ticketResponse.map((t) => ({
    id: t.id,
    campus: t.machine.pocket.location.campus.name,
    location: t.machine.pocket.location.name,
    floor: t.machine.pocket.floor ?? "",
    type: t.machine.type.name,
    status: t.status.name,
    updatedAt: t.updatedAt,
  }));
  return json({ tickets, ticketStatuses });
}

export default function TicketIndex() {
  const { tickets, ticketStatuses } = useLoaderData<typeof loader>();
  const { items, requestSort, sortConfig } = useSortableData<typeof tickets>(
    tickets,
    {
      key: "updatedAt",
      direction: "desc",
    }
  );

  return (
    <>
      <TableHeader
        title="Tickets"
        description="All tickets in the system with their current status and location."
        noAction
      />
      <TicketFilter ticketStatuses={ticketStatuses} />
      <div className="mt-4">
        <TicketTable
          items={items}
          requestSort={requestSort}
          sortConfig={sortConfig}
        />
      </div>
    </>
  );
}
