import { GraphQLError } from 'graphql';
import { getAuthenticatedClient, handleSupabaseError } from './serviceUtils';
import type { Person, PersonInput } from './generated/graphql';
import { CustomFieldEntityType } from './generated/graphql';
import { processCustomFieldsForCreate, processCustomFieldsForUpdate } from './customFieldUtils';
import type { SupabaseClient } from '@supabase/supabase-js';

// --- Person Service --- 
export const personService = {
  // Get all people - Uses authenticated client as RLS SELECT policy uses auth.uid()
  async getPeople(userId: string, accessToken: string): Promise<Person[]> {
    // console.log('[personService.getPeople] called for user:', userId);
    const supabase = getAuthenticatedClient(accessToken); 
    const { data, error } = await supabase
      .from('people') 
      .select('*') 
      .order('created_at', { ascending: false }); 

    handleSupabaseError(error, 'fetching people'); 
    return (data || []) as Person[];
  },

  // Get a single person by ID - Uses authenticated client
  async getPersonById(userId: string, id: string, accessToken: string): Promise<Person | null> {
    // console.log('[personService.getPersonById] called for user:', userId, 'id:', id);
    const supabase = getAuthenticatedClient(accessToken); 
    const { data, error } = await supabase
      .from('people') 
      .select('*')
      .eq('id', id) 
      .single(); 

    if (error && error.code !== 'PGRST116') { 
       handleSupabaseError(error, 'fetching person by ID'); 
    }
    return data;
  },

  // Create a new person - Needs authenticated client for INSERT RLS policy
  async createPerson(userId: string, input: PersonInput, accessToken: string): Promise<Person> {
    console.log('[personService.createPerson] called for user:', userId, 'input:', input);
    const supabase = getAuthenticatedClient(accessToken); 
    
    const { customFields, ...personData } = input;
    const processedCustomFieldValues = await processCustomFieldsForCreate(customFields, supabase, CustomFieldEntityType.Person, false);

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
      .select('*')
      .single(); 

    handleSupabaseError(error, 'creating person'); 
    if (!data) {
        throw new GraphQLError('Failed to create person, no data returned', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
    return data as Person;
  },

  // Update an existing person - Needs authenticated client for UPDATE RLS policy
  async updatePerson(userId: string, id: string, input: Partial<PersonInput>, accessToken: string): Promise<Person> {
    // console.log('[personService.updatePerson] called for user:', userId, 'id:', id, 'input:', input);
    const supabase = getAuthenticatedClient(accessToken); 

    // 1. Fetch current person data to get existing custom_field_values
    const currentPersonData = await this.getPersonById(userId, id, accessToken);
    if (!currentPersonData) {
        throw new GraphQLError('Person not found for update', { extensions: { code: 'NOT_FOUND' } });
    }
    const currentDbCustomFieldValues = (currentPersonData as any).custom_field_values || {};
    
    const { customFields, ...personDataToUpdate } = input;
    
    const { finalCustomFieldValues } = await processCustomFieldsForUpdate(
      currentDbCustomFieldValues,
      customFields, 
      supabase,
      CustomFieldEntityType.Person,
      false
    );

    const dbUpdatePayload: any = { ...personDataToUpdate };
    if (finalCustomFieldValues !== null) {
        dbUpdatePayload.custom_field_values = finalCustomFieldValues;
    } else {
        dbUpdatePayload.custom_field_values = {}; 
    }
    
    const { data, error } = await supabase
      .from('people') 
      .update(dbUpdatePayload) 
      .eq('id', id) 
      .select('*')
      .single(); 

    if (error && error.code === 'PGRST116') { 
        throw new GraphQLError('Person not found', { extensions: { code: 'NOT_FOUND' } });
    }
    handleSupabaseError(error, 'updating person'); 
     if (!data) { 
        throw new GraphQLError('Person update failed, no data returned', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }
    return data as Person;
  },

  // Delete a person - Needs authenticated client for DELETE RLS policy
  async deletePerson(userId: string, id: string, accessToken: string): Promise<boolean> {
    console.log('[personService.deletePerson] called for user:', userId, 'id:', id);
    const supabase = getAuthenticatedClient(accessToken); 
    const { error } = await supabase
      .from('people') 
      .delete()
      .eq('id', id); 

    if (error && error.code === 'PGRST116') { 
        throw new GraphQLError('Person not found', { extensions: { code: 'NOT_FOUND' } });
    }
    handleSupabaseError(error, 'deleting person'); 
    return !error; 
  }
}; 