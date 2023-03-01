import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";
import { Badge } from "~/components/shared/Badge";
import { CaughtError } from "~/components/shared/CaughtError";
import { UncaughtError } from "~/components/shared/UncaughtError";
import type { TableColumn } from "~/components/tables";
import {
  TableBody,
  TableCell,
  TableHead,
  TableWrapper,
} from "~/components/tables";
import { useSortableData } from "~/hooks/useSortableData";
import { getTicketEventsByTicketId } from "~/models/ticketEvent.server";
import { requireAdmin } from "~/utils/auth.server";
import { getTicketStatusBadgeColor } from "~/utils/formatters";
import { badRequest } from "~/utils/utils";

export async function loader({ request, params }: LoaderArgs) {
  await requireAdmin(request);
  const { ticketId } = params;
  if (!ticketId) throw badRequest("Ticket ID is required");
  const ticketEvents = await getTicketEventsByTicketId(Number(ticketId));
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
              {event.assignedTo?.firstName} {event.assignedTo?.lastName}
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

export function CatchBoundary() {
  return <CaughtError />;
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <UncaughtError error={error} />;
}
