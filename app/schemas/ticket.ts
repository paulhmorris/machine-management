import { z } from "zod";

export const ticketActionSchema = z.object({
  actionType: z.enum(["assignment", "close", "note", "reopen"]),
  comments: z.string().max(255).optional(),
});

export const ticketAssignmentSchema = z.object({
  assignedToUserId: z.string().cuid(),
});
