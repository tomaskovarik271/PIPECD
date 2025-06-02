import { GraphQLError } from 'graphql';
import { GraphQLContext, requireAuthentication, getAccessToken, processZodError } from '../../helpers';
import { gatherDealContext, generateActivityRecommendations } from '../../../../../lib/aiActivityService';
import type { 
  QueryResolvers, 
  QueryGetAiActivityRecommendationsArgs,
  AiActivityRecommendationsResponse
} from '../../../../../lib/generated/graphql';
import { ActivityType } from '../../../../../lib/generated/graphql';

export const aiActivityRecommendationsResolver: Pick<QueryResolvers<GraphQLContext>, 'getAIActivityRecommendations'> = {
  getAIActivityRecommendations: async (
    _parent: any, 
    args: QueryGetAiActivityRecommendationsArgs, 
    context: GraphQLContext
  ): Promise<AiActivityRecommendationsResponse> => {
    const action = 'getting AI activity recommendations';
    try {
      requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      const { dealId } = args;

      // Check basic permissions for viewing deals
      if (!context.userPermissions?.includes('deal:read_any') && 
          !context.userPermissions?.includes('deal:read_own')) {
        throw new GraphQLError('Forbidden: You do not have permission to view deals.', { 
          extensions: { code: 'FORBIDDEN' } 
        });
      }

      // Gather comprehensive deal context
      const dealContext = await gatherDealContext(dealId, accessToken);
      
      // Generate AI recommendations
      const recommendations = await generateActivityRecommendations(dealContext);
      
      // Convert AI activity types to GraphQL ActivityType enum
      const mapActivityType = (type: string): ActivityType => {
        switch (type) {
          case 'CALL': return ActivityType.Call;
          case 'EMAIL': return ActivityType.Email;
          case 'MEETING': return ActivityType.Meeting;
          case 'TASK': return ActivityType.Task;
          case 'DEADLINE': return ActivityType.Deadline;
          default: return ActivityType.Task; // fallback
        }
      };
      
      return {
        __typename: 'AIActivityRecommendationsResponse',
        recommendations: recommendations.recommendations.map(rec => ({
          __typename: 'AIActivityRecommendation',
          type: mapActivityType(rec.type),
          subject: rec.subject,
          notes: rec.notes,
          suggestedDueDate: rec.suggestedDueDate,
          confidence: rec.confidence,
          reasoning: rec.reasoning
        })),
        primaryRecommendation: {
          __typename: 'AIActivityRecommendation',
          type: mapActivityType(recommendations.primaryRecommendation.type),
          subject: recommendations.primaryRecommendation.subject,
          notes: recommendations.primaryRecommendation.notes,
          suggestedDueDate: recommendations.primaryRecommendation.suggestedDueDate,
          confidence: recommendations.primaryRecommendation.confidence,
          reasoning: recommendations.primaryRecommendation.reasoning
        },
        contextSummary: recommendations.contextSummary
      };
      
    } catch (error) {
      console.error('[AI Activity Recommendations] Error:', error);
      throw processZodError(error, action);
    }
  }
}; 