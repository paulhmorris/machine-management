import { z } from "zod";

export const newUserSchema = z
  .object({
    email: z.string().email(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    role: z.enum(["ADMIN", "USER"]),
    campusId: z.string().cuid().optional().or(z.literal("")),
    campusRole: z.enum(["ATTENDANT", "MACHINE_TECH", "CAMPUS_TECH"]).optional().or(z.literal("")),
    sendEmail: z.enum(["on"]).optional(),
  })
  .superRefine(({ campusId, campusRole }, ctx) => {
    if (campusId && !campusRole) {
      ctx.addIssue({
        code: "custom",
        message: "Campus role is required",
        path: ["campusRole"],
      });
    }
    if (!campusId && campusRole) {
      ctx.addIssue({
        code: "custom",
        message: "Campus is required",
        path: ["campusId"],
      });
    }
  });

export const updateUserSchema = z
  .object({
    userId: z.string().cuid(),
    email: z.string().email(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    role: z.enum(["ADMIN", "USER"]),
    campusId: z.string().cuid().optional().or(z.literal("")),
    campusRole: z.enum(["ATTENDANT", "MACHINE_TECH", "CAMPUS_TECH"]).optional().or(z.literal("")),
  })
  .superRefine(({ campusId, campusRole }, ctx) => {
    if (campusId && !campusRole) {
      ctx.addIssue({
        code: "custom",
        message: "Campus role is required",
        path: ["campusRole"],
      });
    }
    if (!campusId && campusRole) {
      ctx.addIssue({
        code: "custom",
        message: "Campus is required",
        path: ["campusId"],
      });
    }
  });
