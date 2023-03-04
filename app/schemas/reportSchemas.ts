import { z } from "zod";

export const reportSchema = z.object({
  machineId: z.string(),
  error: z.coerce.number({ invalid_type_error: "Please select an error" }),
  notes: z.string().max(255, { message: "Must be fewer than 255 characters" }),
});
