import { z } from "zod";

export const updateLocationSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  description: z.string().max(255).optional(),
  campusId: z.string().cuid(),
});

export const newLocationSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  campusId: z.string().cuid(),
});
