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
import { requireAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { getTicketStatusBadgeColor } from "~/utils/formatters";

export async function loader({ request, params }: LoaderArgs) {
  await requireAdmin(request);
  const { ticketId } = params;
  invariant(ticketId, "Ticket ID is required");

  const ticketEvents = await prisma.ticketEvent.findMany({
    where: { ticketId: Number(ticketId) },
    include: {
      status: true,
      createdBy: true,
      assignedTo: true,
    },
  });

  return json({ ticketEvents });
}

const columns: TableColumn[] = [
  { key: "timestamp", title: "Timestamp", sortable: false },
  { key: "createdBy", title: "Created By", sortable: false },
  { key: "assignedTo", title: "Assigned To", sortable: false },
  { key: "status", title: "Status", sortable: false },
  { key: "comments", title: "Comments", sortable: false },
];

export default function TicketEvents() {
  const { ticketEvents } = useLoaderData<typeof loader>();
  const { items, sortConfig, requestSort } = useSortableData(ticketEvents, {
    key: "timestamp",
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
        {items.map((event, index) => (
          <tr
            key={event.id}
            className={index % 2 === 0 ? undefined : "bg-gray-50"}
          >
            <TableCell>
              {dayjs(event.timestamp).format("M/D/YYYY h:mm A")}
            </TableCell>
            <TableCell>
              {event.createdBy.firstName} {event.createdBy.lastName}{" "}
            </TableCell>
            <TableCell>
              {event.assignedTo?.firstName} {event.assignedTo.lastName}
            </TableCell>
            <TableCell>
              <Badge
                text={event.status.name}
                size="small"
                color={getTicketStatusBadgeColor(event.status.name)}
              />
            </TableCell>
            <TableCell allowWrap>{event.comments}</TableCell>
          </tr>
        ))}
      </TableBody>
    </TableWrapper>
  );
}
