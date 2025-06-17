import { GraphQLTool } from './GraphQLTool.js';
import type { ToolExecutionContext, ToolResult } from '../types/tools.js';

export interface CreateOrganizationParameters {
  name: string;
  address?: string;
  notes?: string;
  customFields?: Array<{
    definitionId: string;
    stringValue?: string;
    numberValue?: number;
    booleanValue?: boolean;
    dateValue?: string;
    selectedOptionValues?: string[];
  }>;
}

export interface OrganizationCreationResult {
  id: string;
  name: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export class CreateOrganizationTool extends GraphQLTool {
  protected name = 'create_organization';
  protected description = 'Create a new organization/company in the CRM system. IMPORTANT: Always search for existing organizations first using search_organizations to prevent duplicates.';
  
  protected parameters = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Organization name. Should be the official company name. Examples: "Acme Corporation", "TechStart Inc", "Global Solutions Ltd"'
      },
      address: {
        type: 'string',
        description: 'Organization address. Can include full address or just city/state. Examples: "123 Main St, New York, NY", "San Francisco, CA"'
      },
      notes: {
        type: 'string',
        description: 'Additional notes about the organization. Examples: "Leading software company", "Healthcare technology startup", "Potential partner"'
      },
      customFields: {
        type: 'array',
        description: 'Custom field values for organization-specific data',
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
    required: ['name']
  };

  protected requiredPermissions = ['create:organizations'];

  async execute(
    parameters: CreateOrganizationParameters,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    const startTime = Date.now();

    try {
      // Validate required parameters
      const validationErrors = this.validateRequiredParams(parameters, ['name']);
      if (validationErrors.length > 0) {
        return this.createErrorResult(
          new Error(validationErrors.join(', ')),
          parameters
        );
      }

      // Check permissions
      if (!this.checkPermissions(context)) {
        return this.createErrorResult(
          new Error('Insufficient permissions to create organizations'),
          parameters
        );
      }

      // Validate organization name
      const organizationName = parameters.name.trim();
      if (organizationName.length < 2) {
        return this.createErrorResult(
          new Error('Organization name must be at least 2 characters long'),
          parameters
        );
      }

      // Business Rule: Search before create
      // This enforces the "search before create" pattern from V2 rules
      const duplicateCheck = await this.checkForDuplicates(organizationName, context);
      if (duplicateCheck.hasDuplicates) {
        return this.createErrorResult(
          new Error(`Organization "${organizationName}" may already exist. Found similar: ${duplicateCheck.similarNames.join(', ')}. Please search first and use existing organization or choose a different name.`),
          parameters
        );
      }

      // Prepare GraphQL mutation
      const mutation = `
        mutation CreateOrganization($input: OrganizationInput!) {
          createOrganization(input: $input) {
            id
            name
            address
            notes
            created_at
            updated_at
            user_id
            customFieldValues {
              stringValue
              numberValue
              booleanValue
              dateValue
              selectedOptionValues
              definition {
                id
                fieldName
                fieldLabel
              }
            }
          }
        }
      `;

      const organizationInput = {
        name: organizationName,
        address: parameters.address?.trim() || null,
        notes: parameters.notes?.trim() || null,
        customFields: parameters.customFields || []
      };

      const result = await this.executeGraphQL(mutation, {
        input: organizationInput
      }, context);

      if (!result.createOrganization) {
        return this.createErrorResult(
          new Error('Failed to create organization - no result returned'),
          parameters
        );
      }

      const newOrganization: OrganizationCreationResult = result.createOrganization;

      // Generate success message for AI
      const message = this.generateCreationSuccessMessage(newOrganization);

      return this.createSuccessResult(
        {
          organization: newOrganization,
          created: true,
          next_steps: this.generateNextSteps(newOrganization)
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
   * Check for duplicate organizations before creating
   * This implements the "search before create" business rule
   */
  private async checkForDuplicates(
    organizationName: string,
    context: ToolExecutionContext
  ): Promise<{ hasDuplicates: boolean; similarNames: string[] }> {
    try {
      // Query existing organizations to check for duplicates
      const query = `
        query CheckDuplicateOrganizations {
          organizations {
            id
            name
          }
        }
      `;

      const result = await this.executeGraphQL(query, {}, context);
      const existingOrgs = result.organizations || [];

      // Check for exact matches and similar names
      const lowerName = organizationName.toLowerCase();
      const similarNames: string[] = [];

      for (const org of existingOrgs) {
        const existingName = org.name.toLowerCase();
        
        // Exact match
        if (existingName === lowerName) {
          return { hasDuplicates: true, similarNames: [org.name] };
        }

        // Similar match (fuzzy)
        if (this.isSimilarName(lowerName, existingName)) {
          similarNames.push(org.name);
        }
      }

      return { 
        hasDuplicates: similarNames.length > 0, 
        similarNames: similarNames.slice(0, 3) // Limit to 3 suggestions
      };

    } catch (error) {
      console.error('Error checking for duplicates:', error);
      // Don't block creation if duplicate check fails
      return { hasDuplicates: false, similarNames: [] };
    }
  }

  /**
   * Check if two organization names are similar
   */
  private isSimilarName(name1: string, name2: string): boolean {
    // Remove common business suffixes
    const cleanName1 = this.cleanCompanyName(name1);
    const cleanName2 = this.cleanCompanyName(name2);

    // Check for exact match after cleaning
    if (cleanName1 === cleanName2) {
      return true;
    }

    // Check for substring matches
    if (cleanName1.includes(cleanName2) || cleanName2.includes(cleanName1)) {
      return true;
    }

    // Check for similar words
    const words1 = cleanName1.split(/\s+/);
    const words2 = cleanName2.split(/\s+/);
    
    // If 70% of words match, consider it similar
    const matchingWords = words1.filter(word => 
      words2.some(w => w.includes(word) || word.includes(w))
    );
    
    return matchingWords.length / Math.max(words1.length, words2.length) >= 0.7;
  }

  /**
   * Clean company name for comparison
   */
  private cleanCompanyName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\b(inc|corp|corporation|ltd|llc|co|company|limited|group|international|solutions|services|systems|technologies|tech)\b/g, '')
      .replace(/[^\w\s]/g, '')
      .trim()
      .replace(/\s+/g, ' ');
  }

  /**
   * Generate success message for organization creation
   */
  private generateCreationSuccessMessage(organization: OrganizationCreationResult): string {
    return `✅ **Organization created successfully**

**${organization.name}** (ID: ${organization.id})
${organization.address ? `📍 ${organization.address}` : ''}
${organization.notes ? `📝 ${organization.notes}` : ''}
🗓️ Created: ${new Date(organization.created_at).toLocaleDateString()}

💡 **Organization ID:** \`${organization.id}\`
Use this ID when creating deals or contacts for ${organization.name}.

🚀 **What's next?**
- Create contacts for people at this organization
- Add deals/opportunities related to this company
- Set up activities and follow-ups`;
  }

  /**
   * Generate next step suggestions
   */
  private generateNextSteps(organization: OrganizationCreationResult): string[] {
    return [
      `Create contacts for people at ${organization.name}`,
      `Add any existing deals or opportunities for this organization`,
      `Set up follow-up activities or meetings`,
      `Add custom field data if needed for this organization type`,
      `Create initial activity to record how you discovered this organization`
    ];
  }
} 