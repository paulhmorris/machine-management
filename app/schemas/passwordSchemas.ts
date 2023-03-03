import { z } from "zod";

export const passwordSetupSchema = z
  .object({
    token: z.string(),
    password: z.string().min(8),
    confirmation: z.string().min(8),
  })
  .superRefine(({ password, confirmation }, ctx) => {
    if (password !== confirmation) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords must match",
        path: ["confirmation"],
      });
    }
  });

export const passwordResetSchema = z
  .object({
    token: z.string(),
    oldPassword: z.string().min(8),
    newPassword: z.string().min(8),
    confirmation: z.string().min(8),
  })
  .superRefine(({ newPassword, confirmation }, ctx) => {
    if (newPassword !== confirmation) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords must match",
        path: ["confirmation"],
      });
    }
  });

export const sendPasswordResetSchema = z.object({
  userId: z.string().cuid(),
});
