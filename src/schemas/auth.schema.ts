import { z } from "zod";

const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters long")
  .max(30, "Username must be at most 30 characters long")
  .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(72, "Password must be at most 72 characters long");

export const registerSchema = z.object({
  body: z.object({
    email: z.email("Invalid email address").trim().toLowerCase(),
    username: usernameSchema,
    firstName: z.string().trim().min(2, "First name must be at least 2 characters long").max(50),
    lastName: z.string().trim().min(2, "Last name must be at least 2 characters long").max(50),
    password: passwordSchema,
    role: z.enum(["RUNNER", "COACH"]).optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    emailOrUsername: z.string().trim().min(1, "Email or username is required"),
    password: passwordSchema
  })
});
