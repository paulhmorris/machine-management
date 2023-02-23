import type { Ticket } from "@prisma/client";
import { prisma } from "~/utils/db.server";

export function getTicketEventsByTicketId(ticketId: Ticket["id"]) {
  return prisma.ticketEvent.findMany({
    where: { ticketId },
    include: {
      status: true,
      createdBy: true,
      assignedTo: true,
    },
  });
}
