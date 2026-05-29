import { z } from "zod";

// ── Password rules ────────────────────────────────────────────

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least one special character");

// ── Login Schema ──────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["DOCTOR", "PATIENT"], {
    required_error: "Please select your role",
  }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ── Register Schema ───────────────────────────────────────────

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name is too long"),
    email: z.string().email("Please enter a valid email address"),
    password: passwordSchema,
    confirmPassword: z.string(),
    role: z.enum(["DOCTOR", "PATIENT"], {
      required_error: "Please select your role",
    }),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{7,14}$/, "Invalid phone number")
      .optional()
      .or(z.literal("")),

    // Doctor fields
    specialty: z.string().min(2, "Specialty is required").optional().or(z.literal("")),
    licenseNumber: z
      .string()
      .min(3, "License number is required")
      .optional()
      .or(z.literal("")),
    clinicName: z.string().optional().or(z.literal("")),
    clinicAddress: z.string().optional().or(z.literal("")),

    // Patient fields
    dob: z.string().optional().or(z.literal("")),
    gender: z
      .enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"])
      .optional(),
    bloodGroup: z
      .enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }

    if (data.role === "DOCTOR") {
      if (!data.specialty || data.specialty.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["specialty"],
          message: "Specialty is required for doctors",
        });
      }
      if (!data.licenseNumber || data.licenseNumber.length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["licenseNumber"],
          message: "License number is required for doctors",
        });
      }
    }

    if (data.role === "PATIENT") {
      if (!data.dob) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["dob"],
          message: "Date of birth is required for patients",
        });
      }
    }
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

// ── Forgot Password Schema ───────────────────────────────────

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
