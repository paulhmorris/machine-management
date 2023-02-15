import { Link } from "@remix-run/react";
import { IconChevronRight } from "@tabler/icons-react";
import dayjs from "dayjs";
import { Badge } from "~/components/shared/Badge";
import type { getTicketById } from "~/models/ticket.server";
import type { TTicketStatus } from "~/utils/constants";
import { getTicketStatusBadgeColor } from "~/utils/formatters";

type Props = {
  ticket: Awaited<ReturnType<typeof getTicketById>>;
};

export function TicketDetails({ ticket }: Props) {
  if (!ticket) return null;
  const campus = ticket.machine.pocket.location.campus;
  const location = ticket.machine.pocket.location;
  const floor = ticket.machine.pocket.floor;

  return (
    <div className="overflow-hidden sm:rounded-lg">
      <div className="py-5">
        <h1>
          {ticket.id}: {ticket.errorType.name}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">{ticket.notes}</p>
      </div>
      <div className="border-t border-gray-200 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-4 sm:grid sm:grid-cols-5 sm:gap-4 sm:py-5">
            <dt className="text-sm font-medium text-gray-500">Machine</dt>
            <dd className="mt-1 flex items-center gap-2 text-sm sm:col-span-2 sm:mt-0">
              <Link
                to={`/admin/campuses/${campus.id}`}
                className="-m-1 p-1 font-medium text-cyan-700 hover:text-cyan-800 hover:underline"
              >
                {campus.name}
              </Link>
              <IconChevronRight size={12} />
              <Link
                to={`/admin/locations/${location.id}`}
                className="-m-1 p-1 font-medium text-cyan-700 hover:text-cyan-800 hover:underline"
              >
                {location.name}
              </Link>
              <IconChevronRight size={12} />
              {floor && (
                <>
                  <span>Floor {floor}</span>
                  <IconChevronRight size={12} />
                </>
              )}
              <Link
                to={`/admin/machines/${ticket.machine.id}`}
                className="-m-1 p-1 font-medium text-cyan-700 hover:text-cyan-800 hover:underline"
              >
                {ticket.machine.id}
              </Link>
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-5 sm:gap-4 sm:py-5">
            <dt className="text-sm font-medium text-gray-500">Reported On</dt>
            <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">
              {dayjs(ticket.reported).format("M/D/YYYY h:mm A")}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-5 sm:gap-4 sm:py-5">
            <dt className="text-sm font-medium text-gray-500">Reported By</dt>
            <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">
              {ticket.reporterEmail}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-5 sm:gap-4 sm:py-5">
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              <Badge
                text={ticket.status.name}
                size="large"
                color={getTicketStatusBadgeColor(
                  ticket.status.name as TTicketStatus
                )}
              />
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
