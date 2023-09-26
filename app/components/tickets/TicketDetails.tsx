import { IconChevronRight } from "@tabler/icons-react";
import dayjs from "dayjs";
import type { ReactNode } from "react";
import { Badge } from "~/components/shared/Badge";
import { CustomLink } from "~/components/shared/CustomLink";
import type { getTicketByIdWithAllRelations } from "~/models/ticket.server";
import type { TTicketStatus } from "~/utils/constants";
import { getFormattedEnum, getTicketStatusBadgeColor } from "~/utils/formatters";

type Props = {
  ticket: Awaited<ReturnType<typeof getTicketByIdWithAllRelations>>;
};

export function TicketDetails({ ticket }: Props) {
  if (!ticket || !ticket.assignedTo) return null;
  const campus = ticket.machine.pocket.location.campus;
  const location = ticket.machine.pocket.location;
  const floor = ticket.machine.pocket.floor;
  const assignedToRole = ticket.assignedTo.campusUserRole?.role;

  return (
    <div className="sm:rounded-lg">
      <div className="flex items-center justify-between">
        <div className="py-5">
          <h1>
            {ticket.id}: {ticket.errorType.name}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">"{ticket.notes}"</p>
        </div>
      </div>
      <div className="border-t border-gray-200 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <TicketDetailRow title="Machine">
            <div className="flex flex-row items-center gap-2 whitespace-nowrap">
              <CustomLink to={`/admin/campuses/${campus.id}`}>{campus.name}</CustomLink>
              <IconChevronRight size={12} stroke={3} />
              <CustomLink to={`/admin/locations/${location.id}`}>{location.name}</CustomLink>
              <IconChevronRight size={12} stroke={3} />
              {floor && (
                <>
                  <span>Floor {floor}</span>
                  <IconChevronRight size={12} stroke={3} />
                </>
              )}
              <CustomLink to={`/admin/machines/${ticket.machine.id}`}>{ticket.machine.publicId}</CustomLink>
            </div>
          </TicketDetailRow>
          <TicketDetailRow title="Reported On">{dayjs(ticket.reportedOn).format("M/D/YYYY h:mm A")}</TicketDetailRow>
          <TicketDetailRow title="Reported By">{ticket.reporterEmail}</TicketDetailRow>
          <TicketDetailRow title="Status">
            <Badge
              text={ticket.status.name}
              size="large"
              color={getTicketStatusBadgeColor(ticket.status.name as TTicketStatus)}
            />
          </TicketDetailRow>
          <TicketDetailRow title="Assigned To">
            {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}{" "}
            {assignedToRole && `- ${getFormattedEnum(assignedToRole)}`}
          </TicketDetailRow>
        </dl>
      </div>
    </div>
  );
}

type TicketDetailProps = {
  title: string;
  children: ReactNode;
};
function TicketDetailRow({ title, children }: TicketDetailProps) {
  return (
    <div className="py-3 sm:grid sm:grid-cols-5 sm:gap-4">
      <dt className="text-sm font-medium text-gray-500">{title}</dt>
      <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">{children}</dd>
    </div>
  );
}
