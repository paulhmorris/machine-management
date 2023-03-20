import { z } from "zod";
import { HasCUID } from "~/schemas/helpers";

export const newVendorSchema = z.object({
  name: z.string(),
  tripCharge: z.coerce.number(),
  hourlyRate: z.coerce.number(),
  campusIds: z.array(z.string().cuid()).min(1, "Must select at least one campus"),
});

export const updateVendorSchema = newVendorSchema.merge(HasCUID);
