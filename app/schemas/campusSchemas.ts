import { z } from "zod";
import { HasCUID } from "~/schemas/helpers";

export const newCampusSchema = z.object({
  name: z.string(),
  monthlyFee: z.coerce.number(),
});

export const updateCampusSchema = newCampusSchema.merge(HasCUID);
