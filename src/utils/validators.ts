// src/utils/validators.ts
import { z } from "zod";

const emailRegex = /@(gmail|outlook|yahoo|protonmail|rediffmail)\./;

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long"),
  email: z
    .string()
    .email("Invalid email address")
    .refine((email) => emailRegex.test(email), {
      message:
        "Email must be from Gmail, Outlook, Yahoo, ProtonMail or RediffMail",
    }),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long"),
  mobile: z
    .string()
    .min(10, "Mobile number must be at least 10 digits")
    .max(15, "Mobile number must be no longer than 15 digits"),
  countryCode: z.string().min(1, "Country code is required"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
