import { z } from "zod";

export const newVendorSchema = z.object({
  name: z.string(),
  tripCharge: z.coerce.number(),
  hourlyRate: z.coerce.number(),
  campusId: z.string().cuid(),
});

export const updateVendorSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  tripCharge: z.coerce.number(),
  hourlyRate: z.coerce.number(),
  campusIds: z.array(z.string().cuid()),
});
