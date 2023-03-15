import type { Ticket } from "@prisma/client";
import { Select } from "~/components/shared/Select";

export function TicketSelect({
  tickets,
}: {
  tickets: Array<Pick<Ticket, "id">>;
}) {
  return (
    <Select name="ticketId" label="Ticket" required className="sm:w-40">
      <option value="" disabled>
        Select a ticket
      </option>
      {tickets.map((ticket) => (
        <option key={ticket.id} value={ticket.id}>
          {ticket.id}
        </option>
      ))}
    </Select>
  );
}
