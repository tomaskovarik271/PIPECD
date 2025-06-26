import { GraphQLError } from 'graphql';
import { GraphQLContext, requireAuthentication, getAccessToken, processZodError, convertToDateOrNull } from '../../helpers';
import { inngest } from '../../../../../lib/inngestClient';
import * as leadService from '../../../../../lib/leadService';
import * as wfmProjectService from '../../../../../lib/wfmProjectService';
import { wfmWorkflowService } from '../../../../../lib/wfmWorkflowService';
import { wfmStatusService } from '../../../../../lib/wfmStatusService';
import { calculateLeadScoreFields } from '../../../../../lib/leadService/leadScoring';
import type { MutationResolvers, Lead as GraphQLLead, LeadInput as GraphQLLeadInput } from '../../../../../lib/generated/graphql';
import type { LeadServiceUpdateData } from '../../../../../lib/leadService/leadCrud';
import { recordEntityHistory, getAuthenticatedClient } from '../../../../../lib/serviceUtils';

export const leadMutations: Pick<MutationResolvers<GraphQLContext>, 'createLead' | 'updateLead' | 'deleteLead' | 'recalculateLeadScore' | 'updateLeadWFMProgress'> = {
    createLead: async (_parent, args, context) => {
      const action = 'creating lead';
      try {
          requireAuthentication(context);
          const userId = context.currentUser!.id;
          const accessToken = getAccessToken(context)!;

          if (!context.userPermissions?.includes('lead:create')) {
               throw new GraphQLError('Forbidden: You do not have permission to create leads.', { extensions: { code: 'FORBIDDEN' } });
          }

          // Prepare the input for leadService.createLead
          const serviceInput: GraphQLLeadInput = {
            name: args.input.name,
            source: args.input.source,
            description: args.input.description,
            contactName: args.input.contactName,
            contactEmail: args.input.contactEmail,
            contactPhone: args.input.contactPhone,
            companyName: args.input.companyName,
            estimatedValue: args.input.estimatedValue,
            estimatedCloseDate: args.input.estimatedCloseDate,
            wfmProjectTypeId: args.input.wfmProjectTypeId,
            customFields: Array.isArray(args.input.customFields) ? args.input.customFields : undefined,
            assignedToUserId: args.input.assignedToUserId,
          };
          
          const newLeadRecord = await leadService.createLead(userId, serviceInput, accessToken);
          
          inngest.send({
            name: 'crm/lead.created',
            data: { lead: newLeadRecord as any }, 
            user: { id: userId, email: context.currentUser!.email! }
          }).catch((err: unknown) => console.error('Failed to send lead.created event to Inngest:', err));

          return {
            id: newLeadRecord.id,
            created_at: newLeadRecord.created_at, 
            updated_at: newLeadRecord.updated_at, 
            name: newLeadRecord.name,
            source: newLeadRecord.source,
            description: newLeadRecord.description,
            contact_name: newLeadRecord.contact_name,
            contact_email: newLeadRecord.contact_email,
            contact_phone: newLeadRecord.contact_phone,
            company_name: newLeadRecord.company_name,
            estimated_value: newLeadRecord.estimated_value,
            estimated_close_date: newLeadRecord.estimated_close_date,
            lead_score: newLeadRecord.lead_score,
            lead_score_factors: newLeadRecord.lead_score_factors,
            assigned_to_user_id: newLeadRecord.assigned_to_user_id,
            assigned_at: newLeadRecord.assigned_at,
            converted_at: newLeadRecord.converted_at,
            converted_to_deal_id: newLeadRecord.converted_to_deal_id,
            converted_to_person_id: newLeadRecord.converted_to_person_id,
            converted_to_organization_id: newLeadRecord.converted_to_organization_id,
            converted_by_user_id: newLeadRecord.converted_by_user_id,
            wfm_project_id: newLeadRecord.wfm_project_id,
            last_activity_at: newLeadRecord.last_activity_at,
            automation_score_factors: newLeadRecord.automation_score_factors,
            ai_insights: newLeadRecord.ai_insights,
            user_id: newLeadRecord.user_id,
            db_custom_field_values: newLeadRecord.custom_field_values,
          } as unknown as GraphQLLead; 
      } catch (error) {
          throw processZodError(error, action);
      }
    },

    updateLead: async (_parent, args, context) => {
      const action = 'updating lead';
      try {
          requireAuthentication(context);
          const userId = context.currentUser!.id;
          const accessToken = getAccessToken(context)!;
          const leadId = args.id;

          if (Object.keys(args.input).length === 0) {
            throw new GraphQLError('Update input cannot be empty.', { extensions: { code: 'BAD_USER_INPUT' } });
          }

          // Fetch existing lead for permission checks
          const existingLead = await leadService.getLeadById(userId, leadId, accessToken);
          if (!existingLead) {
              throw new GraphQLError('Lead not found for update.', { extensions: { code: 'NOT_FOUND' } });
          }

          const canUpdateAny = context.userPermissions?.includes('lead:update_any') || false;
          const canUpdateOwn = context.userPermissions?.includes('lead:update_own') || false;
          const canAssignAnyPerm = context.userPermissions?.includes('lead:assign_any') || false;

          // Full collaboration model: any member can update any lead
          if (!canUpdateAny) {
            throw new GraphQLError('Forbidden: You do not have permission to update this lead.', { extensions: { code: 'FORBIDDEN' } });
          }

          const { customFields, estimatedCloseDate, assignedToUserId, ...otherValidatedDataForService } = args.input;
          const customFieldsForService = Array.isArray(customFields) ? customFields : undefined;

          const serviceInput: LeadServiceUpdateData = {
            name: otherValidatedDataForService.name || undefined,
            source: otherValidatedDataForService.source || undefined,
            description: otherValidatedDataForService.description || undefined,
            contact_name: args.input.contactName || undefined,
            contact_email: args.input.contactEmail || undefined,
            contact_phone: args.input.contactPhone || undefined,
            company_name: args.input.companyName || undefined,
            estimated_value: args.input.estimatedValue || undefined,
            estimated_close_date: args.input.estimatedCloseDate ? new Date(args.input.estimatedCloseDate).toISOString() : undefined,
            lead_score: args.input.leadScore || undefined,
            customFields: customFieldsForService,
          };

          // Only include assigned_to_user_id if it was actually provided in the input
          if (Object.prototype.hasOwnProperty.call(args.input, 'assignedToUserId')) {
            serviceInput.assigned_to_user_id = assignedToUserId;
          }

          const updatedLeadRecord = await leadService.updateLead(userId, leadId, serviceInput, accessToken);
          
          if (!updatedLeadRecord) {
            return null;
          }

          return {
            id: updatedLeadRecord.id,
            created_at: updatedLeadRecord.created_at, 
            updated_at: updatedLeadRecord.updated_at, 
            name: updatedLeadRecord.name,
            source: updatedLeadRecord.source,
            description: updatedLeadRecord.description,
            contact_name: updatedLeadRecord.contact_name,
            contact_email: updatedLeadRecord.contact_email,
            contact_phone: updatedLeadRecord.contact_phone,
            company_name: updatedLeadRecord.company_name,
            estimated_value: updatedLeadRecord.estimated_value,
            estimated_close_date: updatedLeadRecord.estimated_close_date,
            lead_score: updatedLeadRecord.lead_score,
            lead_score_factors: updatedLeadRecord.lead_score_factors,
            assigned_to_user_id: updatedLeadRecord.assigned_to_user_id,
            assigned_at: updatedLeadRecord.assigned_at,
            converted_at: updatedLeadRecord.converted_at,
            converted_to_deal_id: updatedLeadRecord.converted_to_deal_id,
            converted_to_person_id: updatedLeadRecord.converted_to_person_id,
            converted_to_organization_id: updatedLeadRecord.converted_to_organization_id,
            converted_by_user_id: updatedLeadRecord.converted_by_user_id,
            wfm_project_id: updatedLeadRecord.wfm_project_id,
            last_activity_at: updatedLeadRecord.last_activity_at,
            automation_score_factors: updatedLeadRecord.automation_score_factors,
            ai_insights: updatedLeadRecord.ai_insights,
            user_id: updatedLeadRecord.user_id,
            db_custom_field_values: updatedLeadRecord.custom_field_values,
          } as unknown as GraphQLLead; 
      } catch (error) {
          throw processZodError(error, action);
      }
    },

    deleteLead: async (_parent, args, context) => {
      const action = `deleting lead ${args.id}`;
      try {
          requireAuthentication(context);
          const accessToken = getAccessToken(context)!;
          const userId = context.currentUser!.id;

          const success = await leadService.deleteLead(userId, args.id, accessToken);

          if (success) {
            inngest.send({
              name: 'crm/lead.deleted',
              data: { leadId: args.id },
              user: { id: userId, email: context.currentUser!.email! }
            }).catch((err: unknown) => console.error('Failed to send lead.deleted event to Inngest:', err));
          }
          return success;
      } catch (error) {
          throw processZodError(error, action);
      }
    },

    recalculateLeadScore: async (_parent, args, context) => {
      const action = 'recalculating lead score';
      try {
          requireAuthentication(context);
          const userId = context.currentUser!.id;
          const accessToken = getAccessToken(context)!;
          const leadId = args.leadId;

          // Get existing lead for permission checks
          const existingLead = await leadService.getLeadById(userId, leadId, accessToken);
          if (!existingLead) {
              throw new GraphQLError('Lead not found for score recalculation.', { extensions: { code: 'NOT_FOUND' } });
          }

          // Check permissions (same logic as update)
          const canUpdateAny = context.userPermissions?.includes('lead:update_any') || false;
          const canUpdateOwn = context.userPermissions?.includes('lead:update_own') || false;

          // Full collaboration model: any member can recalculate lead score
          if (!canUpdateAny) {
            throw new GraphQLError('Forbidden: You do not have permission to recalculate score for this lead.', { extensions: { code: 'FORBIDDEN' } });
          }

          // Recalculate score using the leadScoring module
          const recalculatedScore = calculateLeadScoreFields(existingLead);

          const serviceInput: LeadServiceUpdateData = {
            lead_score: recalculatedScore.score,
          };

          const updatedLeadRecord = await leadService.updateLead(userId, leadId, serviceInput, accessToken);
          
          if (!updatedLeadRecord) {
            throw new GraphQLError('Failed to recalculate lead score.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
          }

          return {
            id: updatedLeadRecord.id,
            created_at: updatedLeadRecord.created_at, 
            updated_at: updatedLeadRecord.updated_at, 
            name: updatedLeadRecord.name,
            source: updatedLeadRecord.source,
            description: updatedLeadRecord.description,
            contact_name: updatedLeadRecord.contact_name,
            contact_email: updatedLeadRecord.contact_email,
            contact_phone: updatedLeadRecord.contact_phone,
            company_name: updatedLeadRecord.company_name,
            estimated_value: updatedLeadRecord.estimated_value,
            estimated_close_date: updatedLeadRecord.estimated_close_date,
            lead_score: updatedLeadRecord.lead_score,
            lead_score_factors: updatedLeadRecord.lead_score_factors,
            assigned_to_user_id: updatedLeadRecord.assigned_to_user_id,
            assigned_at: updatedLeadRecord.assigned_at,
            converted_at: updatedLeadRecord.converted_at,
            converted_to_deal_id: updatedLeadRecord.converted_to_deal_id,
            converted_to_person_id: updatedLeadRecord.converted_to_person_id,
            converted_to_organization_id: updatedLeadRecord.converted_to_organization_id,
            converted_by_user_id: updatedLeadRecord.converted_by_user_id,
            wfm_project_id: updatedLeadRecord.wfm_project_id,
            last_activity_at: updatedLeadRecord.last_activity_at,
            automation_score_factors: updatedLeadRecord.automation_score_factors,
            ai_insights: updatedLeadRecord.ai_insights,
            user_id: updatedLeadRecord.user_id,
            db_custom_field_values: updatedLeadRecord.custom_field_values,
          } as unknown as GraphQLLead; 
      } catch (error) {
          throw processZodError(error, action);
      }
    },

    updateLeadWFMProgress: async (_parent, args, context) => {
      const action = 'updating lead WFM progress';
      const { leadId, targetWfmWorkflowStepId } = args;
      try {
        requireAuthentication(context);
        const userId = context.currentUser!.id;
        const accessToken = getAccessToken(context)!;
        const supabase = context.supabaseClient;

        // Get existing lead for permission checks and data
        const existingLead = await leadService.getLeadById(userId, leadId, accessToken);
        if (!existingLead) {
            throw new GraphQLError('Lead not found for WFM progress update.', { extensions: { code: 'NOT_FOUND' } });
        }

        if (!existingLead.wfm_project_id) {
            throw new GraphQLError('Lead does not have an associated WFM project.', { extensions: { code: 'BAD_USER_INPUT' } });
        }

        // Check permissions
        const canUpdateAny = context.userPermissions?.includes('lead:update_any') || false;
        const canUpdateOwn = context.userPermissions?.includes('lead:update_own') || false;

        let authorizedToUpdateWFM = false;
        if (canUpdateAny) {
          authorizedToUpdateWFM = true;
        } else if (canUpdateOwn) {
          const isCreator = existingLead.user_id === userId;
          const isCurrentAssignee = existingLead.assigned_to_user_id === userId;
          if (isCreator || isCurrentAssignee) {
              authorizedToUpdateWFM = true;
          }
        }

        if (!authorizedToUpdateWFM) {
          throw new GraphQLError('Forbidden: You do not have permission to update WFM progress for this lead.', { extensions: { code: 'FORBIDDEN' } });
        }

        // Get current project step
        const wfmProject = await wfmProjectService.getWFMProjectById(existingLead.wfm_project_id, context);
        if (!wfmProject) {
            throw new GraphQLError('WFM project not found for this lead.', { extensions: { code: 'NOT_FOUND' } });
        }

        // Get target step details
        const targetStep = await wfmWorkflowService.getStepById(targetWfmWorkflowStepId, context);
        if (!targetStep) {
            throw new GraphQLError('Target WFM step not found.', { extensions: { code: 'NOT_FOUND' } });
        }

        // Validate transition is allowed
        const currentStepId = (wfmProject as any).current_step_id || wfmProject.currentStep?.id;
        
        if (currentStepId) {
            const isValidTransition = await wfmWorkflowService.validateTransition(
                (targetStep as any).workflow_id, 
                currentStepId, 
                targetWfmWorkflowStepId, 
                context
            );
            if (!isValidTransition) {
                throw new GraphQLError('Invalid workflow transition.', { extensions: { code: 'BAD_USER_INPUT' } });
            }
        }

        // Update WFM project step
        const updatedProject = await wfmProjectService.updateWFMProjectStep(
            existingLead.wfm_project_id,
            targetWfmWorkflowStepId,
            userId,
            context
        );

        // Record the transition in history
        await recordEntityHistory(
            supabase,
            'lead_history',
            'lead_id',
            leadId,
            userId,
            'WFM_STEP_CHANGED',
            {
                previous_step_id: currentStepId,
                new_step_id: targetWfmWorkflowStepId,
                workflow_id: (targetStep as any).workflow_id
            }
        );

        // Return updated lead
        const updatedLead = await leadService.getLeadById(userId, leadId, accessToken);
        if (!updatedLead) {
            throw new GraphQLError('Failed to fetch updated lead after WFM progress update.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
        }

        return {
          id: updatedLead.id,
          created_at: updatedLead.created_at, 
          updated_at: updatedLead.updated_at, 
          name: updatedLead.name,
          source: updatedLead.source,
          description: updatedLead.description,
          contact_name: updatedLead.contact_name,
          contact_email: updatedLead.contact_email,
          contact_phone: updatedLead.contact_phone,
          company_name: updatedLead.company_name,
          estimated_value: updatedLead.estimated_value,
          estimated_close_date: updatedLead.estimated_close_date,
          lead_score: updatedLead.lead_score,
          lead_score_factors: updatedLead.lead_score_factors,
          assigned_to_user_id: updatedLead.assigned_to_user_id,
          assigned_at: updatedLead.assigned_at,
          converted_at: updatedLead.converted_at,
          converted_to_deal_id: updatedLead.converted_to_deal_id,
          converted_to_person_id: updatedLead.converted_to_person_id,
          converted_to_organization_id: updatedLead.converted_to_organization_id,
          converted_by_user_id: updatedLead.converted_by_user_id,
          wfm_project_id: updatedLead.wfm_project_id,
          last_activity_at: updatedLead.last_activity_at,
          automation_score_factors: updatedLead.automation_score_factors,
          ai_insights: updatedLead.ai_insights,
          user_id: updatedLead.user_id,
          db_custom_field_values: updatedLead.custom_field_values,
        } as unknown as GraphQLLead;

      } catch (error) {
        throw processZodError(error, action);
      }
    }
}; 