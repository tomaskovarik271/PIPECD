import { ToolDefinition, ToolExecutor, ToolExecutionContext } from './ToolRegistry';
import { dealService } from '../../dealService';
import { DealServiceUpdateData, DbDeal } from '../../dealService/dealCrud';

interface UpdateDealParams {
  deal_id: string;
  name?: string;
  amount?: number;
  currency?: string;
  expected_close_date?: string;
  person_id?: string;
  organization_id?: string;
  assigned_to_user_id?: string;
  deal_specific_probability?: number;
  notes?: string;
}

interface WorkflowStep {
  step: string;
  status: 'in_progress' | 'completed' | 'failed';
  timestamp: string;
  details: string;
  data?: any;
}

export class UpdateDealTool implements ToolExecutor {
  private workflowSteps: WorkflowStep[] = [];

  static definition: ToolDefinition = {
    name: 'update_deal',
    description: 'Update existing deal information with intelligent validation and workflow transparency',
    input_schema: {
      type: 'object',
      properties: {
        deal_id: {
          type: 'string',
          description: 'ID of the deal to update (required)'
        },
        name: {
          type: 'string',
          description: 'New deal name/title'
        },
        amount: {
          type: 'number',
          description: 'New deal amount/value'
        },
        currency: {
          type: 'string',
          description: 'Deal currency code (EUR, USD, GBP, etc.)'
        },
        expected_close_date: {
          type: 'string',
          description: 'Expected close date in YYYY-MM-DD format'
        },
        person_id: {
          type: 'string',
          description: 'Primary contact person ID'
        },
        organization_id: {
          type: 'string',
          description: 'Organization ID to associate with'
        },
        assigned_to_user_id: {
          type: 'string',
          description: 'User ID to assign/reassign the deal to'
        },
        deal_specific_probability: {
          type: 'number',
          description: 'Deal-specific probability (0-1) to override WFM step probability'
        },
        notes: {
          type: 'string',
          description: 'Additional notes or reason for the update'
        }
      },
      required: ['deal_id']
    }
  };

  private addWorkflowStep(step: string, status: 'in_progress' | 'completed' | 'failed', details: string, data?: any): void {
    this.workflowSteps.push({
      step,
      status,
      timestamp: new Date().toISOString(),
      details,
      ...(data && { data })
    });
  }

  async execute(params: UpdateDealParams, context?: ToolExecutionContext): Promise<any> {
    try {
      if (!context?.authToken || !context?.userId) {
        throw new Error('Authentication required for deal update');
      }

      const { deal_id, ...updateData } = params;

      // Initialize workflow tracking
      this.workflowSteps = [];
      this.addWorkflowStep('initialize', 'completed', `Starting update for deal ID: ${deal_id}`);

      // 1. DEAL VALIDATION - Verify deal exists and user has access
      this.addWorkflowStep('deal_validation', 'in_progress', 'Validating deal exists and user has access');
      
      let existingDeal: DbDeal | null;
      try {
        existingDeal = await dealService.getDealById(context.userId, deal_id, context.authToken);
        if (!existingDeal) {
          throw new Error('Deal not found');
        }
        this.addWorkflowStep('deal_validation', 'completed', `Found deal: "${existingDeal.name}" (${existingDeal.amount ? `${existingDeal.currency || 'EUR'} ${existingDeal.amount.toLocaleString()}` : 'No amount set'})`);
      } catch (error) {
        this.addWorkflowStep('deal_validation', 'failed', `Deal not found or access denied: ${error}`);
        return {
          success: false,
          error: 'DEAL_NOT_FOUND',
          message: `❌ Deal with ID "${deal_id}" not found or you don't have access`,
          workflow_steps: this.workflowSteps
        };
      }

      // 2. CHANGE DETECTION - Identify what's being updated
      this.addWorkflowStep('change_analysis', 'in_progress', 'Analyzing requested changes');
      
      const changes: string[] = [];
      const updateInput: DealServiceUpdateData = {};

      if (updateData.name && updateData.name !== existingDeal.name) {
        changes.push(`name: "${existingDeal.name}" → "${updateData.name}"`);
        updateInput.name = updateData.name;
      }

      if (updateData.amount !== undefined && updateData.amount !== existingDeal.amount) {
        const oldAmount = existingDeal.amount ? `${existingDeal.currency || 'EUR'} ${existingDeal.amount.toLocaleString()}` : 'Not set';
        const newAmount = `${updateData.currency || existingDeal.currency || 'EUR'} ${updateData.amount.toLocaleString()}`;
        changes.push(`amount: ${oldAmount} → ${newAmount}`);
        updateInput.amount = updateData.amount;
      }

      if (updateData.currency && updateData.currency !== existingDeal.currency) {
        changes.push(`currency: "${existingDeal.currency || 'EUR'}" → "${updateData.currency}"`);
        updateInput.currency = updateData.currency;
      }

      if (updateData.expected_close_date) {
        const existingDateStr = existingDeal.expected_close_date ? new Date(existingDeal.expected_close_date).toISOString().split('T')[0] : null;
        if (updateData.expected_close_date !== existingDateStr) {
          changes.push(`close date: "${existingDateStr || 'Not set'}" → "${updateData.expected_close_date}"`);
          updateInput.expected_close_date = updateData.expected_close_date;
        }
      }

      if (updateData.person_id && updateData.person_id !== existingDeal.person_id) {
        changes.push(`primary contact: Changed`);
        updateInput.person_id = updateData.person_id;
      }

      if (updateData.organization_id && updateData.organization_id !== existingDeal.organization_id) {
        changes.push(`organization: Changed`);
        updateInput.organization_id = updateData.organization_id;
      }

      if (updateData.assigned_to_user_id && updateData.assigned_to_user_id !== existingDeal.assigned_to_user_id) {
        changes.push(`assigned user: Changed`);
        updateInput.assigned_to_user_id = updateData.assigned_to_user_id;
      }

      if (updateData.deal_specific_probability !== undefined && updateData.deal_specific_probability !== existingDeal.deal_specific_probability) {
        const oldProb = existingDeal.deal_specific_probability ? `${(existingDeal.deal_specific_probability * 100).toFixed(1)}%` : 'Not set';
        const newProb = `${(updateData.deal_specific_probability * 100).toFixed(1)}%`;
        changes.push(`probability: ${oldProb} → ${newProb}`);
        updateInput.deal_specific_probability = updateData.deal_specific_probability;
      }

      if (changes.length === 0) {
        this.addWorkflowStep('change_analysis', 'completed', 'No changes detected - deal is already up to date');
        return {
          success: true,
          message: `✅ Deal "${existingDeal.name}" is already up to date`,
          deal: existingDeal,
          changes_detected: 0,
          workflow_steps: this.workflowSteps
        };
      }

      this.addWorkflowStep('change_analysis', 'completed', `Detected ${changes.length} changes: ${changes.join(', ')}`);

      // 3. SERVICE LAYER UPDATE - Apply changes using dealService
      this.addWorkflowStep('deal_update', 'in_progress', `Applying ${changes.length} changes to deal`);
      
      const updatedDeal = await dealService.updateDeal(
        context.userId,
        deal_id,
        updateInput,
        context.authToken
      );

      if (!updatedDeal) {
        throw new Error('Deal update returned null');
      }

      this.addWorkflowStep('deal_update', 'completed', `Successfully updated deal "${updatedDeal.name}"`);

      // 4. SUCCESS VALIDATION & STRUCTURED RESPONSE
      const success = !!(updatedDeal && updatedDeal.id === deal_id);
      
      return {
        success,
        deal: updatedDeal,
        message: `✅ Successfully updated deal "${updatedDeal.name}"`,
        details: {
          id: updatedDeal.id,
          name: updatedDeal.name,
          amount: updatedDeal.amount,
          currency: updatedDeal.currency || 'EUR',
          expected_close_date: updatedDeal.expected_close_date || 'Not set',
          organization_id: updatedDeal.organization_id || 'No organization',
          person_id: updatedDeal.person_id || 'No contact',
          updated_at: updatedDeal.updated_at,
          changes_applied: changes.length,
          changed_fields: changes
        },
        workflow_steps: this.workflowSteps
      };

    } catch (error: any) {
      console.error('[UpdateDealTool] Error:', error);
      
      this.addWorkflowStep('error', 'failed', `Update failed: ${error.message}`);
      
      return {
        success: false,
        error: error.code || 'UPDATE_FAILED',
        message: `❌ Failed to update deal: ${error.message}`,
        details: {
          error_type: error.name || 'Unknown',
          error_code: error.code || 'UNKNOWN_ERROR'
        },
        workflow_steps: this.workflowSteps
      };
    }
  }
} 