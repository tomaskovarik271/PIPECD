/**
 * 🚀 Create Deal Tool with Cognitive Context Integration  
 * Uses dealService directly to ensure proper WFM project creation and Kanban integration
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ToolDefinition, ToolExecutor, ToolExecutionContext } from './ToolRegistry';
import { dealService } from '../../dealService';
import type { DealInput } from '../../generated/graphql';
import { WFMOutcomeEngine } from '../../wfmOutcomeEngine';

export class CreateDealTool implements ToolExecutor {
  private workflowSteps: Array<{step: string, status: string, timestamp: string, details?: any}> = [];
  private organizationCreated: boolean = false;

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

  /**
   * 📝 Add workflow step for transparency
   */
  private addWorkflowStep(step: string, status: string, details: string, data?: any): void {
    this.workflowSteps.push({
      step,
      status,
      timestamp: new Date().toISOString(),
      details,
      ...(data && { data })
    });
  }

  async execute(input: any, context: ToolExecutionContext): Promise<any> {
    try {
      console.log('🚀 CreateDealTool executing with input:', JSON.stringify(input, null, 2));
      
      // Initialize workflow tracking
      this.workflowSteps = [];
      this.organizationCreated = false;
      this.addWorkflowStep('initialize', 'completed', `Starting deal creation for "${input.organization_name}"`);

      // 1. Find or create organization
      this.addWorkflowStep('organization_lookup', 'in_progress', `Searching for organization: "${input.organization_name}"`);
      const organization = await this.findOrCreateOrganization(input.organization_name, context);
      
      // 2. Get configured Deal project type (required for WFM integration)
      this.addWorkflowStep('project_type_lookup', 'in_progress', 'Getting configured Deal project type for WFM integration');
      const salesDealProjectType = await this.getSalesDealProjectType();
      
      if (!salesDealProjectType) {
        this.addWorkflowStep('project_type_lookup', 'failed', 'Configured Deal project type not found');
        throw new Error('Configured Deal project type not found. Please contact administrator.');
      }
      this.addWorkflowStep('project_type_lookup', 'completed', `Found Deal project type (ID: ${salesDealProjectType.id})`);
      
      // 3. Generate deal name if not provided
      const dealName = input.name || this.generateDealName(input.organization_name, input.project_description);
      this.addWorkflowStep('deal_preparation', 'completed', `Prepared deal: "${dealName}" with ${input.currency || 'EUR'} ${input.amount.toLocaleString()}`);
      
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

      this.addWorkflowStep('deal_creation', 'in_progress', `Creating deal in CRM system with WFM project setup`);
      const createdDeal = await dealService.createDeal(context.userId!, dealInput, context.authToken);

      console.log('✅ Deal created successfully with WFM project:', createdDeal.wfm_project_id);
      this.addWorkflowStep('deal_creation', 'completed', `Successfully created deal with WFM project integration`, { 
        deal_id: createdDeal.id,
        wfm_project_id: createdDeal.wfm_project_id,
        project_id: createdDeal.project_id
      });

      return {
        success: true,
        deal: createdDeal,
        organizationCreated: this.organizationCreated,
        message: `✅ Successfully created deal "${createdDeal.name}" worth ${currency} ${input.amount.toLocaleString()} for ${organization.name}`,
        details: {
          organization: organization.name,
          amount: `${currency} ${input.amount.toLocaleString()}`,
          project_type: 'Sales Deal',
          wfm_project_id: createdDeal.wfm_project_id,
          project_id: createdDeal.project_id,
          kanban_ready: !!createdDeal.wfm_project_id,
          created_at: createdDeal.created_at
        },
        workflow_steps: this.workflowSteps
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
          this.addWorkflowStep('organization_lookup', 'completed', `Found existing organization: "${exactMatch.name}"`, { organization_id: exactMatch.id });
          return exactMatch;
        }
        
        // Use first close match
        const closeMatch = existingOrgs[0];
        console.log(`📍 Using close match: ${closeMatch.name} (ID: ${closeMatch.id})`);
        this.addWorkflowStep('organization_lookup', 'completed', `Found similar organization: "${closeMatch.name}" (using as match for "${organizationName}")`, { organization_id: closeMatch.id });
        return closeMatch;
      }

          // Create new organization if none found
      console.log(`🆕 Creating new organization: "${organizationName}"`);
      this.addWorkflowStep('organization_creation', 'in_progress', `Creating new organization: "${organizationName}"`);
      
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
        this.addWorkflowStep('organization_creation', 'failed', `Failed to create organization: ${createError.message}`);
        throw new Error(`Failed to create organization: ${createError.message}`);
      }

      console.log(`✅ Created new organization: ${newOrg.name} (ID: ${newOrg.id})`);
      this.addWorkflowStep('organization_creation', 'completed', `Successfully created new organization: "${newOrg.name}"`, { organization_id: newOrg.id });
      this.organizationCreated = true; // Flag that we created a new organization
      return newOrg;
  }

  /**
   * 🎯 Get configured Deal project type (required for proper WFM integration)
   */
  private async getSalesDealProjectType(): Promise<any> {
    const wfmEngine = new WFMOutcomeEngine(this.supabaseClient);
    const projectTypeName = await wfmEngine.getProjectTypeMapping('DEAL');
    
    const { data: salesDealType, error } = await this.supabaseClient
      .from('project_types')
      .select('*')
      .eq('name', projectTypeName)
      .single();

    if (error) {
      console.error(`Failed to find configured Deal project type "${projectTypeName}":`, error);
      return null;
    }

    if (salesDealType) {
      console.log(`✅ Found Deal project type: ${salesDealType.id}`);
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

 