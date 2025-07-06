// Resolvers for Person type fields
import { GraphQLError } from 'graphql';
import { GraphQLContext, requireAuthentication, getAccessToken } from '../helpers';
import { organizationService } from '../../../../lib/organizationService';
import type { PersonResolvers, Organization, CustomFieldValue as GraphQLCustomFieldValue, CustomFieldDefinition as GraphQLCustomFieldDefinition } from '../../../../lib/generated/graphql';
import { CustomFieldEntityType, CustomFieldType } from '../../../../lib/generated/graphql'; // Ensure enums are imported as values
import * as customFieldDefinitionService from '../../../../lib/customFieldDefinitionService';
import { getAuthenticatedClient } from '../../../../lib/serviceUtils'; // Added import
// import { dealService } from '../../../../lib/dealService'; // Keep commented until deals resolver is implemented

// Define parent types for context within these resolvers - Will be removed as types are inferred
// type PersonOrganizationParent = { 
//   organization_id?: string | null 
// };

// type PersonDealsParent = { 
//   id: string 
// };

export const Person: PersonResolvers<GraphQLContext> = {
    // BACKWARD COMPATIBILITY: organization resolver now points to primaryOrganization
    organization: async (parent, _args, context) => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context);
      if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });

      try {
        const supabase = getAuthenticatedClient(accessToken);
        
        // Get primary organization from roles
        const { data: roleData, error: roleError } = await supabase
          .from('person_organization_roles')
          .select('organization_id')
          .eq('person_id', parent.id)
          .eq('is_primary', true)
          .eq('status', 'active')
          .single();

        if (roleError && roleError.code !== 'PGRST116') throw roleError;

        const organizationId = roleData?.organization_id;
        if (!organizationId) return null;

        const orgRecord = await organizationService.getOrganizationById(context.currentUser!.id, organizationId, accessToken);
        if (orgRecord) {
          return {
            id: orgRecord.id,
            created_at: orgRecord.created_at,
            updated_at: orgRecord.updated_at,
            user_id: orgRecord.user_id,
            name: orgRecord.name,
            address: orgRecord.address,
            notes: orgRecord.notes,
          } as Organization;
        }
        return null;
      } catch (error) {
        console.error('Error fetching Person.organization:', error);
        return null;
      }
    },

    // NEW: Get all organization roles for a person
    organizationRoles: async (parent, _args, context) => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context);
      if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });

      try {
        const supabase = getAuthenticatedClient(accessToken);
        const { data, error } = await supabase
          .from('person_organization_roles')
          .select('*')
          .eq('person_id', parent.id)
          .eq('status', 'active')
          .order('is_primary', { ascending: false })
          .order('created_at', { ascending: true });

        if (error) throw error;
        return (data || []) as any[];
      } catch (error) {
        console.error('Error fetching person organization roles:', error);
        return [];
      }
    },

    // NEW: Get primary organization for a person
    primaryOrganization: async (parent, _args, context) => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context);
      if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });

      try {
        const supabase = getAuthenticatedClient(accessToken);
        
        // First try to get from explicitly marked primary role
        const { data: primaryRoleData, error: primaryRoleError } = await supabase
          .from('person_organization_roles')
          .select('organization_id')
          .eq('person_id', parent.id)
          .eq('is_primary', true)
          .eq('status', 'active')
          .single();

        let organizationId = primaryRoleData?.organization_id;

        // If no explicit primary role found, get the first active role
        if (!organizationId && (primaryRoleError?.code === 'PGRST116')) {
          const { data: firstRoleData, error: firstRoleError } = await supabase
            .from('person_organization_roles')
            .select('organization_id')
            .eq('person_id', parent.id)
            .eq('status', 'active')
            .order('created_at', { ascending: true })
            .limit(1)
            .single();

          if (firstRoleError && firstRoleError.code !== 'PGRST116') throw firstRoleError;
          organizationId = firstRoleData?.organization_id;
        }

        if (!organizationId) return null;

        // Get the organization from role
        const orgRecord = await organizationService.getOrganizationById(context.currentUser!.id, organizationId, accessToken);
        if (orgRecord) {
          return {
            id: orgRecord.id,
            created_at: orgRecord.created_at,
            updated_at: orgRecord.updated_at,
            user_id: orgRecord.user_id,
            name: orgRecord.name,
            address: orgRecord.address,
            notes: orgRecord.notes,
          } as Organization;
        }
        return null;
      } catch (error) {
        console.error('Error fetching primary organization:', error);
        return null;
      }
    },

    // NEW: Get primary role for a person
    primaryRole: async (parent, _args, context) => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context);
      if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });

      try {
        const supabase = getAuthenticatedClient(accessToken);
        const { data, error } = await supabase
          .from('person_organization_roles')
          .select('*')
          .eq('person_id', parent.id)
          .eq('is_primary', true)
          .eq('status', 'active')
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data as any || null;
      } catch (error) {
        console.error('Error fetching primary role:', error);
        return null;
      }
    },

    // Placeholder for deals linked to a person (requires dealService update)
    deals: async (_parent, _args, context) => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context);
      if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
       // console.warn(`Resolver Person.deals not fully implemented - needs service update`);
       return []; // Return empty array for now
    },
    customFieldValues: async (parent: any, _args: any, context: GraphQLContext): Promise<GraphQLCustomFieldValue[]> => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      const supabase = getAuthenticatedClient(accessToken);

      const personIdForLog = parent.id || 'unknown_person_id';
      // console.log(`[Person.customFieldValues] Resolver START for person: ${personIdForLog}`);

      const personSpecificValues = parent.db_custom_field_values as Record<string, any> || {}; // Ensure using db_custom_field_values alias
              // console.log(`[Person.customFieldValues] person: ${personIdForLog}, received parent.db_custom_field_values:`, JSON.stringify(personSpecificValues));

      if (Object.keys(personSpecificValues).length === 0) {
                  // console.log(`[Person.customFieldValues] person: ${personIdForLog}, no custom field values found in parent data. Returning [].`);
        return [];
      }

      try {
        console.log(`[Person.customFieldValues] person: ${personIdForLog}, fetching definitions for Person entity.`);
        const definitions: GraphQLCustomFieldDefinition[] = await customFieldDefinitionService.getCustomFieldDefinitions(
          supabase,
          CustomFieldEntityType.Person,
          false 
        );
        console.log(`[Person.customFieldValues] person: ${personIdForLog}, loaded ${definitions.length} active Person definitions:`, JSON.stringify(definitions.map(d => d.fieldName)));

        if (!definitions || definitions.length === 0) {
          console.log(`[Person.customFieldValues] person: ${personIdForLog}, no active Person definitions found. Returning [].`);
          return [];
        }

        const mappedValues: GraphQLCustomFieldValue[] = definitions
          .map((definition: GraphQLCustomFieldDefinition) => {
            const rawValue = personSpecificValues[definition.fieldName];
            console.log(`[Person.customFieldValues] person: ${personIdForLog}, Def: ${definition.fieldName} (${definition.fieldType}), RawValue from DB:`, rawValue);

            const fieldValue: GraphQLCustomFieldValue = {
              definition: definition, // Send full definition
              stringValue: null,
              numberValue: null,
              booleanValue: null,
              dateValue: null,
              selectedOptionValues: null,
            };

            if (rawValue === undefined || rawValue === null) {
              // Retain the definition, but all values will be null
              console.log(`[Person.customFieldValues] person: ${personIdForLog}, Def: ${definition.fieldName}, rawValue is null/undefined. FieldValue will have nulls.`);
              return fieldValue; 
            }

            switch (definition.fieldType) {
              case CustomFieldType.Text:
                fieldValue.stringValue = String(rawValue);
                break;
              case CustomFieldType.Number:
                const num = parseFloat(String(rawValue)); // Ensure string for parseFloat
                if (!isNaN(num)) {
                  fieldValue.numberValue = num;
                } else {
                  console.warn(`[Person.customFieldValues] person: ${personIdForLog}, Def: ${definition.fieldName}, could not parse number:`, rawValue);
                }
                break;
              case CustomFieldType.Boolean:
                fieldValue.booleanValue = Boolean(rawValue);
                break;
              case CustomFieldType.Date:
                fieldValue.dateValue = rawValue; // Reverted: Assuming rawValue is already a valid date string or Date object
                // fieldValue.stringValue = String(rawValue); // Optional: if you want date also as string
                break;
              case CustomFieldType.Dropdown:
                if (Array.isArray(rawValue) && rawValue.length > 0) {
                  fieldValue.selectedOptionValues = [String(rawValue[0])];
                } else if (typeof rawValue === 'string') { 
                  fieldValue.selectedOptionValues = [rawValue];
                }
                break;
              case CustomFieldType.MultiSelect:
                if (Array.isArray(rawValue)) {
                  fieldValue.selectedOptionValues = rawValue.map(String);
                }
                break;
              case CustomFieldType.UserMultiselect:
                if (Array.isArray(rawValue)) {
                  fieldValue.selectedOptionValues = rawValue.map(String);
                } else if (typeof rawValue === 'string' && rawValue.trim() !== '') {
                  // Handle legacy data where USER_MULTISELECT was stored as string instead of array
                  fieldValue.selectedOptionValues = [rawValue];
                }
                break;
              default:
                console.warn(`[Person.customFieldValues] person: ${personIdForLog}, Def: ${definition.fieldName}, Unhandled custom field type: ${definition.fieldType}`);
            }
            console.log(`[Person.customFieldValues] person: ${personIdForLog}, Def: ${definition.fieldName}, mapped fieldValue:`, JSON.stringify(fieldValue));
            return fieldValue;
          });
        
        console.log(`[Person.customFieldValues] person: ${personIdForLog}, mappedValues before filter (${mappedValues.length} items):`, JSON.stringify(mappedValues.map(fv => ({ def: fv.definition.fieldName, sv: fv.stringValue, nv: fv.numberValue, bv: fv.booleanValue, dv: fv.dateValue, sov: fv.selectedOptionValues }))));

        const resolvedValues = mappedValues.filter(fv => 
            fv.stringValue !== null || 
            fv.numberValue !== null || 
            fv.booleanValue !== null || 
            fv.dateValue !== null || 
            (fv.selectedOptionValues && fv.selectedOptionValues.length > 0)
        );
        
        console.log(`[Person.customFieldValues] person: ${personIdForLog}, resolvedValues after filter (${resolvedValues.length} items):`, JSON.stringify(resolvedValues.map(fv => ({ def: fv.definition.fieldName, val: fv.stringValue || fv.numberValue || fv.booleanValue || fv.dateValue || fv.selectedOptionValues }))));
        console.log(`[Person.customFieldValues] Resolver END for person: ${personIdForLog}`);
        return resolvedValues;

      } catch (error) {
        console.error('Error resolving customFieldValues for person:', parent.id, error);
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError('Could not resolve custom field values for the person.', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    }
}; 