/**
 * Tool Registry for PipeCD AI Agent
 * 
 * Centralized registry for all available tools with:
 * - Tool discovery and metadata management
 * - Category-based organization
 * - Dynamic tool registration
 * - Tool validation and constraints
 */

import type { MCPTool } from '../types';
import type { ToolCategory, ToolDefinition } from '../types/tools';

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
    this.initializeDefaultTools();
  }

  /**
   * Initialize all default tools available in the system
   */
  private initializeDefaultTools(): void {
    // Register all tools by category
    this.registerDealTools();
    this.registerLeadTools();
    this.registerOrganizationTools();
    this.registerContactTools();
    this.registerActivityTools();
    this.registerCustomFieldTools();
    this.registerUserTools();
    this.registerWorkflowTools();
  }

  /**
   * Register all deal-related tools
   */
  private registerDealTools(): void {
    const dealTools: MCPTool[] = [
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
    this.initializeDefaultTools();
  }

  /**
   * Get current configuration
   */
  getConfig(): ToolRegistryConfig {
    return { ...this.config };
  }
} 