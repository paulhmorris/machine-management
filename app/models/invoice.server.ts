import { prisma } from "~/utils/db.server";

export function getInvoiceById(invoiceId: string) {
  return prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      tickets: true,
      campus: true,
      charges: { include: { type: true } },
      vendor: true,
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
