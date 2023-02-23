import { z } from "zod";

export const addTicketToInvoiceSchema = z.object({
  ticketId: z.coerce.number(),
});
export const addLaborSchema = z.object({
  ticketId: z.coerce.number({ required_error: "A ticket is required" }),
  chargeAmount: z.coerce.number({
    required_error: "Charge amount is required",
  }),
  isWarranty: z.enum(["on"]).optional(),
  time: z.string(),
});
export const addTripSchema = z.object({
  ticketId: z.coerce.number({ required_error: "A ticket is required" }),
  tripChargeDate: z.coerce.date({ required_error: "A date is required" }),
  chargeAmount: z.coerce.number({
    required_error: "Charge amount is required",
  }),
});
export const addPartSchema = z.object({
  ticketId: z.coerce.number({ required_error: "A ticket is required" }),
  partId: z.string({ required_error: "A part is required" }).cuid(),
  chargeAmount: z.coerce.number({
    required_error: "Charge amount is required",
  }),
  isWarranty: z.enum(["on"]).optional(),
});
export const addReimbursementSchema = z.object({
  ticketId: z.coerce.number({ required_error: "A ticket is required" }),
  reimbursedUser: z.string({ required_error: "Please specify recipient" }),
  chargeAmount: z.coerce.number({
    required_error: "Charge amount is required",
  }),
});
export const addShippingSchema = z.object({
  ticketId: z.coerce.number({ required_error: "A ticket is required" }),
  shippingDate: z.coerce.date({ required_error: "A date is required" }),
  chargeAmount: z.coerce.number({
    required_error: "Charge amount is required",
  }),
});
export const deleteChargeSchema = z.object({
  ticketId: z.coerce.number({ required_error: "A ticket is required" }),
  chargeId: z.coerce.number(),
});
export const finishInvoiceSchema = z.object({
  vendorInvoiceNumber: z.string().optional(),
  vendorInvoiceDate: z.string().optional(),
});
