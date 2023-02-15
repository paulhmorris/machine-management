import dayjs from "dayjs";
import type { BadgeProps } from "~/components/shared/Badge";

export function formatCurrency(
  value: string | number | null,
  decimals: 0 | 2 = 2
) {
  if (value === "" || value === null || value === undefined) return;
  const decimalPlaces = decimals ? decimals : +value % 1 !== 0 ? 2 : 0;
  const formattedValue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(+value);
  return formattedValue;
}

export function formatShortDate(date: string | Date) {
  return dayjs(date).format("MM/DD/YYYY");
}

export function formatDateWithTime(date: string | Date) {
  return dayjs(date).format("MM/DD/YYYY hh:mm A");
}

export function getTicketStatusBadgeColor(status: string): BadgeProps["color"] {
  switch (status) {
    case "New":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "Awaiting Inspection":
    case "Tech Repair Requested":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "Fixed by TA":
    case "Resolved by Tech":
    case "Closed":
      return "bg-gray-100 text-gray-800 border-gray-300";
    case "Tech Repair Acknowledged":
    case "Tech Repair Scheduled":
      return "bg-green-100 text-green-800 border-green-300";
    case "Reopened":
    case "Inspected, Needs Service":
      return "bg-red-100 text-red-800 border-red-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
}
