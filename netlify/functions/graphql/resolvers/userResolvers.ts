import {
  Resolvers,
  User as GraphQLUser,
  Team as GraphQLTeam
} from '../../../../lib/generated/graphql';
import { GraphQLContext } from '../index';
import { mapDbTeamToGraphQLTeam } from './teamResolvers';
import { GraphQLError } from 'graphql';

export const userResolvers: Resolvers<GraphQLContext> = {
  User: {
    teams: async (parentUser: Pick<GraphQLUser, 'id'>, _args: Record<string, never>, context: GraphQLContext): Promise<GraphQLTeam[]> => {
      console.log(`User.teams: Fetching teams for user ${parentUser.id}`);
      const { supabase } = context;

      if (!parentUser.id) {
        console.warn('User.teams: parentUser.id is missing.');
        return [];
      }

      try {
        // Fetch team_ids the user is a member of
        const { data: teamMembers, error: tmError } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', parentUser.id);

        if (tmError) {
          console.error(`User.teams: Error fetching team memberships for user ${parentUser.id}:`, tmError.message);
          throw new GraphQLError('Could not fetch team memberships.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
        }

        if (!teamMembers || teamMembers.length === 0) {
          console.log(`User.teams: User ${parentUser.id} is not a member of any teams.`);
          return [];
        }

        const teamIds = teamMembers.map(tm => tm.team_id);

        // Fetch details for those teams
        // RLS on 'teams' table should apply here for the user making the query (context.currentUser)
        // not necessarily for parentUser.id if an admin is querying another user's teams.
        // The mapDbTeamToGraphQLTeam expects full team objects.
        const { data: teamsData, error: tError } = await supabase
          .from('teams')
          .select('*') // RLS will filter this based on the logged-in user's permissions
          .in('id', teamIds);

        if (tError) {
          console.error(`User.teams: Error fetching teams for user ${parentUser.id} with IDs [${teamIds.join(', ')}]:`, tError.message);
          throw new GraphQLError('Could not fetch teams.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
        }
        
        if (!teamsData) {
            return [];
        }

        // Map DB data to GraphQL types
        // The mapDbTeamToGraphQLTeam helper returns Partial<GraphQLTeam>
        // but the schema expects GraphQLTeam[]. We cast it as GraphQLTeam,
        // assuming the mapped fields + field resolvers will complete the object.
        return teamsData.map(dbTeam => mapDbTeamToGraphQLTeam(dbTeam) as GraphQLTeam);

      } catch (error) {
        console.error(`User.teams: Unexpected error for user ${parentUser.id}:`, error);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('An unexpected error occurred while fetching user teams.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
      }
    },
  },
}; 