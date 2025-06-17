import { GraphQLTool } from './GraphQLTool.js';
import type { ToolExecutionContext, ToolResult } from '../types/tools.js';

export interface CreateContactParameters {
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  organization_id?: string;
  notes?: string;
  custom_fields?: Record<string, any>;
}

export interface ContactCreateResult {
  id: string;
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  organization_id?: string;
  organization?: {
    id: string;
    name: string;
  };
  created_at: string;
}

export class CreateContactTool extends GraphQLTool {
  protected name = 'create_contact';
  protected description = 'Create a new contact/person in the CRM system. Always search for existing contacts first to avoid duplicates. Use this when you need to add a new person to the system.';
  
  protected parameters = {
    type: 'object',
    properties: {
      first_name: {
        type: 'string',
        description: 'First name of the contact. Required field.'
      },
      last_name: {
        type: 'string',
        description: 'Last name of the contact. Recommended to provide.'
      },
      email: {
        type: 'string',
        description: 'Email address of the contact. Should be unique if provided.'
      },
      phone: {
        type: 'string',
        description: 'Phone number of the contact.'
      },
      organization_id: {
        type: 'string',
        description: 'ID of the organization this contact belongs to. Use search_organizations to find the organization first.'
      },
      notes: {
        type: 'string',
        description: 'Additional notes about the contact.'
      },
      custom_fields: {
        type: 'object',
        description: 'Custom field values. Use get_dropdown_data to see available custom fields.'
      }
    },
    required: ['first_name']
  };

  protected requiredPermissions = ['create:people'];

  async execute(
    parameters: CreateContactParameters,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    const startTime = Date.now();

    try {
      // Check permissions
      if (!this.checkPermissions(context)) {
        return this.createErrorResult(
          new Error('Insufficient permissions to create contacts'),
          parameters
        );
      }

      // Validate required fields
      const validation = this.validateInputs(parameters);
      if (!validation.valid) {
        return this.createErrorResult(
          new Error(`Validation failed: ${validation.errors.join(', ')}`),
          parameters
        );
      }

      // Check for duplicates if email provided
      if (parameters.email) {
        const duplicateCheck = await this.checkForDuplicates(parameters, context);
        if (duplicateCheck.hasDuplicates) {
          return this.createErrorResult(
            new Error(`Contact with email ${parameters.email} already exists. Use search_contacts to find existing contact or update_contact to modify.`),
            parameters
          );
        }
      }

      // Validate organization exists if provided
      if (parameters.organization_id) {
        const orgValid = await this.validateOrganization(parameters.organization_id, context);
        if (!orgValid) {
          return this.createErrorResult(
            new Error(`Organization with ID ${parameters.organization_id} not found. Use search_organizations to find the correct organization ID.`),
            parameters
          );
        }
      }

      // Create the contact using GraphQL
      const mutation = `
        mutation CreateContact($input: CreatePersonInput!) {
          createPerson(input: $input) {
            id
            first_name
            last_name
            email
            phone
            notes
            created_at
            organization_id
            organization {
              id
              name
            }
          }
        }
      `;

      const variables = {
        input: {
          first_name: parameters.first_name,
          last_name: parameters.last_name,
          email: parameters.email,
          phone: parameters.phone,
          organization_id: parameters.organization_id,
          notes: parameters.notes,
          // Note: custom_fields would be handled separately in real implementation
        }
      };

      const result = await this.executeGraphQL(mutation, variables, context);

      if (!result.createPerson) {
        return this.createErrorResult(
          new Error('Failed to create contact. Please try again.'),
          parameters
        );
      }

      const createdContact: ContactCreateResult = result.createPerson;

      // Generate AI-friendly success message
      const message = this.generateSuccessMessage(createdContact);

      return this.createSuccessResult(
        {
          contact: createdContact,
          contact_id: createdContact.id,
          suggested_next_steps: this.getSuggestedNextSteps(createdContact)
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
   * Validate input parameters
   */
  private validateInputs(parameters: CreateContactParameters): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // First name is required and should be reasonable length
    if (!parameters.first_name || parameters.first_name.trim().length === 0) {
      errors.push('First name is required');
    } else if (parameters.first_name.length > 100) {
      errors.push('First name cannot exceed 100 characters');
    }

    // Validate email format if provided
    if (parameters.email && !this.isValidEmail(parameters.email)) {
      errors.push('Invalid email format');
    }

    // Validate phone format if provided (basic check)
    if (parameters.phone && parameters.phone.length > 50) {
      errors.push('Phone number too long');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Basic email validation
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check for duplicate contacts
   */
  private async checkForDuplicates(
    parameters: CreateContactParameters,
    context: ToolExecutionContext
  ): Promise<{ hasDuplicates: boolean; existingContact?: any }> {
    if (!parameters.email) {
      return { hasDuplicates: false };
    }

    try {
      // Search for existing contact with same email
      const searchQuery = `
        query SearchContactsByEmail {
          people {
            id
            first_name
            last_name
            email
            organization {
              id
              name
            }
          }
        }
      `;

      const result = await this.executeGraphQL(searchQuery, {}, context);
      
      if (result.people) {
        const existingContact = result.people.find(
          (person: any) => person.email?.toLowerCase() === parameters.email?.toLowerCase()
        );

        if (existingContact) {
          return { hasDuplicates: true, existingContact };
        }
      }

      return { hasDuplicates: false };
    } catch (error) {
      // If search fails, allow creation to proceed
      return { hasDuplicates: false };
    }
  }

  /**
   * Validate that organization exists
   */
  private async validateOrganization(
    organizationId: string,
    context: ToolExecutionContext
  ): Promise<boolean> {
    try {
      const query = `
        query GetOrganization($id: ID!) {
          organization(id: $id) {
            id
            name
          }
        }
      `;

      const result = await this.executeGraphQL(query, { id: organizationId }, context);
      return !!result.organization;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate success message for AI agent
   */
  private generateSuccessMessage(contact: ContactCreateResult): string {
    const fullName = `${contact.first_name} ${contact.last_name || ''}`.trim();
    
    let message = `✅ **Contact Created Successfully!**\n\n`;
    message += `**New Contact:**\n`;
    message += `• 👤 Name: ${fullName}\n`;
    message += `• 🆔 ID: ${contact.id}\n`;
    
    if (contact.email) {
      message += `• 📧 Email: ${contact.email}\n`;
    }
    
    if (contact.phone) {
      message += `• 📞 Phone: ${contact.phone}\n`;
    }
    
    if (contact.organization) {
      message += `• 🏢 Organization: ${contact.organization.name}\n`;
    }

    message += `\n🗓️ Created: ${new Date(contact.created_at).toLocaleDateString()}`;

    return message;
  }

  /**
   * Get suggested next steps after contact creation
   */
  private getSuggestedNextSteps(contact: ContactCreateResult): string[] {
    const suggestions: string[] = [];

    suggestions.push(`Use contact ID ${contact.id} when creating deals`);
    
    if (contact.organization) {
      suggestions.push(`Search for other deals with ${contact.organization.name}`);
    } else {
      suggestions.push('Consider associating contact with an organization');
    }

    if (!contact.email) {
      suggestions.push('Add email address for better communication tracking');
    }

    if (!contact.phone) {
      suggestions.push('Add phone number for complete contact information');
    }

    suggestions.push('Create activities or notes to track interactions');

    return suggestions;
  }
} 