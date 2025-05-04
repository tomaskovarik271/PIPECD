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

// === Activity Validators ===

const ActivityTypeEnum = z.enum([
  'TASK',
  'MEETING',
  'CALL',
  'EMAIL',
  'DEADLINE',
  // Add any other types defined in the GraphQL enum
], { errorMap: () => ({ message: 'Invalid activity type' }) });

export const CreateActivityInputSchema = z.object({
  type: ActivityTypeEnum,
  subject: z.string().trim().min(1, { message: 'Subject cannot be empty' }),
  due_date: z.string().datetime({ message: 'Invalid datetime string for due date. Use ISO 8601 format.' }).optional().nullable(),
  notes: z.string().trim().optional().nullable(), // Trim notes
  is_done: z.boolean().optional(), // Defaults false in DB
  deal_id: z.string().uuid({ message: 'Invalid UUID for deal ID' }).optional().nullable(),
  person_id: z.string().uuid({ message: 'Invalid UUID for person ID' }).optional().nullable(),
  organization_id: z.string().uuid({ message: 'Invalid UUID for organization ID' }).optional().nullable(),
}).refine(data => !!data.deal_id || !!data.person_id || !!data.organization_id, {
  message: 'An activity must be linked to at least one Deal, Person, or Organization.',
  // path: ['deal_id'], // Add path for better error highlighting if desired, points to first field
});

export const UpdateActivityInputSchema = z.object({
  // All fields are optional for update
  type: ActivityTypeEnum.optional(),
  subject: z.string().trim().min(1, { message: 'Subject cannot be empty when provided' }).optional(), // Validate non-empty only if provided
  due_date: z.string().datetime({ message: 'Invalid datetime string for due date. Use ISO 8601 format.' }).optional().nullable(),
  notes: z.string().trim().nullable().optional(), // Allow explicitly setting notes to null or empty string after trim
  is_done: z.boolean().optional(),
  deal_id: z.string().uuid({ message: 'Invalid UUID for deal ID' }).optional().nullable(),
  person_id: z.string().uuid({ message: 'Invalid UUID for person ID' }).optional().nullable(),
  organization_id: z.string().uuid({ message: 'Invalid UUID for organization ID' }).optional().nullable(),
}).refine(data => Object.keys(data).length > 0, {
    message: 'Update input cannot be empty. Provide at least one field to update.',
});

export const ActivityFilterInputSchema = z.object({
    dealId: z.string().uuid({ message: 'Invalid UUID for filter dealId' }).optional(),
    personId: z.string().uuid({ message: 'Invalid UUID for filter personId' }).optional(),
    organizationId: z.string().uuid({ message: 'Invalid UUID for filter organizationId' }).optional(),
    isDone: z.boolean().optional(),
}).optional(); // The whole filter object is optional 