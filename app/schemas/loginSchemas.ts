import { z } from "zod";

export const loginSchema = z.object({
  email: z.string({ required_error: "Email is required" }).email("Invalid username"),
  password: z.string({ required_error: "Password is required" }).min(8, "Password must be at least 8 characters long"),
  remember: z.enum(["on"]).optional(),
  redirectTo: z.string().default("/admin"),
});

export const joinSchema = z.object({
  email: z.string({ required_error: "Email is required" }).email("Invalid username"),
  password: z.string({ required_error: "Password is required" }).min(8, "Password must be at least 8 characters long"),
  redirectTo: z.string().default("/admin"),
});
