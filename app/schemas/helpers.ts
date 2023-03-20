import { z } from "zod";

export const HasCUID = z.object({ id: z.string().cuid() });
