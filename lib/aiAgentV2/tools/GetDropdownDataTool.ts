import { GraphQLTool } from './GraphQLTool.js';
import type { ToolExecutionContext, ToolResult } from '../types/tools.js';

export interface DropdownDataResult {
  wfmProjectTypes: Array<{
    id: string;
    name: string;
    description?: string;
    isDefault?: boolean;
  }>;
  dealStages: Array<{
    id: string;
    name: string;
    order: number;
    color?: string;
  }>;
  dealPriorities: Array<{
    value: string;
    label: string;
    color?: string;
  }>;
  currencies: Array<{
    code: string;
    symbol: string;
    name: string;
  }>;
  customFieldDefinitions: {
    deals: Array<{
      id: string;
      fieldName: string;
      fieldLabel: string;
      fieldType: string;
      isRequired: boolean;
      dropdownOptions?: Array<{
        value: string;
        label: string;
      }>;
    }>;
    organizations: Array<{
      id: string;
      fieldName: string;
      fieldLabel: string;
      fieldType: string;
      isRequired: boolean;
      dropdownOptions?: Array<{
        value: string;
        label: string;
      }>;
    }>;
    people: Array<{
      id: string;
      fieldName: string;
      fieldLabel: string;
      fieldType: string;
      isRequired: boolean;
      dropdownOptions?: Array<{
        value: string;
        label: string;
      }>;
    }>;
  };
  systemDefaults: {
    defaultProjectTypeId?: string;
    defaultCurrency: string;
    defaultDealStage: string;
    defaultDealPriority: string;
  };
}

export class GetDropdownDataTool extends GraphQLTool {
  protected name = 'get_dropdown_data';
  protected description = 'Get system dropdown data, field definitions, and metadata required for creating deals, organizations, and contacts. Use this before creating any entities to get available options and required fields.';
  
  protected parameters = {
    type: 'object',
    properties: {
      entity_types: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['deals', 'organizations', 'people', 'all']
        },
        description: 'Specify which entity types to get dropdown data for. Use "all" to get data for all entity types.',
        default: ['all']
      },
      include_custom_fields: {
        type: 'boolean',
        description: 'Whether to include custom field definitions. Default is true.',
        default: true
      }
    },
    required: []
  };

  protected requiredPermissions: string[] = []; // Dropdown data should be accessible to all authenticated users

  async execute(
    parameters: { entity_types?: string[]; include_custom_fields?: boolean },
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    const startTime = Date.now();

    try {
      // Check permissions
      if (!this.checkPermissions(context)) {
        return this.createErrorResult(
          new Error('Insufficient permissions to access system metadata'),
          parameters
        );
      }

      const entityTypes = parameters.entity_types || ['all'];
      const includeCustomFields = parameters.include_custom_fields !== false;

      // Execute comprehensive GraphQL query to get all dropdown data
      const query = this.buildDropdownDataQuery(entityTypes, includeCustomFields);
      
      const result = await this.executeGraphQL(query, {}, context);

      // Process and structure the dropdown data
      const dropdownData = this.processDropdownData(result, entityTypes, includeCustomFields);

      // Generate AI-friendly message
      const message = this.generateDropdownDataMessage(dropdownData);

      return this.createSuccessResult(
        dropdownData,
        message,
        parameters,
        Date.now() - startTime
      );

    } catch (error: any) {
      return this.createErrorResult(error, parameters);
    }
  }

  /**
   * Build GraphQL query based on requested entity types
   */
  private buildDropdownDataQuery(entityTypes: string[], includeCustomFields: boolean): string {
    const includeAll = entityTypes.includes('all');
    const includeDeals = includeAll || entityTypes.includes('deals');
    const includeOrgs = includeAll || entityTypes.includes('organizations');
    const includePeople = includeAll || entityTypes.includes('people');

    let query = `
      query GetDropdownData {
        # WFM Project Types (required for deals)
        wfmProjectTypes {
          id
          name
          description
          isDefault
        }
    `;

    if (includeDeals) {
      query += `
        # Deal-specific data
        dealStages: wfmWorkflowSteps {
          id
          name
          order
          status {
            name
            color
          }
        }
      `;
    }

    if (includeCustomFields) {
      query += `
        # Custom field definitions
        customFieldDefinitions {
          id
          fieldName
          fieldLabel
          fieldType
          isRequired
          entityType
          dropdownOptions {
            value
            label
          }
        }
      `;
    }

    query += `
      }
    `;

    return query;
  }

  /**
   * Process raw GraphQL data into structured dropdown data
   */
  private processDropdownData(
    result: any,
    entityTypes: string[],
    includeCustomFields: boolean
  ): DropdownDataResult {
    // Process WFM Project Types
    const wfmProjectTypes = (result.wfmProjectTypes || []).map((type: any) => ({
      id: type.id,
      name: type.name,
      description: type.description,
      isDefault: type.isDefault || false
    }));

    // Process deal stages from WFM workflow steps
    const dealStages = (result.dealStages || []).map((stage: any) => ({
      id: stage.id,
      name: stage.name,
      order: stage.order || 0,
      color: stage.status?.color || '#gray'
    }));

    // Static dropdown data (these would come from your system configuration)
    const dealPriorities = [
      { value: 'LOW', label: 'Low', color: '#green' },
      { value: 'MEDIUM', label: 'Medium', color: '#yellow' },
      { value: 'HIGH', label: 'High', color: '#orange' },
      { value: 'URGENT', label: 'Urgent', color: '#red' }
    ];

    const currencies = [
      { code: 'USD', symbol: '$', name: 'US Dollar' },
      { code: 'EUR', symbol: '€', name: 'Euro' },
      { code: 'GBP', symbol: '£', name: 'British Pound' },
      { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' }
    ];

    // Process custom field definitions by entity type
    const customFieldDefinitions = {
      deals: [] as any[],
      organizations: [] as any[],
      people: [] as any[]
    };

    if (includeCustomFields && result.customFieldDefinitions) {
      for (const field of result.customFieldDefinitions) {
        const processedField = {
          id: field.id,
          fieldName: field.fieldName,
          fieldLabel: field.fieldLabel,
          fieldType: field.fieldType,
          isRequired: field.isRequired || false,
          dropdownOptions: field.dropdownOptions || []
        };

        switch (field.entityType) {
          case 'DEAL':
            customFieldDefinitions.deals.push(processedField);
            break;
          case 'ORGANIZATION':
            customFieldDefinitions.organizations.push(processedField);
            break;
          case 'PERSON':
            customFieldDefinitions.people.push(processedField);
            break;
        }
      }
    }

    // Determine system defaults
    const defaultProjectType = wfmProjectTypes.find((t: any) => t.isDefault);
    const systemDefaults = {
      defaultProjectTypeId: defaultProjectType?.id,
      defaultCurrency: 'USD',
      defaultDealStage: dealStages[0]?.id || 'prospecting',
      defaultDealPriority: 'MEDIUM'
    };

    return {
      wfmProjectTypes,
      dealStages,
      dealPriorities,
      currencies,
      customFieldDefinitions,
      systemDefaults
    };
  }

  /**
   * Generate AI-friendly message explaining the dropdown data
   */
  private generateDropdownDataMessage(data: DropdownDataResult): string {
    let message = `📋 **System dropdown data retrieved successfully**\n\n`;

    // WFM Project Types
    if (data.wfmProjectTypes.length > 0) {
      message += `**🎯 WFM Project Types** (${data.wfmProjectTypes.length} available):\n`;
      data.wfmProjectTypes.forEach(type => {
        message += `• ${type.name} (ID: ${type.id})${type.isDefault ? ' [DEFAULT]' : ''}\n`;
      });
      message += '\n';
    }

    // Deal Stages
    if (data.dealStages.length > 0) {
      message += `**📈 Deal Stages** (${data.dealStages.length} available):\n`;
      data.dealStages.forEach(stage => {
        message += `• ${stage.name} (ID: ${stage.id})\n`;
      });
      message += '\n';
    }

    // Deal Priorities
    message += `**⚡ Deal Priorities**:\n`;
    data.dealPriorities.forEach(priority => {
      message += `• ${priority.label} (${priority.value})\n`;
    });
    message += '\n';

    // Currencies
    message += `**💱 Currencies**:\n`;
    data.currencies.forEach(currency => {
      message += `• ${currency.name} (${currency.code}) ${currency.symbol}\n`;
    });
    message += '\n';

    // Custom Fields Summary
    const totalCustomFields = 
      data.customFieldDefinitions.deals.length +
      data.customFieldDefinitions.organizations.length +
      data.customFieldDefinitions.people.length;

    if (totalCustomFields > 0) {
      message += `**🔧 Custom Fields**:\n`;
      message += `• Deals: ${data.customFieldDefinitions.deals.length} fields\n`;
      message += `• Organizations: ${data.customFieldDefinitions.organizations.length} fields\n`;
      message += `• People: ${data.customFieldDefinitions.people.length} fields\n\n`;
    }

    // System Defaults
    message += `**⚙️ System Defaults**:\n`;
    message += `• Project Type: ${data.systemDefaults.defaultProjectTypeId || 'None set'}\n`;
    message += `• Currency: ${data.systemDefaults.defaultCurrency}\n`;
    message += `• Deal Stage: ${data.systemDefaults.defaultDealStage}\n`;
    message += `• Deal Priority: ${data.systemDefaults.defaultDealPriority}\n\n`;

    message += `💡 **Use this data** when creating deals, organizations, or contacts to ensure valid field values and proper system integration.`;

    return message;
  }
} 