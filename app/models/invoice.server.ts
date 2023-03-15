import type { Invoice, Ticket, User } from "@prisma/client";
import dayjs from "dayjs";
import { prisma } from "~/utils/db.server";

export function getInvoiceWithAllRelations(invoiceId: Invoice["id"]) {
  return prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: {
      id: true,
      submittedBy: true,
      campus: {
        select: { name: true },
      },
      tickets: {
        select: { id: true },
      },
      vendor: {
        select: { name: true, hourlyRate: true, tripCharge: true },
      },
      charges: {
        select: {
          id: true,
          description: true,
          warrantyCovered: true,
          actualCost: true,
          ticketId: true,
          type: true,
          typeId: true,
          part: true,
        },
      },
    },
  });
}

export function getInvoicesForIndex() {
  return prisma.invoice.findMany({
    include: {
      vendor: true,
      campus: true,
      charges: {
        include: {
          ticket: { select: { _count: true } },
        },
      },
    },
  });
}

export function getInvoiceWithVendor(invoiceId: Invoice["id"]) {
  return prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: {
      id: true,
      vendorId: true,
    },
  });
}

type FinishInvoiceInput = {
  invoiceId: Invoice["id"];
  vendorInvoiceNumber?: Invoice["vendorInvoiceNumber"];
  vendorInvoiceDate?: Invoice["invoicedOn"];
  userId: User["id"];
};

export async function finishInvoice(data: FinishInvoiceInput) {
  const charges = await prisma.charge.aggregate({
    where: { invoiceId: data.invoiceId, warrantyCovered: false },
    _sum: { actualCost: true },
  });

  return prisma.invoice.update({
    where: { id: data.invoiceId },
    data: {
      invoicedOn: dayjs(data.vendorInvoiceDate).toDate(),
      vendorInvoiceNumber: data.vendorInvoiceNumber,
      total: charges._sum.actualCost ?? 0,
      submittedOn: new Date(),
      submittedBy: { connect: { id: data.userId } },
    },
  });
}

export async function removeTicketFromInvoice({
  ticketId,
  invoiceId,
}: {
  ticketId: Ticket["id"];
  invoiceId: Invoice["id"];
}) {
  await prisma.charge.deleteMany({
    where: { ticketId, invoiceId },
  });
  return prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      tickets: {
        disconnect: { id: ticketId },
      },
    },
  });
}

export async function abandonInvoice(invoiceId: Invoice["id"]) {
  await prisma.$transaction([
    prisma.charge.deleteMany({
      where: { invoiceId },
    }),
    prisma.invoice.delete({
      where: { id: invoiceId },
    }),
  ]);
}
