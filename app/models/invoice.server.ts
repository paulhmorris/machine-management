import type { Invoice, User } from "@prisma/client";
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
  console.info(charges);

  return prisma.invoice.update({
    where: { id: data.invoiceId },
    data: {
      invoicedOn: dayjs(data.vendorInvoiceDate).toDate(),
      total: charges._sum.actualCost ?? 0,
      submittedOn: new Date(),
      submittedBy: { connect: { id: data.userId } },
    },
  });
}
