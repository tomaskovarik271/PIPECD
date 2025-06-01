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
        model: 'claude-sonnet-4-20250514',
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
        if (expected_close_date) input.expected_close_date = expected_close_date;
        if (assigned_to_user_id) input.assigned_to_user_id = assigned_to_user_id;

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

      // Generate AI response
      let assistantMessage: AgentMessage;
      let aiThoughts: AgentThought[] = [];

      if (this.aiService) {
        // Use real AI service
        try {
          const aiResponse = await this.aiService.generateResponse(
            input.content,
            conversation.messages,
            agentConfig,
            availableTools,
            conversation.context
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

          // Handle tool calls if any
          if (aiResponse.toolCalls && aiResponse.toolCalls.length > 0) {
            console.log('AI suggested tool calls:', aiResponse.toolCalls);
            
            // Execute the tool calls and potentially trigger follow-up actions
            const { toolResults, shouldContinue, followUpContext } = await this.executeToolChain(
              aiResponse.toolCalls, 
              conversation, 
              input.content,
              aiResponse.content
            );
            
            // If we have tool results, append them to the assistant's response
            if (toolResults.length > 0) {
              assistantMessage.content += '\n\n' + toolResults.join('\n\n');
            }

            // If Claude should continue with follow-up actions, generate another response
            if (shouldContinue && followUpContext) {
              try {
                const followUpResponse = await this.aiService.generateResponse(
                  followUpContext.prompt,
                  [...conversation.messages, userMessage, assistantMessage],
                  agentConfig,
                  availableTools,
                  conversation.context
                );

                // Execute any additional tool calls from the follow-up
                if (followUpResponse.toolCalls && followUpResponse.toolCalls.length > 0) {
                  const additionalResults = await this.executeAdditionalTools(
                    followUpResponse.toolCalls,
                    conversation
                  );
                  
                  if (additionalResults.length > 0) {
                    assistantMessage.content += '\n\n' + additionalResults.join('\n\n');
                  }
                }

                // Append follow-up content if meaningful
                if (followUpResponse.content && followUpResponse.content.trim() !== assistantMessage.content.trim()) {
                  assistantMessage.content += '\n\n' + followUpResponse.content;
                }

              } catch (followUpError) {
                console.error('Follow-up execution error:', followUpError);
                assistantMessage.content += '\n\n⚠️ Follow-up action encountered an issue, but the primary task was completed.';
              }
            }
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
  // Private Helper Methods
  // ================================

  /**
   * Execute a chain of tool calls with autonomous follow-up detection
   */
  private async executeToolChain(
    toolCalls: Array<{ toolName: string; parameters: Record<string, any>; reasoning: string }>,
    conversation: AgentConversation,
    userMessage: string,
    assistantResponse: string
  ): Promise<{ toolResults: string[]; shouldContinue: boolean; followUpContext?: { prompt: string } }> {
    const toolResults: string[] = [];
    let shouldContinue = false;
    let followUpContext: { prompt: string } | undefined;

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
            content: `Successfully executed ${toolCall.toolName}`,
            metadata: {
              toolName: toolCall.toolName,
              parameters: toolCall.parameters,
              result: toolResponse.result,
              reasoning: toolCall.reasoning,
            },
          }]);

          // Check if this tool result suggests a follow-up action
          const followUp = this.detectFollowUpAction(toolCall, toolResponse.result, userMessage);
          if (followUp) {
            shouldContinue = true;
            followUpContext = followUp;
          }

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

    return { toolResults, shouldContinue, followUpContext };
  }

  /**
   * Detect if a tool execution should trigger follow-up actions
   */
  private detectFollowUpAction(
    toolCall: { toolName: string; parameters: Record<string, any>; reasoning: string },
    result: any,
    originalUserMessage: string
  ): { prompt: string } | null {
    // Check for organization search that should lead to deal creation
    if (toolCall.toolName === 'search_organizations' && typeof result === 'string') {
      // Look for organization ID in the result
      const orgIdMatch = result.match(/ID:\s*([a-f0-9-]+)/i);
      
      if (orgIdMatch && originalUserMessage.toLowerCase().includes('create') && originalUserMessage.toLowerCase().includes('deal')) {
        const orgId = orgIdMatch[1];
        
        // Extract deal details from the original message
        const dealNameMatch = originalUserMessage.match(/(?:named?|called?)\s*["""']([^"""']+)["""']/i);
        const amountMatch = originalUserMessage.match(/(?:for|worth|amount|value|price)\s*[\$]?(\d+(?:,\d{3})*(?:\.\d{2})?)/i);
        
        if (dealNameMatch && amountMatch) {
          const dealName = dealNameMatch[1];
          const amount = parseInt(amountMatch[1]?.replace(/,/g, '') || '0');
          
          return {
            prompt: `Based on the organization search results, I found a suitable organization. Now I need to create the deal "${dealName}" for $${amount} using organization ID: ${orgId}. Please create this deal now.`
          };
        }
      }
    }

    // Check for contact search that should lead to deal creation with contact
    if (toolCall.toolName === 'search_contacts' && typeof result === 'string') {
      if (originalUserMessage.toLowerCase().includes('create') && originalUserMessage.toLowerCase().includes('deal')) {
        const contactIdMatch = result.match(/ID:\s*([a-f0-9-]+)/i);
        
        if (contactIdMatch) {
          return {
            prompt: `Based on the contact search results, I found a suitable contact. Please proceed with creating the deal using the found contact information.`
          };
        }
      }
    }

    return null;
  }

  /**
   * Execute additional tool calls from follow-up responses
   */
  private async executeAdditionalTools(
    toolCalls: Array<{ toolName: string; parameters: Record<string, any>; reasoning: string }>,
    conversation: AgentConversation
  ): Promise<string[]> {
    const results: string[] = [];

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

          results.push(`🔧 **${toolCall.toolName}** execution:\n${resultText}`);

          await this.addThoughts(conversation.id, [{
            conversationId: conversation.id,
            type: 'tool_call',
            content: `Successfully executed follow-up ${toolCall.toolName}`,
            metadata: {
              toolName: toolCall.toolName,
              parameters: toolCall.parameters,
              result: toolResponse.result,
              reasoning: toolCall.reasoning,
            },
          }]);
        } else {
          results.push(`❌ **${toolCall.toolName}** failed: ${toolResponse.error}`);
        }
      } catch (error) {
        console.error('Additional tool execution error:', error);
        results.push(`⚠️ **${toolCall.toolName}** error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return results;
  }

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
} 