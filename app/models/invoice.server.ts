import type { Invoice, Ticket, User } from "@prisma/client";
import dayjs from "dayjs";
import { prisma } from "~/utils/db.server";

export function getInvoiceWithAllRelations(invoiceId: Invoice["id"]) {
  return prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      tickets: true,
      campus: true,
      charges: { include: { type: true, part: true } },
      vendor: true,
      submittedBy: true,
    },
  });
}

export function getInvoicesForIndex() {
  return prisma.invoice.findMany({
    where: { submittedOn: { not: null } },
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
