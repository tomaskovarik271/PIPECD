import { createClient } from '@supabase/supabase-js';
import { Database } from '../database.types';
import { WFMOutcomeEngine } from '../wfmOutcomeEngine';

export interface WFMTransitionPlan {
  sourceProjectTypeId?: string;
  sourceWorkflowId?: string;
  sourceCurrentStepId?: string;
  sourceConvertedStepId?: string;
  targetProjectTypeId: string;
  targetWorkflowId: string;
  targetInitialStepId: string;
  targetStepId?: string;
  transitionReason: string;
  mappingStrategy: 'AUTO' | 'MANUAL' | 'DEFAULT';
}

export interface PlanWFMTransitionInput {
  sourceType: 'lead' | 'deal';
  sourceEntity: any;
  targetType: 'deal' | 'lead';
  targetWfmProjectTypeId?: string;
  targetWfmStepId?: string;
  supabase: ReturnType<typeof createClient<Database>>;
}

export interface ExecuteWFMTransitionInput extends WFMTransitionPlan {
  targetEntityId: string;
  userId: string;
  supabase: ReturnType<typeof createClient<Database>>;
}

export interface WFMTransitionResult {
  success: boolean;
  message: string;
  wfmProjectId?: string;
  currentStepId?: string;
  errors?: string[];
}

/**
 * Plan WFM transitions for conversion with intelligent step mapping
 */
export async function planWFMTransition(
  input: PlanWFMTransitionInput
): Promise<WFMTransitionPlan> {
  try {
    const { supabase } = input;
    
    // 1. Get source WFM information
    let sourceProjectTypeId: string | undefined;
    let sourceWorkflowId: string | undefined;
    let sourceCurrentStepId: string | undefined;
    let sourceConvertedStepId: string | undefined;

    if (input.sourceEntity.wfm_project_id) {
      const { data: sourceProject } = await supabase
        .from('wfm_projects')
        .select(`
          *,
          projectType:project_types(*),
          currentStep:workflow_steps(*)
        `)
        .eq('id', input.sourceEntity.wfm_project_id)
        .single();

      if (sourceProject) {
        sourceProjectTypeId = sourceProject.project_type_id;
        sourceCurrentStepId = sourceProject.current_step_id;
        
        // Find workflow ID from current step
        if (sourceProject.currentStep) {
          sourceWorkflowId = (sourceProject.currentStep as any).workflow_id;
        }

        // Find "Converted" step for source workflow
        if (sourceWorkflowId) {
          const { data: convertedStep } = await supabase
            .from('workflow_steps')
            .select('id')
            .eq('workflow_id', sourceWorkflowId)
            .ilike('name', '%converted%')
            .single();
          
          sourceConvertedStepId = convertedStep?.id;
        }
      }
    }

    // 2. Determine target project type
    let targetProjectTypeId: string;
    
    if (input.targetWfmProjectTypeId) {
      targetProjectTypeId = input.targetWfmProjectTypeId;
    } else {
      // Use configurable project types based on target entity type
      const wfmEngine = new WFMOutcomeEngine(supabase);
      const projectTypeName = await wfmEngine.getProjectTypeMapping(input.targetType === 'deal' ? 'DEAL' : 'LEAD');
      
      const { data: defaultProjectType } = await supabase
        .from('project_types')
        .select('id')
        .eq('name', projectTypeName)
        .single();

      if (!defaultProjectType) {
        throw new Error(`Default project type "${projectTypeName}" not found`);
      }
      
      targetProjectTypeId = defaultProjectType.id;
    }

    // 3. Get target workflow information
    const { data: targetProjectType } = await supabase
      .from('project_types')
      .select(`
        *,
        workflow:workflows(*)
      `)
      .eq('id', targetProjectTypeId)
      .single();

    if (!targetProjectType?.workflow) {
      throw new Error('Target project type has no associated workflow');
    }

    const targetWorkflowId = targetProjectType.workflow.id;

    // 4. Determine target step
    let targetStepId: string;
    let mappingStrategy: 'AUTO' | 'MANUAL' | 'DEFAULT' = 'DEFAULT';

    if (input.targetWfmStepId) {
      // Manual step selection
      targetStepId = input.targetWfmStepId;
      mappingStrategy = 'MANUAL';
    } else {
      // Intelligent step mapping based on source entity state
      targetStepId = await mapIntelligentStep(
        input.sourceType,
        input.sourceEntity,
        input.targetType,
        targetWorkflowId,
        supabase
      );
      mappingStrategy = 'AUTO';
    }

    // 5. Get initial step as fallback
    const { data: initialStep } = await supabase
      .from('workflow_steps')
      .select('id')
      .eq('workflow_id', targetWorkflowId)
      .eq('is_initial_step', true)
      .single();

    const targetInitialStepId = initialStep?.id || targetStepId;

    return {
      sourceProjectTypeId,
      sourceWorkflowId,
      sourceCurrentStepId,
      sourceConvertedStepId,
      targetProjectTypeId,
      targetWorkflowId,
      targetInitialStepId,
      targetStepId,
      transitionReason: `Converted from ${input.sourceType} to ${input.targetType}`,
      mappingStrategy
    };

  } catch (error) {
    console.error('Error planning WFM transition:', error);
    
    // Return basic plan as fallback
    return {
      targetProjectTypeId: input.targetWfmProjectTypeId || '',
      targetWorkflowId: '',
      targetInitialStepId: '',
      targetStepId: '',
      transitionReason: `Converted from ${input.sourceType} to ${input.targetType}`,
      mappingStrategy: 'DEFAULT'
    };
  }
}

/**
 * Execute WFM transition by creating/updating WFM project
 */
export async function executeWFMTransition(
  input: ExecuteWFMTransitionInput
): Promise<WFMTransitionResult> {
  try {
    const { supabase } = input;

    // Create WFM project for target entity
    const { data: wfmProject, error } = await supabase
      .from('wfm_projects')
      .insert({
        name: `${input.targetEntityId} Project`,
        description: `WFM project created from conversion`,
        project_type_id: input.targetProjectTypeId,
        current_step_id: input.targetStepId || input.targetInitialStepId,
        created_by_user_id: input.userId,
        updated_by_user_id: input.userId
      })
      .select('id')
      .single();

    if (error || !wfmProject) {
      console.error('Error creating WFM project:', error);
      return {
        success: false,
        message: 'Failed to create WFM project',
        errors: [error?.message || 'Unknown error']
      };
    }

    // Update target entity with WFM project ID
    const entityTable = input.targetEntityId.includes('deal') ? 'deals' : 'leads';
    
    await supabase
      .from(entityTable as any)
      .update({ wfm_project_id: wfmProject.id })
      .eq('id', input.targetEntityId);

    return {
      success: true,
      message: 'WFM transition completed successfully',
      wfmProjectId: wfmProject.id,
      currentStepId: input.targetStepId || input.targetInitialStepId
    };

  } catch (error) {
    console.error('Error executing WFM transition:', error);
    return {
      success: false,
      message: 'WFM transition failed',
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

/**
 * Intelligent step mapping based on source entity characteristics
 */
async function mapIntelligentStep(
  sourceType: 'lead' | 'deal',
  sourceEntity: any,
  targetType: 'deal' | 'lead',
  targetWorkflowId: string,
  supabase: ReturnType<typeof createClient<Database>>
): Promise<string> {
  try {
    // Get all steps for target workflow
    const { data: workflowSteps } = await supabase
      .from('workflow_steps')
      .select('*')
      .eq('workflow_id', targetWorkflowId)
      .order('step_order');

    if (!workflowSteps || workflowSteps.length === 0) {
      throw new Error('No workflow steps found');
    }

    // Lead → Deal mapping
    if (sourceType === 'lead' && targetType === 'deal') {
      const leadScore = sourceEntity.lead_score || 0;
      const hasDemo = sourceEntity.name?.toLowerCase().includes('demo') || false;
      const hasEstimatedValue = sourceEntity.estimated_value && sourceEntity.estimated_value > 0;

      // Map based on lead qualification level
      if (leadScore >= 80 || hasDemo) {
        // High-quality lead → Opportunity Scoping or Proposal Development
        const advancedStep = workflowSteps.find(step => 
          step.name.toLowerCase().includes('scoping') || 
          step.name.toLowerCase().includes('proposal')
        );
        if (advancedStep) return advancedStep.id;
      } else if (leadScore >= 60 && hasEstimatedValue) {
        // Medium-quality lead → Qualified Lead
        const qualifiedStep = workflowSteps.find(step => 
          step.name.toLowerCase().includes('qualified')
        );
        if (qualifiedStep) return qualifiedStep.id;
      }
    }

    // Deal → Lead mapping
    if (sourceType === 'deal' && targetType === 'lead') {
      const dealAmount = sourceEntity.amount || 0;
      const hasRecentActivity = sourceEntity.last_activity_at && 
        new Date(sourceEntity.last_activity_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Map based on deal characteristics
      if (dealAmount > 10000 && hasRecentActivity) {
        // High-value deal with recent activity → Hot Lead
        const hotStep = workflowSteps.find(step => 
          step.name.toLowerCase().includes('hot') || 
          step.name.toLowerCase().includes('qualified')
        );
        if (hotStep) return hotStep.id;
      } else if (dealAmount > 1000) {
        // Medium-value deal → Qualified Lead
        const qualifiedStep = workflowSteps.find(step => 
          step.name.toLowerCase().includes('qualified')
        );
        if (qualifiedStep) return qualifiedStep.id;
      }
    }

    // Default to initial step
    const initialStep = workflowSteps.find(step => step.is_initial_step);
    return initialStep?.id || workflowSteps[0].id;

  } catch (error) {
    console.error('Error in intelligent step mapping:', error);
    // Return first step as ultimate fallback
    const { data: fallbackStep } = await supabase
      .from('workflow_steps')
      .select('id')
      .eq('workflow_id', targetWorkflowId)
      .eq('is_initial_step', true)
      .single();
    
    return fallbackStep?.id || '';
  }
} 