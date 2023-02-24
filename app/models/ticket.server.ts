import type { Machine, Prisma, Ticket, TicketEvent } from "@prisma/client";
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
export async function reassignTicket(data: UpdateTicketArgs) {
  await prisma.ticketEvent.create({
    data: {
      ticketId: data.ticketId,
      assignedToUserId: data.assignedToUserId,
      createdByUserId: data.createdByUserId,
      ticketStatusId: data.ticketStatusId,
      comments: data.comments,
    },
  });
  return await prisma.ticket.update({
    where: { id: data.ticketId },
    data: { assignedToUserId: data.assignedToUserId },
    select: { assignedTo: { select: { email: true } } },
  });
}

export async function updateTicketStatus(data: UpdateTicketArgs) {
  await prisma.ticket.update({
    where: { id: data.ticketId },
    data: { ticketStatusId: data.ticketStatusId },
  });

  await prisma.ticketEvent.create({
    data: {
      ticketId: data.ticketId,
      createdByUserId: data.createdByUserId,
      assignedToUserId: data.assignedToUserId,
      ticketStatusId: data.ticketStatusId,
      comments: data.comments,
    },
  });
}

export function getTicketsByMachineId(
  machineId: Machine["id"],
  excludedTicketId: Ticket["id"]
) {
  return prisma.ticket.findMany({
    where: { machineId, id: { not: excludedTicketId } },
    include: {
      assignedTo: true,
      status: true,
    },
    orderBy: { reportedOn: "desc" },
  });
}
