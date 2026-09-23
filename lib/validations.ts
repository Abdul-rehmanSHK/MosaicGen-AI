import { z } from "zod";

/**
 * Common prompt injection patterns to sanitize out of user AI prompts
 */
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
  /you\s+are\s+now\s+(an?\s+)?unrestricted/i,
  /system\s+prompt/i,
  /<script[\s\S]*?>[\s\S]*?<\/script>/i,
  /javascript:/i,
];

/**
 * Sanitize prompt string to neutralize prompt injection and script payloads
 */
export function sanitizePrompt(input: string): string {
  let clean = input.trim();
  for (const pattern of INJECTION_PATTERNS) {
    clean = clean.replace(pattern, "");
  }
  return clean.replace(/[<>]/g, ""); // Strip raw HTML angle brackets
}

/**
 * 1. AI Generation Request Validation Schema
 * Enforces prompt length, injection neutralization, surface placement, and image payloads.
 */
export const AIGenerationRequestSchema = z.object({
  prompt: z
    .string({ required_error: "A design prompt is required." })
    .trim()
    .min(3, "Prompt must be at least 3 characters.")
    .max(1000, "Prompt cannot exceed 1000 characters to prevent system abuse.")
    .transform(sanitizePrompt),
  
  placement: z
    .string()
    .trim()
    .min(2, "Placement surface must be at least 2 characters.")
    .max(100, "Placement surface cannot exceed 100 characters.")
    .default("Floor Medallion"),
  
  productId: z.string().optional().nullable(),
  referenceProductImageUrl: z.string().optional().nullable(),
  referenceProductTitle: z.string().optional().nullable(),
  referenceProductCategory: z.string().optional().nullable(),
  
  email: z
    .string()
    .trim()
    .email("A valid email address is required.")
    .optional()
    .nullable(),

  verifiedToken: z.string().optional().nullable(),

  finish: z.string().default("Polished High-Gloss"),

  groutColor: z.string().default("Champagne Gold"),

  surfaceDetection: z
    .object({
      detected: z.boolean().optional(),
      surfaceName: z.string().optional(),
      box_2d: z.array(z.number()).optional(),
      polygon: z.array(z.array(z.number())).optional(),
      description: z.string().optional(),
      confidence: z.number().optional(),
      architecturalGuideline: z.string().optional(),
    })
    .optional()
    .nullable(),

  maskUrl: z
    .string()
    .url("Image mask must be a valid URL.")
    .optional()
    .nullable(),

  inputImageUrl: z
    .string()
    .url("Input reference image must be a valid URL.")
    .optional()
    .nullable(),

  maskBase64: z
    .string()
    .refine(
      (val) => !val || val.startsWith("data:image/"),
      "Mask base64 must be a valid data:image URI."
    )
    .optional()
    .nullable(),

  inputImageBase64: z
    .string()
    .refine(
      (val) => !val || val.startsWith("data:image/"),
      "Input image base64 must be a valid data:image URI."
    )
    .optional()
    .nullable(),
});

export type AIGenerationRequestInput = z.infer<typeof AIGenerationRequestSchema>;

/**
 * 2. Inquiry Form Validation Schema
 * Validates consultation requests, quote inquiries, and specialist consultations.
 */
export const InquiryFormSchema = z.object({
  name: z
    .string({ required_error: "Full name is required." })
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name cannot exceed 100 characters."),

  email: z
    .string({ required_error: "Email is required." })
    .trim()
    .email("Please provide a valid email address.")
    .toLowerCase()
    .max(254, "Email is too long."),

  phone: z
    .string()
    .trim()
    .max(30, "Phone number cannot exceed 30 characters.")
    .optional()
    .nullable(),

  spaceType: z
    .string()
    .trim()
    .min(2, "Space / surface type is required.")
    .max(100, "Space type cannot exceed 100 characters.")
    .default("General Surface"),

  dimensions: z
    .string()
    .trim()
    .max(100, "Approximate dimensions description cannot exceed 100 characters.")
    .optional()
    .nullable(),

  message: z
    .string({ required_error: "Project details / message is required." })
    .trim()
    .min(5, "Project details must be at least 5 characters.")
    .max(3000, "Message cannot exceed 3000 characters.")
    .transform((msg) => msg.replace(/[<>]/g, "")), // Basic sanitization

  inquiryType: z
    .enum(["QUOTE_REQUEST", "TALK_TO_SPECIALIST", "GENERAL_INQUIRY"])
    .default("QUOTE_REQUEST")
    .optional(),

  preferredTime: z
    .string()
    .trim()
    .max(100, "Preferred time is too long.")
    .optional()
    .nullable(),

  productId: z.string().optional().nullable(),
  generationId: z.string().optional().nullable(),
  designImageUrl: z.string().optional().nullable(),
});

export type InquiryFormInput = z.infer<typeof InquiryFormSchema>;

/**
 * Helper to format Zod validation errors into a user-friendly single message or map
 */
export function formatZodError(error: z.ZodError): string {
  return error.errors.map((e) => e.message).join(" | ");
}
