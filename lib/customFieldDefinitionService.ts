import { SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { GraphQLError } from 'graphql'; // Import GraphQLError
import {
  CustomFieldDefinition as GraphQLCustomFieldDefinition,
  CustomFieldDefinitionInput as GraphQLCustomFieldDefinitionInput,
  CustomFieldEntityType as GraphQLCustomFieldEntityType,
  CustomFieldOption as GraphQLCustomFieldOption,
  CustomFieldOptionInput as GraphQLCustomFieldOptionInput,
  CustomFieldType as GraphQLCustomFieldType,
} from './generated/graphql'; // Assuming relative path to generated types
import { handleSupabaseError } from './serviceUtils';

// Database table name
const CUSTOM_FIELD_DEFINITIONS_TABLE = 'custom_field_definitions';

// Helper to map DB row to GraphQL type
const mapDbDefinitionToGraphQL = (dbDef: any): GraphQLCustomFieldDefinition => {
  // Ensure all fields expected by GraphQLCustomFieldDefinition are present and correctly typed.
  // GQL NonNullable fields: id, entityType, fieldName, fieldLabel, fieldType, isRequired, isActive, displayOrder, createdAt, updatedAt

  const mappedData = {
    id: dbDef.id,
    entityType: dbDef.entity_type as GraphQLCustomFieldEntityType,
    fieldName: dbDef.field_name,
    fieldLabel: dbDef.field_label,
    fieldType: dbDef.field_type as GraphQLCustomFieldType,
    isRequired: dbDef.is_required ?? false, // Default if null, though DB should prevent null
    dropdownOptions: null, // Will be populated below
    isActive: dbDef.is_active ?? true,     // Default if null, though DB should prevent null
    displayOrder: dbDef.display_order ?? 0, // Default if null, though DB should prevent null
    createdAt: dbDef.created_at,
    updatedAt: dbDef.updated_at,
  };

  // Explicitly check critical non-nullable fields that don't have defaults in this mapping
  const criticalFields: Array<keyof Pick<GraphQLCustomFieldDefinition, 'id' | 'entityType' | 'fieldName' | 'fieldLabel' | 'fieldType' | 'createdAt' | 'updatedAt'>> = 
    ['id', 'entityType', 'fieldName', 'fieldLabel', 'fieldType', 'createdAt', 'updatedAt'];
  
  for (const field of criticalFields) {
    if (mappedData[field] === null || mappedData[field] === undefined) {
      console.error(`Critical Error: Non-nullable field '${field}' is null or undefined for DB row ID '${dbDef.id}'. DB Data:`, dbDef);
      throw new Error(`Data integrity issue: Field '${field}' is unexpectedly missing for custom field definition '${dbDef.id}'.`);
    }
  }
  
  // Handle dropdownOptions with detailed checking
  if (dbDef.dropdown_options !== null && dbDef.dropdown_options !== undefined) {
    if (Array.isArray(dbDef.dropdown_options)) {
      mappedData.dropdownOptions = dbDef.dropdown_options.map((opt: any, index: number) => {
        if (opt === null || typeof opt !== 'object') {
          console.error(`Critical Error: Dropdown option at index ${index} is null or not an object for DB row ID '${dbDef.id}'. Option Data:`, opt);
          throw new Error(`Data integrity issue: Invalid dropdown option structure for custom field definition '${dbDef.id}'.`);
        }
        if (opt.value === null || opt.value === undefined) {
          console.error(`Critical Error: Dropdown option 'value' is null or undefined at index ${index} for DB row ID '${dbDef.id}'. Option Data:`, opt);
          throw new Error(`Data integrity issue: Dropdown option 'value' is missing for custom field definition '${dbDef.id}'.`);
        }
        if (opt.label === null || opt.label === undefined) {
          console.error(`Critical Error: Dropdown option 'label' is null or undefined at index ${index} for DB row ID '${dbDef.id}'. Option Data:`, opt);
          throw new Error(`Data integrity issue: Dropdown option 'label' is missing for custom field definition '${dbDef.id}'.`);
        }
        return { value: String(opt.value), label: String(opt.label) }; // Ensure string types
      });
    } else {
      // This case should ideally not happen if JSONB is well-formed in DB.
      console.warn(`Warning: 'dropdown_options' for DB row ID '${dbDef.id}' is not an array and not null/undefined. Type: ${typeof dbDef.dropdown_options}. Data:`, dbDef.dropdown_options);
      // GraphQL schema allows dropdownOptions to be null, so setting to null if malformed.
      mappedData.dropdownOptions = null; 
    }
  }

  return mappedData as GraphQLCustomFieldDefinition;
};

export const getCustomFieldDefinitions = async (
  supabase: SupabaseClient,
  entityType: GraphQLCustomFieldEntityType,
  includeInactive: boolean = false
): Promise<GraphQLCustomFieldDefinition[]> => {
  let query = supabase
    .from(CUSTOM_FIELD_DEFINITIONS_TABLE)
    .select('*')
    .eq('entity_type', entityType);

  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  query = query.order('display_order', { ascending: true });

  const { data, error } = await query;
      // console.log('[Service DEBUG] getCustomFieldDefinitions raw response:', { data, error });

  handleSupabaseError(error, 'fetching custom field definitions');

  if (!data) {
    return [];
  }

  try {
    return data.map(mapDbDefinitionToGraphQL);
  } catch (mappingError: any) {
    console.error('[Service Error] Failed to map custom field definitions:', mappingError.message, mappingError.stack);
    // Re-throw as a GraphQLError to provide better error information to the client
    throw new GraphQLError('Error processing custom field definitions data.', {
      extensions: {
        code: 'DATA_PROCESSING_ERROR',
        details: mappingError.message,
      },
    });
  }
};

export const getCustomFieldDefinitionById = async (
  supabase: SupabaseClient,
  id: string
): Promise<GraphQLCustomFieldDefinition | null> => {
  const { data, error } = await supabase
    .from(CUSTOM_FIELD_DEFINITIONS_TABLE)
    .select('*')
    .eq('id', id)
    .single(); // Use single to get one record or null, and error if multiple

  // handleSupabaseError will throw if there's a PostgrestError
  // If error is not null and not a PostgrestError (e.g. multiple rows found for .single()), 
  // or if data is null for other reasons after a non-erroring query, we should handle it.
  if (error && error.code !== 'PGRST116') { // PGRST116: "Searched item was not found"
    handleSupabaseError(error, `fetching custom field definition by id ${id}`);
  }

  if (!data) {
    // This case covers both PGRST116 (not found) and other potential null data scenarios without a thrown error.
    return null;
  }

  return mapDbDefinitionToGraphQL(data);
};

export const getCustomFieldDefinitionsByIds = async (
  supabase: SupabaseClient,
  ids: string[]
): Promise<GraphQLCustomFieldDefinition[]> => {
  if (!ids || ids.length === 0) {
    return [];
  }
  const { data, error } = await supabase
    .from(CUSTOM_FIELD_DEFINITIONS_TABLE)
    .select('*')
    .in('id', ids);

  handleSupabaseError(error, `fetching custom field definitions by ids ${ids.join(', ')}`);

  if (!data) {
    return [];
  }
  try {
    return data.map(mapDbDefinitionToGraphQL);
  } catch (mappingError: any) {
    console.error('[Service Error] Failed to map custom field definitions by IDs:', mappingError.message, mappingError.stack);
    throw new GraphQLError('Error processing custom field definitions data by IDs.', {
      extensions: {
        code: 'DATA_PROCESSING_ERROR',
        details: mappingError.message,
      },
    });
  }
};

export const createCustomFieldDefinition = async (
  supabase: SupabaseClient,
  input: GraphQLCustomFieldDefinitionInput
): Promise<GraphQLCustomFieldDefinition> => {
  const { 
    entityType, 
    fieldName, 
    fieldLabel, 
    fieldType, 
    isRequired, 
    dropdownOptions, 
    displayOrder 
  } = input;

  const dbRow = {
    entity_type: entityType,
    field_name: fieldName,
    field_label: fieldLabel,
    field_type: fieldType,
    is_required: isRequired === null || isRequired === undefined ? false : isRequired, // Default to false
    dropdown_options: (fieldType === GraphQLCustomFieldType.Dropdown || fieldType === GraphQLCustomFieldType.MultiSelect) && dropdownOptions 
      ? dropdownOptions.map(opt => ({ value: opt.value, label: opt.label })) 
      : null,
    display_order: displayOrder === null || displayOrder === undefined ? 0 : displayOrder, // Default to 0
    // is_active defaults to true in the database
  };

  const { data, error } = await supabase
    .from(CUSTOM_FIELD_DEFINITIONS_TABLE)
    .insert(dbRow)
    .select()
    .single();

  handleSupabaseError(error, 'creating custom field definition');

  if (!data) {
    // This should ideally not happen if handleSupabaseError doesn't throw and no data is returned.
    // Consider if a more specific error is needed or if RLS might cause this.
    throw new Error('Failed to create custom field definition and retrieve the created record.');
  }

  return mapDbDefinitionToGraphQL(data);
};

export const updateCustomFieldDefinition = async (
  supabase: SupabaseClient,
  id: string,
  input: GraphQLCustomFieldDefinitionInput
): Promise<GraphQLCustomFieldDefinition> => {
  const dbUpdateData: Record<string, any> = {};

  // fieldLabel is a required field in GraphQLCustomFieldDefinitionInput
  dbUpdateData.field_label = input.fieldLabel;

  // Only update is_required if it's explicitly provided in the input
  if (input.isRequired !== undefined && input.isRequired !== null) {
    dbUpdateData.is_required = input.isRequired;
  }

  // Only update display_order if it's explicitly provided in the input
  if (input.displayOrder !== undefined && input.displayOrder !== null) {
    dbUpdateData.display_order = input.displayOrder;
  }

  // Determine dropdown_options based on input.fieldType (but don't update field_type in DB).
  // input.fieldType is required in GraphQLCustomFieldDefinitionInput.
  // input.dropdownOptions is also required by GraphQL validation if fieldType is DROPDOWN or MULTI_SELECT.
  if (input.fieldType === GraphQLCustomFieldType.Dropdown || input.fieldType === GraphQLCustomFieldType.MultiSelect) {
    // input.dropdownOptions is guaranteed to be an array (possibly empty) by GraphQL validation here.
    // Safely handle if input.dropdownOptions is not an array (e.g. undefined despite GQL validation)
    if (Array.isArray(input.dropdownOptions)) {
      dbUpdateData.dropdown_options = input.dropdownOptions.map(opt => ({ value: opt.value, label: opt.label }));
    } else {
      // If fieldType is Dropdown/MultiSelect and options are not an array (e.g. undefined),
      // default to empty array, signifying no options.
      dbUpdateData.dropdown_options = [];
    }
  } else {
    dbUpdateData.dropdown_options = null;
  }
  
  // The updated_at field will be handled automatically by the database trigger or Supabase.

  const { data, error } = await supabase
    .from(CUSTOM_FIELD_DEFINITIONS_TABLE)
    .update(dbUpdateData)
    .eq('id', id)
    .select()
    .single();

  handleSupabaseError(error, `updating custom field definition ${id}`);

  if (!data) {
    // This could happen if the ID doesn't exist or RLS prevents the update/select.
    throw new Error(`Failed to update or retrieve custom field definition ${id}. It might not exist or access was denied.`);
  }

  return mapDbDefinitionToGraphQL(data);
};

export const setCustomFieldDefinitionActiveStatus = async (
  supabase: SupabaseClient,
  id: string,
  isActive: boolean
): Promise<GraphQLCustomFieldDefinition> => {
  const { data, error } = await supabase
    .from(CUSTOM_FIELD_DEFINITIONS_TABLE)
    .update({ is_active: isActive })
    .eq('id', id)
    .select()
    .single();

  handleSupabaseError(error, `setting active status for custom field definition ${id}`);

  if (!data) {
    throw new Error(`Failed to set active status or retrieve custom field definition ${id}. It might not exist or access was denied.`);
  }

  return mapDbDefinitionToGraphQL(data);
}; 