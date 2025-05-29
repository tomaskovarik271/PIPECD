#!/usr/bin/env node

/**
 * PipeCD MCP Server - Model Context Protocol server for PipeCD
 * 
 * This server exposes PipeCD's GraphQL operations as MCP tools, enabling
 * AI models like Claude to perform intelligent multi-step reasoning
 * over the PipeCD database through structured queries.
 * 
 * Features:
 * - GraphQL query execution as MCP tools
 * - Deal management operations
 * - Contact and organization data access
 * - Activity tracking and analysis
 * - AI-powered insights and recommendations
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch from 'node-fetch';

// Types for our GraphQL operations
interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    path?: string[];
  }>;
}

interface Deal {
  id: string;
  name: string;
  amount?: number;
  stage: string;
  expected_close_date?: string;
  created_at: string;
  updated_at: string;
  assigned_to_user_id?: string;
}

interface Person {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  job_title?: string;
  organization_id?: string;
}

interface Organization {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  size?: string;
}

interface Activity {
  id: string;
  type: string;
  subject?: string;
  notes?: string;
  created_at: string;
  deal_id?: string;
  person_id?: string;
}

// Create MCP server
const server = new McpServer({
  name: "pipecd-mcp-server",
  version: "1.0.0",
});

// GraphQL endpoint configuration
const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || 'http://localhost:3000/.netlify/functions/graphql';
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

/**
 * Execute a GraphQL query against the PipeCD endpoint
 */
async function executeGraphQL<T = any>(
  query: string, 
  variables: Record<string, any> = {},
  accessToken?: string
): Promise<GraphQLResponse<T>> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json() as GraphQLResponse<T>;
  } catch (error) {
    console.error('GraphQL execution error:', error);
    throw error;
  }
}

/**
 * Tool: Search deals with intelligent filtering
 */
server.tool(
  "search_deals",
  {
    search_term: z.string().optional().describe("Search term to filter deals by name"),
    stage: z.string().optional().describe("Deal stage to filter by"),
    assigned_to: z.string().optional().describe("User ID to filter deals assigned to"),
    min_amount: z.number().optional().describe("Minimum deal amount"),
    max_amount: z.number().optional().describe("Maximum deal amount"),
    limit: z.number().optional().default(20).describe("Maximum number of deals to return"),
  },
  async ({ search_term, stage, assigned_to, min_amount, max_amount, limit }) => {
    const query = `
      query SearchDeals($searchTerm: String, $stage: String, $assignedTo: String, $minAmount: Float, $maxAmount: Float, $limit: Int) {
        deals(
          where: {
            ${search_term ? 'name: { ilike: $searchTerm }' : ''}
            ${stage ? 'stage: { eq: $stage }' : ''}
            ${assigned_to ? 'assigned_to_user_id: { eq: $assignedTo }' : ''}
            ${min_amount ? 'amount: { gte: $minAmount }' : ''}
            ${max_amount ? 'amount: { lte: $maxAmount }' : ''}
          }
          limit: $limit
          order_by: { updated_at: desc }
        ) {
          id
          name
          amount
          stage
          expected_close_date
          created_at
          updated_at
          assigned_to_user_id
          contact_person {
            first_name
            last_name
            email
            job_title
          }
          organization {
            name
            industry
          }
        }
      }
    `;

    const variables = {
      searchTerm: search_term ? `%${search_term}%` : undefined,
      stage,
      assignedTo: assigned_to,
      minAmount: min_amount,
      maxAmount: max_amount,
      limit,
    };

    const result = await executeGraphQL(query, variables);

    if (result.errors) {
      return {
        content: [{
          type: "text",
          text: `GraphQL Error: ${result.errors.map(e => e.message).join(', ')}`
        }],
        isError: true,
      };
    }

    const deals = result.data?.deals || [];
    const summary = `Found ${deals.length} deals${search_term ? ` matching "${search_term}"` : ''}${stage ? ` in stage "${stage}"` : ''}`;
    
    const dealsList = deals.map((deal: any) => {
      const contact = deal.contact_person ? `${deal.contact_person.first_name} ${deal.contact_person.last_name}` : 'No contact';
      const org = deal.organization?.name || 'No organization';
      const amount = deal.amount ? `$${deal.amount.toLocaleString()}` : 'No amount';
      
      return `• ${deal.name} (${deal.stage}) - ${amount}
  Contact: ${contact} at ${org}
  Expected Close: ${deal.expected_close_date || 'Not set'}`;
    }).join('\n\n');

    return {
      content: [{
        type: "text",
        text: `${summary}\n\n${dealsList || 'No deals found.'}`
      }]
    };
  }
);

/**
 * Tool: Get detailed deal information
 */
server.tool(
  "get_deal_details",
  {
    deal_id: z.string().describe("The ID of the deal to retrieve details for"),
  },
  async ({ deal_id }) => {
    const query = `
      query GetDealDetails($dealId: ID!) {
        deal(id: $dealId) {
          id
          name
          amount
          stage
          expected_close_date
          created_at
          updated_at
          assigned_to_user_id
          notes
          contact_person {
            id
            first_name
            last_name
            email
            job_title
            phone
          }
          organization {
            id
            name
            industry
            website
            size
          }
          activities(limit: 10, order_by: { created_at: desc }) {
            id
            type
            subject
            notes
            created_at
            created_by_user_id
          }
        }
      }
    `;

    const result = await executeGraphQL(query, { dealId: deal_id });

    if (result.errors) {
      return {
        content: [{
          type: "text",
          text: `GraphQL Error: ${result.errors.map(e => e.message).join(', ')}`
        }],
        isError: true,
      };
    }

    const deal = result.data?.deal;
    if (!deal) {
      return {
        content: [{
          type: "text",
          text: `Deal with ID "${deal_id}" not found.`
        }],
        isError: true,
      };
    }

    const contact = deal.contact_person;
    const org = deal.organization;
    const activities = deal.activities || [];

    const dealInfo = `# Deal: ${deal.name}

## Basic Information
- **ID**: ${deal.id}
- **Stage**: ${deal.stage}
- **Amount**: ${deal.amount ? `$${deal.amount.toLocaleString()}` : 'Not set'}
- **Expected Close**: ${deal.expected_close_date || 'Not set'}
- **Created**: ${new Date(deal.created_at).toLocaleDateString()}
- **Last Updated**: ${new Date(deal.updated_at).toLocaleDateString()}

## Contact Information
${contact ? `
- **Name**: ${contact.first_name} ${contact.last_name}
- **Email**: ${contact.email || 'Not provided'}
- **Job Title**: ${contact.job_title || 'Not provided'}
- **Phone**: ${contact.phone || 'Not provided'}
` : 'No contact assigned'}

## Organization
${org ? `
- **Name**: ${org.name}
- **Industry**: ${org.industry || 'Not specified'}
- **Website**: ${org.website || 'Not provided'}
- **Size**: ${org.size || 'Not specified'}
` : 'No organization assigned'}

## Recent Activities (${activities.length})
${activities.length > 0 ? activities.map((activity: any) => `
- **${activity.type}**: ${activity.subject || 'No subject'}
  ${activity.notes ? `Notes: ${activity.notes}` : ''}
  ${new Date(activity.created_at).toLocaleDateString()}
`).join('\n') : 'No recent activities'}

## Notes
${deal.notes || 'No notes available'}`;

    return {
      content: [{
        type: "text",
        text: dealInfo
      }]
    };
  }
);

/**
 * Tool: Search contacts and organizations
 */
server.tool(
  "search_contacts",
  {
    search_term: z.string().describe("Search term to find contacts by name or email"),
    organization_id: z.string().optional().describe("Filter by organization ID"),
    limit: z.number().optional().default(10).describe("Maximum number of contacts to return"),
  },
  async ({ search_term, organization_id, limit }) => {
    const query = `
      query SearchContacts($searchTerm: String!, $organizationId: String, $limit: Int) {
        people(
          where: {
            or: [
              { first_name: { ilike: $searchTerm } }
              { last_name: { ilike: $searchTerm } }
              { email: { ilike: $searchTerm } }
            ]
            ${organization_id ? 'organization_id: { eq: $organizationId }' : ''}
          }
          limit: $limit
        ) {
          id
          first_name
          last_name
          email
          job_title
          phone
          organization {
            id
            name
            industry
          }
        }
      }
    `;

    const variables = {
      searchTerm: `%${search_term}%`,
      organizationId: organization_id,
      limit,
    };

    const result = await executeGraphQL(query, variables);

    if (result.errors) {
      return {
        content: [{
          type: "text",
          text: `GraphQL Error: ${result.errors.map(e => e.message).join(', ')}`
        }],
        isError: true,
      };
    }

    const contacts = result.data?.people || [];
    const summary = `Found ${contacts.length} contacts matching "${search_term}"`;
    
    const contactsList = contacts.map((contact: any) => {
      const org = contact.organization ? ` at ${contact.organization.name}` : '';
      return `• ${contact.first_name} ${contact.last_name}${org}
  ${contact.job_title || 'No title'} | ${contact.email || 'No email'}`;
    }).join('\n\n');

    return {
      content: [{
        type: "text",
        text: `${summary}\n\n${contactsList || 'No contacts found.'}`
      }]
    };
  }
);

/**
 * Tool: Analyze deal pipeline and trends
 */
server.tool(
  "analyze_pipeline",
  {
    stage: z.string().optional().describe("Focus analysis on specific stage"),
    time_period_days: z.number().optional().default(30).describe("Number of days to analyze"),
  },
  async ({ stage, time_period_days }) => {
    const query = `
      query AnalyzePipeline($stage: String, $since: DateTime!) {
        deals(
          where: {
            ${stage ? 'stage: { eq: $stage }' : ''}
            updated_at: { gte: $since }
          }
        ) {
          id
          name
          amount
          stage
          expected_close_date
          created_at
          updated_at
        }
        
        deal_stats: deals_aggregate(
          where: {
            ${stage ? 'stage: { eq: $stage }' : ''}
            updated_at: { gte: $since }
          }
        ) {
          aggregate {
            count
            sum { amount }
            avg { amount }
          }
        }
      }
    `;

    const since = new Date();
    since.setDate(since.getDate() - time_period_days);

    const result = await executeGraphQL(query, { 
      stage, 
      since: since.toISOString() 
    });

    if (result.errors) {
      return {
        content: [{
          type: "text",
          text: `GraphQL Error: ${result.errors.map(e => e.message).join(', ')}`
        }],
        isError: true,
      };
    }

    const deals = result.data?.deals || [];
    const stats = result.data?.deal_stats?.aggregate || {};

    // Group deals by stage
    const dealsByStage = deals.reduce((acc: Record<string, any[]>, deal: any) => {
      if (!acc[deal.stage]) acc[deal.stage] = [];
      acc[deal.stage].push(deal);
      return acc;
    }, {});

    // Calculate stage metrics
    const stageAnalysis = Object.entries(dealsByStage).map(([stageName, stageDeals]) => {
      const typedStageDeals = stageDeals as any[];
      const totalAmount = typedStageDeals.reduce((sum, deal) => sum + (deal.amount || 0), 0);
      const avgAmount = typedStageDeals.length > 0 ? totalAmount / typedStageDeals.length : 0;
      
      return `**${stageName}**: ${typedStageDeals.length} deals, $${totalAmount.toLocaleString()} total (avg: $${Math.round(avgAmount).toLocaleString()})`;
    }).join('\n');

    const analysis = `# Pipeline Analysis (Last ${time_period_days} days)
${stage ? `Focus: ${stage} stage` : 'All stages'}

## Overall Metrics
- **Total Deals**: ${stats.count || 0}
- **Total Value**: $${(stats.sum?.amount || 0).toLocaleString()}
- **Average Deal Size**: $${Math.round(stats.avg?.amount || 0).toLocaleString()}

## By Stage
${stageAnalysis || 'No deals found in the specified period'}

## Recent Deal Velocity
${deals.length > 0 ? `
Deals updated recently: ${deals.length}
Most recent update: ${new Date(Math.max(...deals.map((d: any) => new Date(d.updated_at).getTime()))).toLocaleDateString()}
` : 'No recent deal activity'}`;

    return {
      content: [{
        type: "text",
        text: analysis
      }]
    };
  }
);

/**
 * Tool: Create new deal
 */
server.tool(
  "create_deal",
  {
    name: z.string().describe("Name of the new deal"),
    amount: z.number().optional().describe("Deal amount"),
    stage: z.string().optional().default("DISCOVERY").describe("Initial deal stage"),
    contact_person_id: z.string().optional().describe("ID of the contact person"),
    organization_id: z.string().optional().describe("ID of the organization"),
    expected_close_date: z.string().optional().describe("Expected close date (YYYY-MM-DD)"),
    notes: z.string().optional().describe("Initial notes about the deal"),
  },
  async ({ name, amount, stage, contact_person_id, organization_id, expected_close_date, notes }) => {
    const mutation = `
      mutation CreateDeal($input: CreateDealInput!) {
        createDeal(input: $input) {
          id
          name
          amount
          stage
          expected_close_date
          created_at
        }
      }
    `;

    const input = {
      name,
      amount,
      stage,
      contact_person_id,
      organization_id,
      expected_close_date,
      notes,
    };

    const result = await executeGraphQL(mutation, { input });

    if (result.errors) {
      return {
        content: [{
          type: "text",
          text: `Failed to create deal: ${result.errors.map(e => e.message).join(', ')}`
        }],
        isError: true,
      };
    }

    const deal = result.data?.createDeal;
    return {
      content: [{
        type: "text",
        text: `✅ Successfully created deal "${deal.name}" (ID: ${deal.id})
- Stage: ${deal.stage}
- Amount: ${deal.amount ? `$${deal.amount.toLocaleString()}` : 'Not set'}
- Expected Close: ${deal.expected_close_date || 'Not set'}
- Created: ${new Date(deal.created_at).toLocaleDateString()}`
      }]
    };
  }
);

/**
 * Tool: Get AI activity recommendations for a deal
 */
server.tool(
  "get_activity_recommendations",
  {
    deal_id: z.string().describe("The ID of the deal to get recommendations for"),
  },
  async ({ deal_id }) => {
    const query = `
      query GetActivityRecommendations($dealId: ID!) {
        getAIActivityRecommendations(dealId: $dealId) {
          contextSummary
          recommendations {
            type
            title
            description
            reasoning
            confidenceScore
            suggestedDueDate
            priority
          }
        }
      }
    `;

    const result = await executeGraphQL(query, { dealId: deal_id });

    if (result.errors) {
      return {
        content: [{
          type: "text",
          text: `GraphQL Error: ${result.errors.map(e => e.message).join(', ')}`
        }],
        isError: true,
      };
    }

    const recommendations = result.data?.getAIActivityRecommendations;
    if (!recommendations) {
      return {
        content: [{
          type: "text",
          text: `No recommendations available for deal "${deal_id}".`
        }],
        isError: true,
      };
    }

    const formattedRecommendations = recommendations.recommendations.map((rec: any, index: number) => `
${index + 1}. **${rec.title}** (${rec.type}, Priority: ${rec.priority})
   Confidence: ${rec.confidenceScore}%
   Due: ${rec.suggestedDueDate || 'Flexible'}
   
   ${rec.description}
   
   💡 *Reasoning*: ${rec.reasoning}
`).join('\n');

    return {
      content: [{
        type: "text",
        text: `# AI Activity Recommendations for Deal ${deal_id}

## Context Summary
${recommendations.contextSummary}

## Recommended Activities
${formattedRecommendations}`
      }]
    };
  }
);

/**
 * Start the MCP server
 */
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("PipeCD MCP Server started and listening on stdio");
    console.error(`GraphQL endpoint: ${GRAPHQL_ENDPOINT}`);
  } catch (error) {
    console.error("Failed to start PipeCD MCP server:", error);
    process.exit(1);
  }
}

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.error('Shutting down PipeCD MCP server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('Shutting down PipeCD MCP server...');
  process.exit(0);
});

// Check if this file is being run directly (ES module equivalent of require.main === module)
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  main().catch(error => {
    console.error("Fatal error in PipeCD MCP server:", error);
    process.exit(1);
  });
} 