import { ToolDefinition, ToolExecutor, ToolExecutionContext } from './ToolRegistry';
import { organizationService } from '../../organizationService';
import { OrganizationUpdateInput, Organization } from '../../generated/graphql';

interface UpdateOrganizationParams {
  organization_id: string;
  name?: string;
  address?: string;
  notes?: string;
}

interface WorkflowStep {
  step: string;
  status: 'in_progress' | 'completed' | 'failed';
  timestamp: string;
  details: string;
  data?: any;
}

export class UpdateOrganizationTool implements ToolExecutor {
  private workflowSteps: WorkflowStep[] = [];

  static definition: ToolDefinition = {
    name: 'update_organization',
    description: 'Update existing organization information with intelligent validation and duplicate detection',
    input_schema: {
      type: 'object',
      properties: {
        organization_id: {
          type: 'string',
          description: 'ID of the organization to update (required)'
        },
        name: {
          type: 'string',
          description: 'New organization name (will be checked for duplicates)'
        },
        address: {
          type: 'string',
          description: 'New organization address'
        },
        notes: {
          type: 'string',
          description: 'Additional notes about the organization'
        }
      },
      required: ['organization_id']
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

  async execute(params: UpdateOrganizationParams, context?: ToolExecutionContext): Promise<any> {
    try {
      if (!context?.authToken || !context?.userId) {
        throw new Error('Authentication required for organization update');
      }

      const { organization_id, ...updateData } = params;

      // Initialize workflow tracking
      this.workflowSteps = [];
      this.addWorkflowStep('initialize', 'completed', `Starting update for organization ID: ${organization_id}`);

      // 1. ORGANIZATION VALIDATION - Verify organization exists and user has access
      this.addWorkflowStep('organization_validation', 'in_progress', 'Validating organization exists and user has access');
      
      let existingOrganization: Organization;
      try {
        existingOrganization = await organizationService.getOrganizationById(context.userId, organization_id, context.authToken);
        if (!existingOrganization) {
          throw new Error('Organization not found');
        }
        
        this.addWorkflowStep('organization_validation', 'completed', `Found organization: "${existingOrganization.name}"`);
      } catch (error) {
        this.addWorkflowStep('organization_validation', 'failed', `Organization not found or access denied: ${error}`);
        return {
          success: false,
          error: 'ORGANIZATION_NOT_FOUND',
          message: `❌ Organization with ID "${organization_id}" not found or you don't have access`,
          workflow_steps: this.workflowSteps
        };
      }

      // 2. DUPLICATE DETECTION - Check for name conflicts if name is being updated
      if (updateData.name && updateData.name !== existingOrganization.name) {
        this.addWorkflowStep('duplicate_check', 'in_progress', `Checking for name conflicts: "${updateData.name}"`);
        
        const allOrganizations = await organizationService.getOrganizations(context.userId, context.authToken);
        const nameConflict = allOrganizations.find((org: Organization) => 
          org.id !== organization_id && 
          org.name.toLowerCase() === updateData.name.toLowerCase()
        );
        
        if (nameConflict) {
          this.addWorkflowStep('duplicate_check', 'failed', `Organization name "${updateData.name}" already exists`);
          return {
            success: false,
            error: 'NAME_CONFLICT',
            message: `❌ Organization name "${updateData.name}" already exists`,
            existing_organization: {
              id: nameConflict.id,
              name: nameConflict.name,
              created_at: nameConflict.created_at
            },
            suggestion: `Use existing organization ID: ${nameConflict.id} or choose a different name`,
            workflow_steps: this.workflowSteps
          };
        }
        
        this.addWorkflowStep('duplicate_check', 'completed', `Organization name "${updateData.name}" is available`);
      }

      // 3. CHANGE DETECTION - Identify what's being updated
      this.addWorkflowStep('change_analysis', 'in_progress', 'Analyzing requested changes');
      
      const changes: string[] = [];
      const updateInput: OrganizationUpdateInput = {};

      if (updateData.name && updateData.name !== existingOrganization.name) {
        changes.push(`name: "${existingOrganization.name}" → "${updateData.name}"`);
        updateInput.name = updateData.name;
      }

      if (updateData.address && updateData.address !== existingOrganization.address) {
        changes.push(`address: "${existingOrganization.address || 'Not set'}" → "${updateData.address}"`);
        updateInput.address = updateData.address;
      }

      if (updateData.notes && updateData.notes !== existingOrganization.notes) {
        changes.push(`notes: Updated`);
        updateInput.notes = updateData.notes;
      }

      if (changes.length === 0) {
        this.addWorkflowStep('change_analysis', 'completed', 'No changes detected - organization is already up to date');
        return {
          success: true,
          message: `✅ Organization "${existingOrganization.name}" is already up to date`,
          organization: existingOrganization,
          changes_detected: 0,
          workflow_steps: this.workflowSteps
        };
      }

      this.addWorkflowStep('change_analysis', 'completed', `Detected ${changes.length} changes: ${changes.join(', ')}`);

      // 4. SERVICE LAYER UPDATE - Apply changes using organizationService
      this.addWorkflowStep('organization_update', 'in_progress', `Applying ${changes.length} changes to organization`);
      
      const updatedOrganization = await organizationService.updateOrganization(
        context.userId,
        organization_id,
        updateInput,
        context.authToken
      );

      this.addWorkflowStep('organization_update', 'completed', `Successfully updated organization "${updatedOrganization.name}"`);

      // 5. SUCCESS VALIDATION & STRUCTURED RESPONSE
      const success = !!(updatedOrganization && updatedOrganization.id === organization_id);
      
      return {
        success,
        organization: updatedOrganization,
        message: `✅ Successfully updated organization "${updatedOrganization.name}"`,
        details: {
          id: updatedOrganization.id,
          name: updatedOrganization.name,
          address: updatedOrganization.address || 'Not specified',
          notes: updatedOrganization.notes || 'Not specified',
          updated_at: updatedOrganization.updated_at,
          changes_applied: changes.length,
          changed_fields: changes
        },
        workflow_steps: this.workflowSteps
      };

    } catch (error: any) {
      console.error('[UpdateOrganizationTool] Error:', error);
      
      this.addWorkflowStep('error', 'failed', `Update failed: ${error.message}`);
      
      return {
        success: false,
        error: error.code || 'UPDATE_FAILED',
        message: `❌ Failed to update organization: ${error.message}`,
        details: {
          error_type: error.name || 'Unknown',
          error_code: error.code || 'UNKNOWN_ERROR'
        },
        workflow_steps: this.workflowSteps
      };
    }
  }
} 