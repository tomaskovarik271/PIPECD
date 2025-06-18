import { GraphQLTool } from './GraphQLTool.js';
import type { ToolExecutionContext, ToolResult } from '../types/tools.js';

export interface GetDetailsParameters {
  entity_type: 'deal' | 'organization' | 'contact';
  entity_id: string;
}

export interface DetailedEntity {
  id: string;
  entity_type: string;
  [key: string]: any; // Flexible structure for different entity types
}

export class GetDetailsTool extends GraphQLTool {
  protected name = 'get_details';
  protected description = 'Get detailed information for a specific entity (deal, organization, or contact). Use this to get comprehensive data including custom fields, relationships, and associated records.';
  
  protected parameters = {
    type: 'object',
    properties: {
      entity_type: {
        type: 'string',
        enum: ['deal', 'organization', 'contact'],
        description: 'Type of entity to get details for'
      },
      entity_id: {
        type: 'string',
        description: 'Unique ID of the entity to get details for'
      }
    },
    required: ['entity_type', 'entity_id']
  };

  protected requiredPermissions = ['deal:read_any', 'organization:read_any', 'person:read_any'];

  async execute(
    parameters: GetDetailsParameters,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    const startTime = Date.now();

    try {
      // Check permissions based on entity type
      const requiredPermission = this.getRequiredPermissionForEntity(parameters.entity_type);
      if (!this.checkSpecificPermission(context, requiredPermission)) {
        return this.createErrorResult(
          new Error(`Insufficient permissions to view ${parameters.entity_type} details`),
          parameters
        );
      }

      let query: string;
      let variables: any;

      switch (parameters.entity_type) {
        case 'deal':
          query = this.getDealDetailsQuery();
          variables = { id: parameters.entity_id };
          break;
        case 'organization':
          query = this.getOrganizationDetailsQuery();
          variables = { id: parameters.entity_id };
          break;
        case 'contact':
          query = this.getContactDetailsQuery();
          variables = { id: parameters.entity_id };
          break;
        default:
          return this.createErrorResult(
            new Error(`Unsupported entity type: ${parameters.entity_type}`),
            parameters
          );
      }

      const result = await this.executeGraphQL(query, variables, context);

      // Extract the entity data based on type
      const entityData = this.extractEntityData(result, parameters.entity_type);

      if (!entityData) {
        return this.createErrorResult(
          new Error(`${parameters.entity_type} with ID ${parameters.entity_id} not found`),
          parameters
        );
      }

      // Format the detailed entity
      const detailedEntity = this.formatDetailedEntity(entityData, parameters.entity_type);

      // Generate AI-friendly message
      const message = this.generateDetailMessage(detailedEntity, parameters.entity_type);

      return this.createSuccessResult(
        {
          entity: detailedEntity,
          entity_type: parameters.entity_type,
          entity_id: parameters.entity_id,
          retrieved_at: new Date().toISOString()
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
   * Get required permission for entity type
   */
  private getRequiredPermissionForEntity(entityType: string): string {
    switch (entityType) {
      case 'deal':
        return 'deal:read_any';
      case 'organization':
        return 'organization:read_any';
      case 'contact':
        return 'person:read_any';
      default:
        return 'read:basic';
    }
  }

  /**
   * Check specific permission
   */
  private checkSpecificPermission(context: ToolExecutionContext, permission: string): boolean {
    return context.permissions?.includes(permission) || 
           context.permissions?.includes('admin') || 
           false;
  }

  /**
   * Get GraphQL query for deal details
   */
  private getDealDetailsQuery(): string {
    return `
      query GetDealDetails($id: ID!) {
        deal(id: $id) {
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
          organization_id
          person_id
          assigned_to_user_id
          organization {
            id
            name
            address
            industry
            website
          }
          person {
            id
            first_name
            last_name
            email
            phone
          }
          assignedToUser {
            id
            display_name
            email
          }
          currentWfmStep {
            id
            name
            order
            status {
              name
              color
            }
          }
          wfmProject {
            id
            name
            description
            project_type {
              id
              name
            }
          }
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
              fieldType
            }
          }
          activities {
            id
            subject
            type
            status
            due_date
            created_at
          }
          notes {
            id
            content
            created_at
          }
        }
      }
    `;
  }

  /**
   * Get GraphQL query for organization details
   */
  private getOrganizationDetailsQuery(): string {
    return `
      query GetOrganizationDetails($id: ID!) {
        organization(id: $id) {
          id
          name
          address
          industry
          website
          created_at
          updated_at
          deals {
            id
            name
            amount
            currency
            expected_close_date
            priority
            currentWfmStep {
              name
              status {
                name
                color
              }
            }
          }
          people {
            id
            first_name
            last_name
            email
            phone
          }
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
              fieldType
            }
          }
        }
      }
    `;
  }

  /**
   * Get GraphQL query for contact details
   */
  private getContactDetailsQuery(): string {
    return `
      query GetContactDetails($id: ID!) {
        person(id: $id) {
          id
          first_name
          last_name
          email
          phone
          notes
          created_at
          updated_at
          organization_id
          organization {
            id
            name
            industry
          }
          deals {
            id
            name
            amount
            currency
            expected_close_date
            priority
            currentWfmStep {
              name
              status {
                name
                color
              }
            }
          }
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
              fieldType
            }
          }
          activities {
            id
            subject
            type
            status
            due_date
            created_at
          }
        }
      }
    `;
  }

  /**
   * Extract entity data from GraphQL result
   */
  private extractEntityData(result: any, entityType: string): any {
    switch (entityType) {
      case 'deal':
        return result.deal;
      case 'organization':
        return result.organization;
      case 'contact':
        return result.person;
      default:
        return null;
    }
  }

  /**
   * Format detailed entity for AI consumption
   */
  private formatDetailedEntity(entityData: any, entityType: string): DetailedEntity {
    return {
      id: entityData.id,
      entity_type: entityType,
      ...entityData
    };
  }

  /**
   * Generate AI-friendly detail message
   */
  private generateDetailMessage(entity: DetailedEntity, entityType: string): string {
    switch (entityType) {
      case 'deal':
        return this.generateDealDetailMessage(entity);
      case 'organization':
        return this.generateOrganizationDetailMessage(entity);
      case 'contact':
        return this.generateContactDetailMessage(entity);
      default:
        return `📋 **${entityType} Details Retrieved**\n\nEntity ID: ${entity.id}`;
    }
  }

  /**
   * Generate deal detail message
   */
  private generateDealDetailMessage(deal: any): string {
    const amountStr = deal.amount ? 
      `💰 ${deal.currency || 'USD'} ${deal.amount.toLocaleString()}` : 
      '💰 Amount not set';
    
    const stageStr = deal.currentWfmStep ? 
      `📈 ${deal.currentWfmStep.name} (${deal.currentWfmStep.status.name})` : 
      '📈 Stage not set';

    const assigneeStr = deal.assignedToUser ? 
      `👤 ${deal.assignedToUser.display_name || deal.assignedToUser.email}` : 
      '👤 Unassigned';

    let message = `💼 **Deal Details: ${deal.name}**\n\n`;
    message += `**Basic Information:**\n`;
    message += `• ID: ${deal.id}\n`;
    message += `• ${amountStr}\n`;
    message += `• ${stageStr}\n`;
    message += `• ${assigneeStr}\n`;
    
    if (deal.expected_close_date) {
      message += `• 🗓️ Expected Close: ${new Date(deal.expected_close_date).toLocaleDateString()}\n`;
    }
    
    if (deal.priority) {
      message += `• 🎯 Priority: ${deal.priority}\n`;
    }

    message += `\n**Organization:**\n`;
    message += `• 🏢 ${deal.organization.name}\n`;
    if (deal.organization.industry) {
      message += `• 🏭 Industry: ${deal.organization.industry}\n`;
    }

    if (deal.person) {
      message += `\n**Primary Contact:**\n`;
      message += `• 👤 ${deal.person.first_name} ${deal.person.last_name}\n`;
      if (deal.person.email) {
        message += `• 📧 ${deal.person.email}\n`;
      }
      if (deal.person.phone) {
        message += `• 📞 ${deal.person.phone}\n`;
      }
    }

    if (deal.activities && deal.activities.length > 0) {
      message += `\n**Recent Activities:** ${deal.activities.length} total\n`;
      deal.activities.slice(0, 3).forEach((activity: any) => {
        message += `• ${activity.subject} (${activity.type})\n`;
      });
    }

    if (deal.customFieldValues && deal.customFieldValues.length > 0) {
      message += `\n**Custom Fields:** ${deal.customFieldValues.length} values set\n`;
    }

    message += `\n🗓️ Created: ${new Date(deal.created_at).toLocaleDateString()}`;

    return message;
  }

  /**
   * Generate organization detail message
   */
  private generateOrganizationDetailMessage(org: any): string {
    let message = `🏢 **Organization Details: ${org.name}**\n\n`;
    message += `**Basic Information:**\n`;
    message += `• ID: ${org.id}\n`;
    
    if (org.industry) {
      message += `• 🏭 Industry: ${org.industry}\n`;
    }
    
    if (org.website) {
      message += `• 🌐 Website: ${org.website}\n`;
    }
    
    if (org.address) {
      message += `• 📍 Address: ${org.address}\n`;
    }

    if (org.deals && org.deals.length > 0) {
      message += `\n**Deals:** ${org.deals.length} total\n`;
      const totalValue = org.deals.reduce((sum: number, deal: any) => sum + (deal.amount || 0), 0);
      if (totalValue > 0) {
        message += `• 💰 Total Value: $${totalValue.toLocaleString()}\n`;
      }
      
      org.deals.slice(0, 3).forEach((deal: any) => {
        const amountStr = deal.amount ? `$${deal.amount.toLocaleString()}` : 'No amount';
        message += `• ${deal.name} - ${amountStr}\n`;
      });
    }

    if (org.people && org.people.length > 0) {
      message += `\n**Contacts:** ${org.people.length} total\n`;
      org.people.slice(0, 3).forEach((person: any) => {
        message += `• ${person.first_name} ${person.last_name}`;
        if (person.email) {
          message += ` (${person.email})`;
        }
        message += `\n`;
      });
    }

    if (org.customFieldValues && org.customFieldValues.length > 0) {
      message += `\n**Custom Fields:** ${org.customFieldValues.length} values set\n`;
    }

    message += `\n🗓️ Created: ${new Date(org.created_at).toLocaleDateString()}`;

    return message;
  }

  /**
   * Generate contact detail message
   */
  private generateContactDetailMessage(contact: any): string {
    const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'No name';
    
    let message = `👤 **Contact Details: ${fullName}**\n\n`;
    message += `**Basic Information:**\n`;
    message += `• ID: ${contact.id}\n`;
    
    if (contact.email) {
      message += `• 📧 ${contact.email}\n`;
    }
    
    if (contact.phone) {
      message += `• 📞 ${contact.phone}\n`;
    }

    if (contact.organization) {
      message += `\n**Organization:**\n`;
      message += `• 🏢 ${contact.organization.name}\n`;
      if (contact.organization.industry) {
        message += `• 🏭 Industry: ${contact.organization.industry}\n`;
      }
    }

    if (contact.deals && contact.deals.length > 0) {
      message += `\n**Associated Deals:** ${contact.deals.length} total\n`;
      const totalValue = contact.deals.reduce((sum: number, deal: any) => sum + (deal.amount || 0), 0);
      if (totalValue > 0) {
        message += `• 💰 Total Value: $${totalValue.toLocaleString()}\n`;
      }
      
      contact.deals.slice(0, 3).forEach((deal: any) => {
        const amountStr = deal.amount ? `$${deal.amount.toLocaleString()}` : 'No amount';
        message += `• ${deal.name} - ${amountStr}\n`;
      });
    }

    if (contact.activities && contact.activities.length > 0) {
      message += `\n**Recent Activities:** ${contact.activities.length} total\n`;
      contact.activities.slice(0, 3).forEach((activity: any) => {
        message += `• ${activity.subject} (${activity.type})\n`;
      });
    }

    if (contact.customFieldValues && contact.customFieldValues.length > 0) {
      message += `\n**Custom Fields:** ${contact.customFieldValues.length} values set\n`;
    }

    message += `\n🗓️ Created: ${new Date(contact.created_at).toLocaleDateString()}`;

    return message;
  }
} 