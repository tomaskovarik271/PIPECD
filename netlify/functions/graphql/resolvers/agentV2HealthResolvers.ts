/**
 * AI Agent V2 Health Monitoring Resolvers
 * Provides comprehensive health, performance, and security monitoring capabilities
 */

import { AgentServiceV2 } from '../../../../lib/aiAgentV2/core/AgentServiceV2';
import { supabase } from '../../../../lib/supabaseClient';
import { requireAuthentication, GraphQLContext } from '../helpers';

export const agentV2HealthResolvers = {
  Query: {
    /**
     * Get comprehensive AI Agent V2 system health status
     */
    getAgentV2Health: async (_: any, __: any, context: GraphQLContext) => {
      try {
        const { userId } = requireAuthentication(context);
        
        // Check if user has admin permissions
        const { data: userProfile, error: userError } = await context.supabaseClient
          .from('user_profiles')
          .select('permissions')
          .eq('id', userId)
          .single();

        if (userError || !userProfile?.permissions?.includes('app_settings:manage')) {
          throw new Error('Access denied: Admin permissions required for health monitoring');
        }

        // Get health status from AgentServiceV2
        const agentService = new AgentServiceV2();
        const healthStatus = await agentService.getSystemHealth(context.supabaseClient);

        return healthStatus;
      } catch (error) {
        console.error('Error fetching Agent V2 health status:', error);
        throw new Error(`Failed to get health status: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },

    /**
     * Get detailed performance metrics for AI Agent V2
     */
    getAgentV2PerformanceMetrics: async (_: any, __: any, context: GraphQLContext) => {
      try {
        const { userId } = requireAuthentication(context);
        
        // Check if user has admin permissions
        const { data: userProfile, error: userError } = await context.supabaseClient
          .from('user_profiles')
          .select('permissions')
          .eq('id', userId)
          .single();

        if (userError || !userProfile?.permissions?.includes('app_settings:manage')) {
          throw new Error('Access denied: Admin permissions required for performance metrics');
        }

        // Get performance metrics from AgentServiceV2
        const agentService = new AgentServiceV2();
        const performanceMetrics = await agentService.getPerformanceMetrics(context.supabaseClient);

        return performanceMetrics;
      } catch (error) {
        console.error('Error fetching Agent V2 performance metrics:', error);
        throw new Error(`Failed to get performance metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  },
}; 