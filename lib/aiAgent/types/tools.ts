/**
 * Tool-specific type definitions for PipeCD AI Agent
 * 
 * Types for tool parameters, responses, and domain-specific data structures
 */

// ================================
// Base Tool Types
// ================================

export interface ToolExecutionContext {
  authToken?: string;
  userId?: string;
  conversationId?: string;
  requestId?: string;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  message: string;
  metadata?: {
    executionTime?: number;
    toolName: string;
    parameters: Record<string, any>;
    timestamp: string;
  };
}

export interface ToolError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// ================================
// Domain-Specific Parameter Types  
// ================================

// Deal Tools
export interface SearchDealsParams {
  search_term?: string;
  assigned_to?: string;
  min_amount?: number;
  max_amount?: number;
  limit?: number;
}

export interface CreateDealParams {
  name: string;
  organization_id?: string;
  primary_contact_id?: string;
  value?: number;
  stage?: string;
  priority?: string;
  description?: string;
  source?: string;
  deal_type?: string;
  close_date?: string;
  custom_fields?: CustomFieldValue[];
}

export interface UpdateDealParams {
  deal_id: string;
  name?: string;
  amount?: number;
  person_id?: string;
  organization_id?: string;
  expected_close_date?: string;
  assigned_to_user_id?: string;
}

export interface GetDealDetailsParams {
  deal_id: string;
}

// Organization Tools
export interface SearchOrganizationsParams {
  search_term: string;
  limit?: number;
}

export interface CreateOrganizationParams {
  name: string;
  address?: string;
  notes?: string;
}

export interface UpdateOrganizationParams {
  organization_id: string;
  name?: string;
  address?: string;
  notes?: string;
}

export interface GetOrganizationDetailsParams {
  organization_id: string;
}

// Contact Tools
export interface SearchContactsParams {
  search_term: string;
  organization_id?: string;
  limit?: number;
}

export interface CreateContactParams {
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  organization_id?: string;
  notes?: string;
}

export interface UpdateContactParams {
  person_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  organization_id?: string;
  notes?: string;
}

export interface GetContactDetailsParams {
  person_id: string;
}

// Activity Tools
export interface SearchActivitiesParams {
  deal_id?: string;
  person_id?: string;
  organization_id?: string;
  is_done?: boolean;
  limit?: number;
}

export interface CreateActivityParams {
  type: 'TASK' | 'MEETING' | 'CALL' | 'EMAIL' | 'DEADLINE' | 'SYSTEM_TASK';
  subject: string;
  due_date?: string;
  notes?: string;
  is_done?: boolean;
  deal_id?: string;
  person_id?: string;
  organization_id?: string;
}

export interface UpdateActivityParams {
  activity_id: string;
  type?: 'TASK' | 'MEETING' | 'CALL' | 'EMAIL' | 'DEADLINE' | 'SYSTEM_TASK';
  subject?: string;
  due_date?: string;
  notes?: string;
  is_done?: boolean;
  deal_id?: string;
  person_id?: string;
  organization_id?: string;
}

export interface GetActivityDetailsParams {
  activity_id: string;
}

export interface CompleteActivityParams {
  activity_id: string;
  completion_notes?: string;
}

// Custom Field Tools
export interface GetCustomFieldDefinitionsParams {
  entity_type: 'DEAL' | 'PERSON' | 'ORGANIZATION';
  include_inactive?: boolean;
}

export interface CreateCustomFieldDefinitionParams {
  entity_type: 'DEAL' | 'PERSON' | 'ORGANIZATION';
  field_name: string;
  field_label: string;
  field_type: 'TEXT' | 'NUMBER' | 'DATE' | 'BOOLEAN' | 'DROPDOWN' | 'MULTI_SELECT';
  is_required?: boolean;
  dropdown_options?: Array<{ value: string; label: string }>;
  display_order?: number;
}

export interface GetEntityCustomFieldsParams {
  entity_type: 'DEAL' | 'PERSON' | 'ORGANIZATION';
  entity_id: string;
}

export interface SetEntityCustomFieldsParams {
  entity_type: 'DEAL' | 'PERSON' | 'ORGANIZATION';
  entity_id: string;
  custom_fields: CustomFieldValue[];
}

export interface CustomFieldValue {
  definitionId: string;
  stringValue?: string;
  numberValue?: number;
  booleanValue?: boolean;
  dateValue?: string;
  selectedOptionValues?: string[];
}

// User Tools
export interface SearchUsersParams {
  search_term: string;
  limit?: number;
}

// ================================
// Response Data Types
// ================================

export interface DealData {
  id: string;
  name: string;
  amount?: number;
  stage?: string;
  status: string;
  priority?: string;
  description?: string;
  source?: string;
  deal_type?: string;
  expected_close_date?: string;
  created_at: string;
  updated_at: string;
  organization?: {
    id: string;
    name: string;
  };
  primaryContact?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  assignedToUser?: {
    id: string;
    display_name: string;
    email: string;
  };
  customFieldValues?: CustomFieldValueData[];
}

export interface OrganizationData {
  id: string;
  name: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  deals?: DealData[];
  people?: ContactData[];
  customFieldValues?: CustomFieldValueData[];
}

export interface ContactData {
  id: string;
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  notes?: string;
  organization?: {
    id: string;
    name: string;
  };
  customFieldValues?: CustomFieldValueData[];
}

export interface ActivityData {
  id: string;
  type: string;
  subject: string;
  due_date?: string;
  notes?: string;
  is_done: boolean;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  deal?: {
    id: string;
    name: string;
  };
  person?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  organization?: {
    id: string;
    name: string;
  };
}

export interface CustomFieldDefinitionData {
  id: string;
  entityType: string;
  fieldName: string;
  fieldLabel: string;
  fieldType: string;
  isRequired: boolean;
  isActive: boolean;
  displayOrder: number;
  dropdownOptions?: Array<{ value: string; label: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface CustomFieldValueData {
  definition: {
    id: string;
    fieldName: string;
    fieldLabel: string;
    fieldType: string;
  };
  stringValue?: string;
  numberValue?: number;
  booleanValue?: boolean;
  dateValue?: string;
  selectedOptionValues?: string[];
}

export interface UserData {
  id: string;
  display_name: string;
  email: string;
  role?: string;
}

// ================================
// Tool Category Definitions
// ================================

export type ToolCategory = 
  | 'deals'
  | 'organizations' 
  | 'contacts'
  | 'activities'
  | 'customFields'
  | 'users'
  | 'workflow';

export interface ToolDefinition {
  name: string;
  category: ToolCategory;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
} 