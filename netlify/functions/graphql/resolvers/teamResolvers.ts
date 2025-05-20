import {
  Resolvers,
  Team as GraphQLTeam,
  User as GraphQLUser,
  TeamWithMembers as GraphQLTeamWithMembers,
  TeamMemberEdge as GraphQLTeamMemberEdge,
  TeamMembersConnection as GraphQLTeamMembersConnection,
  QueryTeamArgs,
  QueryTeamsArgs,
  MutationCreateTeamArgs,
  MutationUpdateTeamArgs,
  MutationDeleteTeamArgs,
  AddTeamMembersInput,
  RemoveTeamMembersInput
} from '../../../../lib/generated/graphql';
import { GraphQLError } from 'graphql';
import { GraphQLContext } from '../index';
import * as teamService from '../../../../lib/teamService'; // Import the new service

// Helper to get current user ID, throwing error if not authenticated
const getCurrentUserId = (context: GraphQLContext): string => {
  if (!context.currentUser?.id) {
    throw new GraphQLError('User is not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
  }
  return context.currentUser.id;
};

// Helper to map DB team row to GraphQLTeam (excluding relational fields handled by field resolvers)
// Exported for use in other resolvers like userResolvers.ts
export const mapDbTeamToGraphQLTeam = (dbTeam: unknown): (Partial<GraphQLTeam> & { _team_lead_user_id?: string, _created_by_user_id?: string }) | null => {
  if (!dbTeam || typeof dbTeam !== 'object') return null;
  // Type guard or assertion might be needed if accessing properties directly on unknown
  const team = dbTeam as Record<string, any>; // Assert to access properties

  return {
    id: team.id,
    name: team.name,
    description: team.description,
    createdAt: team.created_at, // Ensure DateTime scalar handles string conversion, map to camelCase
    updatedAt: team.updated_at, // Map to camelCase
    // Fields to be resolved by Team field resolvers:
    // teamLead (based on team.team_lead_user_id)
    // members (based on team.id)
    // createdBy (based on team.created_by_user_id)

    // Store these raw IDs on the object for field resolvers to use
    _team_lead_user_id: team.team_lead_user_id,
    _created_by_user_id: team.created_by_user_id,
  };
}

const mapDbTeamToGraphQLTeamWithMembers = async (
  dbTeam: teamService.DbTeam,
  supabase: GraphQLContext['supabase']
): Promise<GraphQLTeamWithMembers | null> => {
  if (!dbTeam) return null;

  const baseGqlTeam = mapDbTeamToGraphQLTeam(dbTeam);
  if (!baseGqlTeam) return null; // Should not happen if dbTeam is valid

  // Fetch team members (user_id and joined_at from team_members table)
  const { data: memberLinks, error: memberLinksError } = await supabase
    .from('team_members')
    .select('user_id, joined_at, role') // Include role if needed for TeamMemberEdge
    .eq('team_id', dbTeam.id);

  if (memberLinksError) {
    console.error(`mapDbTeamToGraphQLTeamWithMembers: Error fetching member links for team ${dbTeam.id}: ${memberLinksError.message}`);
    throw new GraphQLError('Could not fetch team members.');
  }

  const edges: GraphQLTeamMemberEdge[] = [];
  if (memberLinks && memberLinks.length > 0) {
    const userIds = memberLinks.map(ml => ml.user_id).filter(id => id !== null) as string[];
    if (userIds.length > 0) {
      // Fetch user profiles for these user IDs
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('user_id, display_name, email, avatar_url') // Add other fields for GraphQLUser as needed
        .in('user_id', userIds);

      if (usersError) {
        console.error(`mapDbTeamToGraphQLTeamWithMembers: Error fetching user profiles for members of team ${dbTeam.id}: ${usersError.message}`);
        throw new GraphQLError('Could not fetch member user details.');
      }

      if (usersData) {
        for (const memberLink of memberLinks) {
          const userProfile = usersData.find(u => u.user_id === memberLink.user_id);
          if (userProfile) {
            edges.push({
              user: {
                id: userProfile.user_id,
                displayName: userProfile.display_name,
                email: userProfile.email,
                avatarUrl: userProfile.avatar_url,
                // Note: teams and leadingTeams for User type are field-resolved by userResolvers typically
              } as GraphQLUser, // Cast, ensure all required GraphQLUser fields are present or resolved
              joinedAt: memberLink.joined_at,
              // role: memberLink.role, // Add if 'role' is part of TeamMemberEdge in GQL schema
            });
          }
        }
      }
    }
  }

  return {
    ...baseGqlTeam, // Spread basic team properties
    id: dbTeam.id, // Ensure ID is not lost if baseGqlTeam doesn't include it directly (it should)
    name: dbTeam.name, // Ensure name is not lost
    membersConnection: {
      edges: edges,
      // pageInfo and totalCount can be added if pagination is implemented for members
    } as GraphQLTeamMembersConnection,
  } as GraphQLTeamWithMembers;
};

export const teamResolvers: Resolvers<GraphQLContext> = {
  Query: {
    team: async (_parent: unknown, args: QueryTeamArgs, context: GraphQLContext): Promise<GraphQLTeam | null> => {
      const { supabase } = context; // Supabase client from context
      const { id } = args;
      try {
        const dbTeam = await teamService.getTeamById(supabase, id);
        // mapDbTeamToGraphQLTeam can return null if dbTeam is null, which is fine for a nullable GQL return type.
        return mapDbTeamToGraphQLTeam(dbTeam) as GraphQLTeam | null;
      } catch (error: unknown) {
        const originalError = error instanceof Error ? error : undefined;
        const errorMessage = originalError ? originalError.message : 'Unknown error fetching team';
        console.error(`Resolver Query.team: Error fetching team ${id}: ${errorMessage}`);
        throw new GraphQLError('Could not fetch team.', { 
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
          originalError 
        });
      }
    },
    teams: async (_parent: unknown, args: QueryTeamsArgs, context: GraphQLContext): Promise<GraphQLTeam[]> => {
      const { supabase } = context;
      const { filter, pagination } = args;

      try {
        // The filter from QueryTeamsArgs (TeamsFilterInput) currently only has a placeholder.
        // If actual filter fields are added to TeamsFilterInput, teamService.getTeams would need to handle them.
        const dbTeams = await teamService.getTeams(supabase, filter, pagination);
        
        // Filter out nulls that mapDbTeamToGraphQLTeam might produce if a team record is problematic,
        // although getTeams service function already returns DbTeam[] so individual items shouldn't be null.
        // The as GraphQLTeam cast assumes mapDbTeamToGraphQLTeam successfully maps or returns null (filtered out).
        return dbTeams
          .map(dbTeam => mapDbTeamToGraphQLTeam(dbTeam))
          .filter(gqlTeam => gqlTeam !== null) as GraphQLTeam[];
      } catch (error: unknown) {
        const originalError = error instanceof Error ? error : undefined;
        const errorMessage = originalError ? originalError.message : 'Unknown error fetching teams';
        console.error(`Resolver Query.teams: Error fetching teams - ${errorMessage}`);
        throw new GraphQLError('Could not fetch teams.', { 
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
          originalError
        });
      }
    },
    myTeams: async (_parent: unknown, _args: Record<string, never>, context: GraphQLContext): Promise<GraphQLTeam[]> => {
      const currentUserId = getCurrentUserId(context);
      const { supabase } = context;

      try {
        const dbTeams = await teamService.getTeamsForUser(supabase, currentUserId);
        return dbTeams
          .map(dbTeam => mapDbTeamToGraphQLTeam(dbTeam))
          .filter(gqlTeam => gqlTeam !== null) as GraphQLTeam[];
      } catch (error: unknown) {
        const originalError = error instanceof Error ? error : undefined;
        const errorMessage = originalError ? originalError.message : 'Unknown error fetching user teams';
        console.error(`Resolver Query.myTeams: Error fetching teams for user ${currentUserId} - ${errorMessage}`);
        throw new GraphQLError('Could not fetch user teams.', { 
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
          originalError
        });
      }
    },
    myLedTeams: async (_parent: unknown, _args: Record<string, never>, context: GraphQLContext): Promise<GraphQLTeam[]> => {
      const currentUserId = getCurrentUserId(context);
      const { supabase } = context;

      try {
        const dbTeams = await teamService.getTeamsLedByUser(supabase, currentUserId);
        return dbTeams
          .map(dbTeam => mapDbTeamToGraphQLTeam(dbTeam))
          .filter(gqlTeam => gqlTeam !== null) as GraphQLTeam[];
      } catch (error: unknown) {
        const originalError = error instanceof Error ? error : undefined;
        const errorMessage = originalError ? originalError.message : 'Unknown error fetching led teams';
        console.error(`Resolver Query.myLedTeams: Error fetching teams led by user ${currentUserId} - ${errorMessage}`);
        throw new GraphQLError('Could not fetch teams led by user.', { 
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
          originalError
        });
      }
    }
  },
  Mutation: {
    createTeam: async (_parent: unknown, args: MutationCreateTeamArgs, context: GraphQLContext): Promise<GraphQLTeam> => {
      const currentUserId = getCurrentUserId(context);
      const { supabase } = context; // Supabase client from context
      const { input } = args;

      try {
        const dbTeam = await teamService.createTeamInDb(supabase, input, currentUserId);
        
        const gqlTeam = mapDbTeamToGraphQLTeam(dbTeam);
        if (!gqlTeam) {
          // This case should ideally be caught by the service if dbTeam comes back unexpectedly null
          console.error('Resolver Mutation.createTeam: dbTeam mapped to null, but schema expects non-null Team.');
          throw new GraphQLError('Failed to process team details after creation.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
        }
        return gqlTeam as GraphQLTeam;
      } catch (error: unknown) {
        const originalError = error instanceof Error ? error : undefined;
        const errorMessage = originalError ? originalError.message : 'Unknown error creating team';
        console.error(`Resolver Mutation.createTeam: Error creating team - ${errorMessage}`);
        throw new GraphQLError('Could not create team.', { 
          extensions: { code: 'INTERNAL_SERVER_ERROR' }, 
          originalError 
        });
      }
    },
    updateTeam: async (_parent: unknown, args: MutationUpdateTeamArgs, context: GraphQLContext): Promise<GraphQLTeam> => {
      getCurrentUserId(context); 
      const { supabase } = context;
      const { id, name, description, teamLeadUserId } = args.input; // Destructure all fields

      // Construct payload for the service, carefully handling nulls for NOT NULL fields
      const servicePayload: { 
        name?: string; 
        description?: string | null; 
        team_lead_user_id?: string | null; 
      } = {};

      if (name !== undefined) {
        if (name === null) {
          // Explicitly setting a NOT NULL 'name' to null is an error.
          // If 'name: null' meant "don't update name", it should be omitted from input or handled by Zod validator if one exists.
          throw new GraphQLError("Team name cannot be set to null.", { extensions: { code: 'BAD_USER_INPUT' }});
        } else {
          servicePayload.name = name;
        }
      }
      if (description !== undefined) { // description can be null
        servicePayload.description = description;
      }
      if (teamLeadUserId !== undefined) { // team_lead_user_id can be null
        servicePayload.team_lead_user_id = teamLeadUserId;
      }
      
      // Cast to the service type. The constructed servicePayload should be compatible.
      const castedServicePayload = servicePayload as teamService.UpdateTeamDbInput;

      if (Object.keys(castedServicePayload).length === 0) {
        // GQL layer check for no actual update fields being provided besides ID.
        try {
          const dbTeam = await teamService.getTeamById(supabase, id);
          if (!dbTeam) {
            throw new GraphQLError('Team not found for no-op update.', { extensions: { code: 'NOT_FOUND' }});
          }
          const gqlTeam = mapDbTeamToGraphQLTeam(dbTeam);
          if (!gqlTeam) {
            throw new GraphQLError('Failed to process existing team details.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
          }
          return gqlTeam as GraphQLTeam; // Return current team if no fields to update
        } catch (error: unknown) {
          const originalError = error instanceof Error ? error : undefined;
          const errorMessage = originalError ? originalError.message : 'Unknown error in updateTeam no-op path';
          console.error(`Resolver Mutation.updateTeam (no-op path): Error fetching team ${id} - ${errorMessage}`);
          throw new GraphQLError('Could not process update request.', { extensions: { code: 'INTERNAL_SERVER_ERROR' }, originalError });
        }
      }

      try {
        const updatedDbTeam = await teamService.updateTeamInDb(supabase, id, castedServicePayload);
        const gqlTeam = mapDbTeamToGraphQLTeam(updatedDbTeam);
        if (!gqlTeam) {
          console.error(`Resolver Mutation.updateTeam: updatedDbTeam (${id}) mapped to null, schema expects non-null.`);
          throw new GraphQLError('Failed to process team details after update.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
        }
        return gqlTeam as GraphQLTeam;
      } catch (error: unknown) {
        const originalError = error instanceof Error ? error : undefined;
        const errorMessage = originalError ? originalError.message : 'Unknown error updating team';
        console.error(`Resolver Mutation.updateTeam: Error updating team ${id} - ${errorMessage}`);
        if (errorMessage?.includes('not found or not permitted')) {
          throw new GraphQLError('Team not found or update not permitted.', { extensions: { code: 'NOT_FOUND' }, originalError });
        }
        throw new GraphQLError('Could not update team.', { extensions: { code: 'INTERNAL_SERVER_ERROR' }, originalError });
      }
    },
    deleteTeam: async (_parent: unknown, args: MutationDeleteTeamArgs, context: GraphQLContext): Promise<boolean> => {
      getCurrentUserId(context);
      const { supabase } = context;
      const { id } = args;

      try {
        const { count } = await teamService.deleteTeamFromDb(supabase, id);
        console.log(`Resolver deleteTeam: ${count} rows affected for team ID ${id}.`);
        // If count is 0, it might mean the team was not found or RLS prevented deletion.
        // The GraphQL schema expects a boolean. We'll return true if no error, 
        // assuming the service throws for actual DB errors.
        // For a stricter check, one might throw if count === 0:
        // if (count === 0) {
        //   throw new GraphQLError('Team not found or could not be deleted.', { extensions: { code: 'NOT_FOUND' } });
        // }
        return true; 
      } catch (error: unknown) {
        const originalError = error instanceof Error ? error : undefined;
        const errorMessage = originalError ? originalError.message : 'Unknown error deleting team';
        console.error(`Resolver Mutation.deleteTeam: Error deleting team ${id} - ${errorMessage}`);
        throw new GraphQLError('Could not delete team.', { 
          extensions: { code: 'INTERNAL_SERVER_ERROR' }, 
          originalError 
        });
      }
    },
    addTeamMembers: async (_parent: unknown, args: { input: AddTeamMembersInput }, context: GraphQLContext): Promise<GraphQLTeamWithMembers> => {
      getCurrentUserId(context);
      const { supabase } = context;
      const { teamId, memberUserIds, role } = args.input;

      if (!memberUserIds || memberUserIds.length === 0) {
        throw new GraphQLError('No member user IDs provided to add.', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      try {
        await teamService.addTeamMembersToDb(supabase, teamId, memberUserIds, role);

        const updatedDbTeam = await teamService.getTeamById(supabase, teamId);
        if (!updatedDbTeam) {
          console.error(`Resolver addTeamMembers: Team ${teamId} not found after adding members.`);
          throw new GraphQLError('Team not found after adding members.', { extensions: { code: 'NOT_FOUND' } });
        }
        
        const gqlTeamWithMembers = await mapDbTeamToGraphQLTeamWithMembers(updatedDbTeam, supabase);
        if (!gqlTeamWithMembers) {
           console.error(`Resolver addTeamMembers: Failed to map team ${teamId} to GraphQLTeamWithMembers.`);
           throw new GraphQLError('Error processing team details after adding members.', { extensions: { code: 'INTERNAL_SERVER_ERROR' }});
        }
        return gqlTeamWithMembers;
      } catch (error: unknown) {
        const originalError = error instanceof Error ? error : undefined;
        const errorMessage = (error instanceof Error ? error.message : 'Unknown error adding team members');
        console.error(`Resolver Mutation.addTeamMembers: Error adding members to team ${teamId} - ${errorMessage}`);
        // Handle specific errors like PK violation if needed
        throw new GraphQLError('Could not add members to team.', { 
          extensions: { code: 'INTERNAL_SERVER_ERROR' }, 
          originalError 
        });
      }
    },
    removeTeamMembers: async (_parent: unknown, args: { input: RemoveTeamMembersInput }, context: GraphQLContext): Promise<GraphQLTeamWithMembers> => {
      getCurrentUserId(context);
      const { supabase } = context;
      const { teamId, memberUserIds } = args.input;

      if (!memberUserIds || memberUserIds.length === 0) {
        throw new GraphQLError('No member user IDs provided to remove.', { extensions: { code: 'BAD_USER_INPUT' } });
      }

      try {
        await teamService.removeTeamMembersFromDb(supabase, teamId, memberUserIds);

        const updatedDbTeam = await teamService.getTeamById(supabase, teamId);
        if (!updatedDbTeam) {
          console.error(`Resolver removeTeamMembers: Team ${teamId} not found after removing members.`);
          throw new GraphQLError('Team not found after removing members.', { extensions: { code: 'NOT_FOUND' } });
        }

        const gqlTeamWithMembers = await mapDbTeamToGraphQLTeamWithMembers(updatedDbTeam, supabase);
        if (!gqlTeamWithMembers) {
           console.error(`Resolver removeTeamMembers: Failed to map team ${teamId} to GraphQLTeamWithMembers.`);
           throw new GraphQLError('Error processing team details after removing members.', { extensions: { code: 'INTERNAL_SERVER_ERROR' }});
        }
        return gqlTeamWithMembers;

      } catch (error: unknown) {
        const originalError = error instanceof Error ? error : undefined;
        const errorMessage = (error instanceof Error ? error.message : 'Unknown error removing team members');
        console.error(`Resolver Mutation.removeTeamMembers: Error removing members from team ${teamId} - ${errorMessage}`);
        throw new GraphQLError('Could not remove members from team.', { 
          extensions: { code: 'INTERNAL_SERVER_ERROR' }, 
          originalError 
        });
      }
    },
  },
  Team: {
    teamLead: async (parentTeam: Partial<GraphQLTeam> & { _team_lead_user_id?: string }, _args: Record<string, never>, context: GraphQLContext): Promise<GraphQLUser | null> => {
      const teamLeadUserId = parentTeam._team_lead_user_id;
      if (!teamLeadUserId) return null;
      const { supabase } = context;
      const { data: userData, error } = await supabase
        .from('user_profiles') // Assuming user profiles table
        .select('user_id, display_name, avatar_url, email')
        .eq('user_id', teamLeadUserId)
        .single();
      if (error || !userData) {
        console.error(`Error fetching team lead profile ${teamLeadUserId}: ${error?.message}`);
        return null;
      }
      return { id: userData.user_id, display_name: userData.display_name, avatar_url: userData.avatar_url, email: userData.email } as GraphQLUser;
    },
    members: async (parentTeam: Pick<GraphQLTeam, 'id'>, _args: Record<string, never>, context: GraphQLContext): Promise<GraphQLUser[]> => {
      const { supabase } = context;
      const { data: memberLinks, error: memberError } = await supabase
        .from('team_members')
        .select('user_id, role') 
        .eq('team_id', parentTeam.id);

      if (memberError) {
        console.error(`Error fetching members for team ${parentTeam.id}: ${memberError.message}`);
        return [];
      }
      if (!memberLinks || memberLinks.length === 0) return [];

      const userIds = memberLinks.map(ml => ml.user_id);
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles') 
        .select('user_id, display_name, avatar_url, email')
        .in('user_id', userIds);

      if (usersError) {
        console.error(`Error fetching member profiles for team ${parentTeam.id}: ${usersError.message}`);
        return [];
      }
      return usersData ? usersData.map(u => ({
          id: u.user_id,
          email: u.email || `${u.user_id.substring(0,8)}@placeholder.email`, 
          display_name: u.display_name,
          avatar_url: u.avatar_url,
        } as GraphQLUser) 
      ) : [];
    },
    createdBy: async (parentTeam: Partial<GraphQLTeam> & { _created_by_user_id?: string }, _args: Record<string, never>, context: GraphQLContext): Promise<GraphQLUser | null> => {
      const createdByUserId = parentTeam._created_by_user_id;
      if (!createdByUserId) return null;
      const { supabase } = context;
      const { data: userData, error } = await supabase
        .from('user_profiles') 
        .select('user_id, display_name, avatar_url, email')
        .eq('user_id', createdByUserId)
        .single();
      if (error || !userData) {
        console.error(`Error fetching creator profile ${createdByUserId}: ${error?.message}`);
        return null;
      }
      return { id: userData.user_id, display_name: userData.display_name, avatar_url: userData.avatar_url, email: userData.email } as GraphQLUser;
    },
  },
};