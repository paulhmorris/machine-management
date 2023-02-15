import { Link } from "@remix-run/react";
import { Badge } from "~/components/shared/Badge";
import type { SortConfig, TableColumn } from "~/components/tables";
import {
  TableBody,
  TableCell,
  TableHead,
  TableWrapper,
} from "~/components/tables";
import type { TTicketStatus } from "~/utils/constants";
import {
  formatDateWithTime,
  getTicketStatusBadgeColor,
} from "~/utils/formatters";

const columns: TableColumn[] = [
  { title: "WO #", key: "id", sortable: true },
  { title: "Campus", key: "campus", sortable: true },
  { title: "Location", key: "location", sortable: true },
  { title: "Floor", key: "floor", sortable: false },
  { title: "Type", key: "type", sortable: false },
  { title: "Status", key: "status", sortable: true },
  { title: "Last Updated", key: "updatedAt", sortable: true },
];

type Props = {
  items: Array<{
    id: number;
    campus: string;
    location: string;
    floor: string;
    type: string;
    status: string;
    updatedAt: string;
  }>;
  sortConfig: SortConfig;
  requestSort: (key: string) => void;
};

export function TicketTable({ items, sortConfig, requestSort }: Props) {
  return (
    <TableWrapper>
      <TableHead
        columns={columns}
        sortFn={requestSort}
        sortConfig={sortConfig}
        includeActionCol
      />
      <TableBody>
        {items.map((ticket, index) => (
          <tr
            key={ticket.id}
            className={index % 2 === 0 ? undefined : "bg-gray-50"}
          >
            <TableCell>{ticket.id}</TableCell>
            <TableCell>{ticket.campus}</TableCell>
            <TableCell>{ticket.location}</TableCell>
            <TableCell>{ticket.floor}</TableCell>
            <TableCell>{ticket.type}</TableCell>
            <TableCell>
              <Badge
                text={ticket.status}
                size="small"
                color={getTicketStatusBadgeColor(
                  ticket.status as TTicketStatus
                )}
              />
            </TableCell>
            <TableCell>{formatDateWithTime(ticket.updatedAt)}</TableCell>
            <TableCell>
              <Link
                to={`/admin/tickets/${ticket.id}/events`}
                className="text-cyan-600 decoration-2 underline-offset-2 hover:text-cyan-700 hover:underline"
              >
                View
              </Link>
            </TableCell>
          </tr>
        ))}
      </TableBody>
    </TableWrapper>
  );
}
