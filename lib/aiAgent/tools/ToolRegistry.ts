/**
 * Tool Registry for PipeCD AI Agent (Enhanced with MCP Best Practices)
 * 
 * Centralized registry for all available tools with:
 * - Rich MCP-inspired tool documentation and examples
 * - Workflow guidance embedded in tool metadata
 * - Self-documenting tools to reduce system prompt complexity
 * - Category-based organization with relationship mapping
 * - Dynamic tool discovery and contextual guidance
 * 
 * Architecture: Uses existing GraphQL adapters (not MCP server) for internal functionality
 */

import type { MCPTool, MCPToolAnnotations } from '../types';
import type { ToolCategory } from '../types/tools';

export interface ToolRegistryConfig {
  enabledCategories?: ToolCategory[];
  enabledTools?: string[];
  disabledTools?: string[];
}

export class ToolRegistry {
  private tools: Map<string, MCPTool> = new Map();
  private categories: Map<ToolCategory, string[]> = new Map();
  private config: ToolRegistryConfig;

  constructor(config: ToolRegistryConfig = {}) {
    this.config = config;
    this.initializeEnhancedTools();
  }

  /**
   * Initialize all tools with rich MCP-inspired documentation
   */
  private initializeEnhancedTools(): void {
    // Register all tools by category with enhanced documentation
    this.registerEnhancedDealTools();
    this.registerEnhancedLeadTools();
    this.registerEnhancedOrganizationTools();
    this.registerEnhancedContactTools();
    this.registerEnhancedActivityTools();
    this.registerEnhancedCustomFieldTools();
    this.registerEnhancedUserTools();
    this.registerEnhancedWorkflowTools();
    this.registerThinkingTools();
  }

  /**
   * Register deal tools with rich MCP-inspired documentation
   */
  private registerEnhancedDealTools(): void {
    const dealTools: MCPTool[] = [
      {
        name: 'search_deals',
        description: 'Search and filter deals in the CRM system. Use this when users ask about finding deals, checking deal status, analyzing deal pipelines, or getting deal overviews. Essential for understanding the current deal landscape before taking actions.',
        parameters: {
          type: 'object',
          properties: {
            search_term: { 
              type: 'string', 
              description: 'Search term to filter deals by name or description. Supports partial matching. Leave empty to get all deals. Examples: "Acme Corp", "Q1 2024", "Enterprise License"'
            },
            assigned_to: { 
              type: 'string', 
              description: 'User ID or name to filter deals assigned to specific person. Use when user asks about "my deals" or "John\'s deals". Examples: "user_123", "john.doe@company.com"'
            },
            min_amount: { 
              type: 'number', 
              description: 'Minimum deal value in USD. Use for queries like "deals over $10k" or "high-value opportunities". Examples: 1000, 10000, 50000'
            },
            max_amount: { 
              type: 'number', 
              description: 'Maximum deal value in USD. Use for queries like "small deals under $5k". Examples: 5000, 25000, 100000'
            },
            stage: {
              type: 'string',
              description: 'Deal stage to filter by. Common stages: "Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost". Examples: "Prospecting", "Proposal", "Closed Won"'
            },
            limit: { 
              type: 'number', 
              description: 'Maximum number of deals to return. Default is 20. Use higher values for comprehensive analysis. Examples: 10, 50, 100',
              default: 20
            }
          }
        },
        annotations: {
          title: 'Search Deals',
          readOnlyHint: true,
          openWorldHint: false,
          workflowStage: 'discovery',
          category: 'deals',
          examples: [
            'Show me all deals over $50,000',
            'Find deals assigned to Sarah Johnson',
            'What deals are in the proposal stage?',
            'Show me deals for Acme Corporation',
            'List all deals closing this quarter',
            'Find high-priority deals in negotiation'
          ],
          usagePatterns: [
            'Start with search_deals to understand the current deal landscape',
            'Use filters to narrow down to specific criteria mentioned by user',
            'Follow up with get_deal_details for specific deals that need analysis',
            'Combine with search_organizations when deals relate to specific companies',
            'Use before creating new deals to check for duplicates'
          ],
          relatedTools: ['get_deal_details', 'search_organizations', 'search_activities', 'create_deal']
        }
      },
      {
        name: 'get_deal_details',
        description: 'Get comprehensive details for a specific deal including all related data, activities, contacts, custom fields, and analysis. Use this after search_deals when user wants detailed information about a particular deal, or when they mention a specific deal by name/ID.',
        parameters: {
          type: 'object',
          properties: {
            deal_id: { 
              type: 'string', 
              description: 'Unique identifier of the deal. Get this from search_deals results or when user provides a specific deal ID. Examples: "deal_123", "uuid-format-id"'
            }
          },
          required: ['deal_id']
        },
        annotations: {
          title: 'Get Deal Details',
          readOnlyHint: true,
          openWorldHint: false,
          workflowStage: 'analysis',
          category: 'deals',
          examples: [
            'Tell me more about the Acme Corp deal',
            'What\'s the status of deal #123?',
            'Show me all details for this deal',
            'Analyze the Microsoft partnership deal',
            'Get full information about the Q2 enterprise deal'
          ],
          usagePatterns: [
            'Use after search_deals to get detailed information about specific deals',
            'Essential for deal analysis and comprehensive reporting',
            'Provides context needed before update_deal operations',
            'Use when user asks about specific deal progress, activities, or details',
            'Required before making deal modifications to understand current state'
          ],
          relatedTools: ['search_deals', 'update_deal', 'search_activities', 'create_activity']
        }
      },
      {
        name: 'create_deal',
        description: 'Create a new deal in the CRM system. Use this when users want to add a new sales opportunity, convert a lead to a deal, or record a new business opportunity. CRITICAL: Always search for existing organizations first to avoid duplicates.',
        parameters: {
          type: 'object',
          properties: {
            name: { 
              type: 'string', 
              description: 'Deal name/title. Should be descriptive and include company name if applicable. Examples: "Acme Corp - Software License Deal", "Q2 2024 Enterprise Package", "Microsoft Partnership Agreement"'
            },
            organization_id: { 
              type: 'string', 
              description: 'ID of the organization/company for this deal. IMPORTANT: Always search_organizations first to find existing organization or create_organization if needed. Examples: "org_123", "uuid-format-org-id"'
            },
            primary_contact_id: { 
              type: 'string', 
              description: 'ID of the main contact person for this deal. Search contacts first or create if needed. Examples: "contact_456", "uuid-format-contact-id"'
            },
            value: { 
              type: 'number', 
              description: 'Deal value/amount in USD. Use the total expected revenue from this deal. Examples: 5000, 25000, 100000'
            },
            stage: { 
              type: 'string', 
              description: 'Initial deal stage. Common values: "Prospecting", "Qualification", "Proposal", "Negotiation". Default is usually "Prospecting". Examples: "Prospecting", "Qualification", "Proposal"'
            },
            priority: { 
              type: 'string', 
              description: 'Deal priority level: HIGH, MEDIUM, or LOW. Use HIGH for urgent/large deals. Examples: "HIGH", "MEDIUM", "LOW"'
            },
            description: { 
              type: 'string', 
              description: 'Detailed description of the deal, requirements, or opportunity details. Examples: "Enterprise software license renewal", "New customer onboarding package", "Custom integration project"'
            },
            source: { 
              type: 'string', 
              description: 'How this deal was acquired. Common sources: Website, Referral, Cold Call, LinkedIn, Trade Show. Examples: "Website", "Referral", "Cold Call", "LinkedIn", "Trade Show"'
            },
            deal_type: { 
              type: 'string', 
              description: 'Type of deal or product category. Examples: "Software License", "Consulting", "Hardware", "Subscription"'
            },
            close_date: { 
              type: 'string', 
              description: 'Expected close date in YYYY-MM-DD format. Use realistic timeline based on deal complexity. Examples: "2024-03-15", "2024-06-30", "2024-12-31"'
            },
            custom_fields: { 
              type: 'array', 
              description: 'Array of custom field values with definitionId and value. Use for RFP data, special requirements, etc. Examples: [{"definitionId": "field_123", "value": "Enterprise"}], [{"definitionId": "budget_field", "value": "50000"}]'
            }
          },
          required: ['name']
        },
        annotations: {
          title: 'Create Deal',
          readOnlyHint: false,
          destructiveHint: false,
          openWorldHint: false,
          workflowStage: 'creation',
          category: 'deals',
          examples: [
            'Create a new deal for Acme Corp worth $50,000',
            'Add a software license deal for Microsoft',
            'Record this RFP as a new opportunity',
            'Convert this lead into a deal',
            'Create a Q2 enterprise package deal'
          ],
          usagePatterns: [
            'ALWAYS search_organizations first to find or create the company',
            'Search for existing contacts or create_contact if needed',
            'Use custom_fields for RFP-specific data or special requirements',
            'Set realistic close_date based on deal complexity and sales cycle',
            'Follow up with create_activity to add initial notes or next steps',
            'Assign appropriate priority based on deal size and urgency'
          ],
          relatedTools: ['search_organizations', 'create_organization', 'search_contacts', 'create_contact', 'create_activity', 'create_custom_field_definition'],
          prerequisites: ['organization_id from search_organizations or create_organization']
        }
      },
      {
        name: 'update_deal',
        description: 'Update existing deal information including amount, stage, dates, assignments, and other details. Use this when users want to modify deal data, change deal stage, update amounts, reassign deals, or progress deals through the sales pipeline.',
        parameters: {
          type: 'object',
          properties: {
            deal_id: { 
              type: 'string', 
              description: 'ID of the deal to update. Get this from search_deals or get_deal_details. Examples: "deal_123", "uuid-format-deal-id"'
            },
            name: { 
              type: 'string', 
              description: 'New deal name/title if changing. Examples: "Updated Deal Name", "Acme Corp - Expanded Package"'
            },
            amount: { 
              type: 'number', 
              description: 'New deal amount/value in USD. Examples: 75000, 125000, 250000'
            },
            person_id: { 
              type: 'string', 
              description: 'New primary contact person ID if changing. Examples: "contact_789", "uuid-format-contact-id"'
            },
            organization_id: { 
              type: 'string', 
              description: 'New organization ID if changing company association. Examples: "org_456", "uuid-format-org-id"'
            },
            expected_close_date: { 
              type: 'string', 
              description: 'New expected close date in YYYY-MM-DD format. Examples: "2024-04-15", "2024-07-30"'
            },
            assigned_to_user_id: { 
              type: 'string', 
              description: 'ID of user to reassign deal to. Examples: "user_456", "uuid-format-user-id"'
            }
          },
          required: ['deal_id']
        },
        annotations: {
          title: 'Update Deal',
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false,
          workflowStage: 'update',
          category: 'deals',
          examples: [
            'Update the deal amount to $75,000',
            'Move this deal to the proposal stage',
            'Change the close date to next month',
            'Reassign this deal to Sarah',
            'Mark this deal as high priority',
            'Update the deal name to include new requirements'
          ],
          usagePatterns: [
            'Use get_deal_details first to understand current state before updating',
            'Update stage progressively through sales pipeline (don\'t skip stages without reason)',
            'When updating amount, consider if close_date should also change',
            'Follow up with create_activity to log the reason for changes',
            'Reassign deals when workload balancing is needed'
          ],
          relatedTools: ['get_deal_details', 'search_deals', 'create_activity', 'search_users'],
          prerequisites: ['deal_id from search_deals or get_deal_details']
        }
      },
      {
        name: 'delete_deal',
        description: 'Permanently delete a deal from the system. Use this only when explicitly requested by user and when deal was created in error or is no longer valid. This action cannot be undone and should be used with extreme caution.',
        parameters: {
          type: 'object',
          properties: {
            deal_id: { 
              type: 'string', 
              description: 'ID of the deal to delete permanently. Examples: "deal_123", "uuid-format-deal-id"'
            }
          },
          required: ['deal_id']
        },
        annotations: {
          title: 'Delete Deal',
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: true,
          openWorldHint: false,
          workflowStage: 'cleanup',
          category: 'deals',
          examples: [
            'Delete this duplicate deal',
            'Remove the test deal we created',
            'This deal was created by mistake, please delete it',
            'Delete the cancelled deal permanently'
          ],
          usagePatterns: [
            'ALWAYS confirm with user before deleting - this action is irreversible',
            'Use get_deal_details first to show what will be deleted',
            'Consider update_deal to mark as "Closed Lost" instead of deleting',
            'Only delete when explicitly requested and confirmed by user',
            'Document reason for deletion in activity log before deleting'
          ],
          relatedTools: ['get_deal_details', 'update_deal', 'create_activity']
        }
      }
    ];

    this.registerToolsForCategory('deals', dealTools);
  }

  /**
   * Register all lead-related tools
   */
  private registerLeadTools(): void {
    const leadTools: MCPTool[] = [
      {
        name: 'search_leads',
        description: 'Search and filter leads by various criteria',
        parameters: {
          type: 'object',
          properties: {
            search_term: { type: 'string', description: 'Filter by lead name or contact info' },
            source: { type: 'string', description: 'Filter by lead source' },
            is_qualified: { type: 'boolean', description: 'Filter by qualification status' },
            assigned_to_user_id: { type: 'string', description: 'Filter by assigned user' },
            min_score: { type: 'number', description: 'Minimum lead score' },
            max_score: { type: 'number', description: 'Maximum lead score' },
            limit: { type: 'number', description: 'Maximum results to return', default: 20 },
          },
        },
      },
      {
        name: 'get_lead_details',
        description: 'Get comprehensive details for a specific lead',
        parameters: {
          type: 'object',
          properties: {
            lead_id: { type: 'string', description: 'ID of the lead to analyze' },
          },
          required: ['lead_id'],
        },
      },
      {
        name: 'create_lead',
        description: 'Create a new lead with comprehensive data and custom fields',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Lead name' },
            source: { type: 'string', description: 'Lead source (e.g., Website, LinkedIn, Referral)' },
            contact_name: { type: 'string', description: 'Contact person name' },
            contact_email: { type: 'string', description: 'Contact email address' },
            contact_phone: { type: 'string', description: 'Contact phone number' },
            company_name: { type: 'string', description: 'Company name' },
            estimated_value: { type: 'number', description: 'Estimated deal value' },
            estimated_close_date: { type: 'string', description: 'Estimated close date (YYYY-MM-DD)' },
            assigned_to_user_id: { type: 'string', description: 'User ID to assign lead to' },
            wfm_project_type_id: { type: 'string', description: 'WFM project type for lead qualification workflow' },
            custom_fields: { type: 'object', description: 'Custom field values as key-value pairs' },
            description: { type: 'string', description: 'Lead description or notes' },
          },
          required: ['name'],
        },
      },
      {
        name: 'qualify_lead',
        description: 'Analyze and qualify a lead based on available data and interactions',
        parameters: {
          type: 'object',
          properties: {
            lead_id: { type: 'string', description: 'ID of the lead to qualify' },
            is_qualified: { type: 'boolean', description: 'Whether the lead is qualified' },
            qualification_notes: { type: 'string', description: 'Qualification notes and reasoning' },
          },
          required: ['lead_id'],
        },
      },
      {
        name: 'convert_lead',
        description: 'Convert a qualified lead to deal, person, organization, or all',
        parameters: {
          type: 'object',
          properties: {
            lead_id: { type: 'string', description: 'ID of the lead to convert' },
            target_type: { type: 'string', enum: ['DEAL', 'PERSON', 'ORGANIZATION', 'ALL'], description: 'What to convert the lead to' },
            deal_data: { type: 'object', description: 'Additional deal data if converting to deal' },
            person_data: { type: 'object', description: 'Additional person data if converting to person' },
            organization_data: { type: 'object', description: 'Additional organization data if converting to organization' },
            preserve_activities: { type: 'boolean', description: 'Whether to transfer lead activities', default: true },
          },
          required: ['lead_id', 'target_type'],
        },
      },
      {
        name: 'update_lead_score',
        description: 'Recalculate and update lead score based on current data and interactions',
        parameters: {
          type: 'object',
          properties: {
            lead_id: { type: 'string', description: 'ID of the lead to rescore' },
            scoring_factors: { type: 'object', description: 'Optional manual scoring factor adjustments' },
          },
          required: ['lead_id'],
        },
      },
    ];

    this.registerToolsForCategory('leads', leadTools);
  }

  /**
   * Register all organization-related tools
   */
  private registerOrganizationTools(): void {
    const organizationTools: MCPTool[] = [
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
    ];

    this.registerToolsForCategory('organizations', organizationTools);
  }

  /**
   * Register all contact/people-related tools
   */
  private registerContactTools(): void {
    const contactTools: MCPTool[] = [
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
    ];

    this.registerToolsForCategory('contacts', contactTools);
  }

  /**
   * Register all activity-related tools
   */
  private registerActivityTools(): void {
    const activityTools: MCPTool[] = [
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
    ];

    this.registerToolsForCategory('activities', activityTools);
  }

  /**
   * Register all custom field management tools
   */
  private registerCustomFieldTools(): void {
    const customFieldTools: MCPTool[] = [
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

    this.registerToolsForCategory('customFields', customFieldTools);
  }

  /**
   * Register user-related tools
   */
  private registerUserTools(): void {
    const userTools: MCPTool[] = [
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
    ];

    this.registerToolsForCategory('users', userTools);
  }

  /**
   * Register workflow management tools
   */
  private registerWorkflowTools(): void {
    const workflowTools: MCPTool[] = [
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
    ];

    this.registerToolsForCategory('workflow', workflowTools);
  }

  /**
   * Register thinking tools for complex reasoning
   */
  private registerThinkingTools(): void {
    const thinkTool: MCPTool = {
      name: "think",
      description: "Use this tool for complex reasoning about CRM operations, policy compliance, or multi-step planning. This tool helps you think through problems step by step before taking action.",
      parameters: {
        type: "object",
        properties: {
          thought: {
            type: "string",
            description: "Detailed reasoning about the current CRM task, decision, or analysis. Be specific about what you're thinking through."
          },
          reasoning_type: {
            type: "string",
            enum: ["analysis", "planning", "decision", "problem_solving", "workflow_design"],
            description: "Type of reasoning being performed"
          },
          confidence: {
            type: "number",
            minimum: 0,
            maximum: 1,
            description: "Confidence level in this reasoning (0.0 to 1.0)"
          },
          next_actions: {
            type: "array",
            items: { type: "string" },
            description: "List of potential next actions based on this thinking"
          }
        },
        required: ["thought", "reasoning_type"]
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        workflowStage: "analysis",
        examples: [
          "Analyzing a complex deal creation request: I need to search for existing deal first, then extract organization details, then create new deal with real IDs",
          "Problem-solving a failed tool execution: The create_deal failed with invalid UUID error, I need to search for organization to get real UUID first"
        ],
        usagePatterns: [
          "Use before complex multi-step operations",
          "Use when you need to analyze user requirements",
          "Use when planning tool execution sequences",
          "Use when debugging failed operations",
          "Use when making decisions about which tools to use"
        ],
        relatedTools: ["search_deals", "search_organizations", "create_deal", "get_deal_details"],
        prerequisites: []
      }
    };

    // Add thinking to the deals category since it's most commonly used with deal operations
    this.registerToolsForCategory('deals', [thinkTool]);
  }

  /**
   * Register tools for a specific category
   */
  private registerToolsForCategory(category: ToolCategory, tools: MCPTool[]): void {
    const toolNames: string[] = [];

    for (const tool of tools) {
      // Check if tool should be enabled based on configuration
      if (this.shouldEnableTool(tool.name, category)) {
        this.tools.set(tool.name, tool);
        toolNames.push(tool.name);
      }
    }

    if (toolNames.length > 0) {
      this.categories.set(category, toolNames);
    }
  }

  /**
   * Check if a tool should be enabled based on configuration
   */
  private shouldEnableTool(toolName: string, category: ToolCategory): boolean {
    // Check if specific tools are disabled
    if (this.config.disabledTools?.includes(toolName)) {
      return false;
    }

    // Check if only specific tools are enabled
    if (this.config.enabledTools && !this.config.enabledTools.includes(toolName)) {
      return false;
    }

    // Check if only specific categories are enabled
    if (this.config.enabledCategories && !this.config.enabledCategories.includes(category)) {
      return false;
    }

    return true;
  }

  // ================================
  // Public API Methods
  // ================================

  /**
   * Get all available tools (respecting configuration)
   */
  getAllTools(): MCPTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(category: ToolCategory): MCPTool[] {
    const toolNames = this.categories.get(category) || [];
    return toolNames.map(name => this.tools.get(name)!).filter(Boolean);
  }

  /**
   * Get a specific tool by name
   */
  getTool(name: string): MCPTool | undefined {
    return this.tools.get(name);
  }

  /**
   * Check if a tool exists
   */
  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Get all available categories
   */
  getCategories(): ToolCategory[] {
    return Array.from(this.categories.keys());
  }

  /**
   * Get tool names by category
   */
  getToolNamesByCategory(category: ToolCategory): string[] {
    return this.categories.get(category) || [];
  }

  /**
   * Get tool count
   */
  getToolCount(): number {
    return this.tools.size;
  }

  /**
   * Get category count
   */
  getCategoryCount(): number {
    return this.categories.size;
  }

  /**
   * Register a custom tool dynamically
   */
  registerTool(tool: MCPTool, category: ToolCategory): void {
    if (this.shouldEnableTool(tool.name, category)) {
      this.tools.set(tool.name, tool);
      
      const categoryTools = this.categories.get(category) || [];
      if (!categoryTools.includes(tool.name)) {
        categoryTools.push(tool.name);
        this.categories.set(category, categoryTools);
      }
    }
  }

  /**
   * Unregister a tool
   */
  unregisterTool(name: string): boolean {
    if (this.tools.has(name)) {
      this.tools.delete(name);
      
      // Remove from categories
      for (const [category, toolNames] of this.categories.entries()) {
        const index = toolNames.indexOf(name);
        if (index !== -1) {
          toolNames.splice(index, 1);
          this.categories.set(category, toolNames);
          break;
        }
      }
      
      return true;
    }
    return false;
  }

  /**
   * Update configuration and refresh tools
   */
  updateConfig(newConfig: ToolRegistryConfig): void {
    this.config = { ...this.config, ...newConfig };
    this.tools.clear();
    this.categories.clear();
    this.initializeEnhancedTools();
  }

  /**
   * Get current configuration
   */
  getConfig(): ToolRegistryConfig {
    return { ...this.config };
  }

  /**
   * Register enhanced lead tools with comprehensive documentation
   */
  private registerEnhancedLeadTools(): void {
    // For now, use existing implementation - will enhance later
    this.registerLeadTools();
  }

  /**
   * Register enhanced organization tools
   */
  private registerEnhancedOrganizationTools(): void {
    // For now, use existing implementation - will enhance later
    this.registerOrganizationTools();
  }

  /**
   * Register enhanced contact tools
   */
  private registerEnhancedContactTools(): void {
    // For now, use existing implementation - will enhance later
    this.registerContactTools();
  }

  /**
   * Register enhanced activity tools
   */
  private registerEnhancedActivityTools(): void {
    // For now, use existing implementation - will enhance later
    this.registerActivityTools();
  }

  /**
   * Register enhanced custom field tools
   */
  private registerEnhancedCustomFieldTools(): void {
    // For now, use existing implementation - will enhance later
    this.registerCustomFieldTools();
  }

  /**
   * Register enhanced user tools
   */
  private registerEnhancedUserTools(): void {
    // For now, use existing implementation - will enhance later
    this.registerUserTools();
  }

  /**
   * Register enhanced workflow tools
   */
  private registerEnhancedWorkflowTools(): void {
    // For now, use existing implementation - will enhance later
    this.registerWorkflowTools();
  }

  /**
   * Get tools by workflow stage for contextual discovery
   */
  getToolsByWorkflowStage(stage: 'discovery' | 'creation' | 'update' | 'analysis' | 'cleanup'): MCPTool[] {
    return Array.from(this.tools.values()).filter(tool => 
      tool.annotations?.workflowStage === stage
    );
  }

  /**
   * Get related tools for a given tool to suggest workflow continuations
   */
  getRelatedTools(toolName: string): MCPTool[] {
    const tool = this.tools.get(toolName);
    if (!tool?.annotations?.relatedTools) {
      return [];
    }

    return tool.annotations.relatedTools
      .map(name => this.tools.get(name))
      .filter(Boolean) as MCPTool[];
  }

  /**
   * Get tools that have specific annotations (e.g., readOnlyHint: true)
   */
  getToolsByAnnotation(annotation: keyof MCPToolAnnotations, value: any): MCPTool[] {
    return Array.from(this.tools.values()).filter(tool => 
      tool.annotations?.[annotation] === value
    );
  }

  /**
   * Generate dynamic tool usage guidance based on current context
   * This replaces the need for massive static prompts
   */
  generateContextualGuidance(context?: {
    userQuery?: string;
    currentStage?: 'discovery' | 'creation' | 'update' | 'analysis' | 'cleanup';
    recentTools?: string[];
  }): string {
    const guidance = [
      "# Dynamic Tool Guidance",
      "",
      "## Core Workflow Patterns",
      "",
      "### Deal Management Workflow:",
      "1. **Discovery**: search_deals → get_deal_details",
      "2. **Creation**: search_organizations → create_organization (if needed) → create_deal → create_activity",
      "3. **Updates**: get_deal_details → update_deal → create_activity (log changes)",
      "",
      "### Lead Processing Workflow:",
      "1. **Discovery**: search_leads → get_lead_details",
      "2. **Qualification**: qualify_lead → create_activity (notes)",
      "3. **Conversion**: convert_lead → create_deal workflow",
      "",
      "## Tool Selection Guidelines",
      "",
      "- **Always search before creating** to avoid duplicates",
      "- **Use read-only tools first** to gather context",
      "- **Follow workflow stages**: discovery → creation → update → analysis",
      "- **Check tool annotations** for usage hints and examples",
      ""
    ];

    // Add contextual guidance based on current stage
    if (context?.currentStage) {
      const stageTools = this.getToolsByWorkflowStage(context.currentStage);
      if (stageTools.length > 0) {
        guidance.push(`## Recommended Tools for ${context.currentStage.toUpperCase()} Stage:`);
        guidance.push("");
        stageTools.forEach(tool => {
          guidance.push(`- **${tool.annotations?.title || tool.name}**: ${tool.description}`);
          if (tool.annotations?.examples?.length) {
            guidance.push(`  Examples: ${tool.annotations.examples.slice(0, 2).join(', ')}`);
          }
        });
        guidance.push("");
      }
    }

    // Add related tools guidance if recent tools were used
    if (context?.recentTools?.length) {
      const lastTool = context.recentTools[context.recentTools.length - 1];
      if (lastTool) {
        const relatedTools = this.getRelatedTools(lastTool);
        if (relatedTools.length > 0) {
          guidance.push(`## Suggested Next Steps after ${lastTool}:`);
          guidance.push("");
          relatedTools.forEach(tool => {
            guidance.push(`- **${tool.annotations?.title || tool.name}**: ${tool.description}`);
          });
          guidance.push("");
        }
      }
    }

    guidance.push("## Key Principles");
    guidance.push("");
    guidance.push("- **Self-documenting tools**: Each tool contains examples and usage patterns");
    guidance.push("- **Workflow awareness**: Tools indicate their stage and related tools");
    guidance.push("- **Context preservation**: Always gather context before making changes");
    guidance.push("- **User confirmation**: Confirm destructive actions before execution");

    return guidance.join('\n');
  }

  /**
   * Get tool examples for a specific tool to help with parameter usage
   */
  getToolExamples(toolName: string): string[] {
    const tool = this.tools.get(toolName);
    return tool?.annotations?.examples || [];
  }

  /**
   * Get usage patterns for a specific tool
   */
  getToolUsagePatterns(toolName: string): string[] {
    const tool = this.tools.get(toolName);
    return tool?.annotations?.usagePatterns || [];
  }

  /**
   * Check if a tool is safe to use (read-only, non-destructive)
   */
  isToolSafe(toolName: string): boolean {
    const tool = this.tools.get(toolName);
    return tool?.annotations?.readOnlyHint === true || 
           tool?.annotations?.destructiveHint === false;
  }

  /**
   * Get tools that require prerequisites
   */
  getToolsWithPrerequisites(): Array<{tool: MCPTool, prerequisites: string[]}> {
    return Array.from(this.tools.values())
      .filter(tool => tool.annotations?.prerequisites?.length)
      .map(tool => ({
        tool,
        prerequisites: tool.annotations!.prerequisites!
      }));
  }

  /**
   * Get contextual guidance based on recent tool usage and current workflow stage
   */
  getContextualGuidance(recentTools: string[], currentStage?: string): string {
    const guidance: string[] = [];
    
    // Check if user should be thinking first
    const hasRecentThinking = recentTools.includes('think');
    const hasActionTools = recentTools.some(tool => 
      !['think', 'search_deals', 'search_organizations', 'search_people'].includes(tool)
    );
    
    if (!hasRecentThinking && hasActionTools) {
      guidance.push("💡 Consider using the 'think' tool to plan your approach before taking actions");
    }
    
    // Check for common workflow patterns
    if (recentTools.includes('search_deals') && !recentTools.includes('get_deal_details')) {
      guidance.push("📋 After finding deals, use 'get_deal_details' to get complete information");
    }
    
    if (recentTools.includes('create_deal') && recentTools.some(t => t.includes('search'))) {
      guidance.push("✅ Good workflow: searching first, then creating with real IDs");
    }
    
    // Stage-specific guidance
    if (currentStage === 'planning') {
      guidance.push("🎯 Planning stage: Use 'think' tool to analyze requirements and plan your approach");
    } else if (currentStage === 'execution') {
      guidance.push("⚡ Execution stage: Use action tools based on your planning");
    }
    
    return guidance.length > 0 ? guidance.join('\n') : '';
  }
} 