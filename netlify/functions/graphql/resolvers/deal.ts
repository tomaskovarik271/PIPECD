// Resolvers for Deal type fields
import { GraphQLError, GraphQLResolveInfo } from 'graphql';
import { GraphQLContext, requireAuthentication, getAccessToken, processZodError } from '../helpers';
import { personService } from '../../../../lib/personService';
import { organizationService } from '../../../../lib/organizationService';
import * as activityService from '../../../../lib/activityService'; // Added import for activityService
import type { DealResolvers, Person, Organization, Deal as GraphQLDealParent, CustomFieldValue as GraphQLCustomFieldValue, CustomFieldDefinition as GraphQLCustomFieldDefinition, Activity as GraphQLActivity, WfmProject, WfmWorkflowStep, WfmStatus } from '../../../../lib/generated/graphql'; // CORRECTED CASING
import { CustomFieldEntityType, CustomFieldType } from '../../../../lib/generated/graphql'; // Ensure enums are imported as values
import { getAuthenticatedClient } from '../../../../lib/serviceUtils'; // Added import for getAuthenticatedClient
import * as customFieldDefinitionService from '../../../../lib/customFieldDefinitionService';
import * as wfmProjectService from '../../../../lib/wfmProjectService'; // ADDED
import { wfmWorkflowService } from '../../../../lib/wfmWorkflowService'; // CHANGED
import { wfmStatusService } from '../../../../lib/wfmStatusService'; // CHANGED

// This interface should match the actual object returned by Query.deals/Query.deal resolvers
interface DealResolverParent extends Pick<GraphQLDealParent, 'id' | 'wfm_project_id'> {
  // Add other fields from Deal if necessary for other resolvers on Deal type
}

// This interface represents the raw data for a WFM Project as fetched from the database
interface RawDbWfmProject {
  id: string;
  current_step_id?: string | null; // from wfm_projects table
  // other raw fields from wfm_projects table ...
}

export const Deal: DealResolvers<GraphQLContext> = {
    // Resolver for the 'person' field on Deal
    person: async (parent, _args, context) => { 
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
    organization: async (parent, _args, context) => {
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
    // Resolver for the 'weighted_amount' field on Deal
    weighted_amount: (parent: GraphQLDealParent, _args: any, _context: GraphQLContext, _info: GraphQLResolveInfo): number | null => {
        // The 'parent' object is the result from the Query.deal or Mutation.updateDeal resolver.
        // We've already ensured that those parent resolvers correctly include the 
        // 'weighted_amount' as calculated and stored by the dealService.
        // So, we just pass it through.
        if (typeof parent.weighted_amount === 'number') {
            return parent.weighted_amount;
        }
        return null;
    },
    // TODO: Add resolver for Deal.activities if not already present or handled by default

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
          // The Activity type from the service might already be compatible or nearly compatible
          // with GraphQLActivity. We need to ensure date fields are correctly formatted/typed.
          // The GraphQL DateTime scalar usually expects a Date object or an ISO string it can parse.
          // The linter error suggests GraphQLActivity expects Date objects for its DateTime fields.
          
          // Assuming activityService returns objects where date fields might be strings or Date objects.
          // We will ensure they are Date objects if not null.
          const mappedActivity: GraphQLActivity = {
            ...activity,
            // Ensure that fields expected by GraphQLActivity are present and correctly typed
            // id, user_id, type, subject, is_done, notes, deal_id, person_id, organization_id should map directly
            // if their types are compatible from the service's Activity type to GraphQLActivity.
            
            // Handle User, Deal, Person, Organization complex objects if they are part of GraphQLActivity
            // and need explicit resolution or mapping from the service activity object.
            // For now, assuming they are either correctly returned by service or resolved by their own type resolvers.
            user: activity.user, // Assuming service returns a compatible User object or null
            deal: activity.deal,   // Assuming service returns a compatible Deal object or null
            person: activity.person, // Assuming service returns a compatible Person object or null
            organization: activity.organization, // Assuming service returns compatible Org object or null

            created_at: new Date(activity.created_at), // Convert to Date object
            updated_at: new Date(activity.updated_at), // Convert to Date object
            due_date: activity.due_date ? new Date(activity.due_date) : null, // Convert to Date object or keep null
          };
          return mappedActivity;
        });
      } catch (error) {
        console.error(`Error fetching activities for deal ${parent.id}:`, error);
        return [];
      }
    },

    customFieldValues: async (parent: any, _args: any, context: GraphQLContext): Promise<GraphQLCustomFieldValue[]> => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      const supabase = getAuthenticatedClient(accessToken);

      // Read from the db_custom_field_values property passed by the parent resolver
      const dealSpecificValues = parent.db_custom_field_values as Record<string, any> || {};

      if (Object.keys(dealSpecificValues).length === 0) {
        // If we want to show all applicable CFs for a Deal, even if not set,
        // we would fetch all definitions here and map them, setting values to null.
        // For now, if the deal has no custom_field_values, we return empty.
        return [];
      }

      try {
        // Fetch active definitions for DEAL entity type
        const definitions: GraphQLCustomFieldDefinition[] = await customFieldDefinitionService.getCustomFieldDefinitions(
          supabase, // Pass the Supabase client
          CustomFieldEntityType.Deal, // Use the imported enum value
          false // includeInactive = false (default, but explicit)
        );

        if (!definitions || definitions.length === 0) {
          // This means there are no active field definitions for Deals, 
          // so even if parent.custom_field_values has data (e.g. for old/inactive fields), 
          // we can't resolve them to a known active definition.
          return [];
        }

        const mappedValues: GraphQLCustomFieldValue[] = definitions
          .map((definition: GraphQLCustomFieldDefinition) => {
            const rawValue = dealSpecificValues[definition.fieldName];

            // Construct the CustomFieldValue, which now expects a 'definition' object
            const fieldValue: GraphQLCustomFieldValue = {
              definition: definition, // The full definition object
              stringValue: null,
              numberValue: null,
              booleanValue: null,
              dateValue: null,
              selectedOptionValues: null,
            };

            if (rawValue === undefined || rawValue === null) {
              // No value for this specific custom field on this deal
              // Return the fieldValue with nulls, but with the definition included
              return fieldValue; 
            }

            switch (definition.fieldType) {
              case CustomFieldType.Text:
                fieldValue.stringValue = String(rawValue);
                break;
              case CustomFieldType.Number:
                // Ensure rawValue is a number or can be parsed to one.
                const num = parseFloat(rawValue);
                if (!isNaN(num)) {
                  fieldValue.numberValue = num;
                }
                break;
              case CustomFieldType.Boolean:
                fieldValue.booleanValue = Boolean(rawValue);
                break;
              case CustomFieldType.Date:
                // rawValue should be an ISO string from the DB.
                // The GraphQL DateTime scalar will handle parsing/validation on output.
                fieldValue.dateValue = rawValue; 
                // Optionally, also provide stringValue for Date for easier direct display if needed
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
        return mappedValues; // Return mappedValues directly
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
        // This should be caught by requireAuthentication, but as a safeguard
        throw new GraphQLError('Authentication token not found.', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      const supabase = getAuthenticatedClient(token);

      // No need to check if supabase is null here as getAuthenticatedClient would throw if config is missing.

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
      // Log the raw data from the database
      console.log('[Deal.history resolver] Raw data for deal_id', parent.id, ':', JSON.stringify(data, null, 2));
      return data || [];
    },

    // ADDING NEW WFM-RELATED RESOLVERS
    wfmProject: async (parent: DealResolverParent, _args, context: GraphQLContext): Promise<WfmProject | null> => {
      if (!parent.wfm_project_id) {
        return null;
      }
      console.log(`[Resolver.Deal.wfmProject] For deal ${parent.id}, fetching WFMProject ID: ${parent.wfm_project_id}`);
      try {
        // wfmProjectService.getWFMProjectById is assumed to return the raw DB object (or an object closely matching it)
        // which will serve as the parent for WFMProject type resolvers.
        const projectData = await wfmProjectService.getWFMProjectById(parent.wfm_project_id, context);
        if (!projectData) {
          console.error(`[Resolver.Deal.wfmProject] WFMProject not found with ID: ${parent.wfm_project_id} for deal ${parent.id}`);
          return null;
        }
        return projectData as any; // Cast to allow GQL to use WFMProject resolvers on this raw data
      } catch (error) {
        console.error(`[Resolver.Deal.wfmProject] Error fetching WFMProject ID ${parent.wfm_project_id} for deal ${parent.id}:`, error);
        return null;
      }
    },

    currentWfmStep: async (parent: DealResolverParent, _args, context: GraphQLContext): Promise<WfmWorkflowStep | null> => {
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
        return step as unknown as WfmWorkflowStep; // WFMWorkflowStep.status will be resolved by its own resolver
      } catch (error) {
        console.error(`[Resolver.Deal.currentWfmStep] Error deriving currentWfmStep for deal ${parent.id}:`, error);
        return null;
      }
    },

    currentWfmStatus: async (parent: DealResolverParent, _args, context: GraphQLContext): Promise<WfmStatus | null> => {
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
}; 