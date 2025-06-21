import { ToolDefinition, ToolExecutor, ToolExecutionContext } from './ToolRegistry';
import { personService } from '../../personService';
import { PersonUpdateInput, Person } from '../../generated/graphql';

interface UpdatePersonParams {
  person_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  organization_id?: string;
  notes?: string;
}

interface WorkflowStep {
  step: string;
  status: 'in_progress' | 'completed' | 'failed';
  timestamp: string;
  details: string;
  data?: any;
}

export class UpdatePersonTool implements ToolExecutor {
  private workflowSteps: WorkflowStep[] = [];

  static definition: ToolDefinition = {
    name: 'update_person',
    description: 'Update existing person/contact information with intelligent validation and duplicate detection',
    input_schema: {
      type: 'object',
      properties: {
        person_id: {
          type: 'string',
          description: 'ID of the person to update (required)'
        },
        first_name: {
          type: 'string',
          description: 'New first name'
        },
        last_name: {
          type: 'string',
          description: 'New last name'
        },
        email: {
          type: 'string',
          description: 'New email address (will be checked for duplicates)'
        },
        phone: {
          type: 'string',
          description: 'New phone number (will be auto-formatted)'
        },
        organization_id: {
          type: 'string',
          description: 'Organization ID to associate with (or null to remove association)'
        },
        notes: {
          type: 'string',
          description: 'Additional notes about the person'
        }
      },
      required: ['person_id']
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

  async execute(params: UpdatePersonParams, context?: ToolExecutionContext): Promise<any> {
    try {
      if (!context?.authToken || !context?.userId) {
        throw new Error('Authentication required for person update');
      }

      const { person_id, ...updateData } = params;

      // Initialize workflow tracking
      this.workflowSteps = [];
      this.addWorkflowStep('initialize', 'completed', `Starting update for person ID: ${person_id}`);

      // 1. PERSON VALIDATION - Verify person exists and user has access
      this.addWorkflowStep('person_validation', 'in_progress', 'Validating person exists and user has access');
      
      const existingPerson = await personService.getPersonById(context.userId, person_id, context.authToken);
      if (!existingPerson) {
        this.addWorkflowStep('person_validation', 'failed', 'Person not found or access denied');
        return {
          success: false,
          error: 'PERSON_NOT_FOUND',
          message: `❌ Person with ID "${person_id}" not found or you don't have access`,
          workflow_steps: this.workflowSteps
        };
      }
      
      const fullName = [existingPerson.first_name, existingPerson.last_name].filter(Boolean).join(' ') || 'Unnamed Person';
      this.addWorkflowStep('person_validation', 'completed', `Found person: "${fullName}" (${existingPerson.email || 'No email'})`);

      // 2. DUPLICATE DETECTION - Check for email conflicts if email is being updated
      if (updateData.email && updateData.email !== existingPerson.email) {
        this.addWorkflowStep('duplicate_check', 'in_progress', `Checking for email conflicts: "${updateData.email}"`);
        
        const allPersons = await personService.getPeople(context.userId, context.authToken);
        const emailConflict = allPersons.find((person: Person) => 
          person.id !== person_id && 
          person.email?.toLowerCase() === updateData.email.toLowerCase()
        );
        
        if (emailConflict) {
          this.addWorkflowStep('duplicate_check', 'failed', `Email "${updateData.email}" already in use by another person`);
          return {
            success: false,
            error: 'EMAIL_CONFLICT',
            message: `❌ Email "${updateData.email}" is already in use by another person`,
            existing_person: {
              id: emailConflict.id,
              name: [emailConflict.first_name, emailConflict.last_name].filter(Boolean).join(' '),
              email: emailConflict.email
            },
            workflow_steps: this.workflowSteps
          };
        }
        
        this.addWorkflowStep('duplicate_check', 'completed', `Email "${updateData.email}" is available`);
      }

      // 3. PHONE NUMBER FORMATTING
      let processedPhone = updateData.phone;
      if (updateData.phone && updateData.phone !== existingPerson.phone) {
        this.addWorkflowStep('phone_formatting', 'in_progress', 'Formatting phone number');
        
        // Basic phone formatting - remove non-digits and format
        const digitsOnly = updateData.phone.replace(/\D/g, '');
        if (digitsOnly.length === 10) {
          processedPhone = `(${digitsOnly.slice(0,3)}) ${digitsOnly.slice(3,6)}-${digitsOnly.slice(6)}`;
        } else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
          processedPhone = `+1 (${digitsOnly.slice(1,4)}) ${digitsOnly.slice(4,7)}-${digitsOnly.slice(7)}`;
        }
        
        if (processedPhone !== updateData.phone) {
          this.addWorkflowStep('phone_formatting', 'completed', `Formatted phone: "${updateData.phone}" → "${processedPhone}"`);
        } else {
          this.addWorkflowStep('phone_formatting', 'completed', 'Phone number kept as provided');
        }
      }

      // 4. CHANGE DETECTION - Identify what's being updated
      this.addWorkflowStep('change_analysis', 'in_progress', 'Analyzing requested changes');
      
      const changes: string[] = [];
      const updateInput: PersonUpdateInput = {};

      if (updateData.first_name && updateData.first_name !== existingPerson.first_name) {
        changes.push(`first name: "${existingPerson.first_name || ''}" → "${updateData.first_name}"`);
        updateInput.first_name = updateData.first_name;
      }

      if (updateData.last_name && updateData.last_name !== existingPerson.last_name) {
        changes.push(`last name: "${existingPerson.last_name || ''}" → "${updateData.last_name}"`);
        updateInput.last_name = updateData.last_name;
      }

      if (updateData.email && updateData.email !== existingPerson.email) {
        changes.push(`email: "${existingPerson.email || 'Not set'}" → "${updateData.email}"`);
        updateInput.email = updateData.email;
      }

      if (processedPhone && processedPhone !== existingPerson.phone) {
        changes.push(`phone: "${existingPerson.phone || 'Not set'}" → "${processedPhone}"`);
        updateInput.phone = processedPhone;
      }

      if (updateData.organization_id !== undefined && updateData.organization_id !== existingPerson.organization_id) {
        const oldOrg = existingPerson.organization_id || 'No organization';
        const newOrg = updateData.organization_id || 'No organization';
        changes.push(`organization: ${oldOrg} → ${newOrg}`);
        updateInput.organization_id = updateData.organization_id;
      }

      if (updateData.notes && updateData.notes !== existingPerson.notes) {
        changes.push(`notes: Updated`);
        updateInput.notes = updateData.notes;
      }

      if (changes.length === 0) {
        this.addWorkflowStep('change_analysis', 'completed', 'No changes detected - person is already up to date');
        return {
          success: true,
          message: `✅ Person "${[existingPerson.first_name, existingPerson.last_name].filter(Boolean).join(' ')}" is already up to date`,
          person: existingPerson,
          changes_detected: 0,
          workflow_steps: this.workflowSteps
        };
      }

      this.addWorkflowStep('change_analysis', 'completed', `Detected ${changes.length} changes: ${changes.join(', ')}`);

      // 5. SERVICE LAYER UPDATE - Apply changes using personService
      this.addWorkflowStep('person_update', 'in_progress', `Applying ${changes.length} changes to person`);
      
      const updatedPerson = await personService.updatePerson(
        context.userId,
        person_id,
        updateInput,
        context.authToken
      );

      const updatedFullName = [updatedPerson.first_name, updatedPerson.last_name].filter(Boolean).join(' ') || 'Unnamed Person';
      this.addWorkflowStep('person_update', 'completed', `Successfully updated person "${updatedFullName}"`);

      // 6. SUCCESS VALIDATION & STRUCTURED RESPONSE
      const success = !!(updatedPerson && updatedPerson.id === person_id);
      
      return {
        success,
        person: updatedPerson,
        message: `✅ Successfully updated person "${updatedFullName}"`,
        details: {
          id: updatedPerson.id,
          full_name: updatedFullName,
          first_name: updatedPerson.first_name || 'Not specified',
          last_name: updatedPerson.last_name || 'Not specified',
          email: updatedPerson.email || 'Not specified',
          phone: updatedPerson.phone || 'Not specified',
          organization_id: updatedPerson.organization_id || 'No organization',
          updated_at: updatedPerson.updated_at,
          changes_applied: changes.length,
          changed_fields: changes,
          phone_auto_formatted: updateData.phone && processedPhone !== updateData.phone
        },
        workflow_steps: this.workflowSteps
      };

    } catch (error: any) {
      console.error('[UpdatePersonTool] Error:', error);
      
      this.addWorkflowStep('error', 'failed', `Update failed: ${error.message}`);
      
      return {
        success: false,
        error: error.code || 'UPDATE_FAILED',
        message: `❌ Failed to update person: ${error.message}`,
        details: {
          error_type: error.name || 'Unknown',
          error_code: error.code || 'UNKNOWN_ERROR'
        },
        workflow_steps: this.workflowSteps
      };
    }
  }
} 