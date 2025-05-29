import type { 
  CustomFieldDefinition, 
  CustomFieldType, 
  CustomFieldValueInput,
  CustomFieldValue 
} from '../../generated/graphql/graphql';

/**
 * Initialize custom field form values with default values based on field type
 */
export const initializeCustomFieldValues = (definitions: CustomFieldDefinition[]): Record<string, any> => {
  const initialValues: Record<string, any> = {};
  
  definitions.forEach(def => {
    switch (def.fieldType) {
      case 'BOOLEAN' as CustomFieldType:
        initialValues[def.fieldName] = false;
        break;
      case 'MULTI_SELECT' as CustomFieldType:
        initialValues[def.fieldName] = [];
        break;
      default:
        initialValues[def.fieldName] = '';
    }
  });
  
  return initialValues;
};

/**
 * Initialize custom field form values from existing custom field values (for editing)
 */
export const initializeCustomFieldValuesFromEntity = (
  definitions: CustomFieldDefinition[],
  existingValues: CustomFieldValue[]
): Record<string, any> => {
  const initialValues: Record<string, any> = {};
  
  definitions.forEach(def => {
    const existingValue = existingValues?.find(cfv => cfv.definition.id === def.id);
    
    if (existingValue) {
      switch (def.fieldType) {
        case 'TEXT' as CustomFieldType:
          initialValues[def.fieldName] = existingValue.stringValue || '';
          break;
        case 'NUMBER' as CustomFieldType:
          initialValues[def.fieldName] = existingValue.numberValue !== null && existingValue.numberValue !== undefined 
            ? existingValue.numberValue 
            : '';
          break;
        case 'BOOLEAN' as CustomFieldType:
          initialValues[def.fieldName] = existingValue.booleanValue ?? false;
          break;
        case 'DATE' as CustomFieldType:
          initialValues[def.fieldName] = existingValue.dateValue 
            ? new Date(existingValue.dateValue).toISOString().split('T')[0] // Format to YYYY-MM-DD
            : '';
          break;
        case 'MULTI_SELECT' as CustomFieldType:
          initialValues[def.fieldName] = existingValue.selectedOptionValues || [];
          break;
        case 'DROPDOWN' as CustomFieldType:
          // Check stringValue first (correct format), then selectedOptionValues for backward compatibility
          initialValues[def.fieldName] = existingValue.stringValue || 
            (existingValue.selectedOptionValues && existingValue.selectedOptionValues.length > 0 
              ? existingValue.selectedOptionValues[0] 
              : '');
          break;
        default:
          initialValues[def.fieldName] = '';
      }
    } else {
      // Default values if not found
      switch (def.fieldType) {
        case 'BOOLEAN' as CustomFieldType:
          initialValues[def.fieldName] = false;
          break;
        case 'MULTI_SELECT' as CustomFieldType:
          initialValues[def.fieldName] = [];
          break;
        default:
          initialValues[def.fieldName] = '';
      }
    }
  });
  
  return initialValues;
};

/**
 * Convert form values to CustomFieldValueInput array for submission
 */
export const processCustomFieldsForSubmission = (
  definitions: CustomFieldDefinition[],
  formValues: Record<string, any>
): CustomFieldValueInput[] => {
  return definitions
    .map(def => {
      const formValue = formValues[def.fieldName];
      const valueInput: CustomFieldValueInput = { definitionId: def.id };

      // Only process if value is not empty/null/undefined
      if (formValue === undefined || formValue === null || formValue === '') {
        // For boolean fields, false is a valid value
        if (def.fieldType === 'BOOLEAN' as CustomFieldType && formValue === false) {
          valueInput.booleanValue = false;
        } else {
          return null; // Skip empty values
        }
      } else {
        switch (def.fieldType) {
          case 'TEXT' as CustomFieldType:
            valueInput.stringValue = String(formValue);
            break;
          case 'NUMBER' as CustomFieldType: {
            const numericValue = parseFloat(String(formValue));
            valueInput.numberValue = isNaN(numericValue) ? undefined : numericValue;
            break;
          }
          case 'BOOLEAN' as CustomFieldType:
            valueInput.booleanValue = Boolean(formValue);
            break;
          case 'DATE' as CustomFieldType:
            valueInput.dateValue = new Date(formValue).toISOString();
            break;
          case 'DROPDOWN' as CustomFieldType:
            valueInput.stringValue = String(formValue);
            break;
          case 'MULTI_SELECT' as CustomFieldType:
            valueInput.selectedOptionValues = Array.isArray(formValue) && formValue.length > 0 
              ? formValue.map(String) 
              : undefined;
            break;
        }
      }

      // Only return if some value is actually set
      const hasValue = valueInput.stringValue !== undefined || 
                      valueInput.numberValue !== undefined || 
                      valueInput.booleanValue !== undefined || 
                      valueInput.dateValue !== undefined || 
                      valueInput.selectedOptionValues !== undefined;
      
      return hasValue ? valueInput : null;
    })
    .filter((cf): cf is CustomFieldValueInput => cf !== null);
}; 