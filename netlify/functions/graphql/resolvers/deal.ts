// Resolvers for Deal type fields
import { GraphQLError, GraphQLResolveInfo } from 'graphql';
import { GraphQLContext, requireAuthentication, getAccessToken } from '../helpers';
import { personService } from '../../../../lib/personService';
import { organizationService } from '../../../../lib/organizationService';
import * as activityService from '../../../../lib/activityService';
import type {
    DealResolvers,
    Person,
    Organization,
    Deal as GraphQLDealParent,
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

export const Deal: DealResolvers<GraphQLContext> = {
    person: async (parent: GraphQLDealParent, _args: any, context: GraphQLContext): Promise<Person | null> => {
      if (!parent.person_id) return null;
      requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      try {
         const personRecord = await personService.getPersonById(context.currentUser!.id, parent.person_id, accessToken);
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
          console.error(`Error fetching person ${parent.person_id} for deal ${parent.id}:`, e);
          return null;
      }
    },
    organization: async (parent: GraphQLDealParent, _args: any, context: GraphQLContext): Promise<Organization | null> => {
      if (!parent.organization_id) return null;
      requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      try {
        const orgRecord = await organizationService.getOrganizationById(context.currentUser!.id, parent.organization_id, accessToken);
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
        console.error(`Error fetching organization ${parent.organization_id} for deal ${parent.id}:`, e);
        return null;
      }
    },
    weighted_amount: async (parent: GraphQLDealParent, _args: any, context: GraphQLContext, _info: GraphQLResolveInfo): Promise<number | null> => {
        const { token } = context;
        const currentAmount = parent.amount;

        if (typeof currentAmount !== 'number') {
            return null; // Cannot calculate without an amount
        }

        let effectiveProbability: number | null = null;

        if (typeof parent.deal_specific_probability === 'number') {
            effectiveProbability = parent.deal_specific_probability;
        } else {
            // deal_specific_probability is null, try to derive from WFM step
            if (parent.wfm_project_id && token) {
                const supabase = getAuthenticatedClient(token); // Now token is guaranteed to be a string
                try {
                    const { data: wfmProject, error: projectError } = await supabase
                        .from('wfm_projects')
                        .select('current_step_id')
                        .eq('id', parent.wfm_project_id)
                        .single();

                    if (projectError || !wfmProject || !wfmProject.current_step_id) {
                        console.warn(`[Deal.weighted_amount] Could not fetch WFM project or current_step_id for deal ${parent.id}. Project ID: ${parent.wfm_project_id}`, projectError);
                        // Proceed without WFM derived probability
                    } else {
                        const { data: wfmStep, error: stepError } = await supabase
                            .from('workflow_steps')
                            .select('metadata')
                            .eq('id', wfmProject.current_step_id)
                            .single();

                        if (stepError || !wfmStep) {
                            console.warn(`[Deal.weighted_amount] Could not fetch WFM step ${wfmProject.current_step_id} for deal ${parent.id}.`, stepError);
                            // Proceed without WFM derived probability
                        } else {
                            const metadata = wfmStep.metadata as any;
                            if (typeof metadata === 'object' && metadata !== null) {
                                if (metadata.outcome_type === 'WON') {
                                    effectiveProbability = 1.0;
                                } else if (metadata.outcome_type === 'LOST') {
                                    effectiveProbability = 0.0;
                                } else if (metadata.outcome_type === 'OPEN' && typeof metadata.deal_probability === 'number') {
                                    effectiveProbability = metadata.deal_probability;
                                }
                            }
                        }
                    }
                } catch (e: any) {
                    console.error(`[Deal.weighted_amount] Error fetching WFM data for deal ${parent.id}: ${e.message}`);
                    // Proceed without WFM derived probability on error
                }
            }
        }

        if (effectiveProbability !== null) {
            return currentAmount * effectiveProbability;
        }

        return null; // Default to null if probability cannot be determined
    },
    activities: async (parent: GraphQLDealParent, _args: any, context: GraphQLContext): Promise<GraphQLActivity[]> => {
      if (!parent.id) {
        console.error('Deal ID missing in parent object for activities resolver.');
        return [];
      }
      requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      const currentUserId = context.currentUser!.id;
      try {
        const activitiesFromService = await activityService.getActivities(currentUserId, accessToken, { dealId: parent.id });
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
        console.error(`Error fetching activities for deal ${parent.id}:`, error);
        return [];
      }
    },
    customFieldValues: async (parent: GraphQLDealParent & { db_custom_field_values?: Record<string, any> }, _args: any, context: GraphQLContext): Promise<GraphQLCustomFieldValue[]> => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      const supabase = getAuthenticatedClient(accessToken);
      const dealSpecificValues = parent.db_custom_field_values || {};
      if (Object.keys(dealSpecificValues).length === 0) {
        return [];
      }
      try {
        const definitions: GraphQLCustomFieldDefinition[] = await customFieldDefinitionService.getCustomFieldDefinitions(
          supabase,
          CustomFieldEntityType.Deal,
          false
        );
        if (!definitions || definitions.length === 0) {
          return [];
        }
        const mappedValues: GraphQLCustomFieldValue[] = definitions
          .map((definition: GraphQLCustomFieldDefinition) => {
            const rawValue = dealSpecificValues[definition.fieldName];
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
                fieldValue.stringValue = String(rawValue);
                break;
              case CustomFieldType.Number:
                const num = parseFloat(rawValue);
                if (!isNaN(num)) {
                  fieldValue.numberValue = num;
                }
                break;
              case CustomFieldType.Boolean:
                fieldValue.booleanValue = Boolean(rawValue);
                break;
              case CustomFieldType.Date:
                fieldValue.dateValue = rawValue;
                fieldValue.stringValue = String(rawValue);
                break;
              case CustomFieldType.Dropdown:
                if (Array.isArray(rawValue) && rawValue.length > 0) {
                  fieldValue.selectedOptionValues = [String(rawValue[0])];
                  fieldValue.stringValue = String(rawValue[0]);
                } else if (typeof rawValue === 'string') {
                  fieldValue.selectedOptionValues = [rawValue];
                  fieldValue.stringValue = rawValue;
                }
                break;
              case CustomFieldType.MultiSelect:
                if (Array.isArray(rawValue)) {
                  fieldValue.selectedOptionValues = rawValue.map(String);
                }
                break;
              default:
                console.warn(`Unhandled custom field type: ${definition.fieldType as string} for definition ${definition.fieldName}`);
            }
            return fieldValue;
          });
        console.log(`[Resolver Deal.customFieldValues] For Deal ${parent.id}, resolvedValues (before any accidental filter):`, JSON.stringify(mappedValues, null, 2));
        return mappedValues;
      } catch (error) {
        console.error(`Error resolving customFieldValues for deal ${parent.id}:`, error);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Could not resolve custom field values for the deal.', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },
    history: async (parent: GraphQLDealParent, args: any, context: GraphQLContext, info: GraphQLResolveInfo) => {
      requireAuthentication(context);
      const token = getAccessToken(context);
      if (!token) {
        throw new GraphQLError('Authentication token not found.', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      const supabase = getAuthenticatedClient(token);
      const limit = args.limit || 20;
      const offset = args.offset || 0;
      const { data, error } = await supabase
        .from('deal_history')
        .select('*')
        .eq('deal_id', parent.id)
        .order('created_at', { ascending: false })
        .limit(limit)
        .range(offset, offset + limit - 1);
      if (error) {
        console.error('Error fetching deal history for deal:', parent.id, error);
        throw new GraphQLError('Could not fetch deal history.');
      }
      console.log('[Deal.history resolver] Raw data for deal_id', parent.id, ':', JSON.stringify(data, null, 2));
      return data || [];
    },
    wfmProject: async (parent: GraphQLDealParent, _args, context: GraphQLContext): Promise<WfmProject | null> => {
      if (!parent.wfm_project_id) {
        return null;
      }
      console.log(`[Resolver.Deal.wfmProject] For deal ${parent.id}, fetching WFMProject ID: ${parent.wfm_project_id}`);
      try {
        const projectData = await wfmProjectService.getWFMProjectById(parent.wfm_project_id, context);
        if (!projectData) {
          console.error(`[Resolver.Deal.wfmProject] WFMProject not found with ID: ${parent.wfm_project_id} for deal ${parent.id}`);
          return null;
        }
        return projectData as any;
      } catch (error) {
        console.error(`[Resolver.Deal.wfmProject] Error fetching WFMProject ID ${parent.wfm_project_id} for deal ${parent.id}:`, error);
        return null;
      }
    },
    currentWfmStep: async (parent: GraphQLDealParent, _args, context: GraphQLContext): Promise<WfmWorkflowStep | null> => {
      if (!parent.wfm_project_id) {
        return null;
      }
      console.log(`[Resolver.Deal.currentWfmStep] For deal ${parent.id}, WFMProject ID: ${parent.wfm_project_id}`);
      try {
        const projectData = await wfmProjectService.getWFMProjectById(parent.wfm_project_id, context) as RawDbWfmProject | null;
        if (!projectData || !projectData.current_step_id) {
          console.log(`[Resolver.Deal.currentWfmStep] WFMProject ${parent.wfm_project_id} or its current_step_id not found.`);
          return null;
        }
        console.log(`[Resolver.Deal.currentWfmStep] Found current_step_id: ${projectData.current_step_id}`);
        const step = await wfmWorkflowService.getStepById(projectData.current_step_id, context);
        if (!step) {
             console.warn(`[Resolver.Deal.currentWfmStep] Step object not found for ID: ${projectData.current_step_id} (via Deal ${parent.id})`);
             return null;
        }
        return step as unknown as WfmWorkflowStep;
      } catch (error) {
        console.error(`[Resolver.Deal.currentWfmStep] Error deriving currentWfmStep for deal ${parent.id}:`, error);
        return null;
      }
    },
    currentWfmStatus: async (parent: GraphQLDealParent, _args, context: GraphQLContext): Promise<WfmStatus | null> => {
      if (!parent.wfm_project_id) {
        return null;
      }
      console.log(`[Resolver.Deal.currentWfmStatus] For deal ${parent.id}, WFMProject ID: ${parent.wfm_project_id}`);
      try {
        const projectData = await wfmProjectService.getWFMProjectById(parent.wfm_project_id, context) as RawDbWfmProject | null;
        if (!projectData || !projectData.current_step_id) {
          console.log(`[Resolver.Deal.currentWfmStatus] WFMProject ${parent.wfm_project_id} or its current_step_id not found.`);
          return null;
        }
        console.log(`[Resolver.Deal.currentWfmStatus] Found current_step_id: ${projectData.current_step_id}`);
        const stepData = await wfmWorkflowService.getStepById(projectData.current_step_id, context);
        if (!stepData || !stepData.status_id) {
          console.log(`[Resolver.Deal.currentWfmStatus] Step ${projectData.current_step_id} or its status_id not found.`);
          return null;
        }
        console.log(`[Resolver.Deal.currentWfmStatus] Found status_id: ${stepData.status_id}`);
        const status = await wfmStatusService.getById(stepData.status_id, context);
        if (!status) {
            console.warn(`[Resolver.Deal.currentWfmStatus] Status object not found for ID: ${stepData.status_id} (via Deal ${parent.id})`);
            return null;
        }
        return status;
      } catch (error) {
        console.error(`[Resolver.Deal.currentWfmStatus] Error deriving currentWfmStatus for deal ${parent.id}:`, error);
        return null;
      }
    },
    createdBy: async (parent: GraphQLDealParent, _args: any, context: GraphQLContext): Promise<GraphQLUser> => {
        // The parent.user_id is the ID of the user who created the deal.
        // This field is non-nullable in the schema for Deal.user_id and Deal.createdBy.
        const creatorUserId = parent.user_id; 
        if (!creatorUserId) {
            // This should ideally not happen if DB constraints and service layer ensure user_id is set.
            console.error(`[DealResolver.createdBy] Creator user ID (user_id) is missing on deal ${parent.id}.`);
            throw new GraphQLError('Creator user ID is missing for the deal.', {
                extensions: { code: 'INTERNAL_SERVER_ERROR' },
            });
        }
        try {
            const userProfileData = await getServiceLevelUserProfileData(creatorUserId);
            if (!userProfileData) {
                console.error(`[DealResolver.createdBy] User profile data not found for creator user ID ${creatorUserId} on deal ${parent.id}.`);
                // According to schema, createdBy is non-nullable.
                throw new GraphQLError('Could not fetch creator user profile.', {
                    extensions: { code: 'INTERNAL_SERVER_ERROR' },
                });
            }
            return {
                id: userProfileData.user_id, // Make sure this matches the GraphQL User type's ID field
                email: userProfileData.email, // Make sure this matches
                display_name: userProfileData.display_name || userProfileData.email, // Fallback for name
                avatar_url: userProfileData.avatar_url,
            } as GraphQLUser; // Cast to ensure it matches the GraphQL User type
        } catch (error: any) {
            console.error(`[DealResolver.createdBy] Error fetching creator user for deal ${parent.id}:`, error.message);
            if (error instanceof GraphQLError) throw error;
            // Throw a generic error as createdBy is non-nullable
            throw new GraphQLError('Could not fetch creator user due to an internal error.', {
                extensions: { code: 'INTERNAL_SERVER_ERROR', originalError: error.message },
            });
        }
    },
    assignedToUser: async (parent: GraphQLDealParent, _args: any, context: GraphQLContext): Promise<GraphQLUser | null> => {
        const assignedToUserId = parent.assigned_to_user_id;
        console.log(`[DealResolver.assignedToUser] Processing deal ${parent.id}, assigned_to_user_id: ${assignedToUserId}`);

        if (!assignedToUserId) {
            return null;
        }
        try {
            const userProfileData = await getServiceLevelUserProfileData(assignedToUserId);
            console.log(`[DealResolver.assignedToUser] For deal ${parent.id}, userProfileData from getServiceLevelUserProfileData for user ${assignedToUserId}:`, JSON.stringify(userProfileData, null, 2));

            if (!userProfileData) {
                console.warn(`[DealResolver.assignedToUser] User profile data not found for assigned user ID ${assignedToUserId} on deal ${parent.id}.`);
                return null;
            }

            if (!userProfileData.email) {
                console.error(`[DealResolver.assignedToUser] User profile for ${assignedToUserId} is missing an email (came as ${userProfileData.email}). Deal ${parent.id}. Returning null for assignedToUser.`);
                return null; // Cannot satisfy GraphQL User.email: String! constraint
            }

            const resolvedUser = {
                id: userProfileData.user_id,
                email: userProfileData.email, // Assumes email is now reliably present from user_profiles
                display_name: userProfileData.display_name || userProfileData.email, // Fallback for name
                avatar_url: userProfileData.avatar_url,
            } as GraphQLUser;

            console.log(`[DealResolver.assignedToUser] For deal ${parent.id}, resolving user as:`, JSON.stringify(resolvedUser, null, 2));
            return resolvedUser;
        } catch (error: any) {
            console.error(`[DealResolver.assignedToUser] Error fetching assigned user for deal ${parent.id}, user ID ${assignedToUserId}:`, error.message);
            // Avoid breaking the entire deal list if a single user profile fetch fails.
            // Log the error and return null, indicating the assigned user could not be resolved.
            // Consider if specific errors should be re-thrown if they are critical.
            return null; 
        }
    },
}; 