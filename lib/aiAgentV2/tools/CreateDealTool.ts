import { GraphQLTool } from './GraphQLTool.js';
import type { ToolExecutionContext, ToolResult } from '../types/tools.js';

export interface CreateDealParameters {
  name: string;
  organization_id: string;
  primary_contact_id?: string;
  amount?: number;
  currency?: string;
  expected_close_date?: string;
  priority?: string;
  description?: string;
  stage?: string;
  source?: string;
  customFields?: Array<{
    definitionId: string;
    stringValue?: string;
    numberValue?: number;
    booleanValue?: boolean;
    dateValue?: string;
    selectedOptionValues?: string[];
  }>;
}

export interface DealCreationResult {
  id: string;
  name: string;
  amount?: number;
  currency?: string;
  expected_close_date?: string;
  priority?: string;
  description?: string;
  project_id: string;
  created_at: string;
  updated_at: string;
  organization: {
    id: string;
    name: string;
  };
  person?: {
    id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  wfmProject?: {
    id: string;
    name: string;
  };
}

export class CreateDealTool extends GraphQLTool {
  protected name = 'create_deal';
  protected description = 'Create a new deal in the CRM system. CRITICAL: Always search for existing organizations first using search_organizations to get organization_id. Use get_dropdown_data to get valid field options.';
  
  protected parameters = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Deal name/title. Should be descriptive and include company name. Examples: "Acme Corp - Software License Deal", "Q2 2024 Enterprise Package"'
      },
      organization_id: {
        type: 'string',
        description: 'REQUIRED: ID of the organization for this deal. Get this from search_organizations or create_organization first. Example: "org_123"'
      },
      primary_contact_id: {
        type: 'string',
        description: 'ID of the main contact person for this deal. Get from search_contacts or create_contact. Example: "contact_456"'
      },
      amount: {
        type: 'number',
        description: 'Deal value/amount. Use the total expected revenue. Examples: 5000, 25000, 100000'
      },
      currency: {
        type: 'string',
        description: 'Currency code. Use get_dropdown_data to see available currencies. Examples: "USD", "EUR", "GBP"'
      },
      expected_close_date: {
        type: 'string',
        description: 'Expected close date in YYYY-MM-DD format. Examples: "2024-12-31", "2024-06-15"'
      },
      priority: {
        type: 'string',
        description: 'Deal priority level. Use get_dropdown_data to see available options. Examples: "HIGH", "MEDIUM", "LOW"'
      },
      description: {
        type: 'string',
        description: 'Deal description or additional notes. Examples: "Enterprise software licensing deal", "RFP response for Q2 implementation"'
      },
      stage: {
        type: 'string',
        description: 'Initial deal stage ID. Use get_dropdown_data to see available stages. Will default to first stage if not provided.'
      },
      source: {
        type: 'string',
        description: 'How this deal was discovered. Examples: "Website", "Referral", "Cold Call", "Trade Show"'
      },
      customFields: {
        type: 'array',
        description: 'Custom field values. Use get_dropdown_data to see available custom fields for deals.',
        items: {
          type: 'object',
          properties: {
            definitionId: { type: 'string' },
            stringValue: { type: 'string' },
            numberValue: { type: 'number' },
            booleanValue: { type: 'boolean' },
            dateValue: { type: 'string' },
            selectedOptionValues: {
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ['definitionId']
        }
      }
    },
    required: ['name', 'organization_id']
  };

  protected requiredPermissions = ['create:deals'];

  async execute(
    parameters: CreateDealParameters,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    const startTime = Date.now();

    try {
      // Validate required parameters
      const validationErrors = this.validateRequiredParams(parameters, ['name', 'organization_id']);
      if (validationErrors.length > 0) {
        return this.createErrorResult(
          new Error(validationErrors.join(', ')),
          parameters
        );
      }

      // Check permissions
      if (!this.checkPermissions(context)) {
        return this.createErrorResult(
          new Error('Insufficient permissions to create deals'),
          parameters
        );
      }

      // Validate deal name
      const dealName = parameters.name.trim();
      if (dealName.length < 3) {
        return this.createErrorResult(
          new Error('Deal name must be at least 3 characters long'),
          parameters
        );
      }

      // Validate organization exists
      const organizationExists = await this.validateOrganizationExists(
        parameters.organization_id,
        context
      );
      if (!organizationExists.exists) {
        return this.createErrorResult(
          new Error(`Organization with ID ${parameters.organization_id} not found. Please search for organizations first or create a new one.`),
          parameters
        );
      }

      // Validate contact if provided
      if (parameters.primary_contact_id) {
        const contactExists = await this.validateContactExists(
          parameters.primary_contact_id,
          context
        );
        if (!contactExists.exists) {
          return this.createErrorResult(
            new Error(`Contact with ID ${parameters.primary_contact_id} not found. Please search for contacts first or create a new one.`),
            parameters
          );
        }
      }

      // Business Rule: Check for duplicate deals
      const duplicateCheck = await this.checkForDuplicateDeals(
        dealName,
        parameters.organization_id,
        context
      );
      if (duplicateCheck.hasDuplicates) {
        return this.createErrorResult(
          new Error(`Similar deal may already exist for this organization: "${duplicateCheck.similarDeals[0]}". Please check existing deals first.`),
          parameters
        );
      }

      // Prepare GraphQL mutation
      const mutation = `
        mutation CreateDeal($input: DealInput!) {
          createDeal(input: $input) {
            id
            name
            amount
            currency
            expected_close_date
            priority
            description
            project_id
            created_at
            updated_at
            organization {
              id
              name
            }
            person {
              id
              first_name
              last_name
              email
            }
            wfmProject {
              id
              name
            }
          }
        }
      `;

      const dealInput = {
        name: dealName,
        organization_id: parameters.organization_id,
        person_id: parameters.primary_contact_id || null,
        amount: parameters.amount || null,
        currency: parameters.currency || 'USD',
        expected_close_date: parameters.expected_close_date || null,
        priority: parameters.priority || 'MEDIUM',
        description: parameters.description?.trim() || null,
        source: parameters.source?.trim() || null,
        customFields: parameters.customFields || []
      };

      const result = await this.executeGraphQL(mutation, {
        input: dealInput
      }, context);

      if (!result.createDeal) {
        return this.createErrorResult(
          new Error('Failed to create deal - no result returned'),
          parameters
        );
      }

      const newDeal: DealCreationResult = result.createDeal;

      // Generate success message for AI
      const message = this.generateCreationSuccessMessage(newDeal);

      return this.createSuccessResult(
        {
          deal: newDeal,
          created: true,
          next_steps: this.generateNextSteps(newDeal)
        },
        message,
        parameters,
        Date.now() - startTime
      );

    } catch (error: any) {
      return this.createErrorResult(error, parameters);
    }
  }

  /**
   * Validate that organization exists
   */
  private async validateOrganizationExists(
    organizationId: string,
    context: ToolExecutionContext
  ): Promise<{ exists: boolean; organization?: any }> {
    try {
      const query = `
        query ValidateOrganization($id: ID!) {
          organization(id: $id) {
            id
            name
          }
        }
      `;

      const result = await this.executeGraphQL(query, { id: organizationId }, context);
      return {
        exists: !!result.organization,
        organization: result.organization
      };
    } catch (error) {
      console.error('Error validating organization:', error);
      return { exists: false };
    }
  }

  /**
   * Validate that contact exists
   */
  private async validateContactExists(
    contactId: string,
    context: ToolExecutionContext
  ): Promise<{ exists: boolean; contact?: any }> {
    try {
      const query = `
        query ValidateContact($id: ID!) {
          person(id: $id) {
            id
            first_name
            last_name
            email
          }
        }
      `;

      const result = await this.executeGraphQL(query, { id: contactId }, context);
      return {
        exists: !!result.person,
        contact: result.person
      };
    } catch (error) {
      console.error('Error validating contact:', error);
      return { exists: false };
    }
  }

  /**
   * Check for duplicate deals with the same organization
   */
  private async checkForDuplicateDeals(
    dealName: string,
    organizationId: string,
    context: ToolExecutionContext
  ): Promise<{ hasDuplicates: boolean; similarDeals: string[] }> {
    try {
      const query = `
        query CheckDuplicateDeals($organizationId: ID!) {
          deals {
            id
            name
            organization_id
          }
        }
      `;

      const result = await this.executeGraphQL(query, { organizationId }, context);
      const existingDeals = result.deals || [];

      // Filter deals for the same organization
      const orgDeals = existingDeals.filter((deal: any) => 
        deal.organization_id === organizationId
      );

      // Check for similar names
      const lowerDealName = dealName.toLowerCase();
      const similarDeals: string[] = [];

      for (const deal of orgDeals) {
        const existingName = deal.name.toLowerCase();
        
        // Check for exact or similar matches
        if (existingName === lowerDealName || 
            existingName.includes(lowerDealName) || 
            lowerDealName.includes(existingName) ||
            this.isSimilarDealName(lowerDealName, existingName)) {
          similarDeals.push(deal.name);
        }
      }

      return {
        hasDuplicates: similarDeals.length > 0,
        similarDeals: similarDeals.slice(0, 3) // Limit to 3 suggestions
      };

    } catch (error) {
      console.error('Error checking for duplicate deals:', error);
      return { hasDuplicates: false, similarDeals: [] };
    }
  }

  /**
   * Check if two deal names are similar
   */
  private isSimilarDealName(name1: string, name2: string): boolean {
    // Remove common deal words for comparison
    const cleanName1 = this.cleanDealName(name1);
    const cleanName2 = this.cleanDealName(name2);

    if (cleanName1 === cleanName2) {
      return true;
    }

    // Check word overlap
    const words1 = cleanName1.split(/\s+/);
    const words2 = cleanName2.split(/\s+/);
    
    const matchingWords = words1.filter(word => 
      words2.some(w => w.includes(word) || word.includes(w))
    );
    
    // If 60% of words match, consider it similar
    return matchingWords.length / Math.max(words1.length, words2.length) >= 0.6;
  }

  /**
   * Clean deal name for comparison
   */
  private cleanDealName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\b(deal|opportunity|sales|contract|agreement|package|license|project|rfp|proposal)\b/g, '')
      .replace(/[^\w\s]/g, '')
      .trim()
      .replace(/\s+/g, ' ');
  }

  /**
   * Generate success message for deal creation
   */
  private generateCreationSuccessMessage(deal: DealCreationResult): string {
    const amountStr = deal.amount ? 
      `💰 ${deal.currency || 'USD'} ${deal.amount.toLocaleString()}` : 
      '';
    
    const closeDate = deal.expected_close_date ? 
      `📅 Expected close: ${new Date(deal.expected_close_date).toLocaleDateString()}` : 
      '';

    return `✅ **Deal created successfully**

**${deal.name}** (ID: ${deal.id})
🏢 Organization: ${deal.organization.name}
${deal.person ? `👤 Contact: ${deal.person.first_name} ${deal.person.last_name}` : ''}
${amountStr}
${closeDate}
${deal.priority ? `⚡ Priority: ${deal.priority}` : ''}
🗓️ Created: ${new Date(deal.created_at).toLocaleDateString()}

🎯 **Project ID:** ${deal.project_id}
${deal.wfmProject ? `📋 WFM Project: ${deal.wfmProject.name}` : ''}

💡 **Deal ID:** \`${deal.id}\`
Use this ID for future updates, activities, or references to this deal.`;
  }

  /**
   * Generate next step suggestions
   */
  private generateNextSteps(deal: DealCreationResult): string[] {
    const steps = [
      `Create initial activity to record deal discovery or first contact`,
      `Add any relevant documents or attachments to the deal`,
      `Schedule follow-up activities or meetings`,
      `Update deal stage as progress is made`
    ];

    if (!deal.person) {
      steps.unshift(`Add primary contact person for ${deal.organization.name}`);
    }

    if (!deal.amount) {
      steps.push(`Update deal amount when value is determined`);
    }

    if (!deal.expected_close_date) {
      steps.push(`Set expected close date based on sales cycle`);
    }

    return steps;
  }
} 