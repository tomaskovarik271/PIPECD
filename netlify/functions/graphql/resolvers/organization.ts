import type { GraphQLContext } from '../helpers';
import { requireAuthentication, getAccessToken } from '../helpers';
import { GraphQLError } from 'graphql';
import type { OrganizationResolvers, CustomFieldDefinition, CustomFieldValue } from '../../../../lib/generated/graphql';
import { CustomFieldEntityType, CustomFieldType } from '../../../../lib/generated/graphql';
import * as customFieldDefinitionService from '../../../../lib/customFieldDefinitionService';
import { getAuthenticatedClient } from '../../../../lib/serviceUtils';

export const Organization: OrganizationResolvers<GraphQLContext> = {
  people: async (_parent: { id: string }, _args: unknown, context: GraphQLContext) => {
     requireAuthentication(context);
     const accessToken = getAccessToken(context);
     if (!accessToken) throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
     console.warn(`Resolver Organization.people not fully implemented - needs service update`);
     return []; // Return empty array for now
  },

  customFieldValues: async (parent: { id: string; db_custom_field_values?: Record<string, any> | null }, _args: unknown, context: GraphQLContext): Promise<CustomFieldValue[]> => {
    requireAuthentication(context);
    const accessToken = getAccessToken(context);
    if (!accessToken) {
      console.error('Organization.customFieldValues: Missing access token');
      throw new GraphQLError('Missing access token', { extensions: { code: 'UNAUTHENTICATED' } });
    }
    const supabase = getAuthenticatedClient(accessToken);
    const organizationIdForLog = parent.id || 'unknown_organization_id';
    console.log(`[Organization.customFieldValues] Resolver START for organization: ${organizationIdForLog}`);

    const organizationSpecificValues = parent.db_custom_field_values || {};
    console.log(`[Organization.customFieldValues] organization: ${organizationIdForLog}, received parent.db_custom_field_values:`, JSON.stringify(organizationSpecificValues));

    try {
      console.log(`[Organization.customFieldValues] organization: ${organizationIdForLog}, fetching definitions for Organization entity.`);
      const definitions: CustomFieldDefinition[] = await customFieldDefinitionService.getCustomFieldDefinitions(
        supabase,
        CustomFieldEntityType.Organization, // Use enum value
        false // includeInactive = false
      );
      console.log(`[Organization.customFieldValues] organization: ${organizationIdForLog}, loaded ${definitions.length} active Organization definitions:`, JSON.stringify(definitions.map(d => d.fieldName)));

      if (!definitions || definitions.length === 0) {
        console.log(`[Organization.customFieldValues] organization: ${organizationIdForLog}, no active Organization definitions found. Returning [].`);
        return [];
      }

      const mappedValues: CustomFieldValue[] = definitions
        .map((definition: CustomFieldDefinition) => {
          const rawValue = organizationSpecificValues[definition.fieldName];
          console.log(`[Organization.customFieldValues] organization: ${organizationIdForLog}, Def: ${definition.fieldName} (${definition.fieldType}), RawValue from DB:`, rawValue);

          const fieldValue: CustomFieldValue = {
            definition: definition, 
            stringValue: null,
            numberValue: null,
            booleanValue: null,
            dateValue: null,
            selectedOptionValues: null,
          };

          if (rawValue === undefined || rawValue === null) {
            console.log(`[Organization.customFieldValues] organization: ${organizationIdForLog}, Def: ${definition.fieldName}, rawValue is null/undefined. FieldValue will have nulls.`);
            return fieldValue; 
          }

          switch (definition.fieldType) {
            case CustomFieldType.Text: 
              fieldValue.stringValue = String(rawValue);
              break;
            case CustomFieldType.Number:
              const num = parseFloat(String(rawValue));
              if (!isNaN(num)) {
                fieldValue.numberValue = num;
              } else {
                console.warn(`[Organization.customFieldValues] organization: ${organizationIdForLog}, Def: ${definition.fieldName}, could not parse number:`, rawValue);
              }
              break;
            case CustomFieldType.Boolean:
              fieldValue.booleanValue = Boolean(rawValue);
              break;
            case CustomFieldType.Date:
              fieldValue.dateValue = rawValue; 
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
            default:
              console.warn(`[Organization.customFieldValues] organization: ${organizationIdForLog}, Def: ${definition.fieldName}, Unhandled custom field type: ${definition.fieldType as string}`);
          }
          console.log(`[Organization.customFieldValues] organization: ${organizationIdForLog}, Def: ${definition.fieldName}, mapped fieldValue:`, JSON.stringify(fieldValue));
          return fieldValue;
        });
      
      console.log(`[Organization.customFieldValues] organization: ${organizationIdForLog}, mappedValues before filter (${mappedValues.length} items):`, JSON.stringify(mappedValues.map(fv => ({ def: fv.definition.fieldName, sv: fv.stringValue, nv: fv.numberValue, bv: fv.booleanValue, dv: fv.dateValue, sov: fv.selectedOptionValues }))));

      const resolvedValues = mappedValues.filter(fv => 
          fv.stringValue !== null || 
          fv.numberValue !== null || 
          fv.booleanValue !== null || 
          fv.dateValue !== null || 
          (fv.selectedOptionValues && fv.selectedOptionValues.length > 0)
      );
      
      console.log(`[Organization.customFieldValues] organization: ${organizationIdForLog}, resolvedValues after filter (${resolvedValues.length} items):`, JSON.stringify(resolvedValues.map(fv => ({ def: fv.definition.fieldName, val: fv.stringValue || fv.numberValue || fv.booleanValue || fv.dateValue || fv.selectedOptionValues }))));
      console.log(`[Organization.customFieldValues] Resolver END for organization: ${organizationIdForLog}`);
      return resolvedValues;

    } catch (error) {
      console.error(`Error resolving customFieldValues for organization ${organizationIdForLog}:`, error);
      if (error instanceof GraphQLError) throw error;
      throw new GraphQLError('Could not resolve custom field values for the organization.', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
  }
}; 