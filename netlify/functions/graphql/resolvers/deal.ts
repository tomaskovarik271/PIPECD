// Resolvers for Deal type fields
import { GraphQLError, GraphQLResolveInfo } from 'graphql';
import { GraphQLContext, requireAuthentication, getAccessToken, processZodError } from '../helpers';
import { personService } from '../../../../lib/personService';
import * as stageService from '../../../../lib/stageService';
import type { DealResolvers, Person, Stage as GraphQLStage, Deal as GraphQLDealParent, CustomFieldValue as GraphQLCustomFieldValue, CustomFieldDefinition as GraphQLCustomFieldDefinition } from '../../../../lib/generated/graphql'; // Import generated types
import { CustomFieldEntityType, CustomFieldType } from '../../../../lib/generated/graphql'; // Ensure enums are imported as values
import { getAuthenticatedClient } from '../../../../lib/serviceUtils'; // Added import for getAuthenticatedClient
import * as customFieldDefinitionService from '../../../../lib/customFieldDefinitionService';

// Define the parent type for Deal field resolvers to ensure all fields are available
// type ParentDeal = Pick<GraphQLDealParent, 'id' | 'person_id' | 'stage_id' | 'amount' | 'deal_specific_probability'> & {
//   stage?: Pick<GraphQLStage, 'deal_probability'> | null; // Ensure stage with deal_probability can be part of parent
// };

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
    // Resolver for the 'stage' field on Deal
    stage: async (parent, _args, context) => { 
        if (!parent.stage_id) {
            console.error(`Deal ${parent.id} is missing stage_id.`);
            throw new GraphQLError('Internal Error: Deal is missing stage information.', { extensions: { code: 'INTERNAL_SERVER_ERROR' } });
        }
        requireAuthentication(context); 
        const accessToken = getAccessToken(context)!; 
        
        try {
            const stageRecord = await stageService.getStageById(accessToken, parent.stage_id);
            if (!stageRecord) {
                console.error(`Stage ${parent.stage_id} not found for deal ${parent.id}.`);
                 throw new GraphQLError('Stage associated with this deal not found.', { extensions: { code: 'NOT_FOUND' } });
            }
            return {
                id: stageRecord.id,
                user_id: stageRecord.user_id,
                pipeline_id: stageRecord.pipeline_id,
                name: stageRecord.name,
                order: stageRecord.order,
                deal_probability: stageRecord.deal_probability,
                created_at: stageRecord.created_at,
                updated_at: stageRecord.updated_at,
            } as GraphQLStage;
        } catch (e) {
            console.error(`Error fetching stage ${parent.stage_id} for deal ${parent.id}:`, e);
             if (e instanceof GraphQLError && e.extensions?.code === 'NOT_FOUND') {
                 throw e; 
             }
             throw processZodError(e, `fetching stage ${parent.stage_id}`);
        }
    },
    // Resolver for the 'weighted_amount' field on Deal
    weighted_amount: async (parent: GraphQLDealParent, _args: any, context: GraphQLContext) => {
        if (parent.amount == null) {
            return null;
        }

        let probabilityToUse: number | null | undefined = parent.deal_specific_probability;

        if (probabilityToUse == null) {
            let stageDealProbability: number | null | undefined = null;

            // Check if stage is already resolved on the parent and has deal_probability
            if (parent.stage && typeof parent.stage.deal_probability === 'number') { 
                stageDealProbability = parent.stage.deal_probability;
            } else if (parent.stage_id) {
                // If stage is not resolved, or doesn't have probability, and we have stage_id, fetch the stage
                requireAuthentication(context); // Ensure context is authenticated for service call
                const accessToken = getAccessToken(context);
                if (!accessToken) {
                    // This case should ideally be caught by requireAuthentication, but as a safeguard:
                    console.error('Authentication token not found in weighted_amount resolver.');
                    throw new GraphQLError('User not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
                }
                try {
                    const stageRecord = await stageService.getStageById(accessToken, parent.stage_id);
                    if (stageRecord && typeof stageRecord.deal_probability === 'number') {
                        stageDealProbability = stageRecord.deal_probability;
                    }
                } catch (e) {
                    console.error(`Error fetching stage ${parent.stage_id} for deal ${parent.id} within weighted_amount resolver:`, e);
                    // If stage fetch fails, proceed without stage probability (probabilityToUse remains null)
                }
            }
            probabilityToUse = stageDealProbability;
        }

        if (probabilityToUse != null) {
            // Ensure parent.amount is still valid if any async operations occurred, though it shouldn't change.
            return parent.amount * probabilityToUse;
        }
        return null; // If no probability can be determined
    },
    // TODO: Add resolver for Deal.activities if not already present or handled by default

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

        const resolvedValues: GraphQLCustomFieldValue[] = definitions
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
                console.warn(`Unhandled custom field type: ${definition.fieldType} for field ${definition.fieldName}`);
            }
            return fieldValue;
          })
          // Filter out definitions for which the deal doesn't have a value stored in custom_field_values.
          // This means we only return custom fields that are *set* on the deal.
          // If we wanted to return all active definitions for the deal, with null values for those not set,
          // we would remove this filter and the initial check for Object.keys(dealSpecificValues).length === 0.
          .filter(fv => fv.stringValue !== null || fv.numberValue !== null || fv.booleanValue !== null || fv.dateValue !== null || (fv.selectedOptionValues && fv.selectedOptionValues.length > 0));

        return resolvedValues;

      } catch (error) {
        console.error('Error resolving customFieldValues for deal:', parent.id, error);
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
}; 