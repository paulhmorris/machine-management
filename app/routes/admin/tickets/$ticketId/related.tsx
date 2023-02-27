import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";
import invariant from "tiny-invariant";
import { Badge } from "~/components/shared/Badge";
import type { TableColumn } from "~/components/tables";
import {
  TableBody,
  TableCell,
  TableHead,
  TableWrapper,
} from "~/components/tables";
import { useSortableData } from "~/hooks/useSortableData";
import { getTicketsByMachineId } from "~/models/ticket.server";
import { requireAdmin } from "~/utils/auth.server";
import type { TTicketStatus } from "~/utils/constants";
import { prisma } from "~/utils/db.server";
import { getTicketStatusBadgeColor } from "~/utils/formatters";
import { badRequest } from "~/utils/utils";

export async function loader({ request, params }: LoaderArgs) {
  await requireAdmin(request);
  const { ticketId } = params;
  invariant(ticketId, "Ticket ID is required");

  const ticket = await prisma.ticket.findUnique({
    where: { id: Number(ticketId) },
    include: {
      machine: true,
    },
  });
  if (!ticket) {
    throw badRequest(`Ticket with id ${ticketId} not found`);
  }
  const relatedTickets = await getTicketsByMachineId(
    ticket.machineId,
    ticket.id
  );
  return json({ relatedTickets });
}

const columns: TableColumn[] = [
  { key: "id", title: "WO #", sortable: false },
  { key: "reported", title: "Reported", sortable: true },
  { key: "status", title: "Status", sortable: true },
  { key: "cost", title: "Assigned To", sortable: true },
];

export default function RelatedTickets() {
  const { relatedTickets } = useLoaderData<typeof loader>();
  const { items, sortConfig, requestSort } = useSortableData(relatedTickets, {
    key: "reportedOn",
    direction: "desc",
  });

  return (
    <TableWrapper>
      <TableHead
        columns={columns}
        sortConfig={sortConfig}
        sortFn={requestSort}
      />
      <TableBody>
        {items.map((ticket, index) => (
          <tr
            key={ticket.id}
            className={index % 2 === 0 ? undefined : "bg-gray-50"}
          >
            <TableCell>{ticket.id}</TableCell>
            <TableCell>
              {dayjs(ticket.reportedOn).format("M/D/YYYY h:mm A")}
            </TableCell>
            <TableCell>
              {" "}
              <Badge
                text={ticket.status.name}
                size="small"
                color={getTicketStatusBadgeColor(
                  ticket.status.name as TTicketStatus
                )}
              />
            </TableCell>
            <TableCell>
              {ticket.assignedTo?.firstName} {ticket.assignedTo?.lastName}
            </TableCell>
          </tr>
        ))}
      </TableBody>
    </TableWrapper>
  );
}
