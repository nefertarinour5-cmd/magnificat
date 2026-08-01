import { z } from "zod";

// ============================================================
// SCHÉMAS D'AUTHENTIFICATION
// ============================================================

export const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(80),
  email: z.string().email("Email invalide").max(120).toLowerCase(),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(128)
    .regex(/[A-Z]/, "Au moins une majuscule requise")
    .regex(/[a-z]/, "Au moins une minuscule requise")
    .regex(/\d/, "Au moins un chiffre requis"),
  role: z.enum(["PARENT", "TEACHER"]).default("PARENT"),
  phone: z.string().min(8, "Téléphone invalide").max(20),
  whatsapp: z.string().max(20).optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/\d/),
});

// ============================================================
// SCHÉMAS PARENT
// ============================================================

export const parentProfileSchema = z.object({
  fullName: z.string().min(2).max(80),
  phone: z.string().min(8).max(20),
  whatsapp: z.string().max(20).optional().or(z.literal("")),
  city: z.string().min(2).max(60),
  address: z.string().min(4).max(200),
  need: z.string().max(2000).optional().or(z.literal("")),
});

// ============================================================
// SCHÉMAS ENSEIGNANT / CANDIDATURE
// ============================================================

export const teacherApplicationSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().toLowerCase(),
  phone: z.string().min(8).max(20),
  whatsapp: z.string().max(20).optional().or(z.literal("")),
  age: z.number().int().min(18).max(80).optional(),
  specialty: z.string().min(2).max(60),
  level: z.enum(["Primaire", "Secondaire", "Universitaire"]),
  subject: z.string().min(2).max(60),
  experienceYears: z.number().int().min(0).max(60),
  city: z.string().min(2).max(60),
  commune: z.string().max(60).optional().or(z.literal("")),
  desiredRate: z.number().int().min(0).max(10000),
  availability: z.enum(["En semaine", "Week-end", "Flexible"]),
  bio: z.string().min(20, "Présentation trop courte").max(2000),
  methods: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
});

export const teacherUpdateSchema = z.object({
  bio: z.string().min(20).max(2000).optional(),
  methods: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  availability: z.enum(["En semaine", "Week-end", "Flexible"]).optional(),
  phone: z.string().min(8).max(20).optional(),
  whatsapp: z.string().max(20).optional().or(z.literal("")),
});

// ============================================================
// SCHÉMAS ADMIN
// ============================================================

export const applicationReviewSchema = z.object({
  applicationId: z.string().min(1),
  action: z.enum(["APPROVE", "REJECT", "INTERVIEW"]),
  publicRate: z.number().int().min(0).max(10000).optional(),
  internalCredits: z.number().int().min(0).max(100000).optional(),
  adminNote: z.string().max(2000).optional().or(z.literal("")),
});

export const teacherAdminUpdateSchema = z.object({
  teacherId: z.string().min(1),
  hourlyRate: z.number().int().min(0).max(10000).optional(),
  publicRate: z.number().int().min(0).max(10000).optional(),
  internalCredits: z.number().int().min(0).max(100000).optional(),
  isFeatured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  isVerified: z.boolean().optional(),
});

// ============================================================
// SCHÉMAS DEMANDE
// ============================================================

export const requestSchema = z.object({
  teacherId: z.string().min(1),
  message: z.string().min(10, "Message trop court").max(2000),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
});

export const requestStatusUpdateSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONTACTED",
    "SCHEDULED",
    "COMPLETED",
    "CANCELLED",
    "ORIENTED",
  ]),
  adminNote: z.string().max(2000).optional().or(z.literal("")),
});

// ============================================================
// SCHÉMAS AVIS
// ============================================================

export const reviewSchema = z.object({
  teacherId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional().or(z.literal("")),
});

// ============================================================
// SCHÉMAS RECHERCHE
// ============================================================

export const searchSchema = z.object({
  q: z.string().max(200).optional().or(z.literal("")),
  city: z.string().max(60).optional().or(z.literal("")),
  subject: z.string().max(60).optional().or(z.literal("")),
  level: z.string().max(60).optional().or(z.literal("")),
  availability: z.string().max(60).optional().or(z.literal("")),
  minRating: z.coerce.number().min(0).max(5).optional(),
  minExperience: z.coerce.number().int().min(0).max(60).optional(),
  maxRate: z.coerce.number().int().min(0).max(10000).optional(),
  sort: z
    .enum(["compatibility", "rating", "experience", "recent", "rate"])
    .default("compatibility"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ParentProfileInput = z.infer<typeof parentProfileSchema>;
export type TeacherApplicationInput = z.infer<typeof teacherApplicationSchema>;
export type RequestInput = z.infer<typeof requestSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
