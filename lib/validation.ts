import { z } from "zod";
import { INQUIRY_STATUSES, INQUIRY_TYPES, PROJECT_CATEGORIES, PROJECT_STATUSES, USER_ROLES, VISIT_STATUSES } from "./constants";

const phoneRegex = /^(\+91)?[6-9]\d{9}$/;

export function normalisePhone(input: string) {
  const digits = input.replace(/[^\d+]/g, "").replace(/^\+91/, "").replace(/^0+/, "");
  return digits;
}

export const phoneSchema = z
  .string()
  .trim()
  .min(10, "Please enter a valid 10-digit mobile number")
  .transform((v) => normalisePhone(v))
  .refine((v) => phoneRegex.test(v), "Please enter a valid Indian mobile number");

const optionalEmail = z
  .union([z.string().trim().email("Please enter a valid email address"), z.literal("")])
  .optional()
  .transform((v) => (v === "" ? undefined : v));

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(80),
  email: z.string().trim().toLowerCase().email("Please enter a valid email address"),
  phone: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? normalisePhone(v) : undefined))
    .refine((v) => !v || phoneRegex.test(v), "Please enter a valid Indian mobile number"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100)
    .regex(/[A-Za-z]/, "Include at least one letter")
    .regex(/\d/, "Include at least one number"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address"),
  password: z.string().min(1, "Please enter your password"),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? normalisePhone(v) : undefined))
    .refine((v) => !v || phoneRegex.test(v), "Please enter a valid Indian mobile number"),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100)
    .regex(/[A-Za-z]/, "Include at least one letter")
    .regex(/\d/, "Include at least one number"),
});

const inquiryTypeValues = INQUIRY_TYPES.map((t) => t.value) as [string, ...string[]];

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: phoneSchema,
  email: optionalEmail,
  projectId: z.string().trim().optional().nullable(),
  projectName: z.string().trim().max(160).optional(),
  inquiryType: z.enum(inquiryTypeValues).default("GENERAL"),
  message: z.string().trim().max(1200, "Message is too long").optional(),
  source: z.string().trim().max(120).optional(),
  preferredDate: z.string().trim().optional(),
  preferredTime: z.string().trim().optional(),
  website: z.string().max(0, "Spam detected").optional(), // honeypot
  consent: z.literal(true, { message: "Please agree to be contacted about your inquiry" }),
});

export const siteVisitSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: phoneSchema,
  email: optionalEmail,
  projectId: z.string().trim().min(1, "Select a project"),
  preferredDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a preferred date")
    .refine((value) => {
      const date = new Date(`${value}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }, "Choose a date from today onwards"),
  preferredTime: z.string().trim().min(1, "Choose a preferred time").max(40),
  message: z.string().trim().max(1000).optional(),
  website: z.string().max(0, "Spam detected").optional(),
  consent: z.literal(true, { message: "Please agree to be contacted about your site visit" }),
});

export const projectSchema = z.object({
  name: z.string().trim().min(2, "Project name is required").max(140),
  slug: z
    .string()
    .trim()
    .max(160)
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine((v) => !v || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v), "Use lowercase letters, numbers and hyphens"),
  tagline: z.string().trim().max(180).optional(),
  developerId: z.string().trim().min(1, "Select a developer"),
  locationId: z.string().trim().min(1, "Select a location"),
  address: z.string().trim().min(5, "Address is required").max(300),
  propertyType: z.enum(["RESIDENTIAL", "COMMERCIAL"]),
  category: z.enum(PROJECT_CATEGORIES),
  startingPrice: z.coerce.number().int().positive("Starting price must be greater than zero"),
  maxPrice: z.coerce.number().int().positive().optional().nullable(),
  bhkConfigs: z.array(z.string().trim()).default([]),
  status: z.enum(PROJECT_STATUSES.map((s) => s.value) as [string, ...string[]]),
  possessionDate: z.string().trim().optional().nullable(),
  reraNumber: z.string().trim().max(80).optional().nullable(),
  reraVerified: z.boolean().default(false),
  description: z.string().trim().min(30, "Add a description of at least 30 characters").max(6000),
  highlights: z.array(z.string().trim()).default([]),
  amenityNotes: z.string().trim().max(1000).optional(),
  amenityIds: z.array(z.string().trim()).default([]),
  mapEmbedUrl: z.string().trim().url("Enter a valid map URL").optional().or(z.literal("")),
  mapLat: z.coerce.number().optional().nullable(),
  mapLng: z.coerce.number().optional().nullable(),
  nearbyPlaces: z
    .array(z.object({ name: z.string().trim().min(1), distance: z.string().trim().min(1) }))
    .default([]),
  brochureUrl: z.string().trim().optional().nullable(),
  heroImage: z.string().trim().max(500).optional().nullable(),
  images: z
    .array(
      z.object({
        id: z.string().optional(),
        url: z.string().trim().min(1),
        alt: z.string().trim().optional(),
        isCover: z.boolean().optional(),
      }),
    )
    .default([]),
  floorPlans: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().trim().min(1),
        bhk: z.string().trim().optional(),
        areaSqft: z.coerce.number().int().positive().optional().nullable(),
        price: z.coerce.number().int().positive().optional().nullable(),
        imageUrl: z.string().trim().optional(),
      }),
    )
    .default([]),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  isDemo: z.boolean().default(true),
  metaTitle: z.string().trim().max(160).optional(),
  metaDescription: z.string().trim().max(300).optional(),
});

export const developerSchema = z.object({
  name: z.string().trim().min(2, "Developer name is required").max(120),
  slug: z.string().trim().optional(),
  description: z.string().trim().max(2000).optional(),
  establishedYear: z.coerce.number().int().min(1950).max(new Date().getFullYear()).optional().nullable(),
  website: z.string().trim().url().optional().or(z.literal("")),
  logoUrl: z.string().trim().optional().nullable(),
  isDemo: z.boolean().default(true),
});

export const locationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().optional(),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().default("Uttar Pradesh"),
  description: z.string().trim().max(2000).optional(),
  imageUrl: z.string().trim().optional().nullable(),
  highlights: z.array(z.string().trim()).default([]),
  sortOrder: z.coerce.number().int().default(0),
});

export const faqSchema = z.object({
  question: z.string().trim().min(5).max(240),
  answer: z.string().trim().min(10).max(4000),
  category: z.string().trim().max(60).default("General"),
  sortOrder: z.coerce.number().int().default(0),
  published: z.boolean().default(true),
});

export const testimonialSchema = z.object({
  name: z.string().trim().min(2).max(100),
  role: z.string().trim().max(120).optional(),
  quote: z.string().trim().min(20).max(1000),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  published: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export const leadUpdateSchema = z.object({
  status: z.enum(INQUIRY_STATUSES).optional(),
  assignedToId: z.string().trim().nullable().optional(),
  note: z.string().trim().max(1000).optional(),
});

export const visitUpdateSchema = z.object({
  status: z.enum(VISIT_STATUSES),
});

export const userAdminSchema = z.object({
  role: z.enum(USER_ROLES).optional(),
  isActive: z.boolean().optional(),
});

export const changePasswordAdminSchema = z.object({
  password: z.string().min(8).max(100),
});
