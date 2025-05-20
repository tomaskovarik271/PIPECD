import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types'; // Corrected path
// import { getAuthenticatedClient } from './serviceUtils'; // Assuming serviceUtils is in lib/
// import { User } from './generated/graphql'; // For types if needed directly, or use DB types

// Define a type for the database Team row
export type DbTeam = Database['public']['Tables']['teams']['Row'];

/**
 * Fetches a single team by its ID.
 * Relies on RLS for row-level security.
 * 
 * @param supabase The Supabase client instance.
 * @param teamId The ID of the team to fetch.
 * @returns The team object or null if not found/permitted.
 */
export const getTeamById = async (supabase: SupabaseClient<Database>, teamId: string): Promise<DbTeam | null> => {
  const { data: dbTeam, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single();

  if (error) {
    console.error(`teamService.getTeamById: Error fetching team ${teamId}: ${(error as Error).message}`);
    if ((error as any).code === 'PGRST116') return null; 
    throw error; 
  }
  return dbTeam;
};

export const createTeamInDb = async (
  supabase: SupabaseClient<Database>, 
  input: { name: string; description?: string | null; teamLeadUserId?: string | null },
  creatorUserId: string
): Promise<DbTeam> => {
  const { data: newDbTeam, error } = await supabase
    .from('teams')
    .insert({ 
      name: input.name, 
      description: input.description, 
      team_lead_user_id: input.teamLeadUserId, 
      created_by_user_id: creatorUserId 
    })
    .select()
    .single();

  if (error) {
    console.error(`teamService.createTeamInDb: Error creating team - ${(error as Error).message}`);
    throw error; 
  }
  if (!newDbTeam) { 
    console.error('teamService.createTeamInDb: No data returned after insert, though no error reported.');
    throw new Error('Team creation failed to return data.');
  }
  return newDbTeam;
};

interface TeamsFilter { 
  // e.g. nameContains?: string;
}

interface Pagination {
  limit?: number | null;
  offset?: number | null;
}

export const getTeams = async (
  supabase: SupabaseClient<Database>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filter?: TeamsFilter | null, 
  pagination?: Pagination | null
): Promise<DbTeam[]> => {
  let query = supabase.from('teams').select('*');

  // if (filter?.nameContains) { // Placeholder for actual filter logic
  //   query = query.ilike('name', `%${filter.nameContains}%`);
  // }

  if (pagination) {
    const limit = pagination.limit ?? 20;
    const offset = pagination.offset ?? 0;
    query = query.range(offset, offset + limit - 1);
  }

  const { data: dbTeams, error } = await query;

  if (error) {
    console.error(`teamService.getTeams: Error fetching teams: ${(error as Error).message}`);
    throw error;
  }
  return dbTeams || [];
};

export const getTeamsForUser = async (
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<DbTeam[]> => {
  // Fetch team_ids the user is a member of
  const { data: teamMembers, error: tmError } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', userId);

  if (tmError) {
    console.error(`teamService.getTeamsForUser: Error fetching team memberships for user ${userId}:`, (tmError as Error).message);
    throw tmError;
  }

  if (!teamMembers || teamMembers.length === 0) {
    return [];
  }

  // The type of tm.team_id will be string as per the select.
  // The generated type for team_members.Row is missing 'role', but team_id is present.
  const teamIds = teamMembers.map(tm => tm.team_id);

  const { data: teamsData, error: teamsError } = await supabase
    .from('teams')
    .select('*')
    .in('id', teamIds);

  if (teamsError) {
    console.error(`teamService.getTeamsForUser: Error fetching teams for user ${userId} with IDs [${teamIds.join(',')}] :`, (teamsError as Error).message);
    throw teamsError;
  }
  
  return teamsData || [];
};

export const getTeamsLedByUser = async (
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<DbTeam[]> => {
  const { data: ledTeamsData, error } = await supabase
    .from('teams')
    .select('*')
    .eq('team_lead_user_id', userId);
  
  if (error) {
    console.error(`teamService.getTeamsLedByUser: Error fetching teams led by user ${userId}:`, (error as Error).message);
    throw error;
  }

  return ledTeamsData || [];
};

// Use generated Update type if suitable, or define more specifically if needed
export type UpdateTeamDbInput = Partial<Pick<Database['public']['Tables']['teams']['Update'], 'name' | 'description' | 'team_lead_user_id'>>;


export const updateTeamInDb = async (
  supabase: SupabaseClient<Database>,
  teamId: string,
  updatePayload: UpdateTeamDbInput 
): Promise<DbTeam> => {
  const dbUpdatePayload: Database['public']['Tables']['teams']['Update'] = {};
  if (updatePayload.name !== undefined) dbUpdatePayload.name = updatePayload.name;
  if (updatePayload.description !== undefined) dbUpdatePayload.description = updatePayload.description;
  // Ensure teamLeadUserId is handled correctly (null vs undefined)
  if (updatePayload.team_lead_user_id !== undefined) dbUpdatePayload.team_lead_user_id = updatePayload.team_lead_user_id;


  if (Object.keys(dbUpdatePayload).length === 0) {
    console.warn('teamService.updateTeamInDb: Called with empty updatePayload. Fetching and returning existing team.');
    const existingTeam = await getTeamById(supabase, teamId);
    if (!existingTeam) throw new Error(`Team with ID ${teamId} not found for no-op update.`);
    return existingTeam;
  }

  const { data: updatedDbTeam, error } = await supabase
    .from('teams')
    .update(dbUpdatePayload)
    .eq('id', teamId)
    .select()
    .single();

  if (error) {
    console.error(`teamService.updateTeamInDb: Error updating team ${teamId}: ${(error as Error).message}`);
    if ((error as any).code === 'PGRST116') { 
      throw new Error(`Team with ID ${teamId} not found or not permitted to update.`); 
    }
    throw error;
  }
  if (!updatedDbTeam) {
    console.error('teamService.updateTeamInDb: No data returned after update, though no error reported.');
    throw new Error('Team update failed to return data.');
  }
  return updatedDbTeam;
};

export const deleteTeamFromDb = async (
  supabase: SupabaseClient<Database>,
  teamId: string
): Promise<{ success: boolean; count: number | null }> => {
  const { error, count } = await supabase
    .from('teams')
    .delete()
    .eq('id', teamId);

  if (error) {
    console.error(`teamService.deleteTeamFromDb: Error deleting team ${teamId}: ${(error as Error).message}`);
    throw error; 
  }
  return { success: true, count }; 
};

// Explicitly define the type for team member insert, including role
type TeamMemberInsert = Database['public']['Tables']['team_members']['Insert'] & { role: string };
// Define what we expect to get back, acknowledging 'role' might be missing from generated types
type TeamMemberRowWithRole = Database['public']['Tables']['team_members']['Row'] & { role?: string };


export const addTeamMemberToDb = async (
  supabase: SupabaseClient<Database>,
  teamId: string,
  userId: string,
  role?: string | null 
): Promise<TeamMemberRowWithRole> => {
  // The 'role' field is NOT NULL and has a DEFAULT in the DB.
  // The generated type Database['public']['Tables']['team_members']['Insert'] is missing 'role'.
  // We ensure 'role' is part of the payload.
  const insertPayload: TeamMemberInsert = { 
    team_id: teamId, 
    user_id: userId, 
    role: role || 'member' // Provide default if not specified, matching DB default
  };

  const { data: newMemberLink, error } = await supabase
    .from('team_members')
    .insert(insertPayload as any) // Cast to any because generated Insert type is missing 'role'
    .select()
    .single();

  if (error) {
    console.error(`teamService.addTeamMemberToDb: Error adding user ${userId} to team ${teamId}: ${(error as Error).message}`);
    // TODO: Check for specific error codes, e.g., 23505 for PK violation if user is already in team with that role
    throw error;
  }
  if (!newMemberLink) {
    console.error('teamService.addTeamMemberToDb: No data returned after insert, though no error reported.');
    throw new Error('Team member creation failed to return data.');
  }
  // The returned 'newMemberLink' will be of type Database['public']['Tables']['team_members']['Row']
  // which is missing 'role'. We cast it to acknowledge 'role' should be there from the DB.
  return newMemberLink as TeamMemberRowWithRole; 
};

export const addTeamMembersToDb = async (
  supabase: SupabaseClient<Database>,
  teamId: string,
  userIds: string[],
  role?: string | null 
): Promise<TeamMemberRowWithRole[]> => {
  if (userIds.length === 0) {
    return [];
  }
  const effectiveRole = role || 'member';
  const insertPayloads: TeamMemberInsert[] = userIds.map(userId => ({
    team_id: teamId,
    user_id: userId,
    role: effectiveRole,
  }));

  // Supabase .insert() with an array handles bulk inserts.
  // RLS policies on team_members table will apply.
  // If any insert fails (e.g. user already member with that role), the whole batch might fail depending on Supabase client version and DB settings.
  // It's safer to insert one by one if partial success is desired or use upsert with care.
  // For now, try batch insert and let it fail on any error.
  const { data: newMemberLinks, error } = await supabase
    .from('team_members')
    .insert(insertPayloads as any[]) // Cast to any[] because generated Insert type is missing 'role'
    .select();

  if (error) {
    console.error(`teamService.addTeamMembersToDb: Error adding users to team ${teamId}: ${(error as Error).message}`);
    // Consider checking for specific error codes, like 23505 for PK violation.
    throw error;
  }
  if (!newMemberLinks) {
    console.error('teamService.addTeamMembersToDb: No data returned after insert, though no error reported.');
    throw new Error('Team member creation failed to return data.');
  }
  return newMemberLinks as TeamMemberRowWithRole[];
};

export const removeTeamMemberFromDb = async (
  supabase: SupabaseClient<Database>,
  teamId: string,
  userId: string
): Promise<{ success: boolean; count: number | null }> => {
  // This will delete all memberships for the user in the team, regardless of role,
  // which is appropriate for "removing a member from a team".
  // The primary key is (team_id, user_id, role), so deleting by just team_id and user_id
  // will remove all matching entries.
  const { error, count } = await supabase
    .from('team_members')
    .delete()
    .match({ team_id: teamId, user_id: userId });

  if (error) {
    console.error(`teamService.removeTeamMemberFromDb: Error removing user ${userId} from team ${teamId}: ${(error as Error).message}`);
    throw error;
  }
  return { success: true, count };
};

export const removeTeamMembersFromDb = async (
  supabase: SupabaseClient<Database>,
  teamId: string,
  userIds: string[]
): Promise<{ success: boolean; count: number | null }> => {
  if (userIds.length === 0) {
    return { success: true, count: 0 };
  }
  // This will delete all memberships for the specified users in the team, regardless of role.
  const { error, count } = await supabase
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .in('user_id', userIds);

  if (error) {
    console.error(`teamService.removeTeamMembersFromDb: Error removing users from team ${teamId}: ${(error as Error).message}`);
    throw error;
  }
  return { success: true, count };
};

// Add more service functions here... 