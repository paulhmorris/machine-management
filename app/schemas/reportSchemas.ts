import { z } from "zod";

export const reportSchema = z.object({
  machineId: z.string(),
  notes: z.string().max(255, { message: "Must be fewer than 255 characters" }),
  reporterEmail: z.string().email({ message: "Invalid email" }),
});
