import { z } from "zod";

// Login Schema
export const loginSchema = z.object({
  emailOrPhone: z
    .string()
    .min(1, "Email or phone is required")
    .refine(
      (value) => {
        // Check if it's a valid email or phone number
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{10}$/;
        return emailRegex.test(value) || phoneRegex.test(value);
      },
      {
        message: "Please enter a valid email or 10-digit phone number",
      }
    ),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password is too long"),
});

// Register Schema
export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(50, "Full name is too long")
      .regex(/^[a-zA-Z\s]+$/, "Full name can only contain letters and spaces"),
    emailOrPhone: z
      .string()
      .min(1, "Email or phone is required")
      .refine(
        (value) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const phoneRegex = /^[0-9]{10}$/;
          return emailRegex.test(value) || phoneRegex.test(value);
        },
        {
          message: "Please enter a valid email or 10-digit phone number",
        }
      ),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(50, "Password is too long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;