// src/utils/validators.ts
import { z } from "zod";

const emailRegex = /@(gmail|outlook|yahoo|protonmail|rediffmail)\./;
const usernameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
const mobileRegex = /^\d{10}$/;
const countryCodeRegex = /^\+[1-9]\d{0,2}$/;

export const registerSchema = z.object({
  username: z.string().refine(
    (value) => usernameRegex.test(value) && value.length >= 3 && value.length <= 20,
    {
      message:
        "Username must be 3-20 characters long and can only contain English alphabets with single spaces between words",
    }),
    email: z.string().refine((value) => {
      // Basic email validation pattern (case-insensitive)
      const basicEmailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
      return basicEmailPattern.test(value) && emailRegex.test(value);
    }, {
      message: "Invalid email address. Email must be from Gmail, Outlook, Yahoo, ProtonMail or RediffMail",
    }),
  password: z.string().regex(
    /^(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[A-Z])(?=.*[a-z]).{8,20}$/,
    "Password must be 8-20 characters long and include at least one uppercase letter, one lowercase letter, and one special character"
  ),
  mobile: z
    .string()
    .regex(mobileRegex, "Mobile number must be exactly 10 digits"),
    countryCode: z
    .string()
    .regex(countryCodeRegex, "Country code is invalid. Must start with '+' and then 1 to 3 digits (first digit non-zero)"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().regex(
    /^(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[A-Z])(?=.*[a-z]).{8,20}$/,
    "Invalid password. Password must be 8-20 characters long and include at least one uppercase letter, one lowercase letter, and one special character"
  ),
});
