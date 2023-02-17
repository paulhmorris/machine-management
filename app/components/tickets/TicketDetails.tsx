import { IconChevronRight } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useState } from "react";
import { Badge } from "~/components/shared/Badge";
import { Button } from "~/components/shared/Button";
import { CustomLink } from "~/components/shared/CustomLink";
import { AddTicketNoteModal } from "~/components/tickets/AddTicketNoteModal";
import { CloseTicketModal } from "~/components/tickets/CloseTicketModal";
import type { getTicketById } from "~/models/ticket.server";
import type { TTicketStatus } from "~/utils/constants";
import { getTicketStatusBadgeColor } from "~/utils/formatters";

type Props = {
  ticket: Awaited<ReturnType<typeof getTicketById>>;
};

export function TicketDetails({ ticket }: Props) {
  const [openCloseTicket, setOpenCloseTicket] = useState(false);
  const [openAddNote, setOpenAddNote] = useState(false);

  if (!ticket) return null;
  const campus = ticket.machine.pocket.location.campus;
  const location = ticket.machine.pocket.location;
  const floor = ticket.machine.pocket.floor;

  return (
    <>
      <CloseTicketModal
        ticketId={ticket.id}
        open={openCloseTicket}
        setOpen={setOpenCloseTicket}
      />
      <AddTicketNoteModal
        ticketId={ticket.id}
        open={openAddNote}
        setOpen={setOpenAddNote}
      />
      <div className="sm:rounded-lg">
        <div className="flex items-center justify-between">
          <div className="py-5">
            <h1>
              {ticket.id}: {ticket.errorType.name}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {ticket.notes}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setOpenCloseTicket(true)}
            >
              Close
            </Button>
            <Button variant="secondary" onClick={() => setOpenAddNote(true)}>
              Add Note
            </Button>
          </div>
        </div>
        <div className="border-t border-gray-200 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-3 sm:grid sm:grid-cols-5 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Machine</dt>
              <dd className="mt-1 flex items-center gap-2 text-sm sm:col-span-2 sm:mt-0">
                <CustomLink to={`/admin/campuses/${campus.id}`}>
                  {campus.name}
                </CustomLink>
                <IconChevronRight size={12} />
                <CustomLink to={`/admin/locations/${location.id}`}>
                  {location.name}
                </CustomLink>
                <IconChevronRight size={12} />
                {floor && (
                  <>
                    <span>Floor {floor}</span>
                    <IconChevronRight size={12} />
                  </>
                )}
                <CustomLink to={`/admin/machines/${ticket.machine.id}`}>
                  {ticket.machine.id}
                </CustomLink>
              </dd>
            </div>
            <div className="py-3 sm:grid sm:grid-cols-5 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Reported On</dt>
              <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">
                {dayjs(ticket.reported).format("M/D/YYYY h:mm A")}
              </dd>
            </div>
            <div className="py-3 sm:grid sm:grid-cols-5 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Reported By</dt>
              <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">
                {ticket.reporterEmail}
              </dd>
            </div>
            <div className="py-3 sm:grid sm:grid-cols-5 sm:gap-4">
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
    </>
  );
}
