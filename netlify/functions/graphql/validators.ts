import { z } from 'zod';
// import { StageType as GeneratedStageType } from '../../../lib/generated/graphql'; // REMOVED
import { 
    ActivityType as GeneratedActivityType
} from '../../../lib/generated/graphql';

// Zod schema for CustomFieldValueInput
const CustomFieldValueInputSchema = z.object({
  definitionId: z.string().uuid("Invalid Definition ID format for custom field value"),
  stringValue: z.string().optional().nullable(),
  numberValue: z.number().optional().nullable(),
  booleanValue: z.boolean().optional().nullable(),
  dateValue: z.coerce.date({ errorMap: () => ({ message: "Invalid date for custom field. Expected a valid date string." }) }).optional().nullable(), 
  selectedOptionValues: z.array(z.string()).optional().nullable(),
}).refine(data => {
  const valueFields = [
    data.stringValue,
    data.numberValue,
    data.booleanValue,
    data.dateValue,
    data.selectedOptionValues
  ];
  const providedValueFields = valueFields.filter(v => v !== undefined && v !== null && (!Array.isArray(v) || v.length > 0));
  // Ensure at most one value field is provided (0 is okay for optional, 1 is for a set value)
  return providedValueFields.length <= 1;
}, {
  message: "If providing a custom field value, only one of stringValue, numberValue, booleanValue, dateValue, or selectedOptionValues should be set.",
  // path: [], // General error, or pick one field e.g., 'stringValue'
});

// --- Person Schemas ---
const PersonBaseSchema = z.object({
  first_name: z.string().trim().min(1, { message: "First name cannot be empty if provided" }).optional().nullable(),
  last_name: z.string().trim().min(1, { message: "Last name cannot be empty if provided" }).optional().nullable(),
  email: z.string().trim().email({ message: "Invalid email address" }).optional().nullable(),
  phone: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  organization_id: z.string().uuid({ message: "Invalid Organization ID format" }).optional().nullable(),
  customFields: z.array(CustomFieldValueInputSchema).optional().nullable(),
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
    customFields: z.array(CustomFieldValueInputSchema).optional().nullable(),
});

// --- Deal Schemas ---

export const DealBaseSchema = z.object({
  name: z.string().min(1, { message: "Deal name is required" }).optional(),
  amount: z.number().positive("Amount must be positive").optional().nullable(),
  expected_close_date: z.string().optional().nullable(),
  wfmProjectTypeId: z.string().uuid("Valid WFM Project Type ID is required").optional(),
  person_id: z.string().uuid("Valid Person ID is required").optional().nullable(),
  organization_id: z.string().uuid("Valid Organization ID is required").optional().nullable(),
  deal_specific_probability: z.number().min(0).max(100, "Probability must be between 0 and 100").optional().nullable(),
  customFields: z.array(CustomFieldValueInputSchema).optional().nullable(),
  assignedToUserId: z.string().uuid("Valid User ID for assignee is required").optional().nullable(),
});

export const DealCreateSchema = DealBaseSchema.merge(z.object({
  name: z.string().min(1, { message: "Deal name is required" }),
  wfmProjectTypeId: z.string().uuid("Valid WFM Project Type ID is required"),
}));

export const DealUpdateSchema = DealBaseSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    { message: "Update input cannot be empty." }
);

// --- Pipeline Schemas ---

// === Activity Validators ===

const ActivityTypeEnum = z.nativeEnum(GeneratedActivityType, {
    errorMap: () => ({ message: 'Invalid activity type. Must be one of CALL, DEADLINE, EMAIL, MEETING, SYSTEM_TASK, TASK.' })
});

export const CreateActivityInputSchema = z.object({
  type: ActivityTypeEnum,
  subject: z.string().trim().min(1, { message: 'Subject cannot be empty' }),
  due_date: z.coerce.date().optional().nullable(),
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
  due_date: z.coerce.date().optional().nullable(),
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
    leadId: z.string().uuid({ message: 'Invalid UUID for filter leadId' }).optional(),
    isDone: z.boolean().optional(),
}).optional();

