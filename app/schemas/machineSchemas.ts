import { z } from "zod";

export const updateMachineSchema = z.object({
  id: z.string().cuid(),
  publicId: z.string(),
  serialNumber: z.string().optional(),
  description: z.string().max(255).optional(),
  machineTypeId: z.coerce.number(),
  pocketId: z.string().cuid(),
});

export const newMachineSchema = z.object({
  publicId: z.string(),
  serialNumber: z.string().optional(),
  description: z.string().max(255).optional(),
  machineTypeId: z.coerce.number(),
  pocketId: z.string().cuid(),
});
