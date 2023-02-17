import type { Prisma, Ticket } from "@prisma/client";
import { prisma } from "~/utils/db.server";

export async function getAllTicketsWithCount({
  where = {},
}: {
  where?: Prisma.TicketWhereInput;
}) {
  return prisma.ticket.findMany({
    where,
    select: {
      id: true,
      updatedAt: true,
      status: {
        select: { name: true },
      },
      machine: {
        select: {
          type: true,
          pocket: {
            select: {
              floor: true,
              location: {
                select: {
                  name: true,
                  campus: { select: { name: true } },
                },
              },
            },
          },
        },
      },
    },
  });
}

export function getTicketById(id: number) {
  return prisma.ticket.findUnique({
    where: { id },
    include: {
      errorType: true,
      status: true,
      assignedTo: {
        include: { campusUserRoles: true },
      },
      machine: {
        include: {
          pocket: {
            include: {
              location: {
                include: {
                  campus: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export function getTicketWithCampusId(ticketId: Ticket["id"]) {
  return prisma.ticket.findUnique({
    where: { id: ticketId },
    select: {
      status: true,
      machine: {
        select: {
          pocket: {
            select: {
              location: {
                select: { campus: { select: { id: true } } },
              },
            },
          },
        },
      },
    },
  });
}

export function getTicketStatuses() {
  return prisma.ticketStatus.findMany({
    orderBy: { id: "asc" },
  });
}
