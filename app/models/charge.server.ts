import type { Charge, Prisma, Ticket } from "@prisma/client";
import { prisma } from "~/utils/db.server";

export function getChargesByTicketId(ticketId: Ticket["id"]) {
  return prisma.charge.findMany({
    where: { ticketId },
    include: {
      type: true,
      part: true,
      invoice: {
        include: { vendor: true },
      },
    },
  });
}

export function createCharge(data: Prisma.ChargeCreateArgs["data"]) {
  return prisma.charge.create({ data });
}

export function deleteCharge(id: Charge["id"]) {
  return prisma.charge.delete({ where: { id } });
}
