import type { Ticket } from "@prisma/client";
import { prisma } from "~/utils/db.server";

export function getChargesByTicketId(ticketId: Ticket["id"]) {
  return prisma.charge.findMany({
    where: { ticketId },
    include: {
      type: true,
      vendor: true,
      part: true,
      invoice: true,
    },
  });
}
