import { describe, test, expect, vi } from 'vitest';
import { processCustomFieldsForCreate, processCustomFieldsForUpdate } from '../../lib/customFieldUtils';
import type { CustomFieldValueInput, CustomFieldEntityType, CustomFieldType } from '../../lib/generated/graphql';

// Mock the custom field definition service
vi.mock('../../lib/customFieldDefinitionService', () => ({
  getCustomFieldDefinitionsByIds: vi.fn(),
  getCustomFieldDefinitionById: vi.fn()
}));

import { getCustomFieldDefinitionsByIds, getCustomFieldDefinitionById } from '../../lib/customFieldDefinitionService';

describe('Custom Fields Validation and Processing', () => {

  describe('Custom Field Value Extraction Logic', () => {
    test('should extract string values correctly', () => {
      const extractCustomFieldValue = (cfInput: CustomFieldValueInput): any => {
        if (cfInput.stringValue !== undefined && cfInput.stringValue !== null) return cfInput.stringValue;
        if (cfInput.numberValue !== undefined && cfInput.numberValue !== null) return cfInput.numberValue;
        if (cfInput.booleanValue !== undefined && cfInput.booleanValue !== null) return cfInput.booleanValue;
        if (cfInput.dateValue !== undefined && cfInput.dateValue !== null) return cfInput.dateValue;
        if (cfInput.selectedOptionValues !== undefined && cfInput.selectedOptionValues !== null) return cfInput.selectedOptionValues;
        return undefined;
      };

      // Valid string value
      expect(extractCustomFieldValue({
        definitionId: 'def-1',
        stringValue: 'Test Company'
      })).toBe('Test Company');

      // Empty string is valid
      expect(extractCustomFieldValue({
        definitionId: 'def-1',
        stringValue: ''
      })).toBe('');

      // Null string is skipped
      expect(extractCustomFieldValue({
        definitionId: 'def-1',
        stringValue: null
      })).toBeUndefined();

      // Undefined string is skipped
      expect(extractCustomFieldValue({
        definitionId: 'def-1',
        stringValue: undefined
      })).toBeUndefined();
    });

    test('should extract numeric values correctly', () => {
      const extractCustomFieldValue = (cfInput: CustomFieldValueInput): any => {
        if (cfInput.stringValue !== undefined && cfInput.stringValue !== null) return cfInput.stringValue;
        if (cfInput.numberValue !== undefined && cfInput.numberValue !== null) return cfInput.numberValue;
        if (cfInput.booleanValue !== undefined && cfInput.booleanValue !== null) return cfInput.booleanValue;
        if (cfInput.dateValue !== undefined && cfInput.dateValue !== null) return cfInput.dateValue;
        if (cfInput.selectedOptionValues !== undefined && cfInput.selectedOptionValues !== null) return cfInput.selectedOptionValues;
        return undefined;
      };

      // Positive number
      expect(extractCustomFieldValue({
        definitionId: 'def-1',
        numberValue: 42.5
      })).toBe(42.5);

      // Zero is valid
      expect(extractCustomFieldValue({
        definitionId: 'def-1',
        numberValue: 0
      })).toBe(0);

      // Negative number
      expect(extractCustomFieldValue({
        definitionId: 'def-1',
        numberValue: -100
      })).toBe(-100);

      // Large number
      expect(extractCustomFieldValue({
        definitionId: 'def-1',
        numberValue: 999999999.99
      })).toBe(999999999.99);

      // Null number is skipped
      expect(extractCustomFieldValue({
        definitionId: 'def-1',
        numberValue: null
      })).toBeUndefined();
    });

    test('should extract boolean values correctly', () => {
      const extractCustomFieldValue = (cfInput: CustomFieldValueInput): any => {
        if (cfInput.stringValue !== undefined && cfInput.stringValue !== null) return cfInput.stringValue;
        if (cfInput.numberValue !== undefined && cfInput.numberValue !== null) return cfInput.numberValue;
        if (cfInput.booleanValue !== undefined && cfInput.booleanValue !== null) return cfInput.booleanValue;
        if (cfInput.dateValue !== undefined && cfInput.dateValue !== null) return cfInput.dateValue;
        if (cfInput.selectedOptionValues !== undefined && cfInput.selectedOptionValues !== null) return cfInput.selectedOptionValues;
        return undefined;
      };

      // True value
      expect(extractCustomFieldValue({
        definitionId: 'def-1',
        booleanValue: true
      })).toBe(true);

      // False value
      expect(extractCustomFieldValue({
        definitionId: 'def-1',
        booleanValue: false
      })).toBe(false);

      // Null boolean is skipped
      expect(extractCustomFieldValue({
        definitionId: 'def-1',
        booleanValue: null
      })).toBeUndefined();
    });

    test('should extract date values correctly', () => {
      const extractCustomFieldValue = (cfInput: CustomFieldValueInput): any => {
        if (cfInput.stringValue !== undefined && cfInput.stringValue !== null) return cfInput.stringValue;
        if (cfInput.numberValue !== undefined && cfInput.numberValue !== null) return cfInput.numberValue;
        if (cfInput.booleanValue !== undefined && cfInput.booleanValue !== null) return cfInput.booleanValue;
        if (cfInput.dateValue !== undefined && cfInput.dateValue !== null) return cfInput.dateValue;
        if (cfInput.selectedOptionValues !== undefined && cfInput.selectedOptionValues !== null) return cfInput.selectedOptionValues;
        return undefined;
      };

      const testDate = new Date('2025-02-15T10:00:00Z');

      expect(extractCustomFieldValue({
        definitionId: 'def-1',
        dateValue: testDate
      })).toBe(testDate);

      // Null date is skipped
      expect(extractCustomFieldValue({
        definitionId: 'def-1',
        dateValue: null
      })).toBeUndefined();
    });

    test('should extract multi-select values correctly', () => {
      const extractCustomFieldValue = (cfInput: CustomFieldValueInput): any => {
        if (cfInput.stringValue !== undefined && cfInput.stringValue !== null) return cfInput.stringValue;
        if (cfInput.numberValue !== undefined && cfInput.numberValue !== null) return cfInput.numberValue;
        if (cfInput.booleanValue !== undefined && cfInput.booleanValue !== null) return cfInput.booleanValue;
        if (cfInput.dateValue !== undefined && cfInput.dateValue !== null) return cfInput.dateValue;
        if (cfInput.selectedOptionValues !== undefined && cfInput.selectedOptionValues !== null) return cfInput.selectedOptionValues;
        return undefined;
      };

      // Array of selected values
      expect(extractCustomFieldValue({
        definitionId: 'def-1',
        selectedOptionValues: ['option1', 'option2']
      })).toEqual(['option1', 'option2']);

      // Single selected value
      expect(extractCustomFieldValue({
        definitionId: 'def-1',
        selectedOptionValues: ['option1']
      })).toEqual(['option1']);

      // Empty array
      expect(extractCustomFieldValue({
        definitionId: 'def-1',
        selectedOptionValues: []
      })).toEqual([]);

      // Null selected values is skipped
      expect(extractCustomFieldValue({
        definitionId: 'def-1',
        selectedOptionValues: null
      })).toBeUndefined();
    });

    test('should handle value priority correctly', () => {
      const extractCustomFieldValue = (cfInput: CustomFieldValueInput): any => {
        if (cfInput.stringValue !== undefined && cfInput.stringValue !== null) return cfInput.stringValue;
        if (cfInput.numberValue !== undefined && cfInput.numberValue !== null) return cfInput.numberValue;
        if (cfInput.booleanValue !== undefined && cfInput.booleanValue !== null) return cfInput.booleanValue;
        if (cfInput.dateValue !== undefined && cfInput.dateValue !== null) return cfInput.dateValue;
        if (cfInput.selectedOptionValues !== undefined && cfInput.selectedOptionValues !== null) return cfInput.selectedOptionValues;
        return undefined;
      };

      // String takes priority over other types
      expect(extractCustomFieldValue({
        definitionId: 'def-1',
        stringValue: 'priority',
        numberValue: 42,
        booleanValue: true
      })).toBe('priority');

      // Number takes priority when string is null/undefined
      expect(extractCustomFieldValue({
        definitionId: 'def-1',
        stringValue: null,
        numberValue: 42,
        booleanValue: true
      })).toBe(42);

      // Boolean takes priority when string and number are null/undefined
      expect(extractCustomFieldValue({
        definitionId: 'def-1',
        stringValue: null,
        numberValue: null,
        booleanValue: true,
        dateValue: new Date()
      })).toBe(true);
    });
  });

  describe('Custom Field Value Extraction for Updates', () => {
    test('should allow null values for clearing fields', () => {
      const extractCustomFieldValueForUpdate = (cfInput: CustomFieldValueInput): any => {
        if ('stringValue' in cfInput) return cfInput.stringValue;
        if ('numberValue' in cfInput) return cfInput.numberValue;
        if ('booleanValue' in cfInput) return cfInput.booleanValue;
        if ('dateValue' in cfInput) return cfInput.dateValue;
        if ('selectedOptionValues' in cfInput) return cfInput.selectedOptionValues;
        return null;
      };

      // Null string value for clearing
      expect(extractCustomFieldValueForUpdate({
        definitionId: 'def-1',
        stringValue: null
      })).toBeNull();

      // Null number value for clearing
      expect(extractCustomFieldValueForUpdate({
        definitionId: 'def-1',
        numberValue: null
      })).toBeNull();

      // Null boolean value for clearing
      expect(extractCustomFieldValueForUpdate({
        definitionId: 'def-1',
        booleanValue: null
      })).toBeNull();

      // Valid values still work
      expect(extractCustomFieldValueForUpdate({
        definitionId: 'def-1',
        stringValue: 'Updated Value'
      })).toBe('Updated Value');

      expect(extractCustomFieldValueForUpdate({
        definitionId: 'def-1',
        numberValue: 99
      })).toBe(99);
    });

    test('should handle field presence detection', () => {
      const extractCustomFieldValueForUpdate = (cfInput: CustomFieldValueInput): any => {
        if ('stringValue' in cfInput) return cfInput.stringValue;
        if ('numberValue' in cfInput) return cfInput.numberValue;
        if ('booleanValue' in cfInput) return cfInput.booleanValue;
        if ('dateValue' in cfInput) return cfInput.dateValue;
        if ('selectedOptionValues' in cfInput) return cfInput.selectedOptionValues;
        return null;
      };

      // Field present with null value
      expect(extractCustomFieldValueForUpdate({
        definitionId: 'def-1',
        stringValue: null
      })).toBeNull();

      // Field not present (no update intended)
      expect(extractCustomFieldValueForUpdate({
        definitionId: 'def-1'
      })).toBeNull();

      // Multiple fields present - priority order
      expect(extractCustomFieldValueForUpdate({
        definitionId: 'def-1',
        stringValue: 'string-value',
        numberValue: 42
      })).toBe('string-value');
    });
  });

  describe('Custom Field Definition Mapping Logic', () => {
    test('should validate critical non-nullable fields', () => {
      const mapDbDefinitionToGraphQL = (dbDef: any) => {
        const mappedData = {
          id: dbDef.id,
          entityType: dbDef.entity_type,
          fieldName: dbDef.field_name,
          fieldLabel: dbDef.field_label,
          fieldType: dbDef.field_type,
          isRequired: dbDef.is_required ?? false,
          dropdownOptions: null,
          isActive: dbDef.is_active ?? true,
          displayOrder: dbDef.display_order ?? 0,
          createdAt: dbDef.created_at,
          updatedAt: dbDef.updated_at,
        };

        const criticalFields = ['id', 'entityType', 'fieldName', 'fieldLabel', 'fieldType', 'createdAt', 'updatedAt'];
        
        for (const field of criticalFields) {
          if (mappedData[field] === null || mappedData[field] === undefined) {
            throw new Error(`Data integrity issue: Field '${field}' is unexpectedly missing for custom field definition '${dbDef.id}'.`);
          }
        }

        return mappedData;
      };

      // Valid definition
      const validDef = {
        id: 'def-123',
        entity_type: 'DEAL',
        field_name: 'company_size',
        field_label: 'Company Size',
        field_type: 'TEXT',
        is_required: false,
        is_active: true,
        display_order: 1,
        created_at: '2025-01-30T10:00:00Z',
        updated_at: '2025-01-30T10:00:00Z'
      };

      expect(() => mapDbDefinitionToGraphQL(validDef)).not.toThrow();

      // Missing ID
      expect(() => mapDbDefinitionToGraphQL({
        ...validDef,
        id: null
      })).toThrow('Data integrity issue: Field \'id\' is unexpectedly missing');

      // Missing entity type
      expect(() => mapDbDefinitionToGraphQL({
        ...validDef,
        entity_type: undefined
      })).toThrow('Data integrity issue: Field \'entityType\' is unexpectedly missing');

      // Missing field name
      expect(() => mapDbDefinitionToGraphQL({
        ...validDef,
        field_name: null
      })).toThrow('Data integrity issue: Field \'fieldName\' is unexpectedly missing');

      // Missing created_at
      expect(() => mapDbDefinitionToGraphQL({
        ...validDef,
        created_at: undefined
      })).toThrow('Data integrity issue: Field \'createdAt\' is unexpectedly missing');
    });

    test('should handle dropdown options validation', () => {
      const mapDbDefinitionToGraphQL = (dbDef: any) => {
        const mappedData = {
          id: dbDef.id,
          entityType: dbDef.entity_type,
          fieldName: dbDef.field_name,
          fieldLabel: dbDef.field_label,
          fieldType: dbDef.field_type,
          isRequired: dbDef.is_required ?? false,
          dropdownOptions: null,
          isActive: dbDef.is_active ?? true,
          displayOrder: dbDef.display_order ?? 0,
          createdAt: dbDef.created_at,
          updatedAt: dbDef.updated_at,
        };

        // Handle dropdownOptions validation
        if (dbDef.dropdown_options !== null && dbDef.dropdown_options !== undefined) {
          if (Array.isArray(dbDef.dropdown_options)) {
            mappedData.dropdownOptions = dbDef.dropdown_options.map((opt: any, index: number) => {
              if (opt === null || typeof opt !== 'object') {
                throw new Error(`Data integrity issue: Invalid dropdown option structure for custom field definition '${dbDef.id}'.`);
              }
              if (opt.value === null || opt.value === undefined) {
                throw new Error(`Data integrity issue: Dropdown option 'value' is missing for custom field definition '${dbDef.id}'.`);
              }
              if (opt.label === null || opt.label === undefined) {
                throw new Error(`Data integrity issue: Dropdown option 'label' is missing for custom field definition '${dbDef.id}'.`);
              }
              return { value: String(opt.value), label: String(opt.label) };
            });
          } else {
            mappedData.dropdownOptions = null;
          }
        }

        return mappedData;
      };

      const baseDef = {
        id: 'def-123',
        entity_type: 'DEAL',
        field_name: 'company_type',
        field_label: 'Company Type',
        field_type: 'DROPDOWN',
        is_required: false,
        is_active: true,
        display_order: 1,
        created_at: '2025-01-30T10:00:00Z',
        updated_at: '2025-01-30T10:00:00Z'
      };

      // Valid dropdown options
      const result = mapDbDefinitionToGraphQL({
        ...baseDef,
        dropdown_options: [
          { value: 'enterprise', label: 'Enterprise' },
          { value: 'smb', label: 'Small/Medium Business' }
        ]
      });
      expect(result.dropdownOptions).toEqual([
        { value: 'enterprise', label: 'Enterprise' },
        { value: 'smb', label: 'Small/Medium Business' }
      ]);

      // Null dropdown options (valid)
      const resultNull = mapDbDefinitionToGraphQL({
        ...baseDef,
        dropdown_options: null
      });
      expect(resultNull.dropdownOptions).toBeNull();

      // Invalid option structure
      expect(() => mapDbDefinitionToGraphQL({
        ...baseDef,
        dropdown_options: [null]
      })).toThrow('Data integrity issue: Invalid dropdown option structure');

      // Missing value
      expect(() => mapDbDefinitionToGraphQL({
        ...baseDef,
        dropdown_options: [{ label: 'Enterprise' }]
      })).toThrow('Data integrity issue: Dropdown option \'value\' is missing');

      // Missing label
      expect(() => mapDbDefinitionToGraphQL({
        ...baseDef,
        dropdown_options: [{ value: 'enterprise' }]
      })).toThrow('Data integrity issue: Dropdown option \'label\' is missing');

      // Non-array dropdown options
      const resultNonArray = mapDbDefinitionToGraphQL({
        ...baseDef,
        dropdown_options: 'invalid'
      });
      expect(resultNonArray.dropdownOptions).toBeNull();
    });

    test('should handle default values correctly', () => {
      const mapDbDefinitionToGraphQL = (dbDef: any) => {
        return {
          id: dbDef.id,
          entityType: dbDef.entity_type,
          fieldName: dbDef.field_name,
          fieldLabel: dbDef.field_label,
          fieldType: dbDef.field_type,
          isRequired: dbDef.is_required ?? false,
          dropdownOptions: null,
          isActive: dbDef.is_active ?? true,
          displayOrder: dbDef.display_order ?? 0,
          createdAt: dbDef.created_at,
          updatedAt: dbDef.updated_at,
        };
      };

      const defWithNulls = {
        id: 'def-123',
        entity_type: 'PERSON',
        field_name: 'notes',
        field_label: 'Notes',
        field_type: 'TEXTAREA',
        is_required: null,
        is_active: null,
        display_order: null,
        created_at: '2025-01-30T10:00:00Z',
        updated_at: '2025-01-30T10:00:00Z'
      };

      const result = mapDbDefinitionToGraphQL(defWithNulls);
      expect(result.isRequired).toBe(false);
      expect(result.isActive).toBe(true);
      expect(result.displayOrder).toBe(0);
    });
  });

  describe('Database Field Name Conversion', () => {
    test('should handle snake_case to camelCase conversion', () => {
      const dbToGraphQLMapping = {
        'entity_type': 'entityType',
        'field_name': 'fieldName',
        'field_label': 'fieldLabel',
        'field_type': 'fieldType',
        'is_required': 'isRequired',
        'dropdown_options': 'dropdownOptions',
        'is_active': 'isActive',
        'display_order': 'displayOrder',
        'created_at': 'createdAt',
        'updated_at': 'updatedAt'
      };

      // Test each mapping
      Object.entries(dbToGraphQLMapping).forEach(([dbField, graphqlField]) => {
        expect(dbField.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())).toBe(graphqlField);
      });
    });

    test('should validate database input structure', () => {
      const validateDbInput = (input: any): string[] => {
        const errors: string[] = [];
        const requiredFields = ['entity_type', 'field_name', 'field_label', 'field_type'];
        
        requiredFields.forEach(field => {
          if (!input[field]) {
            errors.push(`Missing required field: ${field}`);
          }
        });

        if (input.field_name && !/^[a-z][a-z0-9_]*$/.test(input.field_name)) {
          errors.push('Field name must start with lowercase letter and contain only lowercase letters, numbers, and underscores');
        }

        if (input.display_order && (isNaN(input.display_order) || input.display_order < 0)) {
          errors.push('Display order must be a non-negative number');
        }

        return errors;
      };

      // Valid input
      expect(validateDbInput({
        entity_type: 'DEAL',
        field_name: 'company_size',
        field_label: 'Company Size',
        field_type: 'TEXT',
        display_order: 1
      })).toEqual([]);

      // Missing required fields
      expect(validateDbInput({})).toEqual([
        'Missing required field: entity_type',
        'Missing required field: field_name',
        'Missing required field: field_label',
        'Missing required field: field_type'
      ]);

      // Invalid field name
      expect(validateDbInput({
        entity_type: 'DEAL',
        field_name: 'Company-Size',
        field_label: 'Company Size',
        field_type: 'TEXT'
      })).toContain('Field name must start with lowercase letter and contain only lowercase letters, numbers, and underscores');

      // Invalid display order
      expect(validateDbInput({
        entity_type: 'DEAL',
        field_name: 'company_size',
        field_label: 'Company Size',
        field_type: 'TEXT',
        display_order: -1
      })).toContain('Display order must be a non-negative number');
    });
  });

  describe('Custom Field Processing Integration Tests', () => {
    test('should process custom fields for creation with bulk fetch', async () => {
      const mockDefinitions = [
        {
          id: 'def-1',
          entityType: 'DEAL' as CustomFieldEntityType,
          fieldName: 'company_size',
          fieldLabel: 'Company Size',
          fieldType: 'TEXT' as CustomFieldType,
          isRequired: false,
          isActive: true,
          displayOrder: 1,
          createdAt: new Date('2025-01-30T10:00:00Z'),
          updatedAt: new Date('2025-01-30T10:00:00Z'),
          dropdownOptions: null
        },
        {
          id: 'def-2',
          entityType: 'DEAL' as CustomFieldEntityType,
          fieldName: 'deal_value',
          fieldLabel: 'Deal Value',
          fieldType: 'NUMBER' as CustomFieldType,
          isRequired: true,
          isActive: true,
          displayOrder: 2,
          createdAt: new Date('2025-01-30T10:00:00Z'),
          updatedAt: new Date('2025-01-30T10:00:00Z'),
          dropdownOptions: null
        }
      ];

      vi.mocked(getCustomFieldDefinitionsByIds).mockResolvedValue(mockDefinitions);

      const customFieldsInput: CustomFieldValueInput[] = [
        {
          definitionId: 'def-1',
          stringValue: 'Enterprise'
        },
        {
          definitionId: 'def-2',
          numberValue: 100000
        }
      ];

      const mockSupabaseClient = {} as any;
      
      const result = await processCustomFieldsForCreate(
        customFieldsInput,
        mockSupabaseClient,
        'DEAL' as CustomFieldEntityType,
        true // useBulkFetch
      );

      expect(result).toEqual({
        company_size: 'Enterprise',
        deal_value: 100000
      });

      expect(getCustomFieldDefinitionsByIds).toHaveBeenCalledWith(mockSupabaseClient, ['def-1', 'def-2']);
    });

    test('should process custom fields for creation with individual fetch', async () => {
      const mockDefinition1 = {
        id: 'def-1',
        entityType: 'PERSON' as CustomFieldEntityType,
        fieldName: 'linkedin_url',
        fieldLabel: 'LinkedIn URL',
        fieldType: 'TEXT' as CustomFieldType,
        isRequired: false,
        isActive: true,
        displayOrder: 1,
        createdAt: new Date('2025-01-30T10:00:00Z'),
        updatedAt: new Date('2025-01-30T10:00:00Z'),
        dropdownOptions: null
      };

      vi.mocked(getCustomFieldDefinitionById)
        .mockResolvedValueOnce(mockDefinition1)
        .mockResolvedValueOnce(null); // Second definition not found

      const customFieldsInput: CustomFieldValueInput[] = [
        {
          definitionId: 'def-1',
          stringValue: 'https://linkedin.com/in/johndoe'
        },
        {
          definitionId: 'def-invalid',
          stringValue: 'should be ignored'
        }
      ];

      const mockSupabaseClient = {} as any;
      
      const result = await processCustomFieldsForCreate(
        customFieldsInput,
        mockSupabaseClient,
        'PERSON' as CustomFieldEntityType,
        false // useBulkFetch = false
      );

      expect(result).toEqual({
        linkedin_url: 'https://linkedin.com/in/johndoe'
      });

      expect(getCustomFieldDefinitionById).toHaveBeenCalledTimes(2);
    });

    test('should process custom fields for updates', async () => {
      const mockDefinitions = [
        {
          id: 'def-1',
          entityType: 'ORGANIZATION' as CustomFieldEntityType,
          fieldName: 'industry',
          fieldLabel: 'Industry',
          fieldType: 'TEXT' as CustomFieldType,
          isRequired: false,
          isActive: true,
          displayOrder: 1,
          createdAt: new Date('2025-01-30T10:00:00Z'),
          updatedAt: new Date('2025-01-30T10:00:00Z'),
          dropdownOptions: null
        }
      ];

      vi.mocked(getCustomFieldDefinitionsByIds).mockResolvedValue(mockDefinitions);

      const currentValues = {
        industry: 'Technology',
        old_field: 'should remain'
      };

      const customFieldsInput: CustomFieldValueInput[] = [
        {
          definitionId: 'def-1',
          stringValue: 'Financial Services'
        }
      ];

      const mockSupabaseClient = {} as any;
      
      const result = await processCustomFieldsForUpdate(
        currentValues,
        customFieldsInput,
        mockSupabaseClient,
        'ORGANIZATION' as CustomFieldEntityType,
        true
      );

      expect(result.finalCustomFieldValues).toEqual({
        industry: 'Financial Services',
        old_field: 'should remain'
      });
    });

    test('should handle entity type validation', async () => {
      const mockDefinitions = [
        {
          id: 'def-1',
          entityType: 'PERSON' as CustomFieldEntityType, // Wrong entity type
          fieldName: 'person_field',
          fieldLabel: 'Person Field',
          fieldType: 'TEXT' as CustomFieldType,
          isRequired: false,
          isActive: true,
          displayOrder: 1,
          createdAt: new Date('2025-01-30T10:00:00Z'),
          updatedAt: new Date('2025-01-30T10:00:00Z'),
          dropdownOptions: null
        }
      ];

      vi.mocked(getCustomFieldDefinitionsByIds).mockResolvedValue(mockDefinitions);

      const customFieldsInput: CustomFieldValueInput[] = [
        {
          definitionId: 'def-1',
          stringValue: 'Should be ignored'
        }
      ];

      const mockSupabaseClient = {} as any;
      
      const result = await processCustomFieldsForCreate(
        customFieldsInput,
        mockSupabaseClient,
        'DEAL' as CustomFieldEntityType, // Different entity type
        true
      );

      expect(result).toBeNull(); // No fields processed due to entity type mismatch
    });

    test('should handle inactive field definitions', async () => {
      const mockDefinitions = [
        {
          id: 'def-1',
          entityType: 'DEAL' as CustomFieldEntityType,
          fieldName: 'inactive_field',
          fieldLabel: 'Inactive Field',
          fieldType: 'TEXT' as CustomFieldType,
          isRequired: false,
          isActive: false, // Inactive field
          displayOrder: 1,
          createdAt: new Date('2025-01-30T10:00:00Z'),
          updatedAt: new Date('2025-01-30T10:00:00Z'),
          dropdownOptions: null
        }
      ];

      vi.mocked(getCustomFieldDefinitionsByIds).mockResolvedValue(mockDefinitions);

      const customFieldsInput: CustomFieldValueInput[] = [
        {
          definitionId: 'def-1',
          stringValue: 'Should be ignored'
        }
      ];

      const mockSupabaseClient = {} as any;
      
      const result = await processCustomFieldsForCreate(
        customFieldsInput,
        mockSupabaseClient,
        'DEAL' as CustomFieldEntityType,
        true
      );

      expect(result).toBeNull(); // No fields processed due to inactive status
    });

    test('should handle bulk fetch errors gracefully', async () => {
      vi.mocked(getCustomFieldDefinitionsByIds).mockRejectedValue(new Error('Database connection failed'));

      const customFieldsInput: CustomFieldValueInput[] = [
        {
          definitionId: 'def-1',
          stringValue: 'Test Value'
        }
      ];

      const mockSupabaseClient = {} as any;
      
      const result = await processCustomFieldsForCreate(
        customFieldsInput,
        mockSupabaseClient,
        'DEAL' as CustomFieldEntityType,
        true
      );

      expect(result).toBeNull(); // Returns null on bulk fetch error
    });

    test('should handle empty or null inputs', async () => {
      const mockSupabaseClient = {} as any;

      // Empty array
      const result1 = await processCustomFieldsForCreate(
        [],
        mockSupabaseClient,
        'DEAL' as CustomFieldEntityType,
        true
      );
      expect(result1).toBeNull();

      // Null input
      const result2 = await processCustomFieldsForCreate(
        null,
        mockSupabaseClient,
        'DEAL' as CustomFieldEntityType,
        true
      );
      expect(result2).toBeNull();

      // Undefined input
      const result3 = await processCustomFieldsForCreate(
        undefined,
        mockSupabaseClient,
        'DEAL' as CustomFieldEntityType,
        true
      );
      expect(result3).toBeNull();
    });
  });

  describe('Custom Field Type Validation', () => {
    test('should validate dropdown/multiselect field types', () => {
      const validateDropdownInput = (fieldType: string, dropdownOptions: any): string[] => {
        const errors: string[] = [];

        if ((fieldType === 'DROPDOWN' || fieldType === 'MULTI_SELECT') && !dropdownOptions) {
          errors.push('Dropdown and multi-select fields must have dropdown options');
        }

        if (dropdownOptions && !Array.isArray(dropdownOptions)) {
          errors.push('Dropdown options must be an array');
        }

        if (Array.isArray(dropdownOptions)) {
          dropdownOptions.forEach((option, index) => {
            if (!option.value || typeof option.value !== 'string') {
              errors.push(`Option ${index + 1}: value is required and must be a string`);
            }
            if (!option.label || typeof option.label !== 'string') {
              errors.push(`Option ${index + 1}: label is required and must be a string`);
            }
          });

          // Check for duplicate values
          const values = dropdownOptions.map(opt => opt.value);
          const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
          if (duplicates.length > 0) {
            errors.push(`Duplicate option values found: ${duplicates.join(', ')}`);
          }
        }

        return errors;
      };

      // Valid dropdown
      expect(validateDropdownInput('DROPDOWN', [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' }
      ])).toEqual([]);

      // Missing options for dropdown
      expect(validateDropdownInput('DROPDOWN', null)).toContain(
        'Dropdown and multi-select fields must have dropdown options'
      );

      // Invalid options format
      expect(validateDropdownInput('DROPDOWN', 'invalid')).toContain(
        'Dropdown options must be an array'
      );

      // Missing option values
      expect(validateDropdownInput('DROPDOWN', [
        { label: 'Option 1' },
        { value: 'option2', label: 'Option 2' }
      ])).toContain('Option 1: value is required and must be a string');

      // Duplicate values
      expect(validateDropdownInput('DROPDOWN', [
        { value: 'option1', label: 'Option 1' },
        { value: 'option1', label: 'Option 1 Duplicate' }
      ])).toContain('Duplicate option values found: option1');
    });

    test('should validate field type constraints', () => {
      const validateFieldTypeConstraints = (fieldType: string, value: any): string[] => {
        const errors: string[] = [];

        switch (fieldType) {
          case 'TEXT':
            if (value !== null && typeof value !== 'string') {
              errors.push('Text field value must be a string');
            }
            if (typeof value === 'string' && value.length > 1000) {
              errors.push('Text field value cannot exceed 1000 characters');
            }
            break;

          case 'TEXTAREA':
            if (value !== null && typeof value !== 'string') {
              errors.push('Textarea field value must be a string');
            }
            if (typeof value === 'string' && value.length > 10000) {
              errors.push('Textarea field value cannot exceed 10000 characters');
            }
            break;

          case 'NUMBER':
            if (value !== null && typeof value !== 'number') {
              errors.push('Number field value must be a number');
            }
            if (typeof value === 'number' && !isFinite(value)) {
              errors.push('Number field value must be finite');
            }
            break;

          case 'BOOLEAN':
            if (value !== null && typeof value !== 'boolean') {
              errors.push('Boolean field value must be a boolean');
            }
            break;

          case 'DATE':
            if (value !== null && !(value instanceof Date) && typeof value !== 'string') {
              errors.push('Date field value must be a Date object or ISO string');
            }
            if (typeof value === 'string') {
              const date = new Date(value);
              if (isNaN(date.getTime())) {
                errors.push('Date field value must be a valid date');
              }
            }
            break;

          case 'DROPDOWN':
            if (value !== null && typeof value !== 'string') {
              errors.push('Dropdown field value must be a string');
            }
            break;

          case 'MULTI_SELECT':
            if (value !== null && !Array.isArray(value)) {
              errors.push('Multi-select field value must be an array');
            }
            if (Array.isArray(value)) {
              value.forEach((item, index) => {
                if (typeof item !== 'string') {
                  errors.push(`Multi-select item ${index + 1} must be a string`);
                }
              });
            }
            break;
        }

        return errors;
      };

      // Valid values
      expect(validateFieldTypeConstraints('TEXT', 'Valid text')).toEqual([]);
      expect(validateFieldTypeConstraints('NUMBER', 42.5)).toEqual([]);
      expect(validateFieldTypeConstraints('BOOLEAN', true)).toEqual([]);
      expect(validateFieldTypeConstraints('DATE', new Date())).toEqual([]);
      expect(validateFieldTypeConstraints('DROPDOWN', 'option1')).toEqual([]);
      expect(validateFieldTypeConstraints('MULTI_SELECT', ['option1', 'option2'])).toEqual([]);

      // Invalid values
      expect(validateFieldTypeConstraints('TEXT', 123)).toContain('Text field value must be a string');
      expect(validateFieldTypeConstraints('NUMBER', 'not a number')).toContain('Number field value must be a number');
      expect(validateFieldTypeConstraints('NUMBER', Infinity)).toContain('Number field value must be finite');
      expect(validateFieldTypeConstraints('BOOLEAN', 'not boolean')).toContain('Boolean field value must be a boolean');
      expect(validateFieldTypeConstraints('DATE', 'invalid date')).toContain('Date field value must be a valid date');
      expect(validateFieldTypeConstraints('DROPDOWN', 123)).toContain('Dropdown field value must be a string');
      expect(validateFieldTypeConstraints('MULTI_SELECT', 'not array')).toContain('Multi-select field value must be an array');

      // Length constraints
      expect(validateFieldTypeConstraints('TEXT', 'x'.repeat(1001))).toContain('Text field value cannot exceed 1000 characters');
      expect(validateFieldTypeConstraints('TEXTAREA', 'x'.repeat(10001))).toContain('Textarea field value cannot exceed 10000 characters');
    });
  });
}); 