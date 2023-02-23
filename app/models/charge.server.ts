import type { Prisma, Ticket } from "@prisma/client";
import { prisma } from "~/utils/db.server";

export function getChargesByTicketId(ticketId: Ticket["id"]) {
  return prisma.charge.findMany({
    where: { ticketId },
    include: {
      type: true,
      part: true,
      invoice: true,
    },
  });
}

export async function createCharge(data: Prisma.ChargeCreateArgs["data"]) {
  return prisma.charge.create({ data });
}
