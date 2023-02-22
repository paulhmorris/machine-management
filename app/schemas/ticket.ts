import { z } from "zod";

export const ticketAssignmentSchema = z.object({
  actionType: z.enum(["assignment", "close", "note", "reopen"]),
  comments: z.string().max(255).optional(),
  assignedToUserId: z.string().cuid(),
});
