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
  expected_close_date?: string;
  created_at: string;
  updated_at: string;
  assigned_to_user_id?: string;
  person?: Person;
  organization?: Organization;
}

interface Person {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  organization_id?: string;
}

interface Organization {
  id: string;
  name: string;
  address?: string;
  notes?: string;
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
  variables: Record<string, any> = {}
): Promise<GraphQLResponse<T>> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authentication header if available
    if (SUPABASE_JWT_SECRET) {
      headers['Authorization'] = `Bearer ${SUPABASE_JWT_SECRET}`;
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
 * Tool: Search deals with client-side filtering
 */
server.tool(
  "search_deals",
  {
    search_term: z.string().optional().describe("Search term to filter deals by name"),
    assigned_to: z.string().optional().describe("User ID to filter deals assigned to"),
    min_amount: z.number().optional().describe("Minimum deal amount"),
    max_amount: z.number().optional().describe("Maximum deal amount"),
    limit: z.number().optional().default(20).describe("Maximum number of deals to return"),
  },
  async ({ search_term, assigned_to, min_amount, max_amount, limit }) => {
    const query = `
      query GetDeals {
        deals {
          id
          name
          amount
          expected_close_date
          created_at
          updated_at
          assigned_to_user_id
          person {
            id
            first_name
            last_name
            email
          }
          organization {
            id
            name
            address
          }
          assignedToUser {
            id
            display_name
            email
          }
        }
      }
    `;

    const result = await executeGraphQL(query);

    if (result.errors) {
      return {
        content: [{
          type: "text",
          text: `GraphQL Error: ${result.errors.map(e => e.message).join(', ')}`
        }],
        isError: true,
      };
    }

    let deals = result.data?.deals || [];

    // Apply client-side filtering
    if (search_term) {
      deals = deals.filter((deal: any) => 
        deal.name?.toLowerCase().includes(search_term.toLowerCase())
      );
    }

    if (assigned_to) {
      deals = deals.filter((deal: any) => deal.assigned_to_user_id === assigned_to);
    }

    if (min_amount !== undefined) {
      deals = deals.filter((deal: any) => deal.amount && deal.amount >= min_amount);
    }

    if (max_amount !== undefined) {
      deals = deals.filter((deal: any) => deal.amount && deal.amount <= max_amount);
    }

    // Sort by updated_at desc and limit
    deals.sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    deals = deals.slice(0, limit);

    const summary = `Found ${deals.length} deals${search_term ? ` matching "${search_term}"` : ''}`;
    
    const dealsList = deals.map((deal: any) => {
      const contact = deal.person ? `${deal.person.first_name || ''} ${deal.person.last_name || ''}`.trim() : 'No contact';
      const org = deal.organization?.name || 'No organization';
      const amount = deal.amount ? `$${deal.amount.toLocaleString()}` : 'No amount';
      const assignedTo = deal.assignedToUser?.display_name || 'Unassigned';
      
      return `• ${deal.name} - ${amount}
  Contact: ${contact} at ${org}
  Assigned to: ${assignedTo}
  Expected Close: ${deal.expected_close_date || 'Not set'}
  Updated: ${new Date(deal.updated_at).toLocaleDateString()}`;
    }).join('\n\n');

    return {
      content: [{
        type: "text",
        text: `${summary}\n\n${dealsList}`
      }],
    };
  }
);

/**
 * Tool: Get detailed deal information
 */
server.tool(
  "get_deal_details",
  {
    deal_id: z.string().describe("ID of the deal to get details for"),
  },
  async ({ deal_id }) => {
    const query = `
      query GetDealDetails($dealId: ID!) {
        deal(id: $dealId) {
          id
          name
          amount
          expected_close_date
          created_at
          updated_at
          assigned_to_user_id
          person {
            id
            first_name
            last_name
            email
            phone
            notes
          }
          organization {
            id
            name
            address
            notes
          }
          activities {
            id
            type
            subject
            notes
            created_at
            is_done
            due_date
            user {
              display_name
            }
          }
          assignedToUser {
            id
            display_name
            email
          }
          customFieldValues {
            definition {
              fieldLabel
              fieldType
            }
            stringValue
            numberValue
            booleanValue
            dateValue
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
          text: `Deal with ID ${deal_id} not found`
        }],
        isError: true,
      };
    }

    const contact = deal.person ? 
      `${deal.person.first_name || ''} ${deal.person.last_name || ''}`.trim() : 'No contact';
    const org = deal.organization?.name || 'No organization';
    const amount = deal.amount ? `$${deal.amount.toLocaleString()}` : 'No amount';
    const assignedTo = deal.assignedToUser?.display_name || 'Unassigned';

    const activities = deal.activities?.slice(0, 5).map((activity: any) => 
      `• ${activity.type}: ${activity.subject || 'No subject'} (${new Date(activity.created_at).toLocaleDateString()})`
    ).join('\n') || 'No activities';

    const customFields = deal.customFieldValues?.map((field: any) => {
      const value = field.stringValue || field.numberValue || field.booleanValue || field.dateValue || 'No value';
      return `• ${field.definition.fieldLabel}: ${value}`;
    }).join('\n') || 'No custom fields';

    return {
      content: [{
        type: "text",
        text: `# Deal Details: ${deal.name}

**Basic Information:**
- Amount: ${amount}
- Assigned to: ${assignedTo}
- Expected Close: ${deal.expected_close_date || 'Not set'}
- Created: ${new Date(deal.created_at).toLocaleDateString()}
- Last Updated: ${new Date(deal.updated_at).toLocaleDateString()}

**Contact Information:**
- Primary Contact: ${contact}
- Organization: ${org}
${deal.person?.email ? `- Email: ${deal.person.email}` : ''}
${deal.person?.phone ? `- Phone: ${deal.person.phone}` : ''}

**Recent Activities:**
${activities}

**Custom Fields:**
${customFields}

**Notes:**
${deal.organization?.notes ? `Organization: ${deal.organization.notes}` : ''}
${deal.person?.notes ? `Contact: ${deal.person.notes}` : ''}`
      }],
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
      query GetPeople {
        people {
          id
          first_name
          last_name
          email
          phone
          notes
          organization {
            id
            name
            address
          }
        }
      }
    `;

    const result = await executeGraphQL(query);

    if (result.errors) {
      return {
        content: [{
          type: "text",
          text: `GraphQL Error: ${result.errors.map(e => e.message).join(', ')}`
        }],
        isError: true,
      };
    }

    let contacts = result.data?.people || [];

    // Apply client-side filtering
    if (search_term) {
      const searchLower = search_term.toLowerCase();
      contacts = contacts.filter((contact: any) => {
        const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.toLowerCase();
        const email = (contact.email || '').toLowerCase();
        return fullName.includes(searchLower) || email.includes(searchLower);
      });
    }

    if (organization_id) {
      contacts = contacts.filter((contact: any) => contact.organization?.id === organization_id);
    }

    // Limit results
    contacts = contacts.slice(0, limit);

    const summary = `Found ${contacts.length} contacts${search_term ? ` matching "${search_term}"` : ''}`;
    
    const contactsList = contacts.map((contact: any) => {
      const org = contact.organization ? ` at ${contact.organization.name}` : '';
      const email = contact.email ? ` | ${contact.email}` : '';
      const phone = contact.phone ? ` | ${contact.phone}` : '';
      return `• ${contact.first_name || ''} ${contact.last_name || ''}${org}${email}${phone}`;
    }).join('\n');

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
    time_period_days: z.number().optional().default(30).describe("Number of days to analyze"),
  },
  async ({ time_period_days }) => {
    const query = `
      query AnalyzePipeline {
        deals {
          id
          name
          amount
          expected_close_date
          created_at
          updated_at
          assignedToUser {
            display_name
          }
        }
      }
    `;

    const result = await executeGraphQL(query);

    if (result.errors) {
      return {
        content: [{
          type: "text",
          text: `GraphQL Error: ${result.errors.map(e => e.message).join(', ')}`
        }],
        isError: true,
      };
    }

    const allDeals = result.data?.deals || [];
    
    // Filter deals by time period
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - time_period_days);
    
    const recentDeals = allDeals.filter((deal: any) => 
      new Date(deal.updated_at) >= sinceDate
    );

    // Calculate statistics
    const totalDeals = recentDeals.length;
    const totalValue = recentDeals.reduce((sum: number, deal: any) => 
      sum + (deal.amount || 0), 0
    );
    const avgDealSize = totalDeals > 0 ? totalValue / totalDeals : 0;

    // Group by assigned user
    const dealsByUser = recentDeals.reduce((acc: Record<string, any[]>, deal: any) => {
      const user = deal.assignedToUser?.display_name || 'Unassigned';
      if (!acc[user]) acc[user] = [];
      acc[user].push(deal);
      return acc;
    }, {});

    // Expected closes this month
    const thisMonth = new Date();
    thisMonth.setDate(1); // First of current month
    const nextMonth = new Date(thisMonth);
    nextMonth.setMonth(thisMonth.getMonth() + 1);

    const closingThisMonth = allDeals.filter((deal: any) => {
      if (!deal.expected_close_date) return false;
      const closeDate = new Date(deal.expected_close_date);
      return closeDate >= thisMonth && closeDate < nextMonth;
    });

    const userBreakdown = Object.entries(dealsByUser)
      .map(([user, deals]) => {
        const dealsArray = deals as any[];
        const userValue = dealsArray.reduce((sum: number, deal: any) => sum + (deal.amount || 0), 0);
        return `• ${user}: ${dealsArray.length} deals, $${userValue.toLocaleString()}`;
      })
      .join('\n');

    return {
      content: [{
        type: "text",
        text: `# Pipeline Analysis (Last ${time_period_days} days)

**Overall Metrics:**
- Total Active Deals: ${totalDeals}
- Total Pipeline Value: $${totalValue.toLocaleString()}
- Average Deal Size: $${avgDealSize.toLocaleString()}

**Deals by User:**
${userBreakdown || 'No deals assigned'}

**Expected Closes This Month:**
- ${closingThisMonth.length} deals expected to close
- Total value: $${closingThisMonth.reduce((sum: number, deal: any) => sum + (deal.amount || 0), 0).toLocaleString()}

**Recent Activity:**
- ${recentDeals.length} deals updated in the last ${time_period_days} days
- ${allDeals.length - recentDeals.length} deals have not been updated recently`
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
    person_id: z.string().optional().describe("ID of the contact person"),
    organization_id: z.string().optional().describe("ID of the organization"),
    expected_close_date: z.string().optional().describe("Expected close date (YYYY-MM-DD)"),
    assigned_to_user_id: z.string().optional().describe("ID of the user to assign the deal to"),
  },
  async ({ name, amount, person_id, organization_id, expected_close_date, assigned_to_user_id }) => {
    const mutation = `
      mutation CreateDeal($input: DealInput!) {
        createDeal(input: $input) {
          id
          name
          amount
          expected_close_date
          created_at
          person {
            first_name
            last_name
          }
          organization {
            name
          }
        }
      }
    `;

    const input: any = {
      name,
    };

    if (amount !== undefined) input.amount = amount;
    if (person_id) input.person_id = person_id;
    if (organization_id) input.organization_id = organization_id;
    if (expected_close_date) input.expected_close_date = expected_close_date;
    if (assigned_to_user_id) input.assigned_to_user_id = assigned_to_user_id;

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
    const contact = deal.person ? `${deal.person.first_name} ${deal.person.last_name}` : 'No contact';
    const org = deal.organization?.name || 'No organization';
    
    return {
      content: [{
        type: "text",
        text: `✅ Successfully created deal "${deal.name}" (ID: ${deal.id})
- Amount: ${deal.amount ? `$${deal.amount.toLocaleString()}` : 'Not set'}
- Contact: ${contact}
- Organization: ${org}
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
          primaryRecommendation {
            type
            subject
            notes
            suggestedDueDate
            confidence
            reasoning
          }
          recommendations {
            type
            subject
            notes
            suggestedDueDate
            confidence
            reasoning
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

    const primary = recommendations.primaryRecommendation;
    const formattedPrimary = `**${primary.subject}** (${primary.type})
Confidence: ${(primary.confidence * 100).toFixed(1)}%
Due: ${primary.suggestedDueDate || 'Flexible'}

${primary.notes}

💡 *Reasoning*: ${primary.reasoning}`;

    const formattedRecommendations = recommendations.recommendations?.map((rec: any, index: number) => `
${index + 1}. **${rec.subject}** (${rec.type})
   Confidence: ${(rec.confidence * 100).toFixed(1)}%
   Due: ${rec.suggestedDueDate || 'Flexible'}
   
   ${rec.notes}
   
   💡 *Reasoning*: ${rec.reasoning}
`).join('\n') || 'No additional recommendations';

    return {
      content: [{
        type: "text",
        text: `# AI Activity Recommendations for Deal ${deal_id}

## Context Summary
${recommendations.contextSummary}

## 🎯 Primary Recommendation
${formattedPrimary}

## Additional Recommendations
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