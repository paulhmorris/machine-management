import { z } from "zod";

export const updatePocketSchema = z.object({
  id: z.string().cuid(),
  floor: z.string().max(255).optional(),
  position: z.coerce.number().optional(),
  description: z.string().max(255).optional(),
  locationId: z.string().cuid(),
});
