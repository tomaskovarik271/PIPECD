/**
 * 🚀 Create Deal Tool with Cognitive Context Integration  
 * Uses dealService directly to ensure proper WFM project creation and Kanban integration
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ToolDefinition, ToolExecutor, ToolExecutionContext } from './ToolRegistry';
import { dealService } from '../../dealService';
import type { DealInput } from '../../generated/graphql';

export class CreateDealTool implements ToolExecutor {
  // Static definition - this is what gets enhanced by CognitiveContextEngine
  static definition: ToolDefinition = {
    name: 'create_deal',
    description: 'Create a new deal in the CRM system. Will automatically find existing organizations and set up WFM project for Kanban integration.',
    input_schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Deal name/title (will be auto-generated if not provided)'
        },
        amount: {
          type: 'number',
          description: 'Deal value in the specified currency'
        },
        currency: {
          type: 'string',
          description: 'Currency code (EUR, USD, etc.)',
          enum: ['EUR', 'USD', 'GBP', 'CHF'],
          default: 'EUR'
        },
        organization_name: {
          type: 'string',
          description: 'Organization name (e.g., "ORVIL", "Microsoft") - will search for existing organization or create new one'
        },
        project_description: {
          type: 'string',
          description: 'Brief description of the project/deal (e.g., "ELE2 extension with SaaS features")'
        },
        expected_close_date: {
          type: 'string',
          format: 'date',
          description: 'Expected closing date (YYYY-MM-DD), optional'
        }
      },
      required: ['amount', 'organization_name']
    }
  };

  constructor(
    private supabaseClient: SupabaseClient,
    private conversationId: string
  ) {}

  async execute(input: any, context: ToolExecutionContext): Promise<any> {
    try {
      console.log('🚀 CreateDealTool executing with input:', JSON.stringify(input, null, 2));

      // 1. Find or create organization
      const organization = await this.findOrCreateOrganization(input.organization_name, context);
      
      // 2. Get "Sales Deal" project type (required for WFM integration)
      const salesDealProjectType = await this.getSalesDealProjectType();
      
      if (!salesDealProjectType) {
        throw new Error('Sales Deal project type not found. Please contact administrator.');
      }
      
      // 3. Generate deal name if not provided
      const dealName = input.name || this.generateDealName(input.organization_name, input.project_description);
      
      // 4. Set default currency if not provided
      const currency = input.currency || 'EUR';
      
      // 5. Prepare DealInput for dealService (same as GraphQL mutation)
      const dealInput: DealInput = {
        name: dealName,
        wfmProjectTypeId: salesDealProjectType.id,
        amount: input.amount,
        currency: currency,
        organization_id: organization.id,
        expected_close_date: input.expected_close_date ? new Date(input.expected_close_date) : null,
        assignedToUserId: context.userId
      };

      console.log('🎯 Creating deal with dealService:', JSON.stringify(dealInput, null, 2));

      // 6. Create deal using dealService directly (same as GraphQL mutation uses)
      if (!context.authToken) {
        throw new Error('Authentication token required for deal creation');
      }

      const createdDeal = await dealService.createDeal(context.userId!, dealInput, context.authToken);

      console.log('✅ Deal created successfully with WFM project:', createdDeal.wfm_project_id);

      return {
        success: true,
        deal: createdDeal,
        message: `✅ Successfully created deal "${createdDeal.name}" worth ${currency} ${input.amount.toLocaleString()} for ${organization.name}`,
        details: {
          organization: organization.name,
          amount: `${currency} ${input.amount.toLocaleString()}`,
          project_type: 'Sales Deal',
          wfm_project_id: createdDeal.wfm_project_id,
          project_id: createdDeal.project_id,
          kanban_ready: !!createdDeal.wfm_project_id,
          created_at: createdDeal.created_at
        }
      };

    } catch (error) {
      console.error('❌ CreateDealTool error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to create deal'
      };
    }
  }

  /**
   * 🔍 Find existing organization or create new one
   */
  private async findOrCreateOrganization(organizationName: string, context: ToolExecutionContext): Promise<any> {
    console.log(`🔍 Searching for organization: "${organizationName}"`);
    
    // Search for existing organization (case-insensitive)
    const { data: existingOrgs, error: searchError } = await this.supabaseClient
      .from('organizations')
      .select('*')
      .ilike('name', `%${organizationName}%`)
      .limit(5);

    if (searchError) {
      console.warn('Search error:', searchError);
    }

    // If we found exact or close matches, use the first one
    if (existingOrgs && existingOrgs.length > 0) {
      const exactMatch = existingOrgs.find(org => 
        org.name.toLowerCase() === organizationName.toLowerCase()
      );
      
      if (exactMatch) {
        console.log(`✅ Found exact match: ${exactMatch.name} (ID: ${exactMatch.id})`);
        return exactMatch;
      }
      
      // Use first close match
      const closeMatch = existingOrgs[0];
      console.log(`📍 Using close match: ${closeMatch.name} (ID: ${closeMatch.id})`);
      return closeMatch;
    }

    // Create new organization if none found
    console.log(`🆕 Creating new organization: "${organizationName}"`);
    const { data: newOrg, error: createError } = await this.supabaseClient
      .from('organizations')
      .insert({
        name: organizationName,
        address: null,
        notes: `Created automatically during deal creation`,
        user_id: context.userId
      })
      .select('*')
      .single();

    if (createError) {
      throw new Error(`Failed to create organization: ${createError.message}`);
    }

    console.log(`✅ Created new organization: ${newOrg.name} (ID: ${newOrg.id})`);
    return newOrg;
  }

  /**
   * 🎯 Get "Sales Deal" project type (required for proper WFM integration)
   */
  private async getSalesDealProjectType(): Promise<any> {
    const { data: salesDealType, error } = await this.supabaseClient
      .from('project_types')
      .select('*')
      .eq('name', 'Sales Deal')
      .single();

    if (error) {
      console.error('Failed to find Sales Deal project type:', error);
      return null;
    }

    if (salesDealType) {
      console.log(`✅ Found Sales Deal project type: ${salesDealType.id}`);
      return salesDealType;
    }

    return null;
  }

  /**
   * 🏷️ Generate intelligent deal name
   */
  private generateDealName(organizationName: string, projectDescription?: string): string {
    if (projectDescription) {
      return `${organizationName} - ${projectDescription}`;
    }
    
    return `${organizationName} - New Project ${new Date().getFullYear()}`;
  }
}

 