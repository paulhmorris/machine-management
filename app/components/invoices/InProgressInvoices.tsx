import dayjs from "dayjs";
import { ButtonLink } from "~/components/shared/ButtonLink";
import type { getInvoicesForIndex } from "~/models/invoice.server";

type InvoiceIndexPayload = Awaited<ReturnType<typeof getInvoicesForIndex>>;
export function InProgressInvoices({ invoices }: { invoices: InvoiceIndexPayload }) {
  return (
    <>
      <h2 className="flex items-center gap-2">Unbilled</h2>
      <ul className="mt-2 flex flex-col gap-4">
        {invoices.map((invoice) => (
          <li
            key={invoice.id}
            className="flex w-min items-center gap-6 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-4 py-2"
          >
            <h3 className="font-medium">{invoice.vendor.name}</h3>
            <p className="text-sm text-gray-500">Started {dayjs(invoice.createdAt).format("M/D/YYYY h:mm A")}</p>
            <p className="text-sm text-gray-500">{invoice.campus.name}</p>
            <ButtonLink to={`/admin/invoices/${invoice.id}`}>Finish</ButtonLink>
          </li>
        ))}
      </ul>
    </>
  );
}
