import { z } from 'zod';

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
  currency: z.string().length(3, { message: "Currency must be a 3-letter ISO code" }).optional().nullable(),
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

// Activity validators removed - using Google Calendar integration instead

