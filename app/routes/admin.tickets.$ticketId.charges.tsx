import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";
import { CaughtError } from "~/components/shared/CaughtError";
import { UncaughtError } from "~/components/shared/UncaughtError";
import type { TableColumn } from "~/components/tables";
import { TableBody, TableCell, TableHead, TableWrapper } from "~/components/tables";
import { useSortableData } from "~/hooks/useSortableData";
import { getChargesByTicketId } from "~/models/charge.server";
import { requireAdmin } from "~/utils/auth.server";
import { formatCurrency } from "~/utils/formatters";
import { badRequest } from "~/utils/utils";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const { ticketId } = params;
  if (!ticketId) throw badRequest("Ticket ID is required");
  const charges = await getChargesByTicketId(Number(ticketId));
  return json({ charges });
}

const columns: TableColumn[] = [
  { key: "type", title: "Type", sortable: true },
  { key: "createdAt", title: "Added", sortable: true },
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
      <TableHead columns={columns} sortConfig={sortConfig} sortFn={requestSort} />
      <TableBody>
        {items.map((charge, index) => (
          <tr key={charge.id} className={index % 2 === 0 ? undefined : "bg-gray-50"}>
            <TableCell>{charge.type.name}</TableCell>
            <TableCell>{dayjs(charge.createdAt).format("M/D/YYYY h:mm A")}</TableCell>
            <TableCell>{charge.part?.name ?? ""}</TableCell>
            <TableCell>
              {formatCurrency(charge.actualCost)} {charge.warrantyCovered && "IW"}
            </TableCell>
            <TableCell>{charge.invoice.vendor.name}</TableCell>
            <TableCell>{charge.invoice.vendorInvoiceNumber}</TableCell>
            <TableCell allowWrap>{charge.description}</TableCell>
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
