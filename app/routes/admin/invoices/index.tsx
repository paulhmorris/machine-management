import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { IconPlus } from "@tabler/icons-react";
import dayjs from "dayjs";
import { CustomLink } from "~/components/shared/CustomLink";
import type { TableColumn } from "~/components/tables";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableWrapper,
} from "~/components/tables";
import { useSortableData } from "~/hooks/useSortableData";
import { requireVendorOrAdmin } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { formatCurrency } from "~/utils/formatters";
import { classNames } from "~/utils/utils";

export type MachineQueryParam = "campus" | "loc" | "type";

export async function loader({ request }: LoaderArgs) {
  await requireVendorOrAdmin(request);

  const invoices = await prisma.invoice.findMany({
    include: {
      vendor: true,
      charges: {
        include: {
          ticket: { select: { _count: true } },
        },
      },
    },
  });

  return json({ invoices });
}

export default function InvoiceIndex() {
  const { invoices } = useLoaderData<typeof loader>();
  const { items, requestSort, sortConfig } = useSortableData<typeof invoices>(
    invoices,
    { key: "invoicedOn", direction: "desc" }
  );
  const columns: Array<TableColumn<typeof invoices>> = [
    { key: "vendor", title: "Vendor", sortable: true },
    { key: "invoicedOn", title: "Invoice Date", sortable: true },
    { key: "vendorInvoiceNumber", title: "Invoice #", sortable: false },
    { key: "submittedOn", title: "Submit Date", sortable: true },
    { key: "total", title: "Total", sortable: false },
  ];

  return (
    <main className="flex flex-col">
      <TableHeader
        title="Invoices"
        actionIcon={<IconPlus size={18} />}
        actionText="New Invoice"
        href="/admin/invoices/new"
      />
      <div className="mt-4">
        <TableWrapper>
          <TableHead
            columns={columns}
            sortConfig={sortConfig}
            sortFn={requestSort}
          />
          <TableBody>
            {items.map((invoice, index) => {
              return (
                <tr
                  key={invoice.id}
                  className={classNames(
                    index % 2 === 0 ? undefined : "bg-gray-50"
                  )}
                >
                  <TableCell>
                    <CustomLink to={`/admin/vendors/${invoice.vendorId}`}>
                      {invoice.vendor.name}
                    </CustomLink>
                  </TableCell>
                  <TableCell>
                    {dayjs(invoice.invoicedOn).format("M/D/YYYY")}
                  </TableCell>
                  <TableCell>#{invoice.vendorInvoiceNumber}</TableCell>
                  <TableCell>
                    {dayjs(invoice.submittedOn).format("M/D/YYYY")}
                  </TableCell>
                  <TableCell>{formatCurrency(invoice.total ?? 0)}</TableCell>
                </tr>
              );
            })}
          </TableBody>
        </TableWrapper>
      </div>
    </main>
  );
}
