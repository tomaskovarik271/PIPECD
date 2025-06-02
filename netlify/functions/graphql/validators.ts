import { z } from 'zod';
// import { StageType as GeneratedStageType } from '../../../lib/generated/graphql'; // REMOVED
import { 
    PriceQuoteCreateInput as GeneratedPriceQuoteCreateInput,
    PriceQuoteUpdateInput as GeneratedPriceQuoteUpdateInput,
    AdditionalCostInput as GeneratedAdditionalCostInput,
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
    isDone: z.boolean().optional(),
}).optional(); // The whole filter object is optional 

// --- Pricing Module Schemas ---

// Corresponds to AdditionalCostInput in GraphQL
// This Zod schema should match the structure of GeneratedAdditionalCostInput
export const AdditionalCostInputSchema = z.object({
  description: z.string().trim().min(1, { message: "Description for additional cost cannot be empty" }),
  amount: z.number().positive({ message: "Amount for additional cost must be a positive number" }),
  // Add other fields from GeneratedAdditionalCostInput if they exist and need validation
  // For example, if GeneratedAdditionalCostInput had an optional 'id' for updates:
  // id: z.string().uuid().optional().nullable(), 
});

// Corresponds to PriceQuoteCreateInput in GraphQL
// This Zod schema should match the structure of GeneratedPriceQuoteCreateInput
export const PriceQuoteCreateInputSchema = z.object({
  name: z.string().trim().min(1, { message: "Quote name cannot be empty" }).optional().nullable(),
  base_minimum_price_mp: z.number().min(0, { message: "Base minimum price cannot be negative" }).optional().nullable(),
  target_markup_percentage: z.number().min(0, { message: "Target markup percentage cannot be negative" }).optional().nullable(),
  final_offer_price_fop: z.number().min(0, { message: "Final offer price cannot be negative" }).optional().nullable(),
  overall_discount_percentage: z.number().min(0).max(100, { message: "Overall discount must be between 0 and 100" }).optional().nullable(),
  upfront_payment_percentage: z.number().min(0).max(100, { message: "Upfront payment percentage must be between 0 and 100" }).optional().nullable(),
  upfront_payment_due_days: z.number().int().min(0, { message: "Upfront payment due days cannot be negative" }).optional().nullable(),
  subsequent_installments_count: z.number().int().min(0, { message: "Subsequent installments count cannot be negative" }).optional().nullable(),
  subsequent_installments_interval_days: z.number().int().min(1, { message: "Subsequent installments interval must be at least 1 day" }).optional().nullable(),
  additional_costs: z.array(AdditionalCostInputSchema).optional().nullable(), // Uses the Zod schema above
  // Ensure all fields from GeneratedPriceQuoteCreateInput are represented here
});

// Corresponds to PriceQuoteUpdateInput in GraphQL
// This Zod schema should match the structure of GeneratedPriceQuoteUpdateInput
export const PriceQuoteUpdateInputSchema = z.object({
  name: z.string().trim().min(1, { message: "Quote name cannot be empty if provided" }).optional().nullable(),
  base_minimum_price_mp: z.number().min(0).optional().nullable(),
  target_markup_percentage: z.number().min(0).optional().nullable(),
  final_offer_price_fop: z.number().min(0).optional().nullable(),
  overall_discount_percentage: z.number().min(0).max(100).optional().nullable(),
  upfront_payment_percentage: z.number().min(0).max(100).optional().nullable(),
  upfront_payment_due_days: z.number().int().min(0).optional().nullable(),
  subsequent_installments_count: z.number().int().min(0).optional().nullable(),
  subsequent_installments_interval_days: z.number().int().min(1).optional().nullable(),
  additional_costs: z.array(AdditionalCostInputSchema).optional().nullable(),
  status: z.string().trim().min(1, { message: "Status cannot be empty if provided"}).optional().nullable(),
  // Ensure all fields from GeneratedPriceQuoteUpdateInput are represented here
  // If PriceQuoteUpdateInput in GraphQL has an `id` field, it should NOT be here 
  // as the ID for update usually comes from args.id, not args.input.id
}).partial(); // .partial() makes all fields optional, which is typical for update inputs. 