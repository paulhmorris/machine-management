import type { LoaderFunctionArgs } from "@remix-run/node";
import { IconPlus } from "@tabler/icons-react";
import dayjs from "dayjs";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { InProgressInvoices } from "~/components/invoices/InProgressInvoices";
import { CaughtError } from "~/components/shared/CaughtError";
import { CustomLink } from "~/components/shared/CustomLink";
import { UncaughtError } from "~/components/shared/UncaughtError";
import type { TableColumn } from "~/components/tables";
import { TableBody, TableCell, TableHead, TableHeader, TableWrapper } from "~/components/tables";
import { useSortableData } from "~/hooks/useSortableData";
import { getInvoicesForIndex } from "~/models/invoice.server";
import { requireAdmin } from "~/utils/auth.server";
import { formatCurrency } from "~/utils/formatters";
import { cn } from "~/utils/utils";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAdmin(request);
  const invoices = await getInvoicesForIndex();
  return typedjson({ invoices });
}

export default function InvoiceIndex() {
  const { invoices } = useTypedLoaderData<typeof loader>();
  const { items, requestSort, sortConfig } = useSortableData<typeof invoices>(invoices, {
    key: "invoicedOn",
    direction: "desc",
  });
  const inProgressInvoices = invoices.filter((i) => !i.submittedOn);
  const columns: Array<TableColumn<typeof invoices>> = [
    { key: "vendor", title: "Vendor", sortable: true },
    { key: "invoicedOn", title: "Invoice Date", sortable: true },
    { key: "vendorInvoiceNumber", title: "Invoice #", sortable: false },
    { key: "submittedOn", title: "Submitted", sortable: true },
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
      {inProgressInvoices.length > 0 && (
        <section className="mb-6">
          <InProgressInvoices invoices={inProgressInvoices} />
        </section>
      )}
      <h2>Billed</h2>
      <TableWrapper>
        <TableHead columns={columns} sortConfig={sortConfig} sortFn={requestSort} />
        <TableBody>
          {items
            .filter((i) => i.submittedOn)
            .map((invoice, index) => {
              return (
                <tr key={invoice.id} className={cn(index % 2 === 0 ? undefined : "bg-gray-50")}>
                  <TableCell>
                    <CustomLink to={`/admin/vendors/${invoice.vendorId}`}>{invoice.vendor.name}</CustomLink>
                  </TableCell>
                  <TableCell>{dayjs(invoice.invoicedOn).format("M/D/YYYY")}</TableCell>
                  <TableCell>#{invoice.vendorInvoiceNumber}</TableCell>
                  <TableCell>{dayjs(invoice.submittedOn).format("M/D/YYYY")}</TableCell>
                  <TableCell>{formatCurrency(invoice.total ?? 0)}</TableCell>
                </tr>
              );
            })}
        </TableBody>
      </TableWrapper>
    </main>
  );
}

export function CatchBoundary() {
  return <CaughtError />;
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <UncaughtError error={error} />;
}
