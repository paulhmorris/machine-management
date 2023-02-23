import { z } from "zod";

export const addTicketToInvoiceSchema = z.object({
  ticketId: z.coerce.number(),
  actionType: z.enum([
    "ticket",
    "trip",
    "shipping",
    "labor",
    "part",
    "reimbursement",
    "deleteCharge",
    "finishInvoice",
  ]),
});

export const addChargeSchema = z.object({
  chargeAmount: z.coerce.number(),
  isWarranty: z.string().optional(),
});

export const addLaborSchema = z.object({ time: z.string() });
export const addTripSchema = z.object({ tripChargeDate: z.coerce.date() });
export const addPartSchema = z.object({ partId: z.string().cuid() });
export const addReimbursementSchema = z.object({ reimbursedUser: z.string() });
export const addShippingSchema = z.object({ shippingDate: z.coerce.date() });
export const deleteChargeSchema = z.object({ chargeId: z.coerce.number() });

export const finishInvoiceSchema = z.object({
  vendorInvoiceNumber: z.string().optional(),
  vendorInvoiceDate: z.coerce.date().optional(),
});
