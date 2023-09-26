import type { Machine, Prisma, Ticket, TicketEvent } from "@prisma/client";
import { prisma } from "~/utils/db.server";

export function getTicketById(id: Ticket["id"]) {
  return prisma.ticket.findUnique({ where: { id } });
}

export function getAllTicketsWithCount({ where = {} }: { where?: Prisma.TicketWhereInput }) {
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

export function getTicketByIdWithAllRelations(id: number) {
  return prisma.ticket.findUnique({
    where: { id },
    include: {
      errorType: true,
      status: true,
      assignedTo: {
        include: { campusUserRole: true },
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
          publicId: true,
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

type UpdateTicketArgs = {
  ticketId: Ticket["id"];
  ticketStatusId: Ticket["ticketStatusId"];
  assignedToUserId: Ticket["assignedToUserId"];
  createdByUserId: TicketEvent["createdByUserId"];
  comments?: TicketEvent["comments"];
};
export async function reassignTicket({
  ticketId,
  ticketStatusId,
  assignedToUserId,
  createdByUserId,
  comments,
}: UpdateTicketArgs) {
  await prisma.ticketEvent.create({
    data: {
      ticketId,
      assignedToUserId,
      createdByUserId,
      ticketStatusId,
      comments,
    },
  });
  await prisma.ticket.update({
    where: { id: ticketId },
    data: { assignedToUserId, ticketStatusId },
  });
}

export async function updateTicketStatus({
  ticketId,
  ticketStatusId,
  assignedToUserId,
  createdByUserId,
  comments,
}: UpdateTicketArgs) {
  await prisma.ticketEvent.create({
    data: {
      ticketId,
      createdByUserId,
      assignedToUserId,
      ticketStatusId,
      comments,
    },
  });
  await prisma.ticket.update({
    where: { id: ticketId },
    data: { ticketStatusId },
  });
}

export function getTicketsByMachineId(machineId: Machine["id"], excludedTicketId: Ticket["id"]) {
  return prisma.ticket.findMany({
    where: { machineId, id: { not: excludedTicketId } },
    include: {
      assignedTo: true,
      status: true,
    },
    orderBy: { reportedOn: "desc" },
  });
}
