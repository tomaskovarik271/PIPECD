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
      // DEAL OPERATIONS
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
        name: 'create_deal',
        description: 'Create a new deal in the CRM system',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Deal name/title' },
            organization_id: { type: 'string', description: 'Organization ID to associate with deal' },
            primary_contact_id: { type: 'string', description: 'Primary contact person ID' },
            value: { type: 'number', description: 'Deal value/amount' },
            stage: { type: 'string', description: 'Deal stage' },
            priority: { type: 'string', description: 'Deal priority (HIGH, MEDIUM, LOW)' },
            description: { type: 'string', description: 'Deal description' },
            source: { type: 'string', description: 'Deal source (e.g., Website, Referral, Cold Call)' },
            deal_type: { type: 'string', description: 'Type of deal' },
            close_date: { type: 'string', description: 'Expected close date (YYYY-MM-DD format)' },
            custom_fields: { type: 'array', description: 'Custom field values array with definitionId and value fields' },
          },
          required: ['name'],
        },
      },
      {
        name: 'update_deal',
        description: 'Update existing deal information',
        parameters: {
          type: 'object',
          properties: {
            deal_id: { type: 'string', description: 'ID of the deal to update' },
            name: { type: 'string', description: 'New deal name' },
            amount: { type: 'number', description: 'New deal amount' },
            person_id: { type: 'string', description: 'New contact person ID' },
            organization_id: { type: 'string', description: 'New organization ID' },
            expected_close_date: { type: 'string', description: 'New expected close date (YYYY-MM-DD)' },
            assigned_to_user_id: { type: 'string', description: 'New assigned user ID' },
          },
          required: ['deal_id'],
        },
      },
      {
        name: 'delete_deal',
        description: 'Delete a deal permanently',
        parameters: {
          type: 'object',
          properties: {
            deal_id: { type: 'string', description: 'ID of the deal to delete' },
          },
          required: ['deal_id'],
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

      // ORGANIZATION OPERATIONS
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
        name: 'get_organization_details',
        description: 'Get detailed information about a specific organization',
        parameters: {
          type: 'object',
          properties: {
            organization_id: { type: 'string', description: 'ID of the organization to get details for' },
          },
          required: ['organization_id'],
        },
      },
      {
        name: 'create_organization',
        description: 'Create new organization/company record',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Organization name' },
            address: { type: 'string', description: 'Organization address' },
            notes: { type: 'string', description: 'Additional notes about the organization' },
          },
          required: ['name'],
        },
      },
      {
        name: 'update_organization',
        description: 'Update existing organization information',
        parameters: {
          type: 'object',
          properties: {
            organization_id: { type: 'string', description: 'ID of the organization to update' },
            name: { type: 'string', description: 'New organization name' },
            address: { type: 'string', description: 'New organization address' },
            notes: { type: 'string', description: 'New notes about the organization' },
          },
          required: ['organization_id'],
        },
      },

      // CONTACT/PEOPLE OPERATIONS
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
        name: 'get_contact_details',
        description: 'Get detailed information about a specific contact',
        parameters: {
          type: 'object',
          properties: {
            person_id: { type: 'string', description: 'ID of the person to get details for' },
          },
          required: ['person_id'],
        },
      },
      {
        name: 'create_contact',
        description: 'Create new contact/person record',
        parameters: {
          type: 'object',
          properties: {
            first_name: { type: 'string', description: 'First name' },
            last_name: { type: 'string', description: 'Last name' },
            email: { type: 'string', description: 'Email address' },
            phone: { type: 'string', description: 'Phone number' },
            organization_id: { type: 'string', description: 'Organization ID to associate with' },
            notes: { type: 'string', description: 'Additional notes about the contact' },
          },
          required: ['first_name'],
        },
      },
      {
        name: 'update_contact',
        description: 'Update existing contact information',
        parameters: {
          type: 'object',
          properties: {
            person_id: { type: 'string', description: 'ID of the person to update' },
            first_name: { type: 'string', description: 'New first name' },
            last_name: { type: 'string', description: 'New last name' },
            email: { type: 'string', description: 'New email address' },
            phone: { type: 'string', description: 'New phone number' },
            organization_id: { type: 'string', description: 'New organization ID' },
            notes: { type: 'string', description: 'New notes about the contact' },
          },
          required: ['person_id'],
        },
      },

      // ACTIVITY OPERATIONS
      {
        name: 'search_activities',
        description: 'Find activities and tasks with filtering options',
        parameters: {
          type: 'object',
          properties: {
            deal_id: { type: 'string', description: 'Filter by deal ID' },
            person_id: { type: 'string', description: 'Filter by person ID' },
            organization_id: { type: 'string', description: 'Filter by organization ID' },
            is_done: { type: 'boolean', description: 'Filter by completion status' },
            limit: { type: 'number', description: 'Maximum number of activities to return', default: 20 },
          },
        },
      },
      {
        name: 'get_activity_details',
        description: 'Get detailed information about a specific activity',
        parameters: {
          type: 'object',
          properties: {
            activity_id: { type: 'string', description: 'ID of the activity to get details for' },
          },
          required: ['activity_id'],
        },
      },
      {
        name: 'create_activity',
        description: 'Create new activity, task, meeting, or reminder',
        parameters: {
          type: 'object',
          properties: {
            type: { type: 'string', description: 'Activity type: TASK, MEETING, CALL, EMAIL, DEADLINE, SYSTEM_TASK', enum: ['TASK', 'MEETING', 'CALL', 'EMAIL', 'DEADLINE', 'SYSTEM_TASK'] },
            subject: { type: 'string', description: 'Activity subject/title' },
            due_date: { type: 'string', description: 'Due date (ISO 8601 format)' },
            notes: { type: 'string', description: 'Activity notes or description' },
            is_done: { type: 'boolean', description: 'Completion status', default: false },
            deal_id: { type: 'string', description: 'Associate with deal ID' },
            person_id: { type: 'string', description: 'Associate with person ID' },
            organization_id: { type: 'string', description: 'Associate with organization ID' },
          },
          required: ['type', 'subject'],
        },
      },
      {
        name: 'update_activity',
        description: 'Update existing activity information',
        parameters: {
          type: 'object',
          properties: {
            activity_id: { type: 'string', description: 'ID of the activity to update' },
            type: { type: 'string', description: 'New activity type', enum: ['TASK', 'MEETING', 'CALL', 'EMAIL', 'DEADLINE', 'SYSTEM_TASK'] },
            subject: { type: 'string', description: 'New activity subject/title' },
            due_date: { type: 'string', description: 'New due date (ISO 8601 format)' },
            notes: { type: 'string', description: 'New activity notes' },
            is_done: { type: 'boolean', description: 'New completion status' },
            deal_id: { type: 'string', description: 'New deal association' },
            person_id: { type: 'string', description: 'New person association' },
            organization_id: { type: 'string', description: 'New organization association' },
          },
          required: ['activity_id'],
        },
      },
      {
        name: 'complete_activity',
        description: 'Mark an activity as completed',
        parameters: {
          type: 'object',
          properties: {
            activity_id: { type: 'string', description: 'ID of the activity to complete' },
            completion_notes: { type: 'string', description: 'Optional notes about completion' },
          },
          required: ['activity_id'],
        },
      },

      // PRICING AND QUOTES
      {
        name: 'get_price_quotes',
        description: 'Get price quotes for a specific deal',
        parameters: {
          type: 'object',
          properties: {
            deal_id: { type: 'string', description: 'Deal ID to get quotes for' },
          },
          required: ['deal_id'],
        },
      },
      {
        name: 'create_price_quote',
        description: 'Create new price quote for a deal',
        parameters: {
          type: 'object',
          properties: {
            deal_id: { type: 'string', description: 'Deal ID to create quote for' },
            name: { type: 'string', description: 'Quote name/title' },
            base_minimum_price_mp: { type: 'number', description: 'Base minimum price' },
            target_markup_percentage: { type: 'number', description: 'Target markup percentage' },
            final_offer_price_fop: { type: 'number', description: 'Final offer price' },
            overall_discount_percentage: { type: 'number', description: 'Overall discount percentage' },
            upfront_payment_percentage: { type: 'number', description: 'Upfront payment percentage' },
          },
          required: ['deal_id'],
        },
      },

      // USER OPERATIONS
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
      {
        name: 'get_user_profile',
        description: 'Get current user profile information',
        parameters: {
          type: 'object',
          properties: {},
        },
      },

      // WORKFLOW MANAGEMENT
      {
        name: 'get_wfm_project_types',
        description: 'Get available workflow project types',
        parameters: {
          type: 'object',
          properties: {
            is_archived: { type: 'boolean', description: 'Include archived types', default: false },
          },
        },
      },
      {
        name: 'update_deal_workflow_progress',
        description: 'Move a deal to a different workflow stage',
        parameters: {
          type: 'object',
          properties: {
            deal_id: { type: 'string', description: 'Deal ID to update' },
            target_step_id: { type: 'string', description: 'Target workflow step ID' },
          },
          required: ['deal_id', 'target_step_id'],
        },
      },

      // CUSTOM FIELDS MANAGEMENT
      {
        name: 'get_custom_field_definitions',
        description: 'Get available custom field definitions for an entity type',
        parameters: {
          type: 'object',
          properties: {
            entity_type: { type: 'string', description: 'Entity type: DEAL, PERSON, ORGANIZATION', enum: ['DEAL', 'PERSON', 'ORGANIZATION'] },
            include_inactive: { type: 'boolean', description: 'Include inactive custom fields', default: false },
          },
          required: ['entity_type'],
        },
      },
      {
        name: 'create_custom_field_definition',
        description: 'Create new custom field definition for capturing unique information',
        parameters: {
          type: 'object',
          properties: {
            entity_type: { type: 'string', description: 'Entity type: DEAL, PERSON, ORGANIZATION', enum: ['DEAL', 'PERSON', 'ORGANIZATION'] },
            field_name: { type: 'string', description: 'Internal field name (unique per entity type)' },
            field_label: { type: 'string', description: 'Display label for the field' },
            field_type: { type: 'string', description: 'Field type: TEXT, NUMBER, DATE, BOOLEAN, DROPDOWN, MULTI_SELECT', enum: ['TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'DROPDOWN', 'MULTI_SELECT'] },
            is_required: { type: 'boolean', description: 'Whether field is required', default: false },
            dropdown_options: { type: 'array', description: 'Options for DROPDOWN/MULTI_SELECT fields. Array of {value, label} objects' },
            display_order: { type: 'number', description: 'Display order for UI', default: 0 },
          },
          required: ['entity_type', 'field_name', 'field_label', 'field_type'],
        },
      },
      {
        name: 'get_entity_custom_fields',
        description: 'Get custom field values for a specific entity',
        parameters: {
          type: 'object',
          properties: {
            entity_type: { type: 'string', description: 'Entity type: DEAL, PERSON, ORGANIZATION', enum: ['DEAL', 'PERSON', 'ORGANIZATION'] },
            entity_id: { type: 'string', description: 'ID of the entity to get custom fields for' },
          },
          required: ['entity_type', 'entity_id'],
        },
      },
      {
        name: 'set_entity_custom_fields',
        description: 'Set custom field values for an entity',
        parameters: {
          type: 'object',
          properties: {
            entity_type: { type: 'string', description: 'Entity type: DEAL, PERSON, ORGANIZATION', enum: ['DEAL', 'PERSON', 'ORGANIZATION'] },
            entity_id: { type: 'string', description: 'ID of the entity to set custom fields for' },
            custom_fields: { type: 'array', description: 'Array of custom field values with definitionId and value fields' },
          },
          required: ['entity_type', 'entity_id', 'custom_fields'],
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
              description
              value
              stage
              priority
              status
              source
              created_at
              updated_at
              closeDate
              deal_type
              organization {
                id
                name
              }
              primaryContact {
                id
                first_name
                last_name
                email
              }
              activities {
                id
                type
                status
                due_date
                completed_at
                notes
                created_at
              }
              customFieldValues {
                definition {
                  id
                  fieldName
                  fieldLabel
                  fieldType
                }
                stringValue
                numberValue
                booleanValue
                dateValue
                selectedOptionValues
              }
            }
          }
        `;
        
        const result = await executeGraphQL(query, { dealId: deal_id });
        const deal = result.data?.deal;
        
        if (!deal) {
          return `Deal with ID ${deal_id} not found`;
        }
        
        const org = deal.organization ? `${deal.organization.name} (ID: ${deal.organization.id})` : 'No organization';
        const contact = deal.primaryContact 
          ? `${deal.primaryContact.first_name} ${deal.primaryContact.last_name} (${deal.primaryContact.email})`
          : 'No primary contact';
        
        const activitiesInfo = deal.activities && deal.activities.length > 0 
          ? `\n\n**Recent Activities (${deal.activities.length}):**\n${deal.activities.slice(0, 5).map((activity: any) => 
              `• ${activity.type} - ${activity.status}${activity.due_date ? ` (Due: ${new Date(activity.due_date).toLocaleDateString()})` : ''}${activity.completed_at ? ` (Completed: ${new Date(activity.completed_at).toLocaleDateString()})` : ''}`
            ).join('\n')}`
          : '';

        // Format custom fields
        const customFieldsInfo = deal.customFieldValues && deal.customFieldValues.length > 0
          ? `\n\n**Custom Fields:**\n${deal.customFieldValues.map((field: any) => {
              let value = 'No value';
              switch (field.definition.fieldType) {
                case 'TEXT':
                case 'DROPDOWN':
                  value = field.stringValue || 'No value';
                  break;
                case 'NUMBER':
                  value = field.numberValue !== null ? field.numberValue.toString() : 'No value';
                  break;
                case 'BOOLEAN':
                  value = field.booleanValue !== null ? (field.booleanValue ? 'Yes' : 'No') : 'No value';
                  break;
                case 'DATE':
                  value = field.dateValue ? new Date(field.dateValue).toLocaleDateString() : 'No value';
                  break;
                case 'MULTI_SELECT':
                  value = field.selectedOptionValues && field.selectedOptionValues.length > 0 
                    ? field.selectedOptionValues.join(', ') 
                    : 'No selections';
                  break;
              }
              return `• ${field.definition.fieldLabel}: ${value}`;
            }).join('\n')}`
          : '';
        
        return `**Deal Details:**
- Name: ${deal.name}
- Value: ${deal.value ? `$${deal.value.toLocaleString()}` : 'Not specified'}
- Stage: ${deal.stage || 'Not specified'}
- Priority: ${deal.priority || 'Not specified'}
- Status: ${deal.status}
- Type: ${deal.deal_type || 'Not specified'}
- Source: ${deal.source || 'Not specified'}
- Organization: ${org}
- Primary Contact: ${contact}
- Close Date: ${deal.closeDate ? new Date(deal.closeDate).toLocaleDateString() : 'Not set'}
- Created: ${new Date(deal.created_at).toLocaleDateString()}
- Last Updated: ${new Date(deal.updated_at).toLocaleDateString()}

**Description:**
${deal.description || 'No description provided'}${activitiesInfo}${customFieldsInfo}

Deal ID: ${deal.id}`;
      }

      case 'create_deal': {
        const { name, organization_id, primary_contact_id, value, stage, priority, description, source, deal_type, close_date, custom_fields } = parameters;
        
        const mutation = `
          mutation CreateDeal($input: DealInput!) {
            createDeal(input: $input) {
              id
              name
              value
              stage
              priority
              status
              description
              source
              deal_type
              closeDate
              organization {
                id
                name
              }
              primaryContact {
                id
                first_name
                last_name
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
                selectedOptionValues
              }
              created_at
            }
          }
        `;

        const input: any = {
          name,
          organizationId: organization_id,
          primaryContactId: primary_contact_id,
          value,
          stage,
          priority,
          description,
          source,
          dealType: deal_type,
          closeDate: close_date,
        };

        // Add custom fields if provided
        if (custom_fields && custom_fields.length > 0) {
          input.customFieldValues = custom_fields.map((field: any) => ({
            definitionId: field.definitionId,
            stringValue: field.stringValue || null,
            numberValue: field.numberValue || null,
            booleanValue: field.booleanValue || null,
            dateValue: field.dateValue || null,
            selectedOptionValues: field.selectedOptionValues || null,
          }));
        }

        // Remove undefined values
        Object.keys(input).forEach(key => {
          if (input[key] === undefined) {
            delete input[key];
          }
        });

        const result = await executeGraphQL(mutation, { input });
        const deal = result.data?.createDeal;
        
        if (!deal) {
          throw new Error('Failed to create deal - no data returned');
        }
        
        const org = deal.organization ? ` at ${deal.organization.name}` : '';
        const contact = deal.primaryContact 
          ? ` with primary contact ${deal.primaryContact.first_name} ${deal.primaryContact.last_name} (${deal.primaryContact.email})`
          : '';

        // Format custom fields in response
        const customFieldsInfo = deal.customFieldValues && deal.customFieldValues.length > 0
          ? `\n\n**Custom Fields Set:**\n${deal.customFieldValues.map((field: any) => {
              let value = 'No value';
              switch (field.definition.fieldType) {
                case 'TEXT':
                case 'DROPDOWN':
                  value = field.stringValue || 'No value';
                  break;
                case 'NUMBER':
                  value = field.numberValue !== null ? field.numberValue.toString() : 'No value';
                  break;
                case 'BOOLEAN':
                  value = field.booleanValue !== null ? (field.booleanValue ? 'Yes' : 'No') : 'No value';
                  break;
                case 'DATE':
                  value = field.dateValue ? new Date(field.dateValue).toLocaleDateString() : 'No value';
                  break;
                case 'MULTI_SELECT':
                  value = field.selectedOptionValues && field.selectedOptionValues.length > 0 
                    ? field.selectedOptionValues.join(', ') 
                    : 'No selections';
                  break;
              }
              return `- ${field.definition.fieldLabel}: ${value}`;
            }).join('\n')}`
          : '';
        
        return `✅ Deal created successfully!

**Deal Details:**
- Name: ${deal.name}
- Value: ${deal.value ? `$${deal.value.toLocaleString()}` : 'Not specified'}
- Stage: ${deal.stage || 'Not specified'}
- Priority: ${deal.priority || 'Not specified'}
- Status: ${deal.status}
- Type: ${deal.deal_type || 'Not specified'}
- Source: ${deal.source || 'Not specified'}${org}${contact}
- Close Date: ${deal.closeDate ? new Date(deal.closeDate).toLocaleDateString() : 'Not set'}
- Description: ${deal.description || 'No description'}
- Created: ${new Date(deal.created_at).toLocaleDateString()}${customFieldsInfo}

Deal ID: ${deal.id}`;
      }

      case 'get_custom_field_definitions': {
        const { entity_type, include_inactive = false } = parameters;
        
        const query = `
          query GetCustomFieldDefinitions($entityType: CustomFieldEntityType!, $includeInactive: Boolean) {
            customFieldDefinitions(entityType: $entityType, includeInactive: $includeInactive) {
              id
              entityType
              fieldName
              fieldLabel
              fieldType
              isRequired
              isActive
              displayOrder
              dropdownOptions {
                value
                label
              }
              createdAt
              updatedAt
            }
          }
        `;

        const result = await executeGraphQL(query, { entityType: entity_type, includeInactive: include_inactive });
        const definitions = result.data?.customFieldDefinitions || [];

        if (definitions.length === 0) {
          return `No custom field definitions found for ${entity_type} entity type${include_inactive ? ' (including inactive)' : ''}`;
        }

        const summary = `Found ${definitions.length} custom field definition${definitions.length > 1 ? 's' : ''} for ${entity_type}`;
        
        const definitionsList = definitions.map((def: any) => {
          const status = def.isActive ? 'Active' : 'Inactive';
          const required = def.isRequired ? 'Required' : 'Optional';
          const options = def.dropdownOptions && def.dropdownOptions.length > 0 
            ? ` | Options: ${def.dropdownOptions.map((opt: any) => opt.label).join(', ')}`
            : '';
          
          return `• ${def.fieldLabel} (${def.fieldName})
  Type: ${def.fieldType} | ${required} | ${status}${options}
  Display Order: ${def.displayOrder} | Created: ${new Date(def.createdAt).toLocaleDateString()}
  ID: ${def.id}`;
        }).join('\n\n');

        return `${summary}\n\n${definitionsList}`;
      }

      case 'create_custom_field_definition': {
        const { entity_type, field_name, field_label, field_type, is_required = false, dropdown_options, display_order = 0 } = parameters;
        
        const mutation = `
          mutation CreateCustomFieldDefinition($input: CustomFieldDefinitionInput!) {
            createCustomFieldDefinition(input: $input) {
              id
              entityType
              fieldName
              fieldLabel
              fieldType
              isRequired
              isActive
              displayOrder
              dropdownOptions {
                value
                label
              }
              createdAt
            }
          }
        `;

        const input: any = {
          entityType: entity_type,
          fieldName: field_name,
          fieldLabel: field_label,
          fieldType: field_type,
          isRequired: is_required,
          displayOrder: display_order,
        };

        // Add dropdown options if provided for DROPDOWN or MULTI_SELECT fields
        if (dropdown_options && (field_type === 'DROPDOWN' || field_type === 'MULTI_SELECT')) {
          input.dropdownOptions = dropdown_options;
        }

        const result = await executeGraphQL(mutation, { input });
        const definition = result.data?.createCustomFieldDefinition;
        
        if (!definition) {
          throw new Error('Failed to create custom field definition - no data returned');
        }
        
        const options = definition.dropdownOptions && definition.dropdownOptions.length > 0 
          ? `\n- Options: ${definition.dropdownOptions.map((opt: any) => `${opt.label} (${opt.value})`).join(', ')}`
          : '';
        
        return `✅ Custom field definition created successfully!

**Custom Field Details:**
+- Label: ${definition.fieldLabel}
+- Internal Name: ${definition.fieldName}
+- Entity Type: ${definition.entityType}
+- Field Type: ${definition.fieldType}
+- Required: ${definition.isRequired ? 'Yes' : 'No'}
+- Display Order: ${definition.displayOrder}${options}
+- Created: ${new Date(definition.createdAt).toLocaleDateString()}
+- Definition ID: ${definition.id}

The custom field is now available for use in ${definition.entityType.toLowerCase()} forms and can be set via API.`;
      }

      case 'get_entity_custom_fields': {
        const { entity_type, entity_id } = parameters;
        
        // Map entity types to GraphQL queries
        const entityQueries = {
          DEAL: `
            query GetDealCustomFields($dealId: ID!) {
              deal(id: $dealId) {
                id
                name
                customFieldValues {
                  definition {
                    id
                    fieldName
                    fieldLabel
                    fieldType
                  }
                  stringValue
                  numberValue
                  booleanValue
                  dateValue
                  selectedOptionValues
                }
              }
            }
          `,
          PERSON: `
            query GetPersonCustomFields($personId: ID!) {
              person(id: $personId) {
                id
                first_name
                last_name
                customFieldValues {
                  definition {
                    id
                    fieldName
                    fieldLabel
                    fieldType
                  }
                  stringValue
                  numberValue
                  booleanValue
                  dateValue
                  selectedOptionValues
                }
              }
            }
          `,
          ORGANIZATION: `
            query GetOrganizationCustomFields($organizationId: ID!) {
              organization(id: $organizationId) {
                id
                name
                customFieldValues {
                  definition {
                    id
                    fieldName
                    fieldLabel
                    fieldType
                  }
                  stringValue
                  numberValue
                  booleanValue
                  dateValue
                  selectedOptionValues
                }
              }
            }
          `,
        };

        const query = entityQueries[entity_type as keyof typeof entityQueries];
        if (!query) {
          throw new Error(`Unsupported entity type: ${entity_type}`);
        }

        const variables = {
          [`${entity_type.toLowerCase()}Id`]: entity_id
        };

        const result = await executeGraphQL(query, variables);
        const entity = result.data?.[entity_type.toLowerCase()];
        
        if (!entity) {
          return `${entity_type} with ID ${entity_id} not found`;
        }

        const customFields = entity.customFieldValues || [];

        if (customFields.length === 0) {
          const entityName = entity.name || `${entity.first_name || ''} ${entity.last_name || ''}`.trim() || 'Unknown';
          return `No custom field values found for ${entity_type}: ${entityName} (ID: ${entity_id})`;
        }

        const entityName = entity.name || `${entity.first_name || ''} ${entity.last_name || ''}`.trim() || 'Unknown';
        const summary = `Found ${customFields.length} custom field value${customFields.length > 1 ? 's' : ''} for ${entity_type}: ${entityName}`;
        
        const fieldsList = customFields.map((field: any) => {
          let value = 'No value';
          
          switch (field.definition.fieldType) {
            case 'TEXT':
              value = field.stringValue || 'No value';
              break;
            case 'NUMBER':
              value = field.numberValue !== null ? field.numberValue.toString() : 'No value';
              break;
            case 'BOOLEAN':
              value = field.booleanValue !== null ? (field.booleanValue ? 'Yes' : 'No') : 'No value';
              break;
            case 'DATE':
              value = field.dateValue ? new Date(field.dateValue).toLocaleDateString() : 'No value';
              break;
            case 'DROPDOWN':
              value = field.stringValue || 'No selection';
              break;
            case 'MULTI_SELECT':
              value = field.selectedOptionValues && field.selectedOptionValues.length > 0 
                ? field.selectedOptionValues.join(', ') 
                : 'No selections';
              break;
            default:
              value = field.stringValue || 'No value';
          }
          
          return `• ${field.definition.fieldLabel} (${field.definition.fieldType}): ${value}
  Field ID: ${field.definition.id}`;
        }).join('\n');

        return `${summary}\n\n${fieldsList}`;
      }

      case 'set_entity_custom_fields': {
        const { entity_type, entity_id, custom_fields } = parameters;
        
        // For now, we'll use a direct update approach
        // This assumes the GraphQL mutations support custom field updates
        const mutations = {
          DEAL: `
            mutation UpdateDealCustomFields($id: ID!, $input: DealUpdateInput!) {
              updateDeal(id: $id, input: $input) {
                id
                name
                customFieldValues {
                  definition {
                    fieldLabel
                    fieldType
                  }
                  stringValue
                  numberValue
                  booleanValue
                  dateValue
                  selectedOptionValues
                }
              }
            }
          `,
          PERSON: `
            mutation UpdatePersonCustomFields($id: ID!, $input: PersonInput!) {
              updatePerson(id: $id, input: $input) {
                id
                first_name
                last_name
                customFieldValues {
                  definition {
                    fieldLabel
                    fieldType
                  }
                  stringValue
                  numberValue
                  booleanValue
                  dateValue
                  selectedOptionValues
                }
              }
            }
          `,
          ORGANIZATION: `
            mutation UpdateOrganizationCustomFields($id: ID!, $input: OrganizationInput!) {
              updateOrganization(id: $id, input: $input) {
                id
                name
                customFieldValues {
                  definition {
                    fieldLabel
                    fieldType
                  }
                  stringValue
                  numberValue
                  booleanValue
                  dateValue
                  selectedOptionValues
                }
              }
            }
          `,
        };

        const mutation = mutations[entity_type as keyof typeof mutations];
        if (!mutation) {
          throw new Error(`Unsupported entity type for custom field updates: ${entity_type}`);
        }

        // Format custom fields for GraphQL input
        const formattedCustomFields = custom_fields.map((field: any) => ({
          definitionId: field.definitionId,
          stringValue: field.stringValue || null,
          numberValue: field.numberValue || null,
          booleanValue: field.booleanValue || null,
          dateValue: field.dateValue || null,
          selectedOptionValues: field.selectedOptionValues || null,
        }));

        const input = {
          customFieldValues: formattedCustomFields
        };

        const result = await executeGraphQL(mutation, { id: entity_id, input });
        const entity = result.data?.[`update${entity_type.charAt(0) + entity_type.slice(1).toLowerCase()}`];
        
        if (!entity) {
          throw new Error(`Failed to update custom fields for ${entity_type} with ID ${entity_id}`);
        }

        const entityName = entity.name || `${entity.first_name || ''} ${entity.last_name || ''}`.trim() || 'Unknown';
        const updatedFields = entity.customFieldValues || [];
        
        return `✅ Custom fields updated successfully for ${entity_type}: ${entityName}!

**Updated Custom Fields:**
${updatedFields.map((field: any) => {
  let value = 'No value';
  switch (field.definition.fieldType) {
    case 'TEXT':
    case 'DROPDOWN':
      value = field.stringValue || 'No value';
      break;
    case 'NUMBER':
      value = field.numberValue !== null ? field.numberValue.toString() : 'No value';
      break;
    case 'BOOLEAN':
      value = field.booleanValue !== null ? (field.booleanValue ? 'Yes' : 'No') : 'No value';
      break;
    case 'DATE':
      value = field.dateValue ? new Date(field.dateValue).toLocaleDateString() : 'No value';
      break;
    case 'MULTI_SELECT':
      value = field.selectedOptionValues && field.selectedOptionValues.length > 0 
        ? field.selectedOptionValues.join(', ') 
        : 'No selections';
      break;
  }
  return `- ${field.definition.fieldLabel}: ${value}`;
}).join('\n')}

Entity ID: ${entity.id}`;
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