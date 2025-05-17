import { /* createClient, SupabaseClient, */ } from '@supabase/supabase-js'; // Keep PostgrestError if used directly, remove others
// import { supabase } from './supabaseClient'; // Removed unused import
// import type { User } from '@supabase/supabase-js';
import { GraphQLError } from 'graphql';
import { getAuthenticatedClient, handleSupabaseError } from './serviceUtils'; // Import shared helpers
import type { Person, PersonInput } from './generated/graphql'; // ADDED: Import generated types
// Import CustomFieldValueInput for processing
import type { CustomFieldValueInput } from './generated/graphql';
import { getCustomFieldDefinitionById } from './customFieldDefinitionService';
import type { SupabaseClient } from '@supabase/supabase-js';


// Helper to process custom fields for creation
async function processCustomFieldsForPersonCreate(
  customFieldsInput: CustomFieldValueInput[] | undefined | null,
  supabaseClient: SupabaseClient
): Promise<Record<string, any> | null> {
  if (!customFieldsInput || customFieldsInput.length === 0) {
    return null;
  }

  const dbCustomFieldValues: Record<string, any> = {};
  for (const cfInput of customFieldsInput) {
    try {
      const definition = await getCustomFieldDefinitionById(supabaseClient, cfInput.definitionId);
      if (definition && definition.entityType === 'PERSON' && definition.isActive) { // Ensure for Person and active
        const fieldName = definition.fieldName;
        let valueToStore: any = undefined;

        if (cfInput.stringValue !== undefined && cfInput.stringValue !== null) valueToStore = cfInput.stringValue;
        else if (cfInput.numberValue !== undefined && cfInput.numberValue !== null) valueToStore = cfInput.numberValue;
        else if (cfInput.booleanValue !== undefined && cfInput.booleanValue !== null) valueToStore = cfInput.booleanValue;
        else if (cfInput.dateValue !== undefined && cfInput.dateValue !== null) valueToStore = cfInput.dateValue;
        else if (cfInput.selectedOptionValues !== undefined && cfInput.selectedOptionValues !== null) valueToStore = cfInput.selectedOptionValues;
        
        if (valueToStore !== undefined) {
             dbCustomFieldValues[fieldName] = valueToStore;
        }
      } else if (definition && (definition.entityType !== 'PERSON' || !definition.isActive)) {
        console.warn(`[personService.processCustomFieldsForPersonCreate] Custom field definition ${cfInput.definitionId} (${definition.fieldName}) is not for PERSON or not active. Skipping.`);
      }
       else {
        console.warn(`[personService.processCustomFieldsForPersonCreate] Custom field definition ${cfInput.definitionId} not found. Skipping.`);
      }
    } catch (defError: any) {
        console.error(`[personService.processCustomFieldsForPersonCreate] Error fetching/processing definition ${cfInput.definitionId}:`, defError.message);
    }
  }
  return Object.keys(dbCustomFieldValues).length > 0 ? dbCustomFieldValues : null;
}

// Helper to process custom fields for update
async function processCustomFieldsForPersonUpdate(
  currentDbCustomFieldValues: Record<string, any> | null,
  customFieldsInput: CustomFieldValueInput[] | undefined | null,
  supabaseClient: SupabaseClient
): Promise<{ finalCustomFieldValues: Record<string, any> | null }> {
  let finalCustomFieldValues: Record<string, any> | null = currentDbCustomFieldValues || {};

  if (!customFieldsInput || customFieldsInput.length === 0) {
    return { finalCustomFieldValues: finalCustomFieldValues }; 
  }
  
  const customFieldsToUpdate: Record<string, any> = {};

  for (const cfInput of customFieldsInput) {
    try {
      const definition = await getCustomFieldDefinitionById(supabaseClient, cfInput.definitionId);
      if (definition && definition.entityType === 'PERSON' && definition.isActive) { // Ensure for Person and active
        const fieldName = definition.fieldName;
        let valueToStore: any = null; 

        if ('stringValue' in cfInput) valueToStore = cfInput.stringValue;
        else if ('numberValue' in cfInput) valueToStore = cfInput.numberValue;
        else if ('booleanValue' in cfInput) valueToStore = cfInput.booleanValue;
        else if ('dateValue' in cfInput) valueToStore = cfInput.dateValue;
        else if ('selectedOptionValues' in cfInput) valueToStore = cfInput.selectedOptionValues;
        
        customFieldsToUpdate[fieldName] = valueToStore;
      } else if (definition && (definition.entityType !== 'PERSON' || !definition.isActive)) {
        console.warn(`[personService.processCustomFieldsForPersonUpdate] Custom field definition ${cfInput.definitionId} (${definition.fieldName}) is not for PERSON or not active. Skipping update for this field.`);
      }
       else {
        console.warn(`[personService.processCustomFieldsForPersonUpdate] Custom field definition ${cfInput.definitionId} not found. Skipping update for this field.`);
      }
    } catch (defError: any) {
        console.error(`[personService.processCustomFieldsForPersonUpdate] Error fetching/processing definition ${cfInput.definitionId}:`, defError.message);
    }
  }
  
  finalCustomFieldValues = { ...(currentDbCustomFieldValues || {}), ...customFieldsToUpdate };
  
  return { finalCustomFieldValues };
}


// --- Person Service --- 
export const personService = {
  // Get all people - Uses authenticated client as RLS SELECT policy uses auth.uid()
  async getPeople(userId: string, accessToken: string): Promise<Person[]> { // CHANGED: Return type to Person[]
    console.log('[personService.getPeople] called for user:', userId);
    const supabase = getAuthenticatedClient(accessToken); 
    const { data, error } = await supabase
      .from('people') 
      .select('*') 
      .order('created_at', { ascending: false }); 

    handleSupabaseError(error, 'fetching people'); 
    return (data || []) as Person[]; // CHANGED: Cast to Person[]
  },

  // Get a single person by ID - Uses authenticated client
  async getPersonById(userId: string, id: string, accessToken: string): Promise<Person | null> { // CHANGED: Return type to Person | null
    console.log('[personService.getPersonById] called for user:', userId, 'id:', id);
    const supabase = getAuthenticatedClient(accessToken); 
    const { data, error } = await supabase
      .from('people') 
      .select('*') // Ensure custom_field_values is selected if present
      .eq('id', id) 
      .single(); 

    if (error && error.code !== 'PGRST116') { 
       handleSupabaseError(error, 'fetching person by ID'); 
    }
    return data as Person | null; // CHANGED: Cast to Person | null
  },

  // Create a new person - Needs authenticated client for INSERT RLS policy
  async createPerson(userId: string, input: PersonInput, accessToken: string): Promise<Person> { // CHANGED: input type to PersonInput, return type to Person
    console.log('[personService.createPerson] called for user:', userId, 'input:', input);
    const supabase = getAuthenticatedClient(accessToken); 
    
    const { customFields, ...personData } = input;
    const processedCustomFieldValues = await processCustomFieldsForPersonCreate(customFields, supabase);

    const dbInput: any = { 
      ...personData, 
      user_id: userId 
    };

    if (processedCustomFieldValues) {
      dbInput.custom_field_values = processedCustomFieldValues;
    }
    
    const { data, error } = await supabase
      .from('people') 
      .insert(dbInput) 
      .select('*') // Select all fields including custom_field_values
      .single(); 

    handleSupabaseError(error, 'creating person'); 
    if (!data) {
        throw new GraphQLError('Failed to create person, no data returned', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
    return data as Person; // CHANGED: Cast to Person
  },

  // Update an existing person - Needs authenticated client for UPDATE RLS policy
  async updatePerson(userId: string, id: string, input: Partial<PersonInput>, accessToken: string): Promise<Person> { // CHANGED: input type to Partial<PersonInput>, return type to Person
    console.log('[personService.updatePerson] called for user:', userId, 'id:', id, 'input:', input);
    const supabase = getAuthenticatedClient(accessToken); 

    // 1. Fetch current person data to get existing custom_field_values
    const currentPersonData = await this.getPersonById(userId, id, accessToken);
    if (!currentPersonData) {
        throw new GraphQLError('Person not found for update', { extensions: { code: 'NOT_FOUND' } });
    }
    const currentDbCustomFieldValues = (currentPersonData as any).custom_field_values || {};
    
    const { customFields, ...personDataToUpdate } = input;
    
    const { finalCustomFieldValues } = await processCustomFieldsForPersonUpdate(
      currentDbCustomFieldValues,
      customFields, 
      supabase
    );

    const dbUpdatePayload: any = { ...personDataToUpdate };
    if (finalCustomFieldValues !== null) { // Ensure we only set it if it's not null (could be {} )
        dbUpdatePayload.custom_field_values = finalCustomFieldValues;
    } else {
        // If finalCustomFieldValues is null (e.g. all fields cleared and none existed before), set to empty object
        dbUpdatePayload.custom_field_values = {}; 
    }
    
    const { data, error } = await supabase
      .from('people') 
      .update(dbUpdatePayload) 
      .eq('id', id) 
      .select('*') // Select all fields including custom_field_values
      .single(); 

    if (error && error.code === 'PGRST116') { 
        throw new GraphQLError('Person not found', { extensions: { code: 'NOT_FOUND' } });
    }
    handleSupabaseError(error, 'updating person'); 
     if (!data) { 
        throw new GraphQLError('Person update failed, no data returned', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
    return data as Person; // CHANGED: Cast to Person
  },

  // Delete a person - Needs authenticated client for DELETE RLS policy
  async deletePerson(userId: string, id: string, accessToken: string): Promise<boolean> {
    console.log('[personService.deletePerson] called for user:', userId, 'id:', id);
    const supabase = getAuthenticatedClient(accessToken); 
    const { error, count } = await supabase
      .from('people') 
      .delete()
      .eq('id', id); 

    handleSupabaseError(error, 'deleting person'); 
    console.log('[personService.deletePerson] Deleted count (informational):', count);
    return !error; 
  },
  
  // Consider re-adding getPersonListForUser later if needed for dropdowns
  // It would need to fetch from 'people' table and construct names similarly.
}; 