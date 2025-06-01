/**
 * PipeCD AI Agent Service
 * Core service for managing autonomous agent conversations, thoughts, and tool execution
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { AIService } from './aiService';
import type {
  AgentConversation,
  AgentMessage,
  AgentThought,
  AgentResponse,
  MCPTool,
  MCPToolCall,
  MCPToolResponse,
  SendMessageInput,
  ConversationCreateData,
  ConversationUpdateData,
  ThoughtCreateData,
} from './types';
import {
  AgentError,
  MCPError,
  DEFAULT_AGENT_CONFIG,
} from './types';
import type { Database } from '../database.types';

export class AgentService {
  private supabase: SupabaseClient<Database>;
  private mcpEndpoint: string;
  private availableTools: Map<string, MCPTool> = new Map();
  private aiService: AIService | null = null;
  private accessToken: string | null = null;
  private emitThoughtUpdate?: (conversationId: string, thought: any) => void;

  constructor(
    supabase: SupabaseClient<Database>,
    mcpEndpoint: string = process.env.MCP_ENDPOINT || 'http://localhost:3001'
  ) {
    this.supabase = supabase;
    this.mcpEndpoint = mcpEndpoint;
    
    // Initialize AI service if API key is available
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicApiKey) {
      this.aiService = new AIService({
        apiKey: anthropicApiKey,
        model: 'claude-sonnet-4-20250514', // Claude 4 Sonnet (May 2025)
        maxTokens: 4096,
        temperature: 0.7,
      });
    } else {
      console.warn('ANTHROPIC_API_KEY not found - AI responses will use placeholder mode');
    }
  }

  // Set access token for tool calls
  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  // Set callback for real-time thought updates (WebSocket/SSE integration)
  setThoughtUpdateCallback(callback: (conversationId: string, thought: any) => void) {
    this.emitThoughtUpdate = callback;
  }

  // ================================
  // Conversation Management
  // ================================

  async createConversation(data: ConversationCreateData): Promise<AgentConversation> {
    try {
      const conversationData = {
        user_id: data.userId,
        messages: JSON.stringify(data.messages || []),
        plan: data.plan ? JSON.stringify(data.plan) : null,
        context: JSON.stringify(data.context || {}),
      };

      const { data: conversation, error } = await this.supabase
        .from('agent_conversations')
        .insert(conversationData)
        .select()
        .single();

      if (error) {
        throw new AgentError('Failed to create conversation', 'CREATE_CONVERSATION_ERROR', { error });
      }

      return this.mapDbConversationToModel(conversation);
    } catch (error) {
      if (error instanceof AgentError) throw error;
      throw new AgentError('Unexpected error creating conversation', 'UNEXPECTED_ERROR', { error });
    }
  }

  async getConversation(id: string, userId: string): Promise<AgentConversation | null> {
    try {
      const { data: conversation, error } = await this.supabase
        .from('agent_conversations')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw new AgentError('Failed to fetch conversation', 'FETCH_CONVERSATION_ERROR', { error });
      }

      return this.mapDbConversationToModel(conversation);
    } catch (error) {
      if (error instanceof AgentError) throw error;
      throw new AgentError('Unexpected error fetching conversation', 'UNEXPECTED_ERROR', { error });
    }
  }

  async getConversations(
    userId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<AgentConversation[]> {
    try {
      const { data: conversations, error } = await this.supabase
        .from('agent_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new AgentError('Failed to fetch conversations', 'FETCH_CONVERSATIONS_ERROR', { error });
      }

      return conversations.map(this.mapDbConversationToModel);
    } catch (error) {
      if (error instanceof AgentError) throw error;
      throw new AgentError('Unexpected error fetching conversations', 'UNEXPECTED_ERROR', { error });
    }
  }

  async updateConversation(
    id: string,
    userId: string,
    updates: ConversationUpdateData
  ): Promise<AgentConversation> {
    try {
      const updateData: any = {};
      
      if (updates.messages) {
        updateData.messages = JSON.stringify(updates.messages);
      }
      if (updates.plan) {
        updateData.plan = JSON.stringify(updates.plan);
      }
      if (updates.context) {
        updateData.context = JSON.stringify(updates.context);
      }

      const { data: conversation, error } = await this.supabase
        .from('agent_conversations')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw new AgentError('Failed to update conversation', 'UPDATE_CONVERSATION_ERROR', { error });
      }

      return this.mapDbConversationToModel(conversation);
    } catch (error) {
      if (error instanceof AgentError) throw error;
      throw new AgentError('Unexpected error updating conversation', 'UNEXPECTED_ERROR', { error });
    }
  }

  async deleteConversation(id: string, userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('agent_conversations')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        throw new AgentError('Failed to delete conversation', 'DELETE_CONVERSATION_ERROR', { error });
      }

      return true;
    } catch (error) {
      if (error instanceof AgentError) throw error;
      throw new AgentError('Unexpected error deleting conversation', 'UNEXPECTED_ERROR', { error });
    }
  }

  // ================================
  // Thought Management
  // ================================

  async addThoughts(
    conversationId: string,
    thoughts: ThoughtCreateData[]
  ): Promise<AgentThought[]> {
    try {
      const thoughtsData = thoughts.map(thought => ({
        conversation_id: conversationId,
        type: thought.type,
        content: thought.content,
        metadata: JSON.stringify(thought.metadata || {}),
      }));

      const { data: createdThoughts, error } = await this.supabase
        .from('agent_thoughts')
        .insert(thoughtsData)
        .select();

      if (error) {
        throw new AgentError('Failed to add thoughts', 'ADD_THOUGHTS_ERROR', { error });
      }

      return createdThoughts.map(this.mapDbThoughtToModel);
    } catch (error) {
      if (error instanceof AgentError) throw error;
      throw new AgentError('Unexpected error adding thoughts', 'UNEXPECTED_ERROR', { error });
    }
  }

  async getThoughts(conversationId: string, limit: number = 50): Promise<AgentThought[]> {
    try {
      const { data: thoughts, error } = await this.supabase
        .from('agent_thoughts')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true })
        .limit(limit);

      if (error) {
        throw new AgentError('Failed to fetch thoughts', 'FETCH_THOUGHTS_ERROR', { error });
      }

      return thoughts.map(this.mapDbThoughtToModel);
    } catch (error) {
      if (error instanceof AgentError) throw error;
      throw new AgentError('Unexpected error fetching thoughts', 'UNEXPECTED_ERROR', { error });
    }
  }

  // ================================
  // MCP Tool Integration
  // ================================

  async discoverTools(): Promise<MCPTool[]> {
    // Since our MCP server uses stdio transport for Claude Desktop,
    // we'll define the available tools directly here for the web interface
    return [
      {
        name: 'search_deals',
        description: 'Search and filter deals by various criteria',
        parameters: {
          type: 'object',
          properties: {
            search_term: { type: 'string', description: 'Search term to filter deals by name' },
            assigned_to: { type: 'string', description: 'User ID to filter deals assigned to' },
            min_amount: { type: 'number', description: 'Minimum deal amount' },
            max_amount: { type: 'number', description: 'Maximum deal amount' },
            limit: { type: 'number', description: 'Maximum number of deals to return', default: 20 },
          },
        },
      },
      {
        name: 'get_deal_details',
        description: 'Get comprehensive deal analysis with full context',
        parameters: {
          type: 'object',
          properties: {
            deal_id: { type: 'string', description: 'ID of the deal to get details for' },
          },
          required: ['deal_id'],
        },
      },
      {
        name: 'search_contacts',
        description: 'Find contacts and people by name or email',
        parameters: {
          type: 'object',
          properties: {
            search_term: { type: 'string', description: 'Search term to find contacts by name or email' },
            organization_id: { type: 'string', description: 'Filter by organization ID' },
            limit: { type: 'number', description: 'Maximum number of contacts to return', default: 10 },
          },
          required: ['search_term'],
        },
      },
      {
        name: 'search_organizations',
        description: 'Find organizations by name to get their IDs for deal creation',
        parameters: {
          type: 'object',
          properties: {
            search_term: { type: 'string', description: 'Search term to find organizations by name' },
            limit: { type: 'number', description: 'Maximum number of organizations to return', default: 10 },
          },
          required: ['search_term'],
        },
      },
      {
        name: 'analyze_pipeline',
        description: 'Pipeline trends and performance analysis',
        parameters: {
          type: 'object',
          properties: {
            time_period_days: { type: 'number', description: 'Number of days to analyze', default: 30 },
          },
        },
      },
      {
        name: 'create_deal',
        description: 'Create new deals through natural language',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Name of the new deal' },
            amount: { type: 'number', description: 'Deal amount' },
            person_id: { type: 'string', description: 'ID of the contact person' },
            organization_id: { type: 'string', description: 'ID of the organization' },
            expected_close_date: { type: 'string', description: 'Expected close date (YYYY-MM-DD)' },
            assigned_to_user_id: { type: 'string', description: 'ID of the user to assign the deal to' },
          },
          required: ['name'],
        },
      },
      {
        name: 'search_users',
        description: 'Find users by name or email to assign deals and tasks',
        parameters: {
          type: 'object',
          properties: {
            search_term: { type: 'string', description: 'Search term to find users by name or email' },
            limit: { type: 'number', description: 'Maximum number of users to return', default: 10 },
          },
          required: ['search_term'],
        },
      },
    ];
  }

  async callTool(toolCall: MCPToolCall, accessToken?: string): Promise<MCPToolResponse> {
    try {
      // Execute GraphQL operations directly instead of calling HTTP MCP server
      const result = await this.executeToolDirectly(toolCall.toolName, toolCall.parameters, accessToken);
      
      return {
        success: true,
        result,
        metadata: { timestamp: new Date().toISOString() },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error calling tool',
        metadata: { error },
      };
    }
  }

  private async executeToolDirectly(toolName: string, parameters: Record<string, any>, accessToken?: string): Promise<string> {
    // Try to get the access token from parameters first, then from supabase session
    let authToken = accessToken;
    
    if (!authToken) {
      const { data: { session } } = await this.supabase.auth.getSession();
      authToken = session?.access_token;
    }

    if (!authToken) {
      throw new Error('Authentication required - please log in');
    }

    const graphqlEndpoint = process.env.GRAPHQL_ENDPOINT || 'http://localhost:8888/.netlify/functions/graphql';

    const executeGraphQL = async (query: string, variables: Record<string, any> = {}) => {
      const response = await fetch(graphqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ query, variables }),
      });

      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      if (result.errors) {
        throw new Error(`GraphQL errors: ${result.errors.map((e: any) => e.message).join(', ')}`);
      }

      return result;
    };

    switch (toolName) {
      case 'search_deals': {
        const { search_term, assigned_to, min_amount, max_amount, limit = 20 } = parameters;
        
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

        return `${summary}\n\n${dealsList}`;
      }

      case 'analyze_pipeline': {
        const { time_period_days = 30 } = parameters;
        
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

        // Expected closes this month
        const thisMonth = new Date();
        thisMonth.setDate(1);
        const nextMonth = new Date(thisMonth);
        nextMonth.setMonth(thisMonth.getMonth() + 1);

        const closingThisMonth = allDeals.filter((deal: any) => {
          if (!deal.expected_close_date) return false;
          const closeDate = new Date(deal.expected_close_date);
          return closeDate >= thisMonth && closeDate < nextMonth;
        });

        return `# Pipeline Analysis (Last ${time_period_days} days)

**Overall Metrics:**
- Total Active Deals: ${totalDeals}
- Total Pipeline Value: $${totalValue.toLocaleString()}
- Average Deal Size: $${avgDealSize.toLocaleString()}

**Expected Closes This Month:**
- ${closingThisMonth.length} deals expected to close
- Total value: $${closingThisMonth.reduce((sum: number, deal: any) => sum + (deal.amount || 0), 0).toLocaleString()}

**All Deals Count: ${allDeals.length}**
**Recent Activity:** ${recentDeals.length} deals updated in the last ${time_period_days} days`;
      }

      case 'search_contacts': {
        const { search_term, organization_id, limit = 10 } = parameters;
        
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
          return `• ${contact.first_name || ''} ${contact.last_name || ''}${org}${email}${phone}
  ID: ${contact.id}`;
        }).join('\n');

        return `${summary}\n\n${contactsList || 'No contacts found.'}`;
      }

      case 'search_organizations': {
        const { search_term, limit = 10 } = parameters;
        
        const query = `
          query GetOrganizations {
            organizations {
              id
              name
              address
              notes
              created_at
            }
          }
        `;

        const result = await executeGraphQL(query);
        let organizations = result.data?.organizations || [];

        // Apply client-side filtering
        if (search_term) {
          const searchLower = search_term.toLowerCase();
          organizations = organizations.filter((org: any) => 
            (org.name || '').toLowerCase().includes(searchLower)
          );
        }

        // Sort by name and limit
        organizations.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
        organizations = organizations.slice(0, limit);

        const summary = `Found ${organizations.length} organizations${search_term ? ` matching "${search_term}"` : ''}`;
        
        const orgsList = organizations.map((org: any) => {
          const address = org.address ? ` | ${org.address}` : '';
          const created = new Date(org.created_at).toLocaleDateString();
          return `• ${org.name}${address}
  ID: ${org.id} | Created: ${created}`;
        }).join('\n');

        return `${summary}\n\n${orgsList || 'No organizations found.'}`;
      }

      case 'get_deal_details': {
        const { deal_id } = parameters;
        
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
        const deal = result.data?.deal;
        
        if (!deal) {
          return `Deal with ID ${deal_id} not found`;
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

        return `# Deal Details: ${deal.name}

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
${deal.person?.notes ? `Contact: ${deal.person.notes}` : ''}`;
      }

      case 'create_deal': {
        const { name, amount, person_id, organization_id, expected_close_date, assigned_to_user_id } = parameters;
        
        // First, get a default WFM project type for deals
        const projectTypeQuery = `
          query GetDefaultProjectType {
            wfmProjectTypes(isArchived: false) {
              id
              name
            }
          }
        `;
        
        const projectTypeResult = await executeGraphQL(projectTypeQuery);
        const projectTypes = projectTypeResult.data?.wfmProjectTypes || [];
        
        if (projectTypes.length === 0) {
          throw new Error('No WFM project types available. Please contact your administrator to set up project types.');
        }
        
        // Use the first available project type as default
        const defaultProjectTypeId = projectTypes[0].id;
        
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
          name: name || 'New Deal',
          wfmProjectTypeId: defaultProjectTypeId,
        };

        if (amount !== undefined) input.amount = amount;
        if (person_id) input.person_id = person_id;
        if (organization_id) input.organization_id = organization_id;
        // Smart default: Set expected close date to 30 days from now if not specified
        if (expected_close_date) {
          input.expected_close_date = expected_close_date;
        } else {
          const defaultCloseDate = new Date();
          defaultCloseDate.setDate(defaultCloseDate.getDate() + 30);
          input.expected_close_date = defaultCloseDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        }
        if (assigned_to_user_id) input.assignedToUserId = assigned_to_user_id;

        const result = await executeGraphQL(mutation, { input });
        const deal = result.data?.createDeal;
        
        if (!deal) {
          throw new Error('Failed to create deal - no data returned');
        }
        
        const contact = deal.person ? `${deal.person.first_name} ${deal.person.last_name}` : 'No contact';
        const org = deal.organization?.name || 'No organization';
        const amountStr = deal.amount ? `$${deal.amount.toLocaleString()}` : 'No amount';
        
        return `✅ Deal created successfully!

**Deal Details:**
- Name: ${deal.name}
- Amount: ${amountStr}
- Contact: ${contact}
- Organization: ${org}
- Expected Close: ${deal.expected_close_date || 'Not set'}
- Created: ${new Date(deal.created_at).toLocaleDateString()}
- Deal ID: ${deal.id}

The deal has been added to your pipeline and is ready for further customization.`;
      }

      case 'search_users': {
        const { search_term, limit = 10 } = parameters;
        
        const query = `
          query GetUsers {
            userProfiles {
              id
              display_name
              email
              first_name
              last_name
              role
              created_at
            }
          }
        `;

        const result = await executeGraphQL(query);
        let users = result.data?.userProfiles || [];

        // Apply client-side filtering
        if (search_term) {
          const searchLower = search_term.toLowerCase();
          users = users.filter((user: any) => {
            const displayName = (user.display_name || '').toLowerCase();
            const email = (user.email || '').toLowerCase();
            const firstName = (user.first_name || '').toLowerCase();
            const lastName = (user.last_name || '').toLowerCase();
            const fullName = `${firstName} ${lastName}`.toLowerCase();
            
            return displayName.includes(searchLower) || 
                   email.includes(searchLower) || 
                   fullName.includes(searchLower) ||
                   firstName.includes(searchLower) ||
                   lastName.includes(searchLower);
          });
        }

        // Sort by display_name and limit
        users.sort((a: any, b: any) => (a.display_name || a.email || '').localeCompare(b.display_name || b.email || ''));
        users = users.slice(0, limit);

        const summary = `Found ${users.length} users${search_term ? ` matching "${search_term}"` : ''}`;
        
        const usersList = users.map((user: any) => {
          const name = user.display_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'No name';
          const email = user.email ? ` | ${user.email}` : '';
          const role = user.role ? ` | ${user.role}` : '';
          const created = new Date(user.created_at).toLocaleDateString();
          return `• ${name}${email}${role}
  ID: ${user.id} | Joined: ${created}`;
        }).join('\n');

        return `${summary}\n\n${usersList || 'No users found.'}`;
      }

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  // ================================
  // Message Processing (AI Integration)
  // ================================

  async processMessage(input: SendMessageInput, userId: string): Promise<AgentResponse> {
    try {
      // Get or create conversation
      let conversation: AgentConversation;
      
      if (input.conversationId) {
        const existing = await this.getConversation(input.conversationId, userId);
        if (!existing) {
          throw new AgentError('Conversation not found', 'CONVERSATION_NOT_FOUND');
        }
        conversation = existing;
      } else {
        conversation = await this.createConversation({
          userId,
          context: { 
            agentConfig: { ...DEFAULT_AGENT_CONFIG, ...input.config },
            lastActivity: new Date().toISOString(),
          },
        });
      }

      // Add user message
      const userMessage: AgentMessage = {
        role: 'user',
        content: input.content,
        timestamp: new Date(),
        thoughts: [],
      };

      const updatedMessages = [...conversation.messages, userMessage];

      // Get agent configuration
      const agentConfig = { ...DEFAULT_AGENT_CONFIG, ...input.config };

      // Get available tools
      let availableTools: MCPTool[] = [];
      try {
        availableTools = await this.discoverTools();
      } catch (error) {
        console.warn('Could not discover tools, continuing without them:', error);
      }

      // Generate AI response with Claude 4's autonomous reasoning
      let assistantMessage: AgentMessage;
      let aiThoughts: AgentThought[] = [];

      if (this.aiService) {
        try {
          // Let Claude 4 work completely autonomously
          const aiResponse = await this.aiService.generateResponse(
            input.content,
            conversation.messages,
            agentConfig,
            availableTools,
            { 
              ...conversation.context,
              currentUser: userId,
              conversationId: conversation.id,
            }
          );

          assistantMessage = {
            role: 'assistant',
            content: aiResponse.content,
            timestamp: new Date(),
            thoughts: [],
          };

          // Convert AI thoughts to agent thoughts
          const thoughtsToAdd = aiResponse.thoughts.map(thought => ({
            conversationId: conversation.id,
            type: thought.type as any,
            content: thought.content,
            metadata: {
              confidence: thought.confidence,
              reasoning: thought.reasoning,
              nextActions: thought.nextActions,
            },
          }));

          if (thoughtsToAdd.length > 0) {
            aiThoughts = await this.addThoughts(conversation.id, thoughtsToAdd);
          }

          // Execute any tool calls that Claude autonomously decided to make
          if (aiResponse.toolCalls && aiResponse.toolCalls.length > 0) {
            console.log('Claude autonomously suggested tool calls:', aiResponse.toolCalls);
            
            // Execute tools sequentially and let Claude decide next steps
            const finalResult = await this.executeSequentialWorkflow(
              aiResponse.toolCalls,
              conversation,
              input.content,
              aiResponse.content,
              updatedMessages
            );
            
            // Update the assistant message with the final result
            assistantMessage.content = finalResult.finalResponse;
            
            // All additional thoughts from sequential execution are already saved
          }

        } catch (aiError) {
          console.error('AI service error, falling back to placeholder:', aiError);
          
          // Fallback to placeholder
          assistantMessage = {
            role: 'assistant',
            content: `I received your message: "${input.content}". I'm experiencing some technical difficulties with my AI processing, but I'm working to resolve them. Please try again in a moment.`,
            timestamp: new Date(),
            thoughts: [],
          };

          aiThoughts = await this.addThoughts(conversation.id, [{
            conversationId: conversation.id,
            type: 'reasoning',
            content: 'AI service error, provided fallback response',
            metadata: { error: aiError instanceof Error ? aiError.message : 'Unknown error' },
          }]);
        }
      } else {
        // Use placeholder implementation (no API key)
        assistantMessage = {
          role: 'assistant',
          content: `I received your message: "${input.content}". I'm currently running in placeholder mode because no AI API key is configured. To enable full AI capabilities, please set the ANTHROPIC_API_KEY environment variable.`,
          timestamp: new Date(),
          thoughts: [],
        };

        aiThoughts = await this.addThoughts(conversation.id, [{
          conversationId: conversation.id,
          type: 'reasoning',
          content: 'Running in placeholder mode - no AI API key configured',
          metadata: { userMessage: input.content },
        }]);
      }

      const finalMessages = [...updatedMessages, assistantMessage];

      // Update conversation
      conversation = await this.updateConversation(conversation.id, userId, {
        messages: finalMessages,
        context: {
          ...conversation.context,
          lastActivity: new Date().toISOString(),
        },
      });

      return {
        conversation,
        message: assistantMessage,
        thoughts: aiThoughts,
        plan: conversation.plan,
      };
    } catch (error) {
      if (error instanceof AgentError) throw error;
      throw new AgentError('Failed to process message', 'PROCESS_MESSAGE_ERROR', { error });
    }
  }

  // ================================
  // Autonomous Tool Execution (No Hardcoded Patterns)
  // ================================

  /**
   * Execute tools sequentially, calling Claude again after each tool to decide next steps
   * This implements proper sequential workflow where tool results inform subsequent actions
   */
  private async executeSequentialWorkflow(
    initialToolCalls: Array<{ toolName: string; parameters: Record<string, any>; reasoning: string }>,
    conversation: AgentConversation,
    originalUserMessage: string,
    initialAssistantResponse: string,
    conversationHistory: AgentMessage[]
  ): Promise<{ finalResponse: string; allToolResults: string[] }> {
    let currentResponse = initialAssistantResponse;
    let allToolResults: string[] = [];
    let remainingTools = [...initialToolCalls];
    let iterationCount = 0;
    const maxIterations = 5; // Prevent infinite loops

    while (remainingTools.length > 0 && iterationCount < maxIterations) {
      iterationCount++;
      
      // Execute the FIRST tool only (sequential execution)
      const currentTool = remainingTools[0];
      if (!currentTool) {
        break; // No more tools to execute
      }
      
      console.log(`Sequential execution - executing tool: ${currentTool.toolName}`);
      
      try {
        const toolCallRequest: MCPToolCall = {
          toolName: currentTool.toolName,
          parameters: currentTool.parameters,
          conversationId: conversation.id,
        };

        const toolResponse = await this.callTool(toolCallRequest, this.accessToken || undefined);
        let toolResultText: string;

        if (toolResponse.success) {
          toolResultText = typeof toolResponse.result === 'string' 
            ? toolResponse.result 
            : JSON.stringify(toolResponse.result, null, 2);

          allToolResults.push(`🔧 **${currentTool.toolName}** execution:\n${toolResultText}`);

          // Add successful tool execution thought
          await this.addThoughts(conversation.id, [{
            conversationId: conversation.id,
            type: 'tool_call',
            content: `Claude autonomously executed ${currentTool.toolName}`,
            metadata: {
              toolName: currentTool.toolName,
              parameters: currentTool.parameters,
              result: toolResponse.result,
              reasoning: currentTool.reasoning,
            },
          }]);

          // For real-time updates: emit thought immediately (future implementation for WebSockets/SSE)
          this.emitThoughtUpdate?.(conversation.id, {
            type: 'tool_call',
            content: `Claude autonomously executed ${currentTool.toolName}`,
            toolName: currentTool.toolName,
            parameters: currentTool.parameters,
            result: toolResponse.result,
            timestamp: new Date(),
          });

        } else {
          toolResultText = `❌ **${currentTool.toolName}** failed: ${toolResponse.error}`;
          allToolResults.push(toolResultText);

          await this.addThoughts(conversation.id, [{
            conversationId: conversation.id,
            type: 'observation',
            content: `Tool execution failed: ${currentTool.toolName}`,
            metadata: {
              toolName: currentTool.toolName,
              parameters: currentTool.parameters,
              error: toolResponse.error,
              reasoning: currentTool.reasoning,
            },
          }]);
        }

        // Remove the executed tool
        remainingTools = remainingTools.slice(1);

        // Call Claude again with the tool result to see if more actions are needed
        if (this.aiService && remainingTools.length === 0) {
          // Check if the task appears to be complete based on the tool result
          const taskComplete = this.isTaskComplete(currentTool.toolName, toolResultText, originalUserMessage);
          
          console.log(`Task completion check: ${taskComplete} for tool ${currentTool.toolName} with user message: "${originalUserMessage}"`);
          
          if (taskComplete) {
            console.log('Task appears complete, stopping sequential execution');
            break;
          }
          
          console.log('Asking Claude for follow-up actions...');
          
          const followUpPrompt = `The tool ${currentTool.toolName} has been executed with the following result:

${toolResultText}

Original user request: "${originalUserMessage}"

IMPORTANT: Only suggest additional tools if they are NECESSARY to complete the original user request.

If the user's request has been fulfilled (e.g., deal created, information provided), respond with "TASK_COMPLETE" and do not suggest any more tools.

Based on this result, do you need to execute any additional tools to complete the user's request? If not, respond with "TASK_COMPLETE". If yes, make the appropriate tool call.`;

          const followUpResponse = await this.aiService.generateResponse(
            followUpPrompt,
            conversationHistory,
            { ...DEFAULT_AGENT_CONFIG },
            await this.discoverTools(),
            {
              currentUser: conversation.userId,
              conversationId: conversation.id,
              currentToolResult: toolResultText,
            }
          );

          // Update current response
          currentResponse = followUpResponse.content;

          console.log('Claude follow-up response:', followUpResponse.content);
          console.log('Claude suggested tool calls:', followUpResponse.toolCalls?.length || 0);

          // Check if Claude indicates the task is complete
          if (followUpResponse.content.includes('TASK_COMPLETE') || 
              followUpResponse.content.toLowerCase().includes('task is complete') ||
              followUpResponse.content.toLowerCase().includes('request has been fulfilled')) {
            console.log('Claude indicates task is complete, stopping sequential execution');
            break;
          }

          // If Claude suggests more tools, add them to the queue
          if (followUpResponse.toolCalls && followUpResponse.toolCalls.length > 0) {
            console.log('Claude suggests additional tools after seeing results:', followUpResponse.toolCalls);
            remainingTools.push(...followUpResponse.toolCalls);

            // Add follow-up reasoning thought
            await this.addThoughts(conversation.id, [{
              conversationId: conversation.id,
              type: 'reasoning',
              content: `Claude analyzed tool results and decided to execute additional tools`,
              metadata: {
                previousTool: currentTool.toolName,
                nextTools: followUpResponse.toolCalls.map(tc => tc.toolName),
                reasoning: 'Sequential workflow continuation based on tool results',
              },
            }]);
          }
        }

      } catch (toolError) {
        console.error('Sequential tool execution error:', toolError);
        const errorText = `⚠️ **${currentTool.toolName}** error: ${toolError instanceof Error ? toolError.message : 'Unknown error'}`;
        allToolResults.push(errorText);

        await this.addThoughts(conversation.id, [{
          conversationId: conversation.id,
          type: 'observation',
          content: `Tool execution exception: ${currentTool.toolName}`,
          metadata: {
            toolName: currentTool.toolName,
            parameters: currentTool.parameters,
            exception: toolError instanceof Error ? toolError.message : 'Unknown error',
          },
        }]);

        // Remove the failed tool and continue
        remainingTools = remainingTools.slice(1);
      }
    }

    // Build final response with all tool results
    const finalResponse = allToolResults.length > 0 
      ? `${currentResponse}\n\n${allToolResults.join('\n\n')}`
      : currentResponse;

    return {
      finalResponse,
      allToolResults
    };
  }

  /**
   * Execute tools autonomously as requested by Claude 4
   * No hardcoded follow-up logic - Claude decides everything
   */
  private async executeToolsAutonomously(
    toolCalls: Array<{ toolName: string; parameters: Record<string, any>; reasoning: string }>,
    conversation: AgentConversation,
    userMessage: string,
    assistantResponse: string
  ): Promise<string[]> {
    const toolResults: string[] = [];

    for (const toolCall of toolCalls) {
      try {
        const toolCallRequest: MCPToolCall = {
          toolName: toolCall.toolName,
          parameters: toolCall.parameters,
          conversationId: conversation.id,
        };

        const toolResponse = await this.callTool(toolCallRequest, this.accessToken || undefined);

        if (toolResponse.success) {
          const resultText = typeof toolResponse.result === 'string' 
            ? toolResponse.result 
            : JSON.stringify(toolResponse.result, null, 2);

          toolResults.push(`🔧 **${toolCall.toolName}** execution:\n${resultText}`);

          // Add successful tool execution thought
          await this.addThoughts(conversation.id, [{
            conversationId: conversation.id,
            type: 'tool_call',
            content: `Claude autonomously executed ${toolCall.toolName}`,
            metadata: {
              toolName: toolCall.toolName,
              parameters: toolCall.parameters,
              result: toolResponse.result,
              reasoning: toolCall.reasoning,
            },
          }]);

        } else {
          toolResults.push(`❌ **${toolCall.toolName}** failed: ${toolResponse.error}`);

          await this.addThoughts(conversation.id, [{
            conversationId: conversation.id,
            type: 'observation',
            content: `Tool execution failed: ${toolCall.toolName}`,
            metadata: {
              toolName: toolCall.toolName,
              parameters: toolCall.parameters,
              error: toolResponse.error,
              reasoning: toolCall.reasoning,
            },
          }]);
        }
      } catch (toolError) {
        console.error('Tool execution error:', toolError);
        toolResults.push(`⚠️ **${toolCall.toolName}** error: ${toolError instanceof Error ? toolError.message : 'Unknown error'}`);

        await this.addThoughts(conversation.id, [{
          conversationId: conversation.id,
          type: 'observation',
          content: `Tool execution exception: ${toolCall.toolName}`,
          metadata: {
            toolName: toolCall.toolName,
            parameters: toolCall.parameters,
            exception: toolError instanceof Error ? toolError.message : 'Unknown error',
          },
        }]);
      }
    }

    return toolResults;
  }

  // ================================
  // Private Helper Methods
  // ================================

  private mapDbConversationToModel(dbConversation: any): AgentConversation {
    return {
      id: dbConversation.id,
      userId: dbConversation.user_id,
      messages: JSON.parse(dbConversation.messages),
      plan: dbConversation.plan ? JSON.parse(dbConversation.plan) : undefined,
      context: JSON.parse(dbConversation.context),
      createdAt: new Date(dbConversation.created_at),
      updatedAt: new Date(dbConversation.updated_at),
    };
  }

  private mapDbThoughtToModel(dbThought: any): AgentThought {
    return {
      id: dbThought.id,
      conversationId: dbThought.conversation_id,
      type: dbThought.type,
      content: dbThought.content,
      metadata: JSON.parse(dbThought.metadata),
      timestamp: new Date(dbThought.timestamp),
    };
  }

  private isTaskComplete(toolName: string, toolResultText: string, originalUserMessage: string): boolean {
    // Deal creation requests - check if deal was successfully created
    if (originalUserMessage.toLowerCase().includes('create deal') || 
        originalUserMessage.toLowerCase().includes('rfp') ||
        originalUserMessage.toLowerCase().includes('new deal')) {
      
      if (toolName === 'create_deal' && toolResultText.includes('✅ Deal created successfully')) {
        return true; // Deal creation task is complete
      }
      // search_organizations is just a step, not completion for deal creation requests
      return false;
    }
    
    // PURE search/analysis requests (not deal creation) - complete after results
    if (originalUserMessage.toLowerCase().includes('search') ||
        originalUserMessage.toLowerCase().includes('find') ||
        originalUserMessage.includes('analyze') ||
        originalUserMessage.includes('pipeline')) {
      
      // But NOT if this is part of a deal creation workflow
      if (originalUserMessage.toLowerCase().includes('create') ||
          originalUserMessage.toLowerCase().includes('rfp') ||
          originalUserMessage.toLowerCase().includes('deal')) {
        return false; // Continue with deal creation workflow
      }
      
      if (toolName === 'search_deals' || toolName === 'search_contacts' || 
          toolName === 'search_organizations' || toolName === 'analyze_pipeline') {
        return true; // Search/analysis task is complete after first result
      }
    }
    
    // If we just got details about something, that's usually complete
    if (toolName === 'get_deal_details' && !toolResultText.includes('not found')) {
      return true;
    }
    
    return false; // Continue execution for other cases
  }
} 