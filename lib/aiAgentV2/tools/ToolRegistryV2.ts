import type { ToolExecutionContext, ToolResult } from '../types/tools.js';

// Import V2 Tools
import { SearchOrganizationsTool } from './SearchOrganizationsTool.js';
import { CreateOrganizationTool } from './CreateOrganizationTool.js';
import { GetDropdownDataTool } from './GetDropdownDataTool.js';
import { CreateDealTool } from './CreateDealTool.js';
import { SearchDealsTool } from './SearchDealsTool.js';
import { SearchContactsTool } from './SearchContactsTool.js';
import { GetDetailsTool } from './GetDetailsTool.js';
import { CreateContactTool } from './CreateContactTool.js';
import { ThinkingTool } from './ThinkingTool.js';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: any;
  requiredPermissions: string[];
  category: string;
  execute: (parameters: any, context: ToolExecutionContext) => Promise<ToolResult>;
}

export interface ToolCategory {
  name: string;
  description: string;
  tools: string[];
  color: string;
}

/**
 * V2 Tool Registry - GraphQL-First Architecture
 * 
 * This registry manages all V2 tools that follow GraphQL-first principles,
 * integrate with business rules, and provide enhanced context preservation.
 */
export class ToolRegistryV2 {
  private tools = new Map<string, ToolDefinition>();
  private categories = new Map<string, ToolCategory>();

  constructor() {
    this.initializeTools();
    this.initializeCategories();
  }

  /**
   * Initialize all V2 tools
   */
  private initializeTools(): void {
    // Core reasoning tool
    const thinkingTool = new ThinkingTool();
    this.registerTool(thinkingTool.getDefinition(), 'reasoning');

    // Organization tools
    const searchOrganizationsTool = new SearchOrganizationsTool();
    this.registerTool(searchOrganizationsTool.getDefinition(), 'organizations');

    const createOrganizationTool = new CreateOrganizationTool();
    this.registerTool(createOrganizationTool.getDefinition(), 'organizations');

    // Contact/People tools
    const searchContactsTool = new SearchContactsTool();
    this.registerTool(searchContactsTool.getDefinition(), 'contacts');

    const createContactTool = new CreateContactTool();
    this.registerTool(createContactTool.getDefinition(), 'contacts');

    // Deal tools
    const searchDealsTool = new SearchDealsTool();
    this.registerTool(searchDealsTool.getDefinition(), 'deals');

    const createDealTool = new CreateDealTool();
    this.registerTool(createDealTool.getDefinition(), 'deals');

    // Universal detail tool
    const getDetailsTool = new GetDetailsTool();
    this.registerTool(getDetailsTool.getDefinition(), 'system');

    // System tools
    const getDropdownDataTool = new GetDropdownDataTool();
    this.registerTool(getDropdownDataTool.getDefinition(), 'system');
  }

  /**
   * Initialize tool categories
   */
  private initializeCategories(): void {
    this.categories.set('reasoning', {
      name: 'Reasoning & Analysis',
      description: 'Tools for structured thinking, analysis, and decision making',
      tools: ['think'],
      color: '#8B5CF6'
    });

    this.categories.set('organizations', {
      name: 'Organization Management',
      description: 'Tools for searching, creating, and managing organizations/companies',
      tools: ['search_organizations', 'create_organization'],
      color: '#059669'
    });

    this.categories.set('contacts', {
      name: 'Contact Management',
      description: 'Tools for searching, creating, and managing contacts/people',
      tools: ['search_contacts', 'create_contact'],
      color: '#7C3AED'
    });

    this.categories.set('deals', {
      name: 'Deal Management',
      description: 'Tools for searching, creating, and managing sales deals',
      tools: ['search_deals', 'create_deal'],
      color: '#2563EB'
    });

    this.categories.set('system', {
      name: 'System & Metadata',
      description: 'Tools for accessing system data, dropdown options, and detailed information',
      tools: ['get_dropdown_data', 'get_details'],
      color: '#DC2626'
    });
  }

  /**
   * Register a tool with the registry
   */
  private registerTool(toolDef: any, category: string): void {
    const toolDefinition: ToolDefinition = {
      name: toolDef.name,
      description: toolDef.description,
      parameters: toolDef.parameters,
      requiredPermissions: toolDef.requiredPermissions || [],
      category,
      execute: toolDef.execute
    };

    this.tools.set(toolDef.name, toolDefinition);
  }

  /**
   * Get tool definition by name
   */
  getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * Get all tools
   */
  getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(category: string): ToolDefinition[] {
    return Array.from(this.tools.values()).filter(tool => tool.category === category);
  }

  /**
   * Get all categories
   */
  getCategories(): ToolCategory[] {
    return Array.from(this.categories.values());
  }

  /**
   * Execute a tool with full context and business rules validation
   */
  async executeTool(
    toolName: string,
    parameters: any,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    const startTime = Date.now();

    try {
      const tool = this.getTool(toolName);
             if (!tool) {
         return {
           success: false,
           error: {
             code: 'UNKNOWN_TOOL',
             message: `Unknown tool: ${toolName}`,
             details: { toolName, availableTools: Array.from(this.tools.keys()) },
             recoverable: true,
             retryable: false,
             suggestedFix: 'Check tool name and available tools'
           },
           metadata: {
             executionTime: Date.now() - startTime
           }
         };
       }

      // Check permissions
      if (tool.requiredPermissions.length > 0) {
        const userPermissions = context.permissions || [];
        const hasPermission = tool.requiredPermissions.some(perm => 
          userPermissions.includes(perm)
        );

                 if (!hasPermission) {
           return {
             success: false,
             error: {
               code: 'INSUFFICIENT_PERMISSIONS',
               message: `Insufficient permissions for ${toolName}. Required: ${tool.requiredPermissions.join(', ')}`,
               details: { toolName, requiredPermissions: tool.requiredPermissions, userPermissions: context.permissions },
               recoverable: false,
               retryable: false,
               suggestedFix: 'Contact administrator to grant required permissions'
             },
             metadata: {
               executionTime: Date.now() - startTime
             }
           };
         }
      }

      // Execute the tool
      const result = await tool.execute(parameters, context);

             // Add execution metadata
       result.metadata = {
         ...result.metadata,
         executionTime: Date.now() - startTime
       };

      return result;

         } catch (error: any) {
       return {
         success: false,
         error: {
           code: 'TOOL_EXECUTION_FAILED',
           message: `Tool execution failed: ${error.message}`,
           details: { toolName, parameters, errorStack: error.stack },
           recoverable: true,
           retryable: true,
           suggestedFix: 'Review parameters and retry'
         },
         metadata: {
           executionTime: Date.now() - startTime
         }
       };
     }
  }

  /**
   * Get tool execution summary for AI context
   */
  getToolSummary(): string {
    const totalTools = this.tools.size;
    const categories = this.getCategories();
    
    let summary = `🛠️ **PipeCD AI Agent V2 Tools** (${totalTools} available)\n\n`;

    for (const category of categories) {
      const categoryTools = this.getToolsByCategory(category.name.toLowerCase().replace(/[^a-z]/g, ''));
      summary += `**${category.name}** (${categoryTools.length} tools)\n`;
      summary += `${category.description}\n`;
      
      for (const tool of categoryTools) {
        summary += `• \`${tool.name}\` - ${tool.description.split('.')[0]}\n`;
      }
      summary += '\n';
    }

    summary += `💡 **Key Features:**\n`;
    summary += `• GraphQL-first architecture with real-time data\n`;
    summary += `• Built-in business rules enforcement\n`;
    summary += `• Context preservation across tool calls\n`;
    summary += `• Permission-based access control\n`;
    summary += `• Structured reasoning with thinking tool\n`;
    summary += `• Duplicate prevention and validation\n\n`;

    summary += `🚀 **Usage Pattern:**\n`;
    summary += `1. Use \`think\` to analyze the request\n`;
    summary += `2. Use \`get_dropdown_data\` for system metadata\n`;
    summary += `3. Search before creating (organizations, contacts)\n`;
    summary += `4. Create entities with proper validation\n`;
    summary += `5. Follow up with activities and updates\n`;

    return summary;
  }

  /**
   * Get suggested workflow for common operations
   */
  getSuggestedWorkflow(operation: string): string[] {
    const workflows: Record<string, string[]> = {
      'create_deal': [
        'think - Analyze the deal creation request',
        'get_dropdown_data - Get system metadata and valid options',
        'search_organizations - Find or confirm organization exists',
        'create_organization - Create if organization doesn\'t exist',
        'create_deal - Create the deal with validated data'
      ],
      'create_organization': [
        'think - Analyze the organization creation request',
        'search_organizations - Check for existing organizations',
        'create_organization - Create if no duplicates found'
      ],
      'setup_client': [
        'think - Analyze client setup requirements',
        'get_dropdown_data - Get system metadata',
        'search_organizations - Check if client organization exists',
        'create_organization - Create client organization if needed',
        'create_deal - Create initial opportunity/deal',
        'create_activity - Schedule follow-up activities'
      ]
    };

    return workflows[operation] || [
      'think - Analyze the request and plan approach',
      'get_dropdown_data - Gather necessary system metadata',
      'Execute appropriate business tools based on analysis'
    ];
  }

  /**
   * Validate tool parameters against schema
   */
  validateToolParameters(toolName: string, parameters: any): { valid: boolean; errors: string[] } {
    const tool = this.getTool(toolName);
    if (!tool) {
      return { valid: false, errors: [`Unknown tool: ${toolName}`] };
    }

    const errors: string[] = [];
    const required = tool.parameters.required || [];

    // Check required parameters
    for (const param of required) {
      if (!(param in parameters) || parameters[param] === null || parameters[param] === undefined) {
        errors.push(`Missing required parameter: ${param}`);
      }
    }

    // Basic type checking
    if (tool.parameters.properties) {
      for (const [paramName, paramSchema] of Object.entries(tool.parameters.properties as any)) {
        if (paramName in parameters) {
          const value = parameters[paramName];
          const schema = paramSchema as any;
          
          if (schema.type === 'string' && typeof value !== 'string') {
            errors.push(`Parameter ${paramName} must be a string`);
          } else if (schema.type === 'number' && typeof value !== 'number') {
            errors.push(`Parameter ${paramName} must be a number`);
          } else if (schema.type === 'boolean' && typeof value !== 'boolean') {
            errors.push(`Parameter ${paramName} must be a boolean`);
          } else if (schema.type === 'array' && !Array.isArray(value)) {
            errors.push(`Parameter ${paramName} must be an array`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get available tools for current user permissions
   */
  getAvailableTools(userPermissions: string[]): ToolDefinition[] {
    return this.getAllTools().filter(tool => {
      if (tool.requiredPermissions.length === 0) {
        return true; // No permissions required
      }
      
      return tool.requiredPermissions.some(perm => userPermissions.includes(perm));
    });
  }
} 