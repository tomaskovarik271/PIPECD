/**
 * GetDropdownDataTool - Dynamic System Context Discovery
 * 
 * Provides AI agents with intelligent dropdown data and available WFM stages
 * instead of hardcoding assumptions like "Prospecting" that may not exist.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ToolExecutor, ToolExecutionContext, ToolDefinition } from './ToolRegistry';

export class GetDropdownDataTool implements ToolExecutor {
  static definition: ToolDefinition = {
    name: 'get_dropdown_data',
    description: `Get available dropdown data for dynamic system discovery.

This tool helps AI agents discover available:
• WFM stages/steps (instead of assuming "Prospecting" exists)
• Project types for deals/leads
• Organizations for filtering
• Users for assignment
• Custom fields and their options

Always use this before pipeline analysis or deal creation to discover actual available stages.`,
    
    input_schema: {
      type: 'object',
      properties: {
        data_types: {
          type: 'array',
          items: { type: 'string' },
          description: `Array of data types to fetch: ['wfm_stages', 'project_types', 'organizations', 'users']`
        },
        context: {
          type: 'string',
          description: 'Optional context like "pipeline_analysis" or "deal_creation"'
        }
      },
      required: ['data_types']
    }
  };

  constructor(
    private supabaseClient: SupabaseClient,
    private conversationId: string
  ) {}

  async execute(input: any, context: ToolExecutionContext): Promise<any> {
    try {
      const { data_types, context: userContext } = input;
      const result: any = {};

      for (const dataType of data_types) {
        switch (dataType) {
          case 'wfm_stages':
            result.wfm_stages = await this.getWfmStages();
            break;
          case 'project_types':
            result.project_types = await this.getProjectTypes();
            break;
          case 'organizations':
            result.organizations = await this.getOrganizations();
            break;
          case 'users':
            result.users = await this.getUsers();
            break;
          default:
            result[dataType] = { error: `Unknown data type: ${dataType}` };
        }
      }

      return {
        success: true,
        data: result,
        context: userContext,
        message: `Retrieved ${data_types.length} data types successfully`
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to retrieve dropdown data'
      };
    }
  }

  private async getWfmStages() {
    const { data: stages, error } = await this.supabaseClient
      .from('workflow_steps')
      .select(`
        id,
        step_order,
        is_initial_step,
        is_final_step,
        metadata,
        workflow_id,
        workflows!inner(name),
        statuses!inner(id, name, description, color)
      `)
      .order('workflow_id')
      .order('step_order');

    if (error) throw error;

    const stagesList = (stages || []).map((stage: any) => ({
      id: stage.id,
      name: stage.statuses?.name,
      description: stage.statuses?.description,
      color: stage.statuses?.color,
      workflow_name: stage.workflows?.name,
      full_name: `${stage.workflows?.name} → ${stage.statuses?.name}`,
      step_order: stage.step_order,
      is_initial_step: stage.is_initial_step,
      is_final_step: stage.is_final_step,
      metadata: stage.metadata
    }));

    return {
      count: stagesList.length,
      stages: stagesList,
      workflows: [...new Set(stagesList.map(s => s.workflow_name))]
    };
  }

  private async getProjectTypes() {
    const { data: types, error } = await this.supabaseClient
      .from('project_types')
      .select('id, name, description, icon_name, is_archived')
      .eq('is_archived', false)
      .order('name');

    if (error) throw error;

    return {
      count: types?.length || 0,
      types: types || [],
      default_sales_type: types?.find(t => 
        t.name.toLowerCase().includes('sales') || 
        t.name.toLowerCase().includes('deal')
      )
    };
  }

  private async getOrganizations() {
    const { data: orgs, error } = await this.supabaseClient
      .from('organizations')
      .select('id, name, industry')
      .order('name')
      .limit(50);

    if (error) throw error;

    return {
      count: orgs?.length || 0,
      organizations: orgs || [],
      industries: [...new Set((orgs || []).map(o => o.industry).filter(Boolean))]
    };
  }

  private async getUsers() {
    const { data: users, error } = await this.supabaseClient
      .from('user_profiles')
      .select('user_id, display_name, email')
      .order('display_name');

    if (error) throw error;

    return {
      count: users?.length || 0,
      users: (users || []).map(u => ({
        id: u.user_id,
        name: u.display_name || u.email,
        email: u.email
      }))
    };
  }
} 