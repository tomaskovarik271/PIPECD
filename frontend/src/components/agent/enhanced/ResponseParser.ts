/**
 * ResponseParser Service
 * Analyzes AI responses to detect entities and generate contextual actions
 */

import type { 
  DetectedEntity, 
  ActionableData, 
  SuggestedAction, 
  EnhancedResponseData 
} from './types';

export class ResponseParser {
  /**
   * Parse AI response content to extract entities and actionable data
   */
  static parseResponse(content: string, thoughts?: any[]): EnhancedResponseData {
    const entities = this.detectEntities(content, thoughts);
    const actionableData = this.extractActionableData(content);
    const suggestedActions = this.generateSuggestedActions(entities, content);

    return {
      entities,
      actionableData,
      suggestedActions,
      hasEnhancements: entities.length > 0 || actionableData.length > 0 || suggestedActions.length > 0,
    };
  }

  /**
   * Detect entities mentioned in the content
   */
  private static detectEntities(content: string, thoughts?: any[]): DetectedEntity[] {
    const entities: DetectedEntity[] = [];
    const organizationMap = new Map<string, any>(); // Map organization IDs to their data
    const entityMap = new Map<string, DetectedEntity>(); // Map to prevent duplicate entities

    // Parse deal entities from tool results in thoughts
    if (thoughts) {
      // Only process the LAST tool result to show most recent entities
      const toolThoughts = thoughts.filter(thought => thought.type?.toLowerCase() === 'tool_call');
      const lastToolThought = toolThoughts.length > 0 ? toolThoughts[toolThoughts.length - 1] : null;
      
      if (lastToolThought) {
        // First pass: collect organizations from the last tool result
        const rawData = lastToolThought.rawData || lastToolThought.metadata?.rawData;
        
        if (rawData) {
          try {
            const data = typeof rawData === 'string' 
              ? JSON.parse(rawData) 
              : rawData;

            // Collect organizations first
            if (Array.isArray(data) && data.length > 0 && data[0].name && data[0].amount === undefined) {
              for (const item of data) {
                organizationMap.set(item.id, item);
                
                // Check for duplicates before adding
                if (!entityMap.has(item.id)) {
                  const orgEntity = {
                    type: 'organization' as const,
                    id: item.id,
                    name: item.name,
                    metadata: {
                      industry: item.industry || item.custom_field_values?.organization_industry,
                      size: item.size,
                      createdAt: item.created_at,
                    },
                  };
                  entityMap.set(item.id, orgEntity);
                  entities.push(orgEntity);
                }
              }
            }

            // Single organization (from organization search)
            if (data.id && data.name && data.amount === undefined && !data.deal_specific_probability) {
              organizationMap.set(data.id, data);
              
              // Check for duplicates before adding
              if (!entityMap.has(data.id)) {
                const orgEntity = {
                  type: 'organization' as const,
                  id: data.id,
                  name: data.name,
                  metadata: {
                    industry: data.industry || data.custom_field_values?.organization_industry,
                    size: data.size,
                  },
                };
                entityMap.set(data.id, orgEntity);
                entities.push(orgEntity);
              }
            }

          } catch (error) {
            console.warn('Failed to parse thought data:', error);
          }
        }

        // Second pass: process deals from the last tool result
        if (rawData) {
          try {
            const data = typeof rawData === 'string' 
              ? JSON.parse(rawData) 
              : rawData;

            // Detect deals from search_deals or create_deal results
            if (Array.isArray(data) && data.length > 0 && data[0].id) {
              for (const item of data) {
                if (item.amount !== undefined) {
                  // This looks like a deal
                  const organization = organizationMap.get(item.organization_id);
                  
                  // Generate a meaningful name if none exists
                  let dealName = item.name;
                  if (!dealName || dealName.trim() === '') {
                    if (organization?.name) {
                      dealName = `${organization.name} Opportunity`;
                    } else {
                      dealName = `$${item.amount.toLocaleString()} Deal`;
                    }
                  }
                  
                  // Check for duplicates before adding
                  if (!entityMap.has(item.id)) {
                    const dealEntity = {
                      type: 'deal' as const,
                      id: item.id,
                      name: dealName,
                      amount: item.amount,
                      organizationName: organization?.name,
                      metadata: {
                        status: item.currentWfmStatus?.name || item.status, // Use WFM status first, fallback to direct status
                        stage: item.stage,
                        createdAt: item.created_at,
                        updatedAt: item.updated_at,
                        organizationId: item.organization_id,
                      },
                    };
                    entityMap.set(item.id, dealEntity);
                    entities.push(dealEntity);
                  }
                }
              }
            }

            // Single deal from create_deal or update_deal
            if (data.id && data.amount !== undefined) {
              const organization = organizationMap.get(data.organization_id);
              
              // Generate a meaningful name if none exists
              let dealName = data.name;
              if (!dealName || dealName.trim() === '') {
                if (organization?.name) {
                  dealName = `${organization.name} Opportunity`;
                } else {
                  dealName = `$${data.amount.toLocaleString()} Deal`;
                }
              }
              
              // Always add the entity from the last tool result
              const dealEntity = {
                type: 'deal' as const,
                id: data.id,
                name: dealName,
                amount: data.amount,
                organizationName: organization?.name,
                metadata: {
                  status: data.currentWfmStatus?.name || data.status, // Use WFM status first, fallback to direct status
                  stage: data.stage,
                  createdAt: data.created_at,
                  organizationId: data.organization_id,
                  updatedAt: data.updated_at, // Include updated timestamp for update operations
                  toolName: lastToolThought.metadata?.toolName, // Track which tool created this entity
                },
              };
              
              entityMap.set(data.id, dealEntity);
              entities.push(dealEntity);
            }

          } catch (error) {
            console.warn('Failed to parse thought data:', error);
          }
        }
      }
    }

    return entities;
  }

  /**
   * Extract actionable data that can be copied
   */
  private static extractActionableData(content: string): ActionableData[] {
    const actionableData: ActionableData[] = [];

    // UUID patterns for IDs
    const uuidPattern = /([a-f0-9-]{36})/g;
    let match;
    while ((match = uuidPattern.exec(content)) !== null) {
      actionableData.push({
        type: 'dealId', // Generic ID type
        value: match[1],
        label: `ID ${match[1].substring(0, 8)}`,
        copyable: true,
      });
    }

    // Amount patterns
    const amountPattern = /\$?([\d,]+(?:\.\d{2})?)/g;
    while ((match = amountPattern.exec(content)) !== null) {
      const value = parseFloat(match[1].replace(/,/g, ''));
      if (value > 100) { // Filter out small numbers that might not be amounts
        actionableData.push({
          type: 'amount',
          value: value,
          label: `$${value.toLocaleString()}`,
          copyable: true,
        });
      }
    }

    return actionableData;
  }

  /**
   * Generate contextual action suggestions based on detected entities
   */
  private static generateSuggestedActions(entities: DetectedEntity[], content: string): SuggestedAction[] {
    const actions: SuggestedAction[] = [];

    for (const entity of entities) {
      switch (entity.type) {
        case 'deal':
          actions.push({
            id: `view-deal-${entity.id}`,
            label: 'View Deal',
            icon: 'eye',
            variant: 'primary',
            action: 'navigate',
            target: `/deals/${entity.id}`,
            tooltip: `View details for ${entity.name}`,
          });
          
          actions.push({
            id: `edit-deal-${entity.id}`,
            label: 'Edit',
            icon: 'edit',
            variant: 'outline',
            action: 'navigate',
            target: `/deals/${entity.id}/edit`,
            tooltip: `Edit ${entity.name}`,
          });
          break;

        case 'organization':
          actions.push({
            id: `view-org-${entity.id}`,
            label: 'View Organization',
            icon: 'building',
            variant: 'primary',
            action: 'navigate',
            target: `/organizations/${entity.id}`,
            tooltip: `View details for ${entity.name}`,
          });

          actions.push({
            id: `add-contact-${entity.id}`,
            label: 'Add Contact',
            icon: 'plus',
            variant: 'outline',
            action: 'navigate',
            target: `/contacts/new?organizationId=${entity.id}`,
            tooltip: `Add new contact to ${entity.name}`,
          });
          break;

        case 'contact':
          actions.push({
            id: `view-contact-${entity.id}`,
            label: 'View Contact',
            icon: 'user',
            variant: 'primary',
            action: 'navigate',
            target: `/contacts/${entity.id}`,
            tooltip: `View details for ${entity.name}`,
          });
          break;
      }
    }

    // Add general actions based on content context
    if (content.toLowerCase().includes('created') || content.toLowerCase().includes('new deal')) {
      actions.push({
        id: 'create-another-deal',
        label: 'Create Another Deal',
        icon: 'plus',
        variant: 'secondary',
        action: 'navigate',
        target: '/deals/new',
        tooltip: 'Create a new deal',
      });
    }

    if (content.toLowerCase().includes('search') && entities.length > 0) {
      actions.push({
        id: 'refine-search',
        label: 'Refine Search',
        icon: 'external',
        variant: 'outline',
        action: 'create',
        tooltip: 'Modify search criteria',
      });
    }

    return actions;
  }
}