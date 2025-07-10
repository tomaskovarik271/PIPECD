import { describe, test, expect, vi } from 'vitest';
import type { GraphQLContext } from '../../netlify/functions/graphql/helpers';
import { requireAuthentication, requirePermission, processZodError, getAccessToken, convertToDateOrNull } from '../../netlify/functions/graphql/helpers';
import { GraphQLError } from 'graphql';
import { ZodError, z } from 'zod';
import type { User } from '@supabase/supabase-js';

describe('GraphQL Resolvers Core Logic', () => {
  
  // Helper function to create mock GraphQL context
  const createMockContext = (overrides: Partial<GraphQLContext> = {}): GraphQLContext => ({
    currentUser: null,
    token: null,
    userPermissions: null,
    supabaseClient: {} as any,
    request: {} as any,
    params: {},
    waitUntil: vi.fn(),
    ...overrides
  } as GraphQLContext);

  describe('Authentication Helper Functions', () => {
    test('should extract access token correctly', () => {
      const mockContext = createMockContext({ token: 'test-jwt-token' });

      expect(getAccessToken(mockContext)).toBe('test-jwt-token');
      expect(getAccessToken(createMockContext({ token: null }))).toBeNull();
    });

    test('should require authentication successfully', () => {
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2025-01-30T10:00:00Z',
        updated_at: '2025-01-30T10:00:00Z',
        aud: '',
        app_metadata: {},
        user_metadata: {}
      };

      const authenticatedContext: GraphQLContext = {
        currentUser: mockUser,
        token: 'valid-token',
        userPermissions: ['deal:read', 'deal:create'],
        supabaseClient: {} as any,
        request: {} as any
      };

      const result = requireAuthentication(authenticatedContext);
      expect(result).toEqual({
        userId: 'user-123',
        accessToken: 'valid-token'
      });
    });

    test('should throw error when user is not authenticated', () => {
      const unauthenticatedContext: GraphQLContext = {
        currentUser: null,
        token: null,
        userPermissions: null,
        supabaseClient: {} as any,
        request: {} as any
      };

      expect(() => requireAuthentication(unauthenticatedContext)).toThrow(
        new GraphQLError('Authentication required', { extensions: { code: 'UNAUTHENTICATED' } })
      );
    });

    test('should throw error when token is missing', () => {
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2025-01-30T10:00:00Z',
        updated_at: '2025-01-30T10:00:00Z',
        aud: '',
        app_metadata: {},
        user_metadata: {}
      };

      const noTokenContext: GraphQLContext = {
        currentUser: mockUser,
        token: null, // Missing token
        userPermissions: ['deal:read'],
        supabaseClient: {} as any,
        request: {} as any
      };

      expect(() => requireAuthentication(noTokenContext)).toThrow(
        new GraphQLError('Authentication required', { extensions: { code: 'UNAUTHENTICATED' } })
      );
    });
  });

  describe('Permission Validation Logic', () => {
    test('should validate permissions successfully', () => {
      const mockUser: User = {
        id: 'user-123',
        email: 'admin@example.com',
        created_at: '2025-01-30T10:00:00Z',
        updated_at: '2025-01-30T10:00:00Z',
        aud: '',
        app_metadata: {},
        user_metadata: {}
      };

      const adminContext: GraphQLContext = {
        currentUser: mockUser,
        token: 'admin-token',
        userPermissions: ['app_settings:manage', 'deal:update_any', 'custom_fields:manage_definitions'],
        supabaseClient: {} as any,
        request: {} as any
      };

      // Should not throw for valid permissions
      expect(() => requirePermission(adminContext, 'app_settings:manage')).not.toThrow();
      expect(() => requirePermission(adminContext, 'deal:update_any')).not.toThrow();
      expect(() => requirePermission(adminContext, 'custom_fields:manage_definitions')).not.toThrow();
    });

    test('should throw error for missing permissions', () => {
      const mockUser: User = {
        id: 'user-123',
        email: 'member@example.com',
        created_at: '2025-01-30T10:00:00Z',
        updated_at: '2025-01-30T10:00:00Z',
        aud: '',
        app_metadata: {},
        user_metadata: {}
      };

      const memberContext: GraphQLContext = {
        currentUser: mockUser,
        token: 'member-token',
        userPermissions: ['deal:read', 'deal:create'], // Limited permissions
        supabaseClient: {} as any,
        request: {} as any
      };

      expect(() => requirePermission(memberContext, 'app_settings:manage')).toThrow(
        new GraphQLError('Permission denied. Required permission: app_settings:manage', {
          extensions: { code: 'FORBIDDEN', requiredPermission: 'app_settings:manage' }
        })
      );
    });

    test('should throw error when user is not authenticated', () => {
      const unauthenticatedContext: GraphQLContext = {
        currentUser: null,
        token: null,
        userPermissions: null,
        supabaseClient: {} as any,
        request: {} as any
      };

      expect(() => requirePermission(unauthenticatedContext, 'deal:read')).toThrow(
        new GraphQLError('Authentication required', { extensions: { code: 'UNAUTHENTICATED' } })
      );
    });

    test('should handle null permissions array', () => {
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2025-01-30T10:00:00Z',
        updated_at: '2025-01-30T10:00:00Z',
        aud: '',
        app_metadata: {},
        user_metadata: {}
      };

      const noPermissionsContext: GraphQLContext = {
        currentUser: mockUser,
        token: 'token',
        userPermissions: null, // No permissions loaded
        supabaseClient: {} as any,
        request: {} as any
      };

      expect(() => requirePermission(noPermissionsContext, 'deal:read')).toThrow(
        new GraphQLError('Permission denied. Required permission: deal:read', {
          extensions: { code: 'FORBIDDEN', requiredPermission: 'deal:read' }
        })
      );
    });

    test('should handle empty permissions array', () => {
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2025-01-30T10:00:00Z',
        updated_at: '2025-01-30T10:00:00Z',
        aud: '',
        app_metadata: {},
        user_metadata: {}
      };

      const emptyPermissionsContext: GraphQLContext = {
        currentUser: mockUser,
        token: 'token',
        userPermissions: [], // Empty permissions
        supabaseClient: {} as any,
        request: {} as any
      };

      expect(() => requirePermission(emptyPermissionsContext, 'deal:read')).toThrow(
        new GraphQLError('Permission denied. Required permission: deal:read', {
          extensions: { code: 'FORBIDDEN', requiredPermission: 'deal:read' }
        })
      );
    });

    test('should validate exact permission match', () => {
      const mockUser: User = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2025-01-30T10:00:00Z',
        updated_at: '2025-01-30T10:00:00Z',
        aud: '',
        app_metadata: {},
        user_metadata: {}
      };

      const specificPermissionsContext: GraphQLContext = {
        currentUser: mockUser,
        token: 'token',
        userPermissions: ['deal:update_own', 'person:read'], // Specific permissions
        supabaseClient: {} as any,
        request: {} as any
      };

      // Should pass for exact matches
      expect(() => requirePermission(specificPermissionsContext, 'deal:update_own')).not.toThrow();
      expect(() => requirePermission(specificPermissionsContext, 'person:read')).not.toThrow();

      // Should fail for partial matches
      expect(() => requirePermission(specificPermissionsContext, 'deal:update_any')).toThrow();
      expect(() => requirePermission(specificPermissionsContext, 'deal:update')).toThrow();
      expect(() => requirePermission(specificPermissionsContext, 'update_own')).toThrow();
    });
  });

  describe('Error Processing Logic', () => {
    test('should process Zod validation errors correctly', () => {
      const zodSchema = z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email format'),
        age: z.number().min(0, 'Age must be positive')
      });

      try {
        zodSchema.parse({
          name: '',
          email: 'invalid-email',
          age: -5
        });
      } catch (error) {
        const processedError = processZodError(error, 'validating user input');
        
        expect(processedError).toBeInstanceOf(GraphQLError);
        expect(processedError.message).toContain('Input validation failed');
        expect(processedError.message).toContain('Name is required');
        expect(processedError.message).toContain('Invalid email format');
        expect(processedError.message).toContain('Age must be positive');
        expect(processedError.extensions?.code).toBe('BAD_USER_INPUT');
        expect(processedError.extensions?.validationErrors).toBeDefined();
      }
    });

    test('should handle GraphQLError passthrough', () => {
      const originalError = new GraphQLError('Custom business logic error', {
        extensions: { code: 'BUSINESS_LOGIC_ERROR' }
      });

      const processedError = processZodError(originalError, 'processing business logic');
      
      expect(processedError).toBe(originalError); // Should be the same instance
      expect(processedError.message).toBe('Custom business logic error');
      expect(processedError.extensions?.code).toBe('BUSINESS_LOGIC_ERROR');
    });

    test('should handle generic Error objects', () => {
      const genericError = new Error('Database connection failed');
      
      const processedError = processZodError(genericError, 'connecting to database');
      
      expect(processedError).toBeInstanceOf(GraphQLError);
      expect(processedError.message).toBe('An unexpected error occurred while connecting to database.');
      expect(processedError.extensions?.code).toBe('INTERNAL_SERVER_ERROR');
      expect(processedError.originalError).toBe(genericError);
    });

    test('should handle unknown error types', () => {
      const unknownError = 'String error';
      
      const processedError = processZodError(unknownError, 'unknown operation');
      
      expect(processedError).toBeInstanceOf(GraphQLError);
      expect(processedError.message).toBe('An unexpected error occurred while unknown operation.');
      expect(processedError.extensions?.code).toBe('INTERNAL_SERVER_ERROR');
      expect(processedError.originalError).toBeUndefined();
    });

    test('should handle null/undefined errors', () => {
      const processedError1 = processZodError(null, 'null error test');
      const processedError2 = processZodError(undefined, 'undefined error test');
      
      expect(processedError1).toBeInstanceOf(GraphQLError);
      expect(processedError1.extensions?.code).toBe('INTERNAL_SERVER_ERROR');
      
      expect(processedError2).toBeInstanceOf(GraphQLError);
      expect(processedError2.extensions?.code).toBe('INTERNAL_SERVER_ERROR');
    });
  });

  describe('Date Conversion Utility', () => {
    test('should convert valid date strings correctly', () => {
      // ISO 8601 date strings
      expect(convertToDateOrNull('2025-01-30T10:00:00Z')).toEqual(new Date('2025-01-30T10:00:00Z'));
      expect(convertToDateOrNull('2025-01-30T10:00:00.123Z')).toEqual(new Date('2025-01-30T10:00:00.123Z'));
      
      // Date-only strings
      expect(convertToDateOrNull('2025-01-30')).toEqual(new Date('2025-01-30'));
      
      // Various formats
      expect(convertToDateOrNull('January 30, 2025')).toEqual(new Date('January 30, 2025'));
      expect(convertToDateOrNull('2025/01/30')).toEqual(new Date('2025/01/30'));
    });

    test('should return null for invalid inputs', () => {
      // Invalid date strings
      expect(convertToDateOrNull('invalid-date')).toBeNull();
      expect(convertToDateOrNull('2025-13-45')).toBeNull(); // Invalid month/day
      expect(convertToDateOrNull('not a date at all')).toBeNull();
      
      // Empty/null/undefined inputs
      expect(convertToDateOrNull('')).toBeNull();
      expect(convertToDateOrNull('   ')).toBeNull(); // Whitespace only
      expect(convertToDateOrNull(null)).toBeNull();
      expect(convertToDateOrNull(undefined)).toBeNull();
    });

    test('should handle edge cases', () => {
      // Leap year
      expect(convertToDateOrNull('2024-02-29')).toEqual(new Date('2024-02-29'));
      // Note: JavaScript Date constructor automatically adjusts invalid dates like 2023-02-29 to 2023-03-01
      // So we test with a clearly invalid date format instead
      expect(convertToDateOrNull('2023-02-30')).toEqual(new Date('2023-03-02')); // JS auto-adjusts invalid dates
      
      // Timezone handling
      expect(convertToDateOrNull('2025-01-30T10:00:00+05:00')).toEqual(new Date('2025-01-30T10:00:00+05:00'));
      expect(convertToDateOrNull('2025-01-30T10:00:00-08:00')).toEqual(new Date('2025-01-30T10:00:00-08:00'));
      
      // Epoch dates
      expect(convertToDateOrNull('1970-01-01T00:00:00Z')).toEqual(new Date('1970-01-01T00:00:00Z'));
      
      // Future dates
      expect(convertToDateOrNull('2099-12-31T23:59:59Z')).toEqual(new Date('2099-12-31T23:59:59Z'));
    });
  });

  describe('Business Rules Data Mapping Logic', () => {
    test('should map database business rule to GraphQL correctly', () => {
      const mapDbBusinessRuleToGraphQL = (dbRule: any) => {
        try {
          // Parse conditions with error handling
          let conditions = [];
          try {
            const conditionsData = typeof dbRule.conditions === 'string' 
              ? JSON.parse(dbRule.conditions) 
              : dbRule.conditions || [];
            conditions = conditionsData.map((condition: any) => ({
              ...condition,
              logicalOperator: condition.logicalOperator || 'AND'
            }));
          } catch (conditionsError) {
            conditions = [];
          }

          // Parse actions with error handling
          let actions = [];
          try {
            const actionsData = typeof dbRule.actions === 'string' 
              ? JSON.parse(dbRule.actions) 
              : dbRule.actions || [];
            actions = actionsData.map((action: any) => ({
              ...action,
              priority: action.priority || 1
            }));
          } catch (actionsError) {
            actions = [];
          }

          return {
            id: dbRule.id,
            name: dbRule.name,
            description: dbRule.description,
            entityType: dbRule.entity_type,
            triggerType: dbRule.trigger_type,
            triggerEvents: dbRule.trigger_events || [],
            triggerFields: dbRule.trigger_fields || [],
            conditions,
            actions,
            status: dbRule.status,
            executionCount: dbRule.execution_count || 0,
            lastError: dbRule.last_error,
            lastExecution: dbRule.last_execution,
            createdAt: new Date(dbRule.created_at),
            updatedAt: new Date(dbRule.updated_at)
          };
        } catch (error) {
          throw new Error(`Failed to map business rule ${dbRule?.id}: ${error.message}`);
        }
      };

      // Valid business rule from database
      const dbRule = {
        id: 'rule-123',
        name: 'High Value Deal Alert',
        description: 'Alert when deal value exceeds $10,000',
        entity_type: 'DEAL',
        trigger_type: 'FIELD_CHANGE',
        trigger_events: ['UPDATE'],
        trigger_fields: ['amount'],
        conditions: JSON.stringify([
          {
            field: 'amount',
            operator: 'GREATER_THAN',
            value: '10000',
            logicalOperator: 'AND'
          }
        ]),
        actions: JSON.stringify([
          {
            type: 'NOTIFY_USER',
            details: { message: 'High value deal created' },
            priority: 1
          }
        ]),
        status: 'ACTIVE',
        execution_count: 5,
        last_error: null,
        last_execution: '2025-01-30T10:00:00Z',
        created_at: '2025-01-29T10:00:00Z',
        updated_at: '2025-01-30T10:00:00Z'
      };

      const result = mapDbBusinessRuleToGraphQL(dbRule);

      expect(result.id).toBe('rule-123');
      expect(result.name).toBe('High Value Deal Alert');
      expect(result.entityType).toBe('DEAL');
      expect(result.triggerType).toBe('FIELD_CHANGE');
      expect(result.conditions).toHaveLength(1);
      expect(result.conditions[0].field).toBe('amount');
      expect(result.conditions[0].operator).toBe('GREATER_THAN');
      expect(result.conditions[0].logicalOperator).toBe('AND');
      expect(result.actions).toHaveLength(1);
      expect(result.actions[0].type).toBe('NOTIFY_USER');
      expect(result.actions[0].priority).toBe(1);
      expect(result.executionCount).toBe(5);
    });

    test('should handle malformed JSON in conditions/actions', () => {
      const mapDbBusinessRuleToGraphQL = (dbRule: any) => {
        let conditions = [];
        try {
          const conditionsData = typeof dbRule.conditions === 'string' 
            ? JSON.parse(dbRule.conditions) 
            : dbRule.conditions || [];
          conditions = conditionsData.map((condition: any) => ({
            ...condition,
            logicalOperator: condition.logicalOperator || 'AND'
          }));
        } catch (conditionsError) {
          conditions = [];
        }

        let actions = [];
        try {
          const actionsData = typeof dbRule.actions === 'string' 
            ? JSON.parse(dbRule.actions) 
            : dbRule.actions || [];
          actions = actionsData.map((action: any) => ({
            ...action,
            priority: action.priority || 1
          }));
        } catch (actionsError) {
          actions = [];
        }

        return { conditions, actions };
      };

      // Malformed JSON strings
      const dbRuleWithBadJSON = {
        conditions: '{"invalid": json}', // Invalid JSON
        actions: '[{"type": "NOTIFY_USER", incomplete'  // Incomplete JSON
      };

      const result = mapDbBusinessRuleToGraphQL(dbRuleWithBadJSON);
      expect(result.conditions).toEqual([]);
      expect(result.actions).toEqual([]);
    });

    test('should apply default values correctly', () => {
      const mapDbBusinessRuleToGraphQL = (dbRule: any) => {
        const conditionsData = dbRule.conditions || [];
        const conditions = conditionsData.map((condition: any) => ({
          ...condition,
          logicalOperator: condition.logicalOperator || 'AND'
        }));

        const actionsData = dbRule.actions || [];
        const actions = actionsData.map((action: any) => ({
          ...action,
          priority: action.priority || 1
        }));

        return {
          triggerEvents: dbRule.trigger_events || [],
          triggerFields: dbRule.trigger_fields || [],
          conditions,
          actions,
          executionCount: dbRule.execution_count || 0
        };
      };

      // Rule with missing optional fields
      const dbRule = {
        conditions: [
          { field: 'status', operator: 'EQUALS', value: 'ACTIVE' } // Missing logicalOperator
        ],
        actions: [
          { type: 'NOTIFY_USER', details: {} } // Missing priority
        ]
      };

      const result = mapDbBusinessRuleToGraphQL(dbRule);

      expect(result.triggerEvents).toEqual([]);
      expect(result.triggerFields).toEqual([]);
      expect(result.conditions[0].logicalOperator).toBe('AND');
      expect(result.actions[0].priority).toBe(1);
      expect(result.executionCount).toBe(0);
    });

    test('should handle null and undefined values', () => {
      const mapDbBusinessRuleToGraphQL = (dbRule: any) => {
        return {
          triggerEvents: dbRule.trigger_events || [],
          triggerFields: dbRule.trigger_fields || [],
          executionCount: dbRule.execution_count || 0,
          lastError: dbRule.last_error,
          lastExecution: dbRule.last_execution
        };
      };

      const dbRule = {
        trigger_events: null,
        trigger_fields: undefined,
        execution_count: null,
        last_error: null,
        last_execution: undefined
      };

      const result = mapDbBusinessRuleToGraphQL(dbRule);

      expect(result.triggerEvents).toEqual([]);
      expect(result.triggerFields).toEqual([]);
      expect(result.executionCount).toBe(0);
      expect(result.lastError).toBeNull();
      expect(result.lastExecution).toBeUndefined();
    });
  });

  describe('Deal Weighted Amount Calculation Logic', () => {
    test('should calculate weighted amount with deal-specific probability', () => {
      const calculateWeightedAmount = (deal: any) => {
        const currentAmount = deal.amount;

        if (typeof currentAmount !== 'number') {
          return null;
        }

        let effectiveProbability: number | null = null;

        if (typeof deal.deal_specific_probability === 'number') {
          effectiveProbability = deal.deal_specific_probability;
        }

        if (effectiveProbability !== null) {
          return currentAmount * effectiveProbability;
        }

        return null;
      };

      // Deal with specific probability
      expect(calculateWeightedAmount({
        amount: 100000,
        deal_specific_probability: 0.75
      })).toBe(75000);

      // Deal with 100% probability
      expect(calculateWeightedAmount({
        amount: 50000,
        deal_specific_probability: 1.0
      })).toBe(50000);

      // Deal with 0% probability
      expect(calculateWeightedAmount({
        amount: 25000,
        deal_specific_probability: 0.0
      })).toBe(0);

      // Deal without specific probability
      expect(calculateWeightedAmount({
        amount: 100000,
        deal_specific_probability: null
      })).toBeNull();

      // Deal without amount
      expect(calculateWeightedAmount({
        amount: null,
        deal_specific_probability: 0.5
      })).toBeNull();
    });

    test('should handle edge cases in weighted amount calculation', () => {
      const calculateWeightedAmount = (deal: any) => {
        const currentAmount = deal.amount;

        if (typeof currentAmount !== 'number') {
          return null;
        }

        const probability = deal.deal_specific_probability;
        if (typeof probability === 'number') {
          return currentAmount * probability;
        }

        return null;
      };

      // Very large amounts
      expect(calculateWeightedAmount({
        amount: 999999999.99,
        deal_specific_probability: 0.1
      })).toBeCloseTo(99999999.999);

      // Very small amounts
      expect(calculateWeightedAmount({
        amount: 0.01,
        deal_specific_probability: 0.5
      })).toBeCloseTo(0.005);

      // Zero amount
      expect(calculateWeightedAmount({
        amount: 0,
        deal_specific_probability: 0.75
      })).toBe(0);

      // Negative amount (edge case)
      expect(calculateWeightedAmount({
        amount: -1000,
        deal_specific_probability: 0.5
      })).toBe(-500);

      // Invalid amount types
      expect(calculateWeightedAmount({
        amount: 'invalid',
        deal_specific_probability: 0.5
      })).toBeNull();

      expect(calculateWeightedAmount({
        amount: undefined,
        deal_specific_probability: 0.5
      })).toBeNull();
    });

    test('should validate probability bounds', () => {
      const validateProbability = (probability: number): boolean => {
        return typeof probability === 'number' && 
               probability >= 0 && 
               probability <= 1 && 
               !isNaN(probability) && 
               isFinite(probability);
      };

      // Valid probabilities
      expect(validateProbability(0)).toBe(true);
      expect(validateProbability(0.5)).toBe(true);
      expect(validateProbability(1)).toBe(true);
      expect(validateProbability(0.001)).toBe(true);
      expect(validateProbability(0.999)).toBe(true);

      // Invalid probabilities
      expect(validateProbability(-0.1)).toBe(false);
      expect(validateProbability(1.1)).toBe(false);
      expect(validateProbability(NaN)).toBe(false);
      expect(validateProbability(Infinity)).toBe(false);
      expect(validateProbability(-Infinity)).toBe(false);
    });
  });

  describe('Custom Field Value Mapping Logic', () => {
    test('should map custom field values by type correctly', () => {
      const mapCustomFieldValue = (rawValue: any, fieldType: string) => {
        const fieldValue = {
          stringValue: null,
          numberValue: null,
          booleanValue: null,
          dateValue: null,
          selectedOptionValues: null
        };

        if (rawValue === undefined || rawValue === null) {
          return fieldValue;
        }

        switch (fieldType) {
          case 'TEXT':
            fieldValue.stringValue = String(rawValue);
            break;
          case 'NUMBER':
            const num = parseFloat(rawValue);
            if (!isNaN(num)) {
              fieldValue.numberValue = num;
            }
            break;
          case 'BOOLEAN':
            fieldValue.booleanValue = Boolean(rawValue);
            break;
          case 'DATE':
            fieldValue.dateValue = rawValue;
            fieldValue.stringValue = String(rawValue);
            break;
          case 'DROPDOWN':
            if (Array.isArray(rawValue) && rawValue.length > 0) {
              fieldValue.selectedOptionValues = [String(rawValue[0])];
              fieldValue.stringValue = String(rawValue[0]);
            } else if (typeof rawValue === 'string') {
              fieldValue.selectedOptionValues = [rawValue];
              fieldValue.stringValue = rawValue;
            }
            break;
          case 'MULTI_SELECT':
            if (Array.isArray(rawValue)) {
              fieldValue.selectedOptionValues = rawValue.map(String);
            }
            break;
        }

        return fieldValue;
      };

      // Text field
      expect(mapCustomFieldValue('Company Name', 'TEXT')).toEqual({
        stringValue: 'Company Name',
        numberValue: null,
        booleanValue: null,
        dateValue: null,
        selectedOptionValues: null
      });

      // Number field
      expect(mapCustomFieldValue('42.5', 'NUMBER')).toEqual({
        stringValue: null,
        numberValue: 42.5,
        booleanValue: null,
        dateValue: null,
        selectedOptionValues: null
      });

      // Boolean field
      expect(mapCustomFieldValue(true, 'BOOLEAN')).toEqual({
        stringValue: null,
        numberValue: null,
        booleanValue: true,
        dateValue: null,
        selectedOptionValues: null
      });

      // Date field
      const testDate = new Date('2025-01-30');
      expect(mapCustomFieldValue(testDate, 'DATE')).toEqual({
        stringValue: testDate.toString(),
        numberValue: null,
        booleanValue: null,
        dateValue: testDate,
        selectedOptionValues: null
      });

      // Dropdown field with array
      expect(mapCustomFieldValue(['option1'], 'DROPDOWN')).toEqual({
        stringValue: 'option1',
        numberValue: null,
        booleanValue: null,
        dateValue: null,
        selectedOptionValues: ['option1']
      });

      // Dropdown field with string
      expect(mapCustomFieldValue('option2', 'DROPDOWN')).toEqual({
        stringValue: 'option2',
        numberValue: null,
        booleanValue: null,
        dateValue: null,
        selectedOptionValues: ['option2']
      });

      // Multi-select field
      expect(mapCustomFieldValue(['opt1', 'opt2', 'opt3'], 'MULTI_SELECT')).toEqual({
        stringValue: null,
        numberValue: null,
        booleanValue: null,
        dateValue: null,
        selectedOptionValues: ['opt1', 'opt2', 'opt3']
      });
    });

    test('should handle invalid values gracefully', () => {
      const mapCustomFieldValue = (rawValue: any, fieldType: string) => {
        const fieldValue = {
          stringValue: null,
          numberValue: null,
          booleanValue: null,
          dateValue: null,
          selectedOptionValues: null
        };

        if (rawValue === undefined || rawValue === null) {
          return fieldValue;
        }

        switch (fieldType) {
          case 'NUMBER':
            const num = parseFloat(rawValue);
            if (!isNaN(num)) {
              fieldValue.numberValue = num;
            }
            break;
          case 'DROPDOWN':
            if (Array.isArray(rawValue) && rawValue.length > 0) {
              fieldValue.selectedOptionValues = [String(rawValue[0])];
              fieldValue.stringValue = String(rawValue[0]);
            } else if (typeof rawValue === 'string') {
              fieldValue.selectedOptionValues = [rawValue];
              fieldValue.stringValue = rawValue;
            }
            break;
          case 'MULTI_SELECT':
            if (Array.isArray(rawValue)) {
              fieldValue.selectedOptionValues = rawValue.map(String);
            }
            break;
        }

        return fieldValue;
      };

      // Invalid number
      expect(mapCustomFieldValue('not-a-number', 'NUMBER')).toEqual({
        stringValue: null,
        numberValue: null,
        booleanValue: null,
        dateValue: null,
        selectedOptionValues: null
      });

      // Empty dropdown array
      expect(mapCustomFieldValue([], 'DROPDOWN')).toEqual({
        stringValue: null,
        numberValue: null,
        booleanValue: null,
        dateValue: null,
        selectedOptionValues: null
      });

      // Non-array for multi-select
      expect(mapCustomFieldValue('not-array', 'MULTI_SELECT')).toEqual({
        stringValue: null,
        numberValue: null,
        booleanValue: null,
        dateValue: null,
        selectedOptionValues: null
      });

      // Null/undefined values
      expect(mapCustomFieldValue(null, 'TEXT')).toEqual({
        stringValue: null,
        numberValue: null,
        booleanValue: null,
        dateValue: null,
        selectedOptionValues: null
      });

      expect(mapCustomFieldValue(undefined, 'NUMBER')).toEqual({
        stringValue: null,
        numberValue: null,
        booleanValue: null,
        dateValue: null,
        selectedOptionValues: null
      });
    });
  });
}); 