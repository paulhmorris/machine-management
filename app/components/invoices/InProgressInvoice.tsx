import { Link } from "@remix-run/react";
import { IconExternalLink } from "@tabler/icons-react";
import dayjs from "dayjs";
import type { getInvoicesForIndex } from "~/models/invoice.server";

type InvoiceIndexPayload = Awaited<ReturnType<typeof getInvoicesForIndex>>;
export function InProgressInvoice({
  invoice,
}: {
  invoice: InvoiceIndexPayload[number];
}) {
  return (
    <li
      key={invoice.id}
      className="cursor-pointer rounded-lg border border-cyan-700/25 bg-white p-4 transition duration-75 hover:bg-gray-50"
    >
      <Link to={`/admin/invoices/${invoice.id}`} className="flex gap-6">
        <div>
          <h3 className="mb-1 font-medium">{invoice.vendor.name}</h3>
          <p className="text-sm text-gray-500">
            Started {dayjs(invoice.createdAt).format("M/D/YYYY h:mm A")}
          </p>
          <p className="text-sm text-gray-500">{invoice.campus.name}</p>
        </div>
        <IconExternalLink size={24} className="text-gray-500" />
      </Link>
    </li>
  );
}
