import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(3).email(),
  password: z.string().min(8),
  remember: z.string().optional(),
  redirectTo: z.string(),
});
