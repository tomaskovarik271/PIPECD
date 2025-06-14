import { GraphQLError } from 'graphql';
import { getAuthenticatedClient, handleSupabaseError } from './serviceUtils';
import type { DealParticipant, DealParticipantInput, ContactRoleType, Person } from './generated/graphql';

// Database interface for deal_participants table
interface DbDealParticipant {
  id: string;
  deal_id: string;
  person_id: string;
  role: string;
  added_from_email: boolean;
  created_at: string;
  created_by_user_id: string;
}

// --- Deal Participant Service ---
// Following the standard CRUD pattern from PersonService and OrganizationService
export const dealParticipantService = {
  
  // Get all participants for a deal
  async getDealParticipants(userId: string, dealId: string, accessToken: string): Promise<DealParticipant[]> {
    const supabase = getAuthenticatedClient(accessToken);
    
    // Join with people table to get person details
    const { data, error } = await supabase
      .from('deal_participants')
      .select(`
        id,
        deal_id,
        person_id,
        role,
        added_from_email,
        created_at,
        created_by_user_id,
        people:person_id (
          id,
          first_name,
          last_name,
          email,
          phone,
          organization_id,
          created_at,
          updated_at,
          user_id,
          custom_field_values
        )
      `)
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false });

    handleSupabaseError(error, 'fetching deal participants');
    
    // Transform database result to GraphQL format
    return (data || []).map((dbParticipant: any) => ({
      id: dbParticipant.id,
      dealId: dbParticipant.deal_id,
      personId: dbParticipant.person_id,
      person: dbParticipant.people as unknown as Person,
      role: dbParticipant.role.toUpperCase() as ContactRoleType,
      addedFromEmail: dbParticipant.added_from_email,
      createdAt: dbParticipant.created_at,
      createdByUserId: dbParticipant.created_by_user_id,
    }));
  },

  // Add a participant to a deal
  async addDealParticipant(userId: string, input: DealParticipantInput, accessToken: string): Promise<DealParticipant> {
    const supabase = getAuthenticatedClient(accessToken);
    
    // Verify the deal exists and user has access
    const { data: dealData, error: dealError } = await supabase
      .from('deals')
      .select('id, user_id, assigned_to_user_id')
      .eq('id', input.dealId)
      .single();
    
    if (dealError || !dealData) {
      throw new GraphQLError('Deal not found or access denied', { extensions: { code: 'NOT_FOUND' } });
    }
    
    // Verify the person exists
    const { data: personData, error: personError } = await supabase
      .from('people')
      .select('id, first_name, last_name, email')
      .eq('id', input.personId)
      .single();
    
    if (personError || !personData) {
      throw new GraphQLError('Person not found', { extensions: { code: 'NOT_FOUND' } });
    }

    const dbInput = {
      deal_id: input.dealId,
      person_id: input.personId,
      role: (input.role || 'PARTICIPANT').toLowerCase(),
      added_from_email: input.addedFromEmail || false,
      created_by_user_id: userId,
    };

    const { data, error } = await supabase
      .from('deal_participants')
      .insert(dbInput)
      .select(`
        id,
        deal_id,
        person_id,
        role,
        added_from_email,
        created_at,
        created_by_user_id,
        people:person_id (
          id,
          first_name,
          last_name,
          email,
          phone,
          organization_id,
          created_at,
          updated_at,
          user_id,
          custom_field_values
        )
      `)
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new GraphQLError('Person is already a participant in this deal', { extensions: { code: 'DUPLICATE_ENTRY' } });
      }
      handleSupabaseError(error, 'adding deal participant');
    }

    if (!data) {
      throw new GraphQLError('Failed to add deal participant', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }

    return {
      id: data.id,
      dealId: data.deal_id,
      personId: data.person_id,
      person: data.people as unknown as Person,
      role: data.role.toUpperCase() as ContactRoleType,
      addedFromEmail: data.added_from_email,
      createdAt: data.created_at,
      createdByUserId: data.created_by_user_id,
    };
  },

  // Remove a participant from a deal
  async removeDealParticipant(userId: string, dealId: string, personId: string, accessToken: string): Promise<boolean> {
    const supabase = getAuthenticatedClient(accessToken);
    
    // Don't allow removing primary contact
    const { data: participantData } = await supabase
      .from('deal_participants')
      .select('role')
      .eq('deal_id', dealId)
      .eq('person_id', personId)
      .single();
    
    if (participantData?.role === 'primary') {
      throw new GraphQLError('Cannot remove primary contact from deal', { extensions: { code: 'INVALID_OPERATION' } });
    }

    const { error } = await supabase
      .from('deal_participants')
      .delete()
      .eq('deal_id', dealId)
      .eq('person_id', personId);

    if (error && error.code === 'PGRST116') {
      throw new GraphQLError('Deal participant not found', { extensions: { code: 'NOT_FOUND' } });
    }
    
    handleSupabaseError(error, 'removing deal participant');
    return !error;
  },

  // Update participant role
  async updateDealParticipantRole(userId: string, dealId: string, personId: string, role: ContactRoleType, accessToken: string): Promise<DealParticipant> {
    const supabase = getAuthenticatedClient(accessToken);
    
    // Don't allow changing primary contact role
    if (role === 'PRIMARY') {
      throw new GraphQLError('Cannot change participant to primary role. Use deal update instead.', { extensions: { code: 'INVALID_OPERATION' } });
    }

    const { data, error } = await supabase
      .from('deal_participants')
      .update({ role: role.toLowerCase() })
      .eq('deal_id', dealId)
      .eq('person_id', personId)
      .select(`
        id,
        deal_id,
        person_id,
        role,
        added_from_email,
        created_at,
        created_by_user_id,
        people:person_id (
          id,
          first_name,
          last_name,
          email,
          phone,
          organization_id,
          created_at,
          updated_at,
          user_id,
          custom_field_values
        )
      `)
      .single();

    if (error && error.code === 'PGRST116') {
      throw new GraphQLError('Deal participant not found', { extensions: { code: 'NOT_FOUND' } });
    }
    
    handleSupabaseError(error, 'updating deal participant role');
    
    if (!data) {
      throw new GraphQLError('Failed to update deal participant role', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
    }

    return {
      id: data.id,
      dealId: data.deal_id,
      personId: data.person_id,
      person: data.people as unknown as Person,
      role: data.role.toUpperCase() as ContactRoleType,
      addedFromEmail: data.added_from_email,
      createdAt: data.created_at,
      createdByUserId: data.created_by_user_id,
    };
  },

  // Suggest participants from email thread
  async suggestEmailParticipants(userId: string, dealId: string, threadId: string | null, accessToken: string): Promise<Person[]> {
    const supabase = getAuthenticatedClient(accessToken);
    
    // For now, return people from the same organization as the deal
    // In the future, this could analyze email threads to suggest participants
    const { data: dealData } = await supabase
      .from('deals')
      .select('organization_id, person_id')
      .eq('id', dealId)
      .single();
    
    if (!dealData) {
      return [];
    }

    // Get existing participants to exclude them
    const { data: existingParticipants } = await supabase
      .from('deal_participants')
      .select('person_id')
      .eq('deal_id', dealId);
    
    const excludePersonIds = (existingParticipants || []).map(p => p.person_id);

    let query = supabase
      .from('people')
      .select('*')
      .limit(10);

    // Exclude existing participants if any exist
    if (excludePersonIds.length > 0) {
      query = query.not('id', 'in', `(${excludePersonIds.join(',')})`);
    }

    // If deal has an organization, suggest people from that organization
    if (dealData.organization_id) {
      query = query.eq('organization_id', dealData.organization_id);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error suggesting email participants:', error);
      return [];
    }

    return (data || []) as Person[];
  },

  // Get participant emails for email filtering
  async getDealParticipantEmails(userId: string, dealId: string, accessToken: string): Promise<string[]> {
    const supabase = getAuthenticatedClient(accessToken);
    
    const { data, error } = await supabase
      .from('deal_participants')
      .select(`
        people:person_id (email)
      `)
      .eq('deal_id', dealId);

    if (error) {
      console.error('Error fetching deal participant emails:', error);
      return [];
    }

    return (data || [])
      .map((participant: any) => participant.people?.email)
      .filter(Boolean);
  }
}; 