import { z } from "zod";

export const updateCampusSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
});

export const newCampusSchema = z.object({
  name: z.string(),
});
