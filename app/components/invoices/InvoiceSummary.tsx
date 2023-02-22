import type { InvoicePayload } from "~/routes/admin/invoices/$invoiceId";
import { formatCurrency } from "~/utils/formatters";
import { calculateTotalByType } from "~/utils/utils";

export function InvoiceSummary({ invoice }: { invoice: InvoicePayload }) {
  const laborTotal = calculateTotalByType(invoice.charges, 1);
  const tripChargeTotal = calculateTotalByType(invoice.charges, 2);
  const shippingPartsTotal =
    calculateTotalByType(invoice.charges, 3) +
    calculateTotalByType(invoice.charges, 4);
  const reimbursementTotal = calculateTotalByType(invoice.charges, 5);
  const total =
    laborTotal + tripChargeTotal + shippingPartsTotal + reimbursementTotal;

  const rows = [
    {
      label: "Labor",
      value: formatCurrency(laborTotal),
    },
    {
      label: "Shipping & Parts",
      value: formatCurrency(shippingPartsTotal),
    },
    {
      label: "Trip Charges",
      value: formatCurrency(tripChargeTotal),
    },
    {
      label: "Reimbursements",
      value: formatCurrency(reimbursementTotal),
    },
  ];

  return (
    <div className="mt-auto border border-gray-200 bg-gray-100 py-6 px-4 sm:rounded-lg sm:px-6 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:px-8 lg:py-8">
      <dl className="grid grid-cols-2 gap-6 text-sm sm:grid-cols-2 md:gap-x-8 lg:col-span-7">
        <div>
          <dt className="font-medium text-gray-900">Vendor</dt>
          <dd className="mt-1 text-gray-500">
            <span className="block">{invoice.vendor.name}</span>
          </dd>
          <dd className="mt-1 text-gray-500">
            <span className="block">
              {formatCurrency(invoice.vendor.hourlyRate)} / hr
            </span>
          </dd>
          <dd className="mt-1 text-gray-500">
            <span className="block">
              {formatCurrency(invoice.vendor.tripCharge)} / trip
            </span>
          </dd>
          <dt className="mt-4 font-medium text-gray-900">Campus</dt>
          <dd className="mt-1 text-gray-500">
            <span className="block">{invoice.campus.name}</span>
          </dd>
        </div>
      </dl>

      <dl className="mt-8 divide-y divide-gray-300 text-sm lg:col-span-5 lg:mt-0">
        {rows.map((row) => (
          <SummaryRow key={row.label} {...row} />
        ))}
        <div className="flex items-center justify-between pt-4">
          <dt className="font-medium text-gray-900">Total</dt>
          <dd className="font-medium text-cyan-700">{formatCurrency(total)}</dd>
        </div>
      </dl>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between py-4">
      <dt>{label}</dt>
      <dd className="font-medium text-gray-900">{value}</dd>
    </div>
  );
}
