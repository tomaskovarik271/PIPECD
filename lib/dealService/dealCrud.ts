import { GraphQLError } from 'graphql';
import { getAuthenticatedClient, handleSupabaseError, recordEntityHistory } from '../serviceUtils';
import type { Deal, DealInput, CustomFieldValueInput } from '../generated/graphql';
import { inngest } from '../inngestClient';

import { processCustomFieldsForCreate, processCustomFieldsForUpdate } from './dealCustomFields';
import { calculateDealProbabilityFields } from './dealProbability';
import { generateDealChanges, TRACKED_DEAL_FIELDS } from './dealHistory';
import { createWFMProject } from '../wfmProjectService';
import type { GraphQLContext } from '../../netlify/functions/graphql/helpers';
import type { User } from '@supabase/supabase-js';

// Interface for the raw deal data selected from the database
export interface DbDeal {
  id: string;
  user_id: string;
  name: string;
  amount?: number | null;
  currency?: string | null;
  amount_usd?: number | null;
  exchange_rate_used?: number | null;
  expected_close_date?: string | null;
  created_at: string;
  updated_at: string;
  person_id?: string | null;
  organization_id?: string | null;
  project_id?: string | null;
  deal_specific_probability?: number | null;
  wfm_project_id?: string | null;
  assigned_to_user_id?: string | null;
  custom_field_values?: Record<string, any> | null; // JSONB field
  // Add other direct columns if selected and needed by resolvers before they resolve complex types
}

// Define a new interface for deal updates at the service layer
export interface DealServiceUpdateData {
  name?: string;
  amount?: number | null;
  currency?: string | null;
  expected_close_date?: string | null; // Keep as string | null from input
  person_id?: string | null;
  organization_id?: string | null;
  deal_specific_probability?: number | null;
  customFields?: CustomFieldValueInput[];
  assigned_to_user_id?: string | null; // Added for assignment
}

// Add filtering interfaces and enhanced query functions after the existing interfaces

// ===============================
// FILTERING INTERFACES
// ===============================

export interface DealFilters {
  // Basic text search
  search?: string;

  // Deal properties
  amountMin?: number;
  amountMax?: number;
  currency?: string;
  expectedCloseDateFrom?: string;
  expectedCloseDateTo?: string;
  createdDateFrom?: string;
  createdDateTo?: string;
  dealSpecificProbabilityMin?: number;
  dealSpecificProbabilityMax?: number;

  // Relationships
  personIds?: string[];
  organizationIds?: string[];
  assignedToUserIds?: string[];
  unassigned?: boolean;

  // WFM/Pipeline filtering
  wfmWorkflowIds?: string[];
  wfmStepIds?: string[];
  wfmStatusIds?: string[];
  wfmProjectTypeIds?: string[];

  // Custom fields filtering
  customFieldFilters?: CustomFieldFilter[];

  // Labels filtering
  labelTexts?: string[];
  labelFilterLogic?: 'AND' | 'OR';

  // Date-based quick filters
  createdToday?: boolean;
  createdThisWeek?: boolean;
  createdThisMonth?: boolean;
  closingToday?: boolean;
  closingThisWeek?: boolean;
  closingThisMonth?: boolean;
  overdue?: boolean;

  // Advanced filters
  hasActivities?: boolean;
  hasCustomFields?: boolean;
  hasPerson?: boolean;
  hasOrganization?: boolean;
}

export interface CustomFieldFilter {
  fieldName: string;
  operator: FieldFilterOperator;
  value: string;
  values?: string[];
}

export type FieldFilterOperator = 
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'CONTAINS'
  | 'NOT_CONTAINS'
  | 'STARTS_WITH'
  | 'ENDS_WITH'
  | 'GREATER_THAN'
  | 'LESS_THAN'
  | 'GREATER_EQUAL'
  | 'LESS_EQUAL'
  | 'IS_NULL'
  | 'IS_NOT_NULL'
  | 'IN'
  | 'NOT_IN'
  | 'BETWEEN';

export interface DealSort {
  field: string;
  direction: 'ASC' | 'DESC';
}

// Mapping from GraphQL enum values to database column names
const SORT_FIELD_MAPPING: Record<string, string> = {
  'NAME': 'name',
  'AMOUNT': 'amount',
  'AMOUNT_USD': 'amount_usd',
  'EXPECTED_CLOSE_DATE': 'expected_close_date',
  'CREATED_AT': 'created_at',
  'UPDATED_AT': 'updated_at',
  'DEAL_SPECIFIC_PROBABILITY': 'deal_specific_probability',
  'WEIGHTED_AMOUNT': 'weighted_amount',
  'PROJECT_ID': 'project_id'
};

export interface DealsQueryOptions {
  filters?: DealFilters;
  sort?: DealSort;
  limit?: number;
  offset?: number;
  includeTotalCount?: boolean;
}

export interface DealsQueryResult {
  deals: DbDeal[];
  totalCount?: number;
  hasNextPage?: boolean;
}

// ===============================
// ENHANCED FILTERING FUNCTIONS
// ===============================

export async function getDealsFiltered(
  userId: string, 
  accessToken: string, 
  options: DealsQueryOptions = {}
): Promise<DealsQueryResult> {
  const supabase = getAuthenticatedClient(accessToken);
  
  // Base query with comprehensive joins for filtering
  let query = supabase
    .from('deals')
    .select(`
      id, user_id, name, amount, currency, amount_usd, exchange_rate_used, 
      expected_close_date, created_at, updated_at, person_id, organization_id, 
      project_id, deal_specific_probability, wfm_project_id, assigned_to_user_id, 
      custom_field_values,
      person:people(id, first_name, last_name, email),
      organization:organizations(id, name),
      wfmProject:wfm_projects(id, name, current_step_id, project_type_id,
        workflow:workflows(id, name),
        projectType:project_types(id, name),
        currentStep:workflow_steps!wfm_projects_current_step_id_fkey(id, step_order, metadata)
      ),
      labels:deal_labels(id, label_text, color_hex)
      ${options.includeTotalCount ? '' : ''}
    `, { count: options.includeTotalCount ? 'exact' : undefined });

  // Apply filters
  if (options.filters) {
    query = applyDealFilters(query, options.filters);
  }

  // Apply sorting
  if (options.sort) {
    const { field, direction } = options.sort;
    // Convert GraphQL enum field name to database column name
    const dbColumnName = SORT_FIELD_MAPPING[field] || field.toLowerCase();
    query = query.order(dbColumnName, { ascending: direction === 'ASC' });
  } else {
    // Default sort by created_at DESC
    query = query.order('created_at', { ascending: false });
  }

  // Apply pagination
  if (options.limit) {
    if (options.offset) {
      query = query.range(options.offset, options.offset + options.limit - 1);
    } else {
      query = query.limit(options.limit);
    }
  }

  const { data, error, count } = await query;
  handleSupabaseError(error, 'fetching filtered deals');

  return {
    deals: (data || []) as DbDeal[],
    totalCount: count || undefined,
    hasNextPage: options.limit ? (data?.length || 0) === options.limit : false
  };
}

// Helper function to apply filters to Supabase query
function applyDealFilters(query: any, filters: DealFilters) {
  // Basic text search across multiple fields
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    query = query.or(`
      name.ilike.%${searchTerm}%,
      person.first_name.ilike.%${searchTerm}%,
      person.last_name.ilike.%${searchTerm}%,
      person.email.ilike.%${searchTerm}%,
      organization.name.ilike.%${searchTerm}%
    `);
  }

  // Amount filters
  if (filters.amountMin !== undefined) {
    query = query.gte('amount', filters.amountMin);
  }
  if (filters.amountMax !== undefined) {
    query = query.lte('amount', filters.amountMax);
  }

  // Currency filter
  if (filters.currency) {
    query = query.eq('currency', filters.currency);
  }

  // Date range filters
  if (filters.expectedCloseDateFrom) {
    query = query.gte('expected_close_date', filters.expectedCloseDateFrom);
  }
  if (filters.expectedCloseDateTo) {
    query = query.lte('expected_close_date', filters.expectedCloseDateTo);
  }
  if (filters.createdDateFrom) {
    query = query.gte('created_at', filters.createdDateFrom);
  }
  if (filters.createdDateTo) {
    query = query.lte('created_at', filters.createdDateTo);
  }

  // Probability filters
  if (filters.dealSpecificProbabilityMin !== undefined) {
    query = query.gte('deal_specific_probability', filters.dealSpecificProbabilityMin);
  }
  if (filters.dealSpecificProbabilityMax !== undefined) {
    query = query.lte('deal_specific_probability', filters.dealSpecificProbabilityMax);
  }

  // Relationship filters
  if (filters.personIds && filters.personIds.length > 0) {
    query = query.in('person_id', filters.personIds);
  }
  if (filters.organizationIds && filters.organizationIds.length > 0) {
    query = query.in('organization_id', filters.organizationIds);
  }
  if (filters.assignedToUserIds && filters.assignedToUserIds.length > 0) {
    query = query.in('assigned_to_user_id', filters.assignedToUserIds);
  }
  if (filters.unassigned) {
    query = query.is('assigned_to_user_id', null);
  }

  // WFM/Pipeline filters - These need to be handled via joins
  if (filters.wfmStepIds && filters.wfmStepIds.length > 0) {
    query = query.in('wfmProject.currentStep.id', filters.wfmStepIds);
  }
  if (filters.wfmProjectTypeIds && filters.wfmProjectTypeIds.length > 0) {
    query = query.in('wfmProject.project_type_id', filters.wfmProjectTypeIds);
  }

  // Quick date filters
  if (filters.createdToday) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    query = query.gte('created_at', today.toISOString())
               .lt('created_at', tomorrow.toISOString());
  }

  if (filters.createdThisWeek) {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    query = query.gte('created_at', startOfWeek.toISOString());
  }

  if (filters.createdThisMonth) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    query = query.gte('created_at', startOfMonth.toISOString());
  }

  if (filters.closingToday) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    query = query.gte('expected_close_date', today.toISOString())
               .lt('expected_close_date', tomorrow.toISOString());
  }

  if (filters.closingThisMonth) {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    query = query.gte('expected_close_date', startOfMonth.toISOString())
               .lte('expected_close_date', endOfMonth.toISOString());
  }

  if (filters.overdue) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    query = query.lt('expected_close_date', today.toISOString())
               .not('expected_close_date', 'is', null);
  }

  // Advanced filters
  if (filters.hasPerson !== undefined) {
    if (filters.hasPerson) {
      query = query.not('person_id', 'is', null);
    } else {
      query = query.is('person_id', null);
    }
  }

  if (filters.hasOrganization !== undefined) {
    if (filters.hasOrganization) {
      query = query.not('organization_id', 'is', null);
    } else {
      query = query.is('organization_id', null);
    }
  }

  if (filters.hasCustomFields !== undefined) {
    if (filters.hasCustomFields) {
      query = query.not('custom_field_values', 'is', null);
    } else {
      query = query.is('custom_field_values', null);
    }
  }

  // Custom field filters - This is complex and may need post-processing
  if (filters.customFieldFilters && filters.customFieldFilters.length > 0) {
    // For now, we'll handle this in post-processing since JSONB querying in Supabase is limited
    console.warn('Custom field filtering will be handled in post-processing');
  }

  // Label filters
  if (filters.labelTexts && filters.labelTexts.length > 0) {
    if (filters.labelFilterLogic === 'AND') {
      // Deal must have ALL specified labels - complex query
      console.warn('AND label filtering will be handled in post-processing');
    } else {
      // Deal must have ANY of the specified labels
      query = query.in('labels.label_text', filters.labelTexts);
    }
  }

  return query;
}

// Apply custom field filters in post-processing
function applyCustomFieldFiltersPostProcess(deals: DbDeal[], filters: CustomFieldFilter[]): DbDeal[] {
  return deals.filter(deal => {
    if (!deal.custom_field_values) return false;
    
    return filters.every(filter => {
      const fieldValue = deal.custom_field_values![filter.fieldName];
      return applyFieldOperator(fieldValue, filter.operator, filter.value, filter.values);
    });
  });
}

// Apply label filters in post-processing for complex logic
function applyLabelFiltersPostProcess(deals: DbDeal[], labelTexts: string[], logic: 'AND' | 'OR' = 'OR'): DbDeal[] {
  return deals.filter(deal => {
    const dealLabels = (deal as any).labels || [];
    const dealLabelTexts = dealLabels.map((label: any) => label.label_text);
    
    if (logic === 'AND') {
      return labelTexts.every(labelText => dealLabelTexts.includes(labelText));
    } else {
      return labelTexts.some(labelText => dealLabelTexts.includes(labelText));
    }
  });
}

function applyFieldOperator(
  fieldValue: any, 
  operator: FieldFilterOperator, 
  value: string, 
  values?: string[]
): boolean {
  switch (operator) {
    case 'EQUALS':
      return fieldValue === value;
    case 'NOT_EQUALS':
      return fieldValue !== value;
    case 'CONTAINS':
      return String(fieldValue || '').toLowerCase().includes(value.toLowerCase());
    case 'NOT_CONTAINS':
      return !String(fieldValue || '').toLowerCase().includes(value.toLowerCase());
    case 'STARTS_WITH':
      return String(fieldValue || '').toLowerCase().startsWith(value.toLowerCase());
    case 'ENDS_WITH':
      return String(fieldValue || '').toLowerCase().endsWith(value.toLowerCase());
    case 'GREATER_THAN':
      return Number(fieldValue) > Number(value);
    case 'LESS_THAN':
      return Number(fieldValue) < Number(value);
    case 'GREATER_EQUAL':
      return Number(fieldValue) >= Number(value);
    case 'LESS_EQUAL':
      return Number(fieldValue) <= Number(value);
    case 'IS_NULL':
      return fieldValue == null;
    case 'IS_NOT_NULL':
      return fieldValue != null;
    case 'IN':
      return values ? values.includes(String(fieldValue)) : false;
    case 'NOT_IN':
      return values ? !values.includes(String(fieldValue)) : true;
    default:
      return true;
  }
}

// Quick filter functions
export async function getMyOpenDeals(userId: string, accessToken: string): Promise<DbDeal[]> {
  const result = await getDealsFiltered(userId, accessToken, {
    filters: {
      assignedToUserIds: [userId],
      // Add filter for open deals (not in final WFM steps)
    }
  });
  return result.deals;
}

export async function getDealsClosingThisMonth(userId: string, accessToken: string): Promise<DbDeal[]> {
  const result = await getDealsFiltered(userId, accessToken, {
    filters: {
      closingThisMonth: true
    }
  });
  return result.deals;
}

export async function getUnassignedDeals(userId: string, accessToken: string): Promise<DbDeal[]> {
  const result = await getDealsFiltered(userId, accessToken, {
    filters: {
      unassigned: true
    }
  });
  return result.deals;
}

export async function searchDeals(
  userId: string, 
  accessToken: string, 
  searchQuery: string, 
  additionalFilters?: DealFilters, 
  limit: number = 20
): Promise<DbDeal[]> {
  const result = await getDealsFiltered(userId, accessToken, {
    filters: {
      search: searchQuery,
      ...additionalFilters
    },
    limit
  });
  return result.deals;
}

// --- Deal CRUD Operations ---

export async function getDeals(userId: string, accessToken: string): Promise<DbDeal[]> {
  // console.log('[dealCrud.getDeals] called for user:', userId);
  const supabase = getAuthenticatedClient(accessToken);
  const { data, error } = await supabase
    .from('deals')
    .select('id, user_id, name, amount, currency, amount_usd, exchange_rate_used, expected_close_date, created_at, updated_at, person_id, organization_id, project_id, deal_specific_probability, wfm_project_id, assigned_to_user_id, custom_field_values')
    .order('created_at', { ascending: false });

  handleSupabaseError(error, 'fetching deals');
  return (data || []) as DbDeal[];
}

export async function getDealById(userId: string, id: string, accessToken:string): Promise<DbDeal | null> {
  // console.log('[dealCrud.getDealById] called for user:', userId, 'id:', id);
  const supabase = getAuthenticatedClient(accessToken);
  const { data, error } = await supabase
    .from('deals')
    .select('id, user_id, name, amount, currency, amount_usd, exchange_rate_used, expected_close_date, created_at, updated_at, person_id, organization_id, project_id, deal_specific_probability, wfm_project_id, assigned_to_user_id, custom_field_values')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') { 
     handleSupabaseError(error, 'fetching deal by ID');
  }
  return data as DbDeal | null;
}

export async function createDeal(userId: string, input: DealInput, accessToken: string): Promise<DbDeal> {
  // console.log('[dealCrud.createDeal] called for user:', userId /*, 'input:', JSON.stringify(input, null, 2)*/);
  const supabase = getAuthenticatedClient(accessToken);
  
  let { customFields, wfmProjectTypeId, assignedToUserId, ...dealCoreData } = input; 

  // Handle auto-default project type resolution for AI-created deals
  if (wfmProjectTypeId === 'AUTO_DEFAULT_SALES_DEAL') {
    // console.log('[dealCrud.createDeal] Resolving AUTO_DEFAULT_SALES_DEAL to actual project type...');
    const { data: salesDealProjectType, error: projectTypeLookupError } = await supabase
      .from('project_types')
      .select('id')
      .eq('name', 'Sales Deal')
      .single();
    
    if (projectTypeLookupError || !salesDealProjectType) {
      console.error('[dealCrud.createDeal] Failed to find Sales Deal project type:', projectTypeLookupError);
      throw new GraphQLError('Default Sales Deal project type not found. Please contact administrator.', { extensions: { code: 'CONFIGURATION_ERROR' } });
    }
    
    wfmProjectTypeId = salesDealProjectType.id;
          // console.log(`[dealCrud.createDeal] Resolved AUTO_DEFAULT_SALES_DEAL to: ${wfmProjectTypeId}`);
  }

  if (!wfmProjectTypeId) {
    throw new GraphQLError('wfmProjectTypeId is required to create a deal.', { extensions: { code: 'BAD_USER_INPUT' } });
  }
  
  const processedCustomFields = await processCustomFieldsForCreate(customFields, supabase);
  
  const explicitDealCoreData: any = {
    name: dealCoreData.name,
    amount: dealCoreData.amount,
    currency: dealCoreData.currency,
    expected_close_date: dealCoreData.expected_close_date,
    person_id: dealCoreData.person_id,
    organization_id: dealCoreData.organization_id,
    deal_specific_probability: dealCoreData.deal_specific_probability,
  };

  const finalDealInsertPayload: any = {
    ...explicitDealCoreData,
    user_id: userId,
    assigned_to_user_id: assignedToUserId || null,
    custom_field_values: processedCustomFields,
    wfm_project_id: null, 
  };

  const { data: newDealRecord, error: dealCreateError } = await supabase
    .from('deals')
    .insert(finalDealInsertPayload)
    .select('id, user_id, name, amount, currency, amount_usd, exchange_rate_used, expected_close_date, created_at, updated_at, person_id, organization_id, project_id, deal_specific_probability, wfm_project_id, assigned_to_user_id, custom_field_values')
    .single();

  handleSupabaseError(dealCreateError, 'creating deal');
  if (!newDealRecord) {
      throw new GraphQLError('Failed to create deal, no data returned', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
  }

  // ---- WFM Project Creation and Linking ----
  let wfmProjectIdToLink: string | null = null;
  try {
    // console.log(`[dealCrud.createDeal] Preparing to create WFMProject for deal ${newDealRecord.id} with project type ID: ${wfmProjectTypeId}`);

    // 1. Fetch the WFMProjectType to get its default workflow_id
    const { data: projectTypeData, error: projectTypeError } = await supabase
        .from('project_types')
        .select('id, name, default_workflow_id')
        .eq('id', wfmProjectTypeId)
        .single();

    handleSupabaseError(projectTypeError, `fetching WFM project type ${wfmProjectTypeId}`);
    if (!projectTypeData || !projectTypeData.default_workflow_id) {
        throw new GraphQLError(`WFM Project Type ${wfmProjectTypeId} not found or has no default workflow.`, { extensions: { code: 'BAD_USER_INPUT' } });
    }
    const defaultWorkflowId = projectTypeData.default_workflow_id;
    // console.log(`[dealCrud.createDeal] Found default workflow ID: ${defaultWorkflowId} for project type ${projectTypeData.name}`);

    // 2. Fetch the initial step for that workflow
    const { data: initialStepData, error: initialStepError } = await supabase
        .from('workflow_steps')
        .select('id, step_order')
        .eq('workflow_id', defaultWorkflowId)
        .eq('is_initial_step', true)
        .order('step_order', { ascending: true })
        .limit(1)
        .single();

    handleSupabaseError(initialStepError, `fetching initial step for workflow ${defaultWorkflowId}`);
    if (!initialStepData || !initialStepData.id) {
        throw new GraphQLError(`No initial step found for workflow ${defaultWorkflowId}. Cannot create WFM Project.`, { extensions: { code: 'CONFIGURATION_ERROR' } });
    }
    const initialStepIdForWfmProject = initialStepData.id;
    // console.log(`[dealCrud.createDeal] Found initial step ID: ${initialStepIdForWfmProject} for workflow ${defaultWorkflowId}`);

    // 3. Create the WFMProject
    const placeholderUser: User = {
        id: userId,
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
    };

    const gqlContextForService = {
        supabaseClient: supabase, 
        currentUser: placeholderUser,
        token: accessToken, 
        userPermissions: [], 
        request: new Request('http://localhost'),
        params: {},
        waitUntil: (() => {}) as any,
    } as GraphQLContext;

    const newWfmProject = await createWFMProject(
        {
            name: `WFM for Deal: ${newDealRecord.name}`,
            projectTypeId: wfmProjectTypeId, 
            workflowId: defaultWorkflowId,
            initialStepId: initialStepIdForWfmProject,
            createdByUserId: userId, 
        },
        gqlContextForService
    );

    if (!newWfmProject || !newWfmProject.id) {
        throw new Error('WFM Project creation did not return an ID.');
    }
    wfmProjectIdToLink = newWfmProject.id;
            // console.log(`[dealCrud.createDeal] WFMProject created with ID: ${wfmProjectIdToLink} for deal ${newDealRecord.id}. Attempting to link.`);

    // 4. Update the deal record with the new wfm_project_id
    const { data: updatedDealWithWfmLink, error: linkError } = await supabase
      .from('deals')
      .update({ wfm_project_id: wfmProjectIdToLink })
      .eq('id', newDealRecord.id)
      .select('*')
      .single();

    if (linkError) {
      console.error(`[dealCrud.createDeal] Error linking WFMProject ${wfmProjectIdToLink} to deal ${newDealRecord.id}:`, linkError);
      throw new GraphQLError(`Failed to link WFM Project to deal: ${linkError.message}`, { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
    if (!updatedDealWithWfmLink) {
        throw new GraphQLError('Failed to update deal with WFM project link, no data returned.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
    
    // console.log(`[dealCrud.createDeal] Deal ${newDealRecord.id} successfully linked to WFMProject ${wfmProjectIdToLink}.`);
    
    // Record history for deal creation (using the *final* updated deal record)
    const initialChangesForHistory: Record<string, { oldValue: any; newValue: any }> = 
      generateDealChanges({} as unknown as Deal, updatedDealWithWfmLink as unknown as Deal);
    await recordEntityHistory(
        supabase, 
        'deal_history', 
        'deal_id', 
        updatedDealWithWfmLink.id, 
        userId, 
        'DEAL_CREATED', 
        initialChangesForHistory
    );
    
    // ---- BUSINESS RULES INTEGRATION ----
    // Trigger business rules for deal creation
    try {
      const { data: businessRulesResult, error: businessRulesError } = await supabase
        .rpc('process_business_rules', {
          p_entity_type: 'DEAL',
          p_entity_id: updatedDealWithWfmLink.id,
          p_trigger_event: 'DEAL_CREATED',
          p_entity_data: JSON.stringify(updatedDealWithWfmLink),
          p_change_data: JSON.stringify(initialChangesForHistory)
        });
      
      if (businessRulesError) {
        console.error(`[dealCrud.createDeal] Business rules processing failed for deal ${updatedDealWithWfmLink.id}:`, businessRulesError.message);
        // Don't throw - business rules failure shouldn't break deal creation
      } else if (businessRulesResult) {
        console.log(`[dealCrud.createDeal] Business rules processed for deal ${updatedDealWithWfmLink.id}:`, businessRulesResult);
      }
    } catch (businessRulesException: any) {
      console.error(`[dealCrud.createDeal] Business rules processing exception for deal ${updatedDealWithWfmLink.id}:`, businessRulesException.message);
      // Don't throw - business rules failure shouldn't break deal creation
    }
    // ---- END BUSINESS RULES INTEGRATION ----
    
    // Send Inngest event
    try {
        await inngest.send({
            name: 'crm/deal.created',
            user: { id: userId }, 
            data: { dealId: updatedDealWithWfmLink.id, /* other relevant data */ },
        });
        // console.log(`[dealCrud.createDeal] Sent 'crm/deal.created' event for deal ID: ${updatedDealWithWfmLink.id}`);

        // ---- Send 'crm/deal.assigned' event if assigned_to_user_id is present ----
        if (updatedDealWithWfmLink.assigned_to_user_id) {
            try {
                await inngest.send({
                    name: 'crm/deal.assigned',
                    user: { id: userId }, // User who performed the action (created the deal)
                    data: {
                        dealId: updatedDealWithWfmLink.id,
                        dealName: updatedDealWithWfmLink.name,
                        assignedToUserId: updatedDealWithWfmLink.assigned_to_user_id,
                        assignedByUserId: userId,
                    },
                });
                // console.log(`[dealCrud.createDeal] Sent 'crm/deal.assigned' event for deal ID: ${updatedDealWithWfmLink.id} assigned to ${updatedDealWithWfmLink.assigned_to_user_id}`);
            } catch (assignEventError: any) {
                console.error(`[dealCrud.createDeal] Failed to send 'crm/deal.assigned' event for deal ID: ${updatedDealWithWfmLink.id}:`, assignEventError.message);
                // Do not let Inngest failure roll back the deal creation
            }
        }
        // ---- End 'crm/deal.assigned' event ----

    } catch (eventError: any) {
        console.error(`[dealCrud.createDeal] Failed to send 'crm/deal.created' event for deal ID: ${updatedDealWithWfmLink.id}:`, eventError.message);
        // Do not let Inngest failure roll back the deal creation
    }
        
    return updatedDealWithWfmLink as DbDeal; // Return the fully updated deal, cast to DbDeal

  } catch (wfmError: any) {
    console.error(`[dealCrud.createDeal] CRITICAL: Failed to create or link WFMProject for deal ${newDealRecord.id}. Error: ${wfmError.message}`, wfmError);
    // Rollback or compensation logic might be needed here if the deal was created but WFM project failed.
    // For now, re-throwing to make the entire mutation fail.
    throw new GraphQLError(`Failed to create/link WFM system for deal: ${wfmError.message}`, {
      extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: wfmError }
    });
  }
}

export async function updateDeal(userId: string, id: string, input: DealServiceUpdateData, accessToken: string): Promise<DbDeal | null> {
  // console.log('[dealCrud.updateDeal] called for user:', userId, 'id:', id /*, 'input:', JSON.stringify(input, null, 2)*/);
  const supabase = getAuthenticatedClient(accessToken); 

  const oldDealData = await getDealById(userId, id, accessToken);
  if (!oldDealData) {
      throw new GraphQLError('Deal not found for update. Original deal data could not be fetched.', { extensions: { code: 'NOT_FOUND' } });
  }
  
  let userPermissions: string[] = [];
  try {
    const { data: permissionsData, error: permissionsError } = await supabase.rpc('get_user_permissions', { p_user_id: userId });
    if (permissionsError) {
      console.warn(`[dealCrud.updateDeal] Failed to fetch user permissions for ${userId}:`, permissionsError.message);
    } else if (permissionsData && Array.isArray(permissionsData)) {
      userPermissions = permissionsData.map(p => `${p.resource}:${p.action}`);
    }
  } catch (e: any) {
    console.warn(`[dealCrud.updateDeal] Exception fetching user permissions for ${userId}:`, e.message);
  }
  
  const hasAssignAny = userPermissions.includes('deal:assign_any');

  const { customFields: inputCustomFields, assigned_to_user_id: newAssigneeIdInput, ...otherCoreInputFieldsFromInput } = input;
  const serviceDataForDirectUpdate: Partial<DbDeal> = { ...otherCoreInputFieldsFromInput } as Partial<DbDeal>; // Cast for properties
  let assignmentWillBeChangedViaRpc = false;
  let assignmentChangedViaRpcSuccessfully = false;

  // Determine if assignment needs to be handled by RPC
  if (Object.prototype.hasOwnProperty.call(input, 'assigned_to_user_id') && !hasAssignAny) {
    assignmentWillBeChangedViaRpc = true;
  } else if (Object.prototype.hasOwnProperty.call(input, 'assigned_to_user_id') && hasAssignAny) {
    // Admin with 'assign_any' can have assignment handled by the general update
    serviceDataForDirectUpdate.assigned_to_user_id = newAssigneeIdInput;
  }

  // Prepare the core database update payload, excluding custom fields and potentially assignment for now
  const dbDataForDirectUpdate: Partial<DbDeal> = { ...serviceDataForDirectUpdate }; // Type changed from any

  if (serviceDataForDirectUpdate.expected_close_date !== undefined) {
    dbDataForDirectUpdate.expected_close_date = convertToDateOrNull(serviceDataForDirectUpdate.expected_close_date);
  }
  if (serviceDataForDirectUpdate.deal_specific_probability !== undefined) {
    dbDataForDirectUpdate.deal_specific_probability = serviceDataForDirectUpdate.deal_specific_probability;
  }

  let processedCustomFieldsForUpdate: Record<string, any> | null = null;
  if (inputCustomFields && Array.isArray(inputCustomFields) && inputCustomFields.length > 0) {
    const updateResult = await processCustomFieldsForUpdate(
        oldDealData.custom_field_values || {}, // currentDbCustomFieldValues
        inputCustomFields, // customFieldsInput
        supabase
    );
    processedCustomFieldsForUpdate = updateResult.finalCustomFieldValues;

    if (processedCustomFieldsForUpdate && Object.keys(processedCustomFieldsForUpdate).length > 0) {
        dbDataForDirectUpdate.custom_field_values = processedCustomFieldsForUpdate;
    }
  }
  
  const tempMergedDataForCalc = { 
    ...(oldDealData || {}),
    ...dbDataForDirectUpdate,
    assigned_to_user_id: assignmentWillBeChangedViaRpc 
        ? oldDealData.assigned_to_user_id // For calc, use current assignee if RPC will change it later
        : (dbDataForDirectUpdate.assigned_to_user_id !== undefined 
            ? dbDataForDirectUpdate.assigned_to_user_id 
            : oldDealData?.assigned_to_user_id)
  } as DbDeal;

  // Prepare a minimal oldDealData object for calculateDealProbabilityFields
  // containing only the fields it actually uses from the 'Deal' type definition.
  const oldDealDataForProbCalc: Partial<Deal> = {
    id: tempMergedDataForCalc.id,
    wfm_project_id: tempMergedDataForCalc.wfm_project_id,
    deal_specific_probability: tempMergedDataForCalc.deal_specific_probability,
    amount: tempMergedDataForCalc.amount,
    // Ensure all fields used by calculateDealProbabilityFields from oldDealData are present here
  };

  // Prepare a minimal updateInput object for calculateDealProbabilityFields
  const updateInputForProbCalc: Partial<Omit<DealInput, 'stage_id' | 'pipeline_id'>> = {
    amount: dbDataForDirectUpdate.amount,
    deal_specific_probability: dbDataForDirectUpdate.deal_specific_probability,
  };

  const { deal_specific_probability_to_set /*, weighted_amount_to_set */ } = await calculateDealProbabilityFields(
    updateInputForProbCalc, // Pass the refined, minimal input object
    oldDealDataForProbCalc as Deal, // Pass the safer, minimal old deal data object
    supabase
  );

  if (deal_specific_probability_to_set !== undefined) {
    dbDataForDirectUpdate.deal_specific_probability = deal_specific_probability_to_set;
  }
  // weighted_amount is not a direct DB column, so it's not set here.
  // It's calculated by a GraphQL resolver.

  // Perform direct update for non-assignment fields first if there are any
  const fieldsInDbDataForDirectUpdate = Object.keys(dbDataForDirectUpdate).filter(k => 
    k !== 'custom_field_values' || (dbDataForDirectUpdate.custom_field_values && Object.keys(dbDataForDirectUpdate.custom_field_values).length > 0)
  );

  if (fieldsInDbDataForDirectUpdate.length > 0) {
      dbDataForDirectUpdate.updated_at = new Date().toISOString();
      // console.log('[dealCrud.updateDeal] Step 1: Direct DB update payload (pre-RPC):', JSON.stringify(dbDataForDirectUpdate, null, 2));
      const { error: directUpdateError } = await supabase
        .from('deals')
        .update(dbDataForDirectUpdate)
        .eq('id', id)
        .select('id') // only select id, we refetch later
        .single();
              // console.log('[dealCrud.updateDeal] Step 1: Supabase direct update result - error:', directUpdateError ? directUpdateError.message : null);
      handleSupabaseError(directUpdateError, 'updating deal (direct fields) in DB');
  }

  // Now, handle assignment via RPC if needed for non-admins
  if (assignmentWillBeChangedViaRpc) {
          // console.log(`[dealCrud.updateDeal] Step 2: User ${userId} (non-admin) changing assignment for deal ${id}. Using RPC.`);
    const { error: rpcError } = await supabase.rpc('reassign_deal', {
      p_deal_id: id,
      p_new_assignee_id: newAssigneeIdInput,
      p_current_user_id: userId
    });
    if (rpcError) {
      console.error(`[dealCrud.updateDeal] Step 2: RPC reassign_deal failed for deal ${id}, user ${userId}:`, rpcError);
      if (rpcError.code === '42501') {
          throw new GraphQLError(rpcError.message || 'Forbidden: Could not reassign deal via RPC due to permission constraints.', { extensions: { code: 'FORBIDDEN', originalError: rpcError } });
      } else if (rpcError.code === 'P0002') {
            throw new GraphQLError(rpcError.message || 'Not found: Deal not found during RPC reassignment.', { extensions: { code: 'NOT_FOUND', originalError: rpcError } });
      }
      handleSupabaseError(rpcError, 'reassigning deal via RPC');
    }
    assignmentChangedViaRpcSuccessfully = true;
  }
  
  // Check if any update actually happened (either direct or RPC)
  const noDirectFieldsWereUpdated = fieldsInDbDataForDirectUpdate.length === 0;
  if (noDirectFieldsWereUpdated && !assignmentChangedViaRpcSuccessfully) {
    console.warn('[dealCrud.updateDeal] No fields provided for deal update, and no assignment change attempted or succeeded via RPC.');
    // If absolutely no changes were made or attempted, we might throw or just return oldDealData.
    // For now, we will refetch and rely on history generation to see if anything changed.
  }

  // Refetch the deal to get its absolute latest state, especially if assignment was changed by RPC or only history was recorded.
  const updatedDealRecord = await getDealById(userId, id, accessToken);
  if (!updatedDealRecord) {
    // This could happen if the RPC call reassigned the deal away from the user and they are not the creator,
    // and they are trying to read it immediately after. 
    console.warn(`[dealCrud.updateDeal] User ${userId} cannot retrieve deal ${id} after update operation. This is likely due to RLS if assignment changed visibility. The DB updates should have succeeded. Returning null from service.`);
    // If any DB operations (direct or RPC) actually failed, an error would have been thrown before this point.
    // So, reaching here implies DB writes were likely successful, but the user lost visibility.
    // Returning null allows the GraphQL mutation to resolve with null for the deal, which is a valid GQL pattern.
    return null; 
  }

  // Record history if there were changes
  if (oldDealData) { // oldDealData is guaranteed to be non-null here due to the initial check
    
    // Prepare objects for history generation, picking only tracked fields
    const oldDataForHistory: Partial<Deal> = {};
    const finalDataForHistory: Partial<Deal> = {};

    TRACKED_DEAL_FIELDS.forEach(key => {
      // Type assertion needed as keyof Deal | 'custom_field_values' | 'assigned_to_user_id'
      // might not be seen as a direct key of DbDeal by TS in all cases, even though they are.
      const fieldKey = key as keyof DbDeal; 
      if (Object.prototype.hasOwnProperty.call(oldDealData, fieldKey)) {
        (oldDataForHistory as any)[key] = oldDealData[fieldKey];
      }
      if (Object.prototype.hasOwnProperty.call(updatedDealRecord, fieldKey)) {
        (finalDataForHistory as any)[key] = updatedDealRecord[fieldKey];
      }
    });

    // The 'as Deal' cast is now safer as we are passing objects that only contain
    // fields explicitly listed in TRACKED_DEAL_FIELDS, which generateDealChanges is designed to handle.
    const changes = generateDealChanges(oldDataForHistory as Deal, finalDataForHistory as Deal);
    if (Object.keys(changes).length > 0) {
        await recordEntityHistory(supabase, 'deal_history', 'deal_id', id, userId, 'DEAL_UPDATED', changes);
        
        // ---- BUSINESS RULES INTEGRATION ----
        // Trigger business rules for deal updates
        try {
          const { data: businessRulesResult, error: businessRulesError } = await supabase
            .rpc('process_business_rules', {
              p_entity_type: 'DEAL',
              p_entity_id: id,
              p_trigger_event: 'DEAL_UPDATED',
              p_entity_data: JSON.stringify(finalDataForHistory),
              p_change_data: JSON.stringify(changes)
            });
          
          if (businessRulesError) {
            console.error(`[dealCrud.updateDeal] Business rules processing failed for deal ${id}:`, businessRulesError.message);
            // Don't throw - business rules failure shouldn't break deal updates
          } else if (businessRulesResult) {
            console.log(`[dealCrud.updateDeal] Business rules processed for deal ${id}:`, businessRulesResult);
          }
        } catch (businessRulesException: any) {
          console.error(`[dealCrud.updateDeal] Business rules processing exception for deal ${id}:`, businessRulesException.message);
          // Don't throw - business rules failure shouldn't break deal updates
        }
        // ---- END BUSINESS RULES INTEGRATION ----
    }
  }
  
  // ---- Send 'crm/deal.assigned' event if assigned_to_user_id changed ----
  if (oldDealData.assigned_to_user_id !== updatedDealRecord.assigned_to_user_id && updatedDealRecord.assigned_to_user_id) {
    try {
        await inngest.send({
            name: 'crm/deal.assigned',
            user: { id: userId }, // User who performed the action (updated the deal)
            data: {
                dealId: updatedDealRecord.id,
                dealName: updatedDealRecord.name,
                assignedToUserId: updatedDealRecord.assigned_to_user_id,
                assignedByUserId: userId,
                previousAssignedToUserId: oldDealData.assigned_to_user_id || null, // Ensure it's null if undefined
            },
        });
        // console.log(`[dealCrud.updateDeal] Sent 'crm/deal.assigned' event for deal ID: ${updatedDealRecord.id} reassigned to ${updatedDealRecord.assigned_to_user_id}`);
    } catch (assignEventError: any) {
        console.error(`[dealCrud.updateDeal] Failed to send 'crm/deal.assigned' event for deal ID: ${updatedDealRecord.id}:`, assignEventError.message);
        // Do not let Inngest failure roll back the deal update
    }
  }
  // ---- End 'crm/deal.assigned' event ----

  // Re-fetch the deal to get its absolute latest state including any WFM or probability updates triggered by other logic.
  // This is important because calculateDealProbabilityFields might rely on joined WFM data not present in the direct updatedDealRecord.
  const finalDealData = await getDealById(userId, id, accessToken);
   if (!finalDealData) {
       // This scenario (deal disappearing after update and before re-fetch) should be rare but needs handling.
       console.warn(`[dealCrud.updateDeal] Deal ${id} could not be re-fetched after update. Returning potentially stale data.`);
       return updatedDealRecord as DbDeal; // Fallback to the record from the update operation.
   }

  // Calculate probability and update if necessary, using the re-fetched finalDealData
  const probabilityFields = await calculateDealProbabilityFields(finalDealData as unknown as DealInput, finalDealData as unknown as Deal, supabase, undefined /* no targetWfmStepMetadata needed for general update */);
  
  // Check if probabilityFields has own properties to update, as it might return an empty object or fields set to undefined/null
  const hasProbabilityUpdate = probabilityFields && 
                             (Object.prototype.hasOwnProperty.call(probabilityFields, 'deal_specific_probability_to_set') || 
                              Object.prototype.hasOwnProperty.call(probabilityFields, 'weighted_amount_to_set'));

  if (hasProbabilityUpdate) {
    const updateDataForProbability: { deal_specific_probability?: number | null, weighted_amount?: number | null } = {};
    if (Object.prototype.hasOwnProperty.call(probabilityFields, 'deal_specific_probability_to_set')) {
      updateDataForProbability.deal_specific_probability = probabilityFields.deal_specific_probability_to_set;
    }
    if (Object.prototype.hasOwnProperty.call(probabilityFields, 'weighted_amount_to_set')) {
      updateDataForProbability.weighted_amount = probabilityFields.weighted_amount_to_set;
    }

    // Only update if there's something to update, and it's different from current values if needed (though service handles this)
    if (Object.keys(updateDataForProbability).length > 0) {
        const { data: _, error: probUpdateError } = await supabase
            .from('deals')
            .update(updateDataForProbability)
            .eq('id', id);

        if (probUpdateError) {
            console.warn(`[dealCrud.updateDeal] Failed to update probability fields for deal ${id}:`, probUpdateError.message);
            // Not throwing, as main update succeeded
        }
        // After updating probability, re-fetch one last time to ensure the returned object has all latest data.
        const dealAfterProbabilityUpdate = await getDealById(userId, id, accessToken);
        return (dealAfterProbabilityUpdate || finalDealData) as DbDeal; // Prefer freshest, fallback to before prob update
    }
  }
  
  return finalDealData as DbDeal; 
}

export async function deleteDeal(userId: string, id: string, accessToken: string): Promise<boolean> {
  // console.log('[dealCrud.deleteDeal] called for user:', userId, 'id:', id);
  const supabase = getAuthenticatedClient(accessToken);
  
  const { error, count } = await supabase
    .from('deals')
    .delete()
    .eq('id', id);

  handleSupabaseError(error, 'deleting deal');
  
  if (!error) {
    await recordEntityHistory(
      supabase,
      'deal_history',
      'deal_id',
      id,
      userId,
      'DEAL_DELETED',
      { deleted_deal_id: id }
    );
  }
  
      // console.log('[dealCrud.deleteDeal] Deleted count (informational):', count);
  return !error;
}

// Helper function (ensure it's defined in your project, possibly in serviceUtils or a permissions helper file)
// This is a placeholder for where you'd get actual permissions.
// In a real setup, this might involve an RPC call to a function that joins user_roles, role_permissions, and permissions tables.
async function getUserPermissions(userId: string, supabaseClient: any): Promise<string[]> {
    // Example: return ['deal:update_own', 'deal:assign_own'];
    // Replace with actual permission fetching logic, e.g., an RPC call
    try {
        const { data, error } = await supabaseClient.rpc('get_user_permissions', { p_user_id: userId });
        if (error) {
            console.error('Error fetching user permissions:', error);
            return [];
        }
        return data ? data.map((p: { resource: string; action: string }) => `${p.resource}:${p.action}`) : [];
    } catch (e) {
        console.error('Exception fetching user permissions:', e);
        return [];
    }
}

function convertToDateOrNull(dateString: string | null | undefined): string | null {
    if (!dateString) return null;
    try {
        return new Date(dateString).toISOString();
    } catch (e) {
        console.warn(`Invalid date string for conversion: ${dateString}`);
        return null; // Or handle error as appropriate
    }
} 