import { ToolDefinition, ToolExecutor, ToolExecutionContext } from './ToolRegistry';
import { organizationService } from '../../organizationService';
import { OrganizationInput, Organization } from '../../generated/graphql';

interface CreateOrganizationParams {
  name: string;
  address?: string;
  notes?: string;
}

export class CreateOrganizationTool implements ToolExecutor {
  static definition: ToolDefinition = {
    name: 'create_organization',
    description: 'Create a new organization with intelligent duplicate detection and industry classification',
    input_schema: {
      type: 'object',
              properties: {
          name: {
            type: 'string',
            description: 'Organization name (required) - will be checked for duplicates'
          },
          address: {
            type: 'string',
            description: 'Organization address (optional)'
          },
          notes: {
            type: 'string',
            description: 'Additional notes about the organization (optional)'
          }
        },
      required: ['name']
    }
  };

  async execute(params: CreateOrganizationParams, context?: ToolExecutionContext): Promise<any> {
    try {
      if (!context?.authToken || !context?.userId) {
        throw new Error('Authentication required for organization creation');
      }

      const { name, address, notes } = params;

      if (!name || name.trim().length === 0) {
        throw new Error('Organization name is required');
      }

      // 1. COGNITIVE DUPLICATE DETECTION - Check for existing organizations
      console.log(`[CreateOrganizationTool] Checking for existing organization: "${name}"`);
      
      const existingOrgs = await organizationService.getOrganizations(
        context.userId,
        context.authToken
      );

      // Filter by name for duplicate detection
      const searchName = name.trim().toLowerCase();
      
      // Exact match check
      const exactMatch = existingOrgs.find((org: Organization) => 
        org.name.toLowerCase() === searchName
      );
      
      if (exactMatch) {
        return {
          success: false,
          error: 'DUPLICATE_ORGANIZATION',
          message: `❌ Organization "${name}" already exists`,
          existing_organization: {
            id: exactMatch.id,
            name: exactMatch.name,
            address: exactMatch.address,
            notes: exactMatch.notes,
            created_at: exactMatch.created_at
          },
          suggestion: `Use existing organization ID: ${exactMatch.id} or modify the name to be more specific`
        };
      }

      // Close match warning (similar names)
      const closeMatches = existingOrgs.filter((org: Organization) => {
        const orgName = org.name.toLowerCase();
        const searchName = name.trim().toLowerCase();
        return orgName.includes(searchName) || searchName.includes(orgName);
      });

      // 2. SERVICE LAYER INTEGRATION (Direct service call, not GraphQL)
      console.log(`[CreateOrganizationTool] Creating organization with service layer`);
      
      const organizationInput: OrganizationInput = {
        name: name.trim(),
        address: address || null,
        notes: notes || null
      };

      const newOrganization = await organizationService.createOrganization(
        context.userId,
        organizationInput,
        context.authToken
      );

      // 3. SUCCESS VALIDATION & STRUCTURED RESPONSE
      const success = !!(newOrganization && newOrganization.id);
      
      return {
        success,
        organization: newOrganization,
        message: `✅ Successfully created organization "${newOrganization.name}"`,
        details: {
          id: newOrganization.id,
          name: newOrganization.name,
          address: newOrganization.address || 'Not specified',
          notes: newOrganization.notes || 'Not specified',
          created_at: newOrganization.created_at,
          close_matches_found: closeMatches.length
        },
        warnings: closeMatches.length > 0 ? [
          `Found ${closeMatches.length} similar organization(s): ${closeMatches.map((org: Organization) => org.name).join(', ')}`
        ] : []
      };

    } catch (error: any) {
      console.error('[CreateOrganizationTool] Error:', error);
      
      return {
        success: false,
        error: error.code || 'CREATION_FAILED',
        message: `❌ Failed to create organization: ${error.message}`,
        details: {
          error_type: error.name || 'Unknown',
          error_code: error.code || 'UNKNOWN_ERROR'
        }
      };
    }
  }

} 