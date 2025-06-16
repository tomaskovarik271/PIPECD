/**
 * Response Formatter for PipeCD AI Agent
 * 
 * Centralized formatting for all tool responses to ensure consistency
 * and proper user experience across all domains
 */

import type {
  DealData,
  OrganizationData,
  ContactData,
  ActivityData,
  CustomFieldDefinitionData,
  CustomFieldValueData,
} from '../types/tools';
import { CurrencyFormatter } from '../../utils/currencyFormatter';

export class ResponseFormatter {
  
  // ================================
  // Deal Response Formatting
  // ================================
  
  static formatDealsList(deals: DealData[], searchTerm?: string): string {
    if (deals.length === 0) {
      return `**Pipeline Summary**\n\nNo deals found${searchTerm ? ` matching "${searchTerm}"` : ''}.`;
    }

    // Calculate total pipeline value
    const totalValue = deals.reduce((sum, deal) => sum + (deal.amount || 0), 0);

    // Create structured response
    const header = `**Pipeline Summary**\n\nYou currently have **${deals.length} deal${deals.length === 1 ? '' : 's'}** in your CRM${searchTerm ? ` matching "${searchTerm}"` : ''}:\n\nTotal pipeline value: $${totalValue.toLocaleString()}`;

    const dealsList = deals.map((deal, index) => {
      const amount = deal.amount ? `$${deal.amount.toLocaleString()}` : 'No amount';
      const org = deal.organization?.name || 'No organization';
      const contact = deal.primaryContact 
        ? `${deal.primaryContact.first_name || ''} ${deal.primaryContact.last_name || ''}`.trim() 
        : 'No contact';
      const dueDate = deal.expected_close_date 
        ? `Due: ${new Date(deal.expected_close_date).toLocaleDateString()}` 
        : 'No due date';
      
      return `${index + 1}. **${deal.name}** - ${amount} (Org: ${org.substring(0, 8)}...)
${dueDate}
ID: ${deal.id}`;
    }).join('\n\n');

    const followUp = deals.length > 0 
      ? `\n\nWould you like me to get more details about either of these deals, or help you with anything else related to your pipeline?`
      : '';

    return `${header}\n\n${dealsList}${followUp}`;
  }

  static formatDealDetails(deal: DealData): string {
    const org = deal.organization ? `${deal.organization.name} (ID: ${deal.organization.id})` : 'No organization';
    const contact = deal.primaryContact 
      ? `${deal.primaryContact.first_name} ${deal.primaryContact.last_name} (${deal.primaryContact.email})`
      : 'No primary contact';

    const customFieldsInfo = this.formatCustomFields(deal.customFieldValues);
    
    return `**Deal Details:**
- **Name:** ${deal.name}
- **Value:** ${deal.amount ? `$${deal.amount.toLocaleString()}` : 'Not specified'}
- **Stage:** ${deal.stage || 'Not specified'}
- **Priority:** ${deal.priority || 'Not specified'}
- **Status:** ${deal.status}
- **Type:** ${deal.deal_type || 'Not specified'}
- **Source:** ${deal.source || 'Not specified'}
- **Organization:** ${org}
- **Primary Contact:** ${contact}
- **Close Date:** ${deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : 'Not set'}
- **Created:** ${new Date(deal.created_at).toLocaleDateString()}
- **Last Updated:** ${new Date(deal.updated_at).toLocaleDateString()}

**Description:**
${deal.description || 'No description provided'}${customFieldsInfo}

**Deal ID:** ${deal.id}`;
  }

  static formatDealCreated(deal: DealData): string {
    const org = deal.organization ? ` at ${deal.organization.name}` : '';
    const contact = deal.primaryContact 
      ? ` with primary contact ${deal.primaryContact.first_name} ${deal.primaryContact.last_name} (${deal.primaryContact.email})`
      : '';

    const customFieldsInfo = this.formatCustomFields(deal.customFieldValues, 'Custom Fields Set:');

    return `✅ **Deal created successfully!**

**Deal Details:**
- **Name:** ${deal.name}
- **Value:** ${deal.amount ? `$${deal.amount.toLocaleString()}` : 'Not specified'}
- **Stage:** ${deal.stage || 'Not specified'}
- **Priority:** ${deal.priority || 'Not specified'}
- **Status:** ${deal.status}
- **Type:** ${deal.deal_type || 'Not specified'}
- **Source:** ${deal.source || 'Not specified'}${org}${contact}
- **Close Date:** ${deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString() : 'Not set'}
- **Description:** ${deal.description || 'No description'}
- **Created:** ${new Date(deal.created_at).toLocaleDateString()}${customFieldsInfo}

**Deal ID:** ${deal.id}`;
  }

  // ================================
  // Organization Response Formatting
  // ================================

  static formatOrganizationsList(organizations: OrganizationData[], searchTerm?: string): string {
    const summary = `Found ${organizations.length} organization${organizations.length === 1 ? '' : 's'}${searchTerm ? ` matching "${searchTerm}"` : ''}`;
    
    if (organizations.length === 0) {
      return `${summary}\n\nNo organizations found.`;
    }

    const orgsList = organizations.map(org => {
      const address = org.address ? ` | ${org.address}` : '';
      const created = new Date(org.created_at).toLocaleDateString();
      return `• **${org.name}**${address}
  ID: ${org.id} | Created: ${created}`;
    }).join('\n');

    return `${summary}\n\n${orgsList}`;
  }

  static formatOrganizationDetails(org: OrganizationData): string {
    const addressInfo = org.address ? `\n- **Address:** ${org.address}` : '';
    const notesInfo = org.notes ? `\n- **Notes:** ${org.notes}` : '';
    const createdDate = new Date(org.created_at).toLocaleDateString();
    const updatedDate = new Date(org.updated_at).toLocaleDateString();

    const dealsInfo = org.deals && org.deals.length > 0
      ? `\n\n**Associated Deals (${org.deals.length}):**\n${org.deals.map(deal => 
          `• ${deal.name} - ${deal.stage || 'No stage'} - ${deal.amount ? `$${deal.amount.toLocaleString()}` : 'No value'} - ${deal.status}
  Deal ID: ${deal.id}`
        ).join('\n')}`
      : '\n\n**Associated Deals:** None';

    const peopleInfo = org.people && org.people.length > 0
      ? `\n\n**Associated Contacts (${org.people.length}):**\n${org.people.map(person => 
          `• ${person.first_name || ''} ${person.last_name || ''}${person.email ? ` - ${person.email}` : ''}${person.phone ? ` - ${person.phone}` : ''}
  Contact ID: ${person.id}`
        ).join('\n')}`
      : '\n\n**Associated Contacts:** None';

    const customFieldsInfo = this.formatCustomFields(org.customFieldValues);

    return `**Organization Details:**

**Basic Information:**
- **Name:** ${org.name}${addressInfo}${notesInfo}
- **Created:** ${createdDate}
- **Last Updated:** ${updatedDate}
- **Organization ID:** ${org.id}${customFieldsInfo}${dealsInfo}${peopleInfo}`;
  }

  static formatOrganizationCreated(org: OrganizationData): string {
    const addressInfo = org.address ? ` | Address: ${org.address}` : '';
    const notesInfo = org.notes ? ` | Notes: ${org.notes}` : '';
    const createdDate = new Date(org.created_at).toLocaleDateString();
    const customFieldsInfo = this.formatCustomFields(org.customFieldValues);

    return `✅ **Organization Created Successfully!**

**Organization Details:**
- **Name:** ${org.name}${addressInfo}${notesInfo}
- **Created:** ${createdDate}
- **ID:** ${org.id}${customFieldsInfo}`;
  }

  // ================================
  // Contact Response Formatting
  // ================================

  static formatContactsList(contacts: ContactData[], searchTerm?: string): string {
    const summary = `Found ${contacts.length} contact${contacts.length === 1 ? '' : 's'}${searchTerm ? ` matching "${searchTerm}"` : ''}`;
    
    if (contacts.length === 0) {
      return `${summary}\n\nNo contacts found.`;
    }

    const contactsList = contacts.map(contact => {
      const org = contact.organization ? ` at ${contact.organization.name}` : '';
      const email = contact.email ? ` | ${contact.email}` : '';
      const phone = contact.phone ? ` | ${contact.phone}` : '';
      return `• **${contact.first_name || ''} ${contact.last_name || ''}**${org}${email}${phone}
  ID: ${contact.id}`;
    }).join('\n');

    return `${summary}\n\n${contactsList}`;
  }

  static formatContactDetails(contact: ContactData): string {
    const org = contact.organization ? ` at ${contact.organization.name}` : '';
    const customFieldsInfo = this.formatCustomFields(contact.customFieldValues);

    return `**Contact Details:**
- **Name:** ${contact.first_name || ''} ${contact.last_name || ''}
- **Email:** ${contact.email || 'Not provided'}
- **Phone:** ${contact.phone || 'Not provided'}
- **Organization:** ${contact.organization?.name || 'None'}${org}
- **Notes:** ${contact.notes || 'None'}
- **Contact ID:** ${contact.id}${customFieldsInfo}`;
  }

  // ================================
  // Activity Response Formatting
  // ================================

  static formatActivitiesList(activities: ActivityData[]): string {
    const summary = `Found ${activities.length} activit${activities.length === 1 ? 'y' : 'ies'}`;
    
    if (activities.length === 0) {
      return `${summary}\n\nNo activities found.`;
    }

    const activitiesList = activities.map(activity => {
      const status = activity.is_done ? '✅ Completed' : '⏳ Pending';
      const dueDate = activity.due_date ? ` | Due: ${new Date(activity.due_date).toLocaleDateString()}` : '';
      const completedDate = activity.completed_at ? ` | Completed: ${new Date(activity.completed_at).toLocaleDateString()}` : '';
      
      return `• **${activity.subject}** (${activity.type})
  ${status}${dueDate}${completedDate}
  ID: ${activity.id}`;
    }).join('\n');

    return `${summary}\n\n${activitiesList}`;
  }

  // ================================
  // Custom Fields Response Formatting
  // ================================

  static formatCustomFieldDefinitions(definitions: CustomFieldDefinitionData[]): string {
    const summary = `Found ${definitions.length} custom field definition${definitions.length === 1 ? '' : 's'}`;
    
    if (definitions.length === 0) {
      return `${summary}\n\nNo custom field definitions found.`;
    }

    const definitionsList = definitions.map(def => {
      const status = def.isActive ? 'Active' : 'Inactive';
      const required = def.isRequired ? 'Required' : 'Optional';
      const options = def.dropdownOptions && def.dropdownOptions.length > 0 
        ? ` | Options: ${def.dropdownOptions.map(opt => opt.label).join(', ')}`
        : '';
      
      return `• **${def.fieldLabel}** (${def.fieldName})
  Type: ${def.fieldType} | ${required} | ${status}${options}
  Display Order: ${def.displayOrder} | Created: ${new Date(def.createdAt).toLocaleDateString()}
  ID: ${def.id}`;
    }).join('\n\n');

    return `${summary}\n\n${definitionsList}`;
  }

  static formatCustomFieldDefinitionCreated(definition: CustomFieldDefinitionData): string {
    const options = definition.dropdownOptions && definition.dropdownOptions.length > 0 
      ? `\n- **Options:** ${definition.dropdownOptions.map(opt => `${opt.label} (${opt.value})`).join(', ')}`
      : '';
    
    return `✅ **Custom field definition created successfully!**

**Custom Field Details:**
- **Label:** ${definition.fieldLabel}
- **Internal Name:** ${definition.fieldName}
- **Entity Type:** ${definition.entityType}
- **Field Type:** ${definition.fieldType}
- **Required:** ${definition.isRequired ? 'Yes' : 'No'}
- **Display Order:** ${definition.displayOrder}${options}
- **Created:** ${new Date(definition.createdAt).toLocaleDateString()}
- **Definition ID:** ${definition.id}

The custom field is now available for use in ${definition.entityType.toLowerCase()} forms and can be set via API.`;
  }

  static formatCustomFields(customFields?: CustomFieldValueData[], title: string = 'Custom Fields:'): string {
    if (!customFields || customFields.length === 0) {
      return '';
    }

    const fieldsList = customFields.map(field => {
      let value = 'No value';
      
      switch (field.definition.fieldType) {
        case 'TEXT':
        case 'DROPDOWN':
          value = field.stringValue || 'No value';
          break;
        case 'NUMBER':
          value = field.numberValue !== null && field.numberValue !== undefined ? field.numberValue.toString() : 'No value';
          break;
        case 'BOOLEAN':
          value = field.booleanValue !== null && field.booleanValue !== undefined ? (field.booleanValue ? 'Yes' : 'No') : 'No value';
          break;
        case 'DATE':
          value = field.dateValue ? new Date(field.dateValue).toLocaleDateString() : 'No value';
          break;
        case 'MULTI_SELECT':
          value = field.selectedOptionValues && field.selectedOptionValues.length > 0 
            ? field.selectedOptionValues.join(', ') 
            : 'No selections';
          break;
        default:
          value = field.stringValue || 'No value';
      }
      
      return `- **${field.definition.fieldLabel}:** ${value}`;
    }).join('\n');

    return `\n\n**${title}**\n${fieldsList}`;
  }

  // ================================
  // Generic Response Formatting
  // ================================

  static formatSuccess(message: string, details?: Record<string, any>): string {
    let response = `✅ ${message}`;
    
    if (details && Object.keys(details).length > 0) {
      const detailsList = Object.entries(details)
        .map(([key, value]) => `- **${this.formatKey(key)}:** ${value}`)
        .join('\n');
      
      response += `\n\n**Details:**\n${detailsList}`;
    }
    
    return response;
  }

  static formatError(message: string, error?: any): string {
    let response = `❌ ${message}`;
    
    if (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      response += `\n\n**Error Details:** ${errorMessage}`;
    }
    
    return response;
  }

  static formatWarning(message: string, details?: string): string {
    let response = `⚠️ ${message}`;
    
    if (details) {
      response += `\n\n**Details:** ${details}`;
    }
    
    return response;
  }

  static formatInfo(message: string, data?: any): string {
    let response = `ℹ️ ${message}`;
    
    if (data) {
      const dataString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      response += `\n\n${dataString}`;
    }
    
    return response;
  }

  // ================================
  // Utility Methods
  // ================================

  private static formatKey(key: string): string {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  static truncate(text: string, maxLength: number = 100): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  static formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return CurrencyFormatter.format(amount, currency, { precision: 2 });
  }
} 