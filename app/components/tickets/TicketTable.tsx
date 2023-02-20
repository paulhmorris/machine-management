import { Badge } from "~/components/shared/Badge";
import { CustomLink } from "~/components/shared/CustomLink";
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
import { classNames } from "~/utils/utils";

const columns: TableColumn[] = [
  { key: "id", title: "WO #", sortable: true },
  { key: "campus", title: "Campus", sortable: true },
  { key: "location", title: "Location", sortable: true },
  { key: "floor", title: "Floor", sortable: false },
  { key: "type", title: "Type", sortable: false },
  { key: "status", title: "Status", sortable: true },
  { key: "updatedAt", title: "Last Updated", sortable: true },
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
  requestSort: (key: string | number | symbol) => void;
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
            className={classNames(index % 2 === 0 ? undefined : "bg-gray-50")}
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
              <CustomLink to={`/admin/tickets/${ticket.id}/events`}>
                View
              </CustomLink>
            </TableCell>
          </tr>
        ))}
      </TableBody>
    </TableWrapper>
  );
}
