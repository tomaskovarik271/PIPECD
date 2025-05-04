import { z } from 'zod';

// --- Person Schemas ---
const PersonBaseSchema = z.object({
  first_name: z.string().trim().min(1, { message: "First name cannot be empty if provided" }).optional().nullable(),
  last_name: z.string().trim().min(1, { message: "Last name cannot be empty if provided" }).optional().nullable(),
  email: z.string().trim().email({ message: "Invalid email address" }).optional().nullable(),
  phone: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  organization_id: z.string().uuid({ message: "Invalid Organization ID format" }).optional().nullable(),
});

export const PersonCreateSchema = PersonBaseSchema.refine(data => data.first_name || data.last_name || data.email, {
  message: "At least a first name, last name, or email is required",
  path: ["first_name"],
});

export const PersonUpdateSchema = PersonBaseSchema.partial();

// --- Organization Schemas ---
export const OrganizationInputSchema = z.object({
    name: z.string().trim().min(1, { message: "Organization name cannot be empty" }),
    address: z.string().trim().optional().nullable(),
    notes: z.string().trim().optional().nullable(),
});

// --- Deal Schemas ---
const DealBaseSchema = z.object({
    name: z.string().trim().min(1, { message: "Deal name cannot be empty" }),
    stage_id: z.string().uuid({ message: "Invalid Stage ID format" }),
    amount: z.number().positive({ message: "Amount must be a positive number"}).optional().nullable(),
    person_id: z.string().uuid({ message: "Invalid Person ID format" }).optional().nullable(),
});

export const DealCreateSchema = DealBaseSchema;
export const DealUpdateSchema = DealBaseSchema.partial();

// --- Pipeline Schemas ---
export const PipelineInputSchema = z.object({
    name: z.string().trim().min(1, { message: "Pipeline name cannot be empty" }),
});

// --- Stage Schemas ---
const StageBaseSchema = z.object({
    name: z.string().trim().min(1, { message: "Stage name cannot be empty" }),
    order: z.number().int().nonnegative({ message: "Order must be a non-negative integer"}),
    pipeline_id: z.string().uuid({ message: "Invalid Pipeline ID format" }),
    deal_probability: z.number().min(0).max(1, { message: "Probability must be between 0.0 and 1.0" }).optional().nullable(),
});

export const StageCreateSchema = StageBaseSchema;
export const StageUpdateSchema = StageBaseSchema.partial().omit({ pipeline_id: true }); 