import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";
import invariant from "tiny-invariant";
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

export async function loader({ request, params }: LoaderArgs) {
  await requireAdmin(request);
  const { ticketId } = params;
  invariant(ticketId, "Ticket ID is required");

  const charges = await prisma.charge.findMany({
    where: { ticketId: Number(ticketId) },
    include: {
      type: true,
      vendor: true,
      part: true,
    },
  });

  return json({ charges });
}

const columns: TableColumn[] = [
  { key: "type", title: "Type", sortable: false },
  { key: "createdAt", title: "Added", sortable: false },
  { key: "part", title: "Part", sortable: false },
  { key: "cost", title: "Cost", sortable: false },
  { key: "vendor", title: "Vendor", sortable: false },
  { key: "vendorInvoiceId", title: "Vendor Invoice #", sortable: false },
  { key: "description", title: "Description", sortable: false },
];

export default function TicketCharges() {
  const { charges } = useLoaderData<typeof loader>();
  const { items, sortConfig, requestSort } = useSortableData(charges, {
    key: "createdAt",
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
        {items.map((charge, index) => (
          <tr
            key={charge.id}
            className={index % 2 === 0 ? undefined : "bg-gray-50"}
          >
            <TableCell>{charge.type.name}</TableCell>
            <TableCell>
              {dayjs(charge.createdAt).format("M/D/YYYY h:mm A")}
            </TableCell>
            <TableCell>{charge.part?.name ?? ""}</TableCell>
            <TableCell>{charge.actualCost}</TableCell>
            <TableCell>{charge.vendor.name}</TableCell>
            <TableCell>{charge.invoiceId}</TableCell>
            <TableCell allowWrap>{charge.description}</TableCell>
          </tr>
        ))}
      </TableBody>
    </TableWrapper>
  );
}
