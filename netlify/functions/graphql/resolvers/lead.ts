// Resolvers for Lead type fields
import { GraphQLError, GraphQLResolveInfo } from 'graphql';
import { GraphQLContext, requireAuthentication, getAccessToken } from '../helpers';
import { personService } from '../../../../lib/personService';
import { organizationService } from '../../../../lib/organizationService';
import { dealService } from '../../../../lib/dealService';
import { activityService } from '../../../../lib/activityService';
import type {
    LeadResolvers,
    Person,
    Organization,
    Deal,
    Lead as GraphQLLeadParent,
    CustomFieldValue as GraphQLCustomFieldValue,
    CustomFieldDefinition as GraphQLCustomFieldDefinition,
    Activity as GraphQLActivity,
    WfmProject,
    WfmWorkflowStep,
    WfmStatus,
    User as GraphQLUser
} from '../../../../lib/generated/graphql';
import { CustomFieldEntityType, CustomFieldType } from '../../../../lib/generated/graphql';
import { getAuthenticatedClient } from '../../../../lib/serviceUtils';
import * as customFieldDefinitionService from '../../../../lib/customFieldDefinitionService';
import * as wfmProjectService from '../../../../lib/wfmProjectService';
import { wfmWorkflowService } from '../../../../lib/wfmWorkflowService';
import { wfmStatusService } from '../../../../lib/wfmStatusService';
import { getServiceLevelUserProfileData } from '../../../../lib/userProfileService';

interface RawDbWfmProject {
  id: string;
  current_step_id?: string | null;
}

export const Lead: LeadResolvers<GraphQLContext> = {
    converted_to_person: async (parent: GraphQLLeadParent, _args: any, context: GraphQLContext): Promise<Person | null> => {
      if (!parent.converted_to_person_id) return null;
      requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      try {
         const personRecord = await personService.getPersonById(context.currentUser!.id, parent.converted_to_person_id, accessToken);
         if (!personRecord) return null;
         return {
            id: personRecord.id,
            created_at: personRecord.created_at,
            updated_at: personRecord.updated_at,
            user_id: personRecord.user_id,
            first_name: personRecord.first_name,
            last_name: personRecord.last_name,
            email: personRecord.email,
            phone: personRecord.phone,
            notes: personRecord.notes,
            organization_id: personRecord.organization_id,
         } as Person;
      } catch (e) {
          console.error(`Error fetching converted person ${parent.converted_to_person_id} for lead ${parent.id}:`, e);
          return null; 
      }
    },
    converted_to_organization: async (parent: GraphQLLeadParent, _args: any, context: GraphQLContext): Promise<Organization | null> => {
      if (!parent.converted_to_organization_id) return null;
      requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      try {
        const orgRecord = await organizationService.getOrganizationById(context.currentUser!.id, parent.converted_to_organization_id, accessToken);
        if (!orgRecord) return null;
        return {
          id: orgRecord.id,
          name: orgRecord.name,
          address: orgRecord.address,
          notes: orgRecord.notes,
          user_id: orgRecord.user_id,
          created_at: orgRecord.created_at,
          updated_at: orgRecord.updated_at,
        } as Organization;
      } catch (e) {
        console.error(`Error fetching converted organization ${parent.converted_to_organization_id} for lead ${parent.id}:`, e);
        return null;
      }
    },
    converted_to_deal: async (parent: GraphQLLeadParent, _args: any, context: GraphQLContext): Promise<Deal | null> => {
      if (!parent.converted_to_deal_id) return null;
      requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      try {
        const dealRecord = await dealService.getDealById(context.currentUser!.id, parent.converted_to_deal_id, accessToken);
        if (!dealRecord) return null;
        return {
          id: dealRecord.id,
          name: dealRecord.name,
          amount: dealRecord.amount,
          expected_close_date: dealRecord.expected_close_date,
          user_id: dealRecord.user_id,
          person_id: dealRecord.person_id,
          organization_id: dealRecord.organization_id,
          deal_specific_probability: dealRecord.deal_specific_probability,
          assigned_to_user_id: dealRecord.assigned_to_user_id,
          wfm_project_id: dealRecord.wfm_project_id,
          created_at: dealRecord.created_at,
          updated_at: dealRecord.updated_at,
        } as unknown as Deal;
      } catch (e) {
        console.error(`Error fetching converted deal ${parent.converted_to_deal_id} for lead ${parent.id}:`, e);
        return null;
      }
    },
    activities: async (parent: GraphQLLeadParent, _args: any, context: GraphQLContext): Promise<GraphQLActivity[]> => {
      if (!parent.id) {
        console.error('Lead ID missing in parent object for activities resolver.');
        return [];
      }
      requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      const currentUserId = context.currentUser!.id;
      try {
        const activitiesFromService = await activityService.getActivities(currentUserId, accessToken, { leadId: parent.id });
        return activitiesFromService.map((activity): GraphQLActivity => {
          const mappedActivity: GraphQLActivity = {
            ...activity,
            user: activity.user,
            deal: activity.deal,
            person: activity.person,
            organization: activity.organization,
            created_at: new Date(activity.created_at),
            updated_at: new Date(activity.updated_at),
            due_date: activity.due_date ? new Date(activity.due_date) : null,
          };
          return mappedActivity;
        });
      } catch (error) {
        console.error(`Error fetching activities for lead ${parent.id}:`, error);
        return [];
      }
    },
    customFieldValues: async (parent: GraphQLLeadParent & { db_custom_field_values?: Record<string, any> }, _args: any, context: GraphQLContext): Promise<GraphQLCustomFieldValue[]> => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      const supabase = getAuthenticatedClient(accessToken);
      const leadSpecificValues = parent.db_custom_field_values || {};
      if (Object.keys(leadSpecificValues).length === 0) {
        return [];
      }
      try {
        const definitions: GraphQLCustomFieldDefinition[] = await customFieldDefinitionService.getCustomFieldDefinitions(
          supabase,
          CustomFieldEntityType.Lead,
          false
        );
        if (!definitions || definitions.length === 0) {
          return [];
        }
        const mappedValues: GraphQLCustomFieldValue[] = definitions
          .map((definition: GraphQLCustomFieldDefinition) => {
            const rawValue = leadSpecificValues[definition.fieldName];
            const fieldValue: GraphQLCustomFieldValue = {
              definition: definition,
              stringValue: null,
              numberValue: null,
              booleanValue: null,
              dateValue: null,
              selectedOptionValues: null,
            };
            if (rawValue === undefined || rawValue === null) {
              return fieldValue; 
            }
            switch (definition.fieldType) {
              case CustomFieldType.Text:
              case CustomFieldType.TextArea:
                if (typeof rawValue.stringValue === 'string') {
                  fieldValue.stringValue = rawValue.stringValue;
                }
                break;
              case CustomFieldType.Number:
                if (typeof rawValue.numberValue === 'number') {
                  fieldValue.numberValue = rawValue.numberValue;
                }
                break;
              case CustomFieldType.Boolean:
                if (typeof rawValue.booleanValue === 'boolean') {
                  fieldValue.booleanValue = rawValue.booleanValue;
                }
                break;
              case CustomFieldType.Date:
                if (rawValue.dateValue) {
                  try {
                    fieldValue.dateValue = new Date(rawValue.dateValue);
                  } catch (e) {
                    console.warn(`Invalid date value for custom field ${definition.fieldName} on lead ${parent.id}:`, rawValue.dateValue);
                  }
                }
                break;
              case CustomFieldType.Dropdown:
                if (typeof rawValue.selectedOptionValues === 'string') {
                  fieldValue.selectedOptionValues = [rawValue.selectedOptionValues];
                } else if (Array.isArray(rawValue.selectedOptionValues)) {
                  fieldValue.selectedOptionValues = rawValue.selectedOptionValues.filter((val: any) => typeof val === 'string');
                }
                break;
              case CustomFieldType.MultiSelect:
                if (Array.isArray(rawValue.selectedOptionValues)) {
                  fieldValue.selectedOptionValues = rawValue.selectedOptionValues.filter((val: any) => typeof val === 'string');
                } else if (typeof rawValue.selectedOptionValues === 'string') {
                  fieldValue.selectedOptionValues = [rawValue.selectedOptionValues];
                }
                break;
              default:
                console.warn(`Unknown custom field type: ${definition.fieldType} for field ${definition.fieldName} on lead ${parent.id}`);
            }
            return fieldValue;
          })
          .filter((fieldValue) => {
            const hasSelectedOptions = fieldValue.selectedOptionValues !== null && fieldValue.selectedOptionValues !== undefined && fieldValue.selectedOptionValues.length > 0;
            return fieldValue.stringValue !== null ||
                   fieldValue.numberValue !== null ||
                   fieldValue.booleanValue !== null ||
                   fieldValue.dateValue !== null ||
                   hasSelectedOptions;
          });

        return mappedValues;
      } catch (error) {
        console.error(`Error fetching custom field values for lead ${parent.id}:`, error);
        return [];
      }
    },
    createdBy: async (parent: GraphQLLeadParent, _args: any, context: GraphQLContext): Promise<GraphQLUser> => {
      const userId = parent.user_id;
      if (!userId) {
        throw new GraphQLError(`Lead ${parent.id} is missing a user_id (creator).`);
      }
      try {
        const userProfile = await getServiceLevelUserProfileData(userId);
        if (!userProfile) {
          throw new GraphQLError(`User profile not found for lead creator: ${userId}`);
        }
        return {
          id: userProfile.user_id,
          email: userProfile.email || `user_${userProfile.user_id}@unknown.com`,
          created_at: new Date(),
          updated_at: new Date(),
        } as GraphQLUser;
      } catch (error) {
        console.error(`Error fetching creator user for lead ${parent.id}:`, error);
        throw new GraphQLError(`Failed to fetch creator information for lead ${parent.id}.`);
      }
    },
    assignedToUser: async (parent: GraphQLLeadParent, _args: any, context: GraphQLContext): Promise<GraphQLUser | null> => {
      const assignedUserId = parent.assigned_to_user_id;
      if (!assignedUserId) {
        return null;
      }
      try {
        const userProfile = await getServiceLevelUserProfileData(assignedUserId);
        if (!userProfile) {
          console.warn(`Assigned user profile not found for lead ${parent.id}: ${assignedUserId}`);
          return null;
        }
        return {
          id: userProfile.user_id,
          email: userProfile.email || `user_${userProfile.user_id}@unknown.com`,
          created_at: new Date(),
          updated_at: new Date(),
        } as GraphQLUser;
      } catch (error) {
        console.error(`Error fetching assigned user for lead ${parent.id}:`, error);
        return null;
      }
    },
    converted_by_user: async (parent: GraphQLLeadParent, _args: any, context: GraphQLContext): Promise<GraphQLUser | null> => {
      const convertedByUserId = parent.converted_by_user_id;
      if (!convertedByUserId) {
        return null;
      }
      try {
        const userProfile = await getServiceLevelUserProfileData(convertedByUserId);
        if (!userProfile) {
          console.warn(`Converted by user profile not found for lead ${parent.id}: ${convertedByUserId}`);
          return null;
        }
        return {
          id: userProfile.user_id,
          email: userProfile.email || `user_${userProfile.user_id}@unknown.com`,
          created_at: new Date(),
          updated_at: new Date(),
        } as GraphQLUser;
      } catch (error) {
        console.error(`Error fetching converted by user for lead ${parent.id}:`, error);
        return null;
      }
    },
    wfmProject: async (parent: GraphQLLeadParent, _args: any, context: GraphQLContext): Promise<WfmProject | null> => {
      if (!parent.wfm_project_id) {
        return null;
      }
      try {
        const wfmProject = await wfmProjectService.getWFMProjectById(parent.wfm_project_id, context);
        return wfmProject;
      } catch (error) {
        console.error(`Error fetching WFM project for lead ${parent.id}:`, error);
        return null;
      }
    },
    currentWfmStep: async (parent: GraphQLLeadParent, _args: any, context: GraphQLContext): Promise<WfmWorkflowStep | null> => {
      if (!parent.wfm_project_id) {
        return null;
      }
              // console.log(`[Resolver.Lead.currentWfmStep] For lead ${parent.id}, WFMProject ID: ${parent.wfm_project_id}`);
      try {
        const wfmProject = await wfmProjectService.getWFMProjectById(parent.wfm_project_id, context) as RawDbWfmProject | null;
        if (!wfmProject || !wfmProject.current_step_id) {
          console.log(`[Resolver.Lead.currentWfmStep] WFMProject ${parent.wfm_project_id} or its current_step_id not found.`);
          return null;
        }
                  // console.log(`[Resolver.Lead.currentWfmStep] Found current_step_id: ${wfmProject.current_step_id}`);
        const step = await wfmWorkflowService.getStepById(wfmProject.current_step_id, context);
        if (!step) {
          console.warn(`[Resolver.Lead.currentWfmStep] Step object not found for ID: ${wfmProject.current_step_id} (via Lead ${parent.id})`);
          return null;
        }
        return step as unknown as WfmWorkflowStep;
      } catch (error) {
        console.error(`Error fetching current WFM step for lead ${parent.id}:`, error);
        return null;
      }
    },
    currentWfmStatus: async (parent: GraphQLLeadParent, _args: any, context: GraphQLContext): Promise<WfmStatus | null> => {
      if (!parent.wfm_project_id) {
        return null;
      }
              // console.log(`[Resolver.Lead.currentWfmStatus] For lead ${parent.id}, WFMProject ID: ${parent.wfm_project_id}`);
      try {
        const wfmProject = await wfmProjectService.getWFMProjectById(parent.wfm_project_id, context) as RawDbWfmProject | null;
        if (!wfmProject || !wfmProject.current_step_id) {
          console.log(`[Resolver.Lead.currentWfmStatus] WFMProject ${parent.wfm_project_id} or its current_step_id not found.`);
          return null;
        }
                  // console.log(`[Resolver.Lead.currentWfmStatus] Found current_step_id: ${wfmProject.current_step_id}`);
        const stepData = await wfmWorkflowService.getStepById(wfmProject.current_step_id, context);
        if (!stepData || !stepData.status_id) {
          console.log(`[Resolver.Lead.currentWfmStatus] Step ${wfmProject.current_step_id} or its status_id not found.`);
          return null;
        }
                  // console.log(`[Resolver.Lead.currentWfmStatus] Found status_id: ${stepData.status_id}`);
        const status = await wfmStatusService.getById(stepData.status_id, context);
        if (!status) {
          console.warn(`[Resolver.Lead.currentWfmStatus] Status object not found for ID: ${stepData.status_id} (via Lead ${parent.id})`);
          return null;
        }
        return status;
      } catch (error) {
        console.error(`Error fetching current WFM status for lead ${parent.id}:`, error);
        return null;
      }
    },
    history: async (parent: GraphQLLeadParent, args: { limit?: number | null; offset?: number | null }, context: GraphQLContext) => {
      if (!parent.id) {
        return [];
      }
      requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      const supabase = getAuthenticatedClient(accessToken);
      
      const limit = args.limit || 50;
      const offset = args.offset || 0;
      
      try {
        const { data, error } = await supabase
          .from('lead_history')
          .select('id, lead_id, user_id, event_type, changes, created_at')
          .eq('lead_id', parent.id)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);
          
        if (error) {
          console.error(`Error fetching history for lead ${parent.id}:`, error);
          return [];
        }
        
        return (data || []).map((historyItem: any) => ({
          id: historyItem.id,
          lead_id: historyItem.lead_id,
          user_id: historyItem.user_id,
          event_type: historyItem.event_type,
          changes: historyItem.changes,
          created_at: new Date(historyItem.created_at),
        }));
      } catch (error) {
        console.error(`Error fetching history for lead ${parent.id}:`, error);
        return [];
      }
    },
    isQualified: async (parent: GraphQLLeadParent, _args: any, context: GraphQLContext): Promise<boolean> => {
      if (!parent.wfm_project_id) {
        return false; // No WFM project = not qualified
      }
      
      try {
        const accessToken = getAccessToken(context);
        if (!accessToken) {
          console.warn(`[Lead.isQualified] No access token for lead ${parent.id}`);
          return false;
        }
        const supabase = getAuthenticatedClient(accessToken);
        
        // Get current WFM step metadata (following deal weighted_amount pattern)
        const { data: wfmProject, error: projectError } = await supabase
          .from('wfm_projects')
          .select('current_step_id')
          .eq('id', parent.wfm_project_id)
          .single();

        if (projectError || !wfmProject || !wfmProject.current_step_id) {
          console.warn(`[Lead.isQualified] Could not fetch WFM project or current_step_id for lead ${parent.id}. Project ID: ${parent.wfm_project_id}`, projectError);
          return false;
        }

        const { data: wfmStep, error: stepError } = await supabase
          .from('workflow_steps')
          .select('metadata')
          .eq('id', wfmProject.current_step_id)
          .single();

        if (stepError || !wfmStep) {
          console.warn(`[Lead.isQualified] Could not fetch WFM step ${wfmProject.current_step_id} for lead ${parent.id}.`, stepError);
          return false;
        }

        const metadata = wfmStep.metadata as any;
        if (typeof metadata === 'object' && metadata !== null && typeof metadata.is_qualified === 'number') {
          return metadata.is_qualified === 1;
        }
        
        return false;
      } catch (error) {
        console.error(`Error fetching qualification status for lead ${parent.id}:`, error);
        return false;
      }
    },
    qualificationLevel: async (parent: GraphQLLeadParent, _args: any, context: GraphQLContext): Promise<number> => {
      if (!parent.wfm_project_id) {
        return 0.0; // No WFM project = 0% qualified
      }
      
      try {
        const accessToken = getAccessToken(context);
        if (!accessToken) {
          console.warn(`[Lead.qualificationLevel] No access token for lead ${parent.id}`);
          return 0.0;
        }
        const supabase = getAuthenticatedClient(accessToken);
        
        // Get current WFM step metadata
        const { data: wfmProject, error: projectError } = await supabase
          .from('wfm_projects')
          .select('current_step_id')
          .eq('id', parent.wfm_project_id)
          .single();

        if (projectError || !wfmProject || !wfmProject.current_step_id) {
          console.warn(`[Lead.qualificationLevel] Could not fetch WFM project or current_step_id for lead ${parent.id}. Project ID: ${parent.wfm_project_id}`, projectError);
          return 0.0;
        }

        const { data: wfmStep, error: stepError } = await supabase
          .from('workflow_steps')
          .select('metadata')
          .eq('id', wfmProject.current_step_id)
          .single();

        if (stepError || !wfmStep) {
          console.warn(`[Lead.qualificationLevel] Could not fetch WFM step ${wfmProject.current_step_id} for lead ${parent.id}.`, stepError);
          return 0.0;
        }

        const metadata = wfmStep.metadata as any;
        if (typeof metadata === 'object' && metadata !== null && typeof metadata.lead_qualification_level === 'number') {
          return metadata.lead_qualification_level;
        }
        
        return 0.0;
      } catch (error) {
        console.error(`Error fetching qualification level for lead ${parent.id}:`, error);
        return 0.0;
      }
    },
    qualificationStatus: async (parent: GraphQLLeadParent, _args: any, context: GraphQLContext): Promise<string> => {
      if (!parent.wfm_project_id) {
        return 'OPEN'; // No WFM project = OPEN status
      }
      
      try {
        const accessToken = getAccessToken(context);
        if (!accessToken) {
          console.warn(`[Lead.qualificationStatus] No access token for lead ${parent.id}`);
          return 'OPEN';
        }
        const supabase = getAuthenticatedClient(accessToken);
        
        // Get current WFM step metadata
        const { data: wfmProject, error: projectError } = await supabase
          .from('wfm_projects')
          .select('current_step_id')
          .eq('id', parent.wfm_project_id)
          .single();

        if (projectError || !wfmProject || !wfmProject.current_step_id) {
          console.warn(`[Lead.qualificationStatus] Could not fetch WFM project or current_step_id for lead ${parent.id}. Project ID: ${parent.wfm_project_id}`, projectError);
          return 'OPEN';
        }

        const { data: wfmStep, error: stepError } = await supabase
          .from('workflow_steps')
          .select('metadata')
          .eq('id', wfmProject.current_step_id)
          .single();

        if (stepError || !wfmStep) {
          console.warn(`[Lead.qualificationStatus] Could not fetch WFM step ${wfmProject.current_step_id} for lead ${parent.id}.`, stepError);
          return 'OPEN';
        }

        const metadata = wfmStep.metadata as any;
        if (typeof metadata === 'object' && metadata !== null && typeof metadata.outcome_type === 'string') {
          return metadata.outcome_type;
        }
        
        return 'OPEN';
      } catch (error) {
        console.error(`Error fetching qualification status for lead ${parent.id}:`, error);
        return 'OPEN';
      }
    },
}; 