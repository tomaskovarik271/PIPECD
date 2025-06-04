/**
 * PipelineModule - Handles pipeline analysis operations
 * 
 * Handles pipeline analysis operations:
 * - analyzePipeline: Analyze sales pipeline performance and trends
 */

import type { ToolResult, ToolExecutionContext } from '../../types/tools';
import { GraphQLClient } from '../../utils/GraphQLClient';
import { ResponseFormatter } from '../../utils/ResponseFormatter';

export class PipelineModule {
  private graphqlClient: GraphQLClient;

  constructor(graphqlClient: GraphQLClient) {
    this.graphqlClient = graphqlClient;
  }

  /**
   * Analyze pipeline performance and trends
   */
  async analyzePipeline(
    params: {
      time_period?: string;
      stage?: string;
      assigned_to?: string;
      include_forecast?: boolean;
    },
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    try {
      // Get deals for analysis
      const query = `
        query GetDealsForAnalysis {
          deals {
            id
            name
            amount
            stage
            probability
            expectedCloseDate
            createdAt
            updatedAt
            assignedTo {
              id
              name
            }
            organization {
              id
              name
            }
          }
        }
      `;

      const result = await this.graphqlClient.execute(query, {}, context.authToken);
      let deals = result.deals || [];

      // Apply filters
      if (params.stage) {
        deals = deals.filter((deal: any) => 
          deal.stage?.toLowerCase().includes(params.stage!.toLowerCase())
        );
      }

      if (params.assigned_to) {
        deals = deals.filter((deal: any) => 
          deal.assignedTo?.name?.toLowerCase().includes(params.assigned_to!.toLowerCase()) ||
          deal.assignedTo?.id === params.assigned_to
        );
      }

      // Time period filtering
      if (params.time_period) {
        const now = new Date();
        let cutoffDate: Date;
        
        switch (params.time_period.toLowerCase()) {
          case 'week':
            cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case 'quarter':
            cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          default:
            cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        deals = deals.filter((deal: any) => 
          new Date(deal.createdAt) >= cutoffDate
        );
      }

      // Calculate pipeline metrics
      const totalValue = deals.reduce((sum: number, deal: any) => sum + (deal.amount || 0), 0);
      const averageDealSize = deals.length > 0 ? totalValue / deals.length : 0;
      const totalDeals = deals.length;
      
      // Stage breakdown
      const stageBreakdown = deals.reduce((acc: any, deal: any) => {
        const stage = deal.stage || 'Unknown';
        if (!acc[stage]) {
          acc[stage] = { count: 0, value: 0 };
        }
        acc[stage].count++;
        acc[stage].value += deal.amount || 0;
        return acc;
      }, {});

      // Forecast calculation if requested
      let forecast = null;
      if (params.include_forecast) {
        const weightedValue = deals.reduce((sum: number, deal: any) => {
          const probability = deal.probability || 0;
          const amount = deal.amount || 0;
          return sum + (amount * probability / 100);
        }, 0);
        
        forecast = {
          weightedPipelineValue: weightedValue,
          totalPipelineValue: totalValue,
          averageProbability: deals.length > 0 
            ? deals.reduce((sum: number, deal: any) => sum + (deal.probability || 0), 0) / deals.length 
            : 0
        };
      }

      const analysisData = {
        summary: {
          totalDeals,
          totalValue,
          averageDealSize,
          timePeriod: params.time_period || 'all time'
        },
        stageBreakdown,
        forecast,
        dealsList: deals.slice(0, 10).map((deal: any) => ({
          id: deal.id,
          name: deal.name,
          amount: deal.amount,
          stage: deal.stage,
          probability: deal.probability,
          assignedTo: deal.assignedTo?.name,
          organization: deal.organization?.name
        }))
      };

      const formattedResponse = ResponseFormatter.formatSuccess(
        `Pipeline analysis completed for ${totalDeals} deals worth $${totalValue.toLocaleString()}`,
        analysisData
      );

      return {
        success: true,
        data: analysisData,
        message: formattedResponse,
        metadata: {
          toolName: 'analyze_pipeline',
          parameters: params,
          timestamp: new Date().toISOString(),
          executionTime: 0,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: ResponseFormatter.formatError('Failed to analyze pipeline', error),
        metadata: {
          toolName: 'analyze_pipeline',
          parameters: params,
          timestamp: new Date().toISOString(),
          executionTime: 0,
        },
      };
    }
  }
} 