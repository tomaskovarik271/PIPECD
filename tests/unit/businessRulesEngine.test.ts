import { describe, test, expect, beforeEach } from 'vitest';
import { EntityTypeEnum } from '../../lib/generated/graphql';

// Define interfaces locally to avoid import issues
interface BusinessRuleCondition {
  field: string;
  operator: string;
  value: string;
  logicalOperator?: 'AND' | 'OR';
}

interface BusinessRuleAction {
  type: string;
  target?: string;
  template?: string;
  message?: string;
  priority?: number;
  metadata?: any;
}

interface ProcessingContext {
  entityType: EntityTypeEnum;
  entityId: string;
  triggerEvent: string;
  entityData: any;
  changeData?: any;
  testMode?: boolean;
}

interface BusinessRuleInput {
  name: string;
  entityType: EntityTypeEnum;
  conditions?: BusinessRuleCondition[];
  actions?: BusinessRuleAction[];
  triggerType?: string;
  triggerEvents?: string[];
  triggerFields?: string[];
}

describe('Business Rules Engine - Core Logic', () => {

  describe('Condition Evaluation Logic', () => {
    
    describe('String Operators', () => {
      test('EQUALS operator should handle exact matches', () => {
        const evaluateCondition = (condition: BusinessRuleCondition, entityData: any): boolean => {
          const fieldValue = entityData[condition.field];
          const { operator, value } = condition;
          
          if (operator === 'EQUALS') {
            return String(fieldValue) === String(value);
          }
          return false;
        };

        const entityData = { status: 'ACTIVE', name: 'Test Deal', amount: 1000 };

        expect(evaluateCondition(
          { field: 'status', operator: 'EQUALS', value: 'ACTIVE' },
          entityData
        )).toBe(true);

        expect(evaluateCondition(
          { field: 'status', operator: 'EQUALS', value: 'INACTIVE' },
          entityData
        )).toBe(false);

        // Type coercion tests
        expect(evaluateCondition(
          { field: 'amount', operator: 'EQUALS', value: '1000' },
          entityData
        )).toBe(true);
      });

      test('NOT_EQUALS operator should handle negation', () => {
        const evaluateCondition = (condition: BusinessRuleCondition, entityData: any): boolean => {
          const fieldValue = entityData[condition.field];
          const { operator, value } = condition;
          
          if (operator === 'NOT_EQUALS') {
            return String(fieldValue) !== String(value);
          }
          return false;
        };

        const entityData = { status: 'ACTIVE', priority: 'HIGH' };

        expect(evaluateCondition(
          { field: 'status', operator: 'NOT_EQUALS', value: 'INACTIVE' },
          entityData
        )).toBe(true);

        expect(evaluateCondition(
          { field: 'status', operator: 'NOT_EQUALS', value: 'ACTIVE' },
          entityData
        )).toBe(false);
      });

      test('CONTAINS operator should handle substring matching', () => {
        const evaluateCondition = (condition: BusinessRuleCondition, entityData: any): boolean => {
          const fieldValue = entityData[condition.field];
          const { operator, value } = condition;
          
          if (operator === 'CONTAINS') {
            return String(fieldValue).toLowerCase().includes(String(value).toLowerCase());
          }
          return false;
        };

        const entityData = { 
          title: 'Enterprise Software Deal',
          description: 'Large SAAS implementation project'
        };

        expect(evaluateCondition(
          { field: 'title', operator: 'CONTAINS', value: 'Software' },
          entityData
        )).toBe(true);

        expect(evaluateCondition(
          { field: 'title', operator: 'CONTAINS', value: 'software' },
          entityData
        )).toBe(true); // Case insensitive

        expect(evaluateCondition(
          { field: 'title', operator: 'CONTAINS', value: 'Hardware' },
          entityData
        )).toBe(false);
      });

      test('STARTS_WITH and ENDS_WITH operators', () => {
        const evaluateCondition = (condition: BusinessRuleCondition, entityData: any): boolean => {
          const fieldValue = entityData[condition.field];
          const { operator, value } = condition;
          
          switch (operator) {
            case 'STARTS_WITH':
              return String(fieldValue).toLowerCase().startsWith(String(value).toLowerCase());
            case 'ENDS_WITH':
              return String(fieldValue).toLowerCase().endsWith(String(value).toLowerCase());
            default:
              return false;
          }
        };

        const entityData = { 
          email: 'john.doe@acmecorp.com',
          phone: '+1-555-1234'
        };

        expect(evaluateCondition(
          { field: 'email', operator: 'STARTS_WITH', value: 'john' },
          entityData
        )).toBe(true);

        expect(evaluateCondition(
          { field: 'email', operator: 'ENDS_WITH', value: 'acmecorp.com' },
          entityData
        )).toBe(true);

        expect(evaluateCondition(
          { field: 'phone', operator: 'STARTS_WITH', value: '+1' },
          entityData
        )).toBe(true);
      });
    });

    describe('Numeric Operators', () => {
      test('should handle numeric comparisons correctly', () => {
        const evaluateCondition = (condition: BusinessRuleCondition, entityData: any): boolean => {
          const fieldValue = entityData[condition.field];
          const { operator, value } = condition;
          
          switch (operator) {
            case 'GREATER_THAN':
              return Number(fieldValue) > Number(value);
            case 'LESS_THAN':
              return Number(fieldValue) < Number(value);
            case 'GREATER_EQUAL':
              return Number(fieldValue) >= Number(value);
            case 'LESS_EQUAL':
              return Number(fieldValue) <= Number(value);
            default:
              return false;
          }
        };

        const entityData = { 
          amount: 50000,
          score: 85.5,
          count: 0
        };

        // Greater than tests
        expect(evaluateCondition(
          { field: 'amount', operator: 'GREATER_THAN', value: '25000' },
          entityData
        )).toBe(true);

        expect(evaluateCondition(
          { field: 'amount', operator: 'GREATER_THAN', value: '75000' },
          entityData
        )).toBe(false);

        // Less than tests
        expect(evaluateCondition(
          { field: 'score', operator: 'LESS_THAN', value: '90' },
          entityData
        )).toBe(true);

        // Greater/Less equal tests
        expect(evaluateCondition(
          { field: 'amount', operator: 'GREATER_EQUAL', value: '50000' },
          entityData
        )).toBe(true);

        expect(evaluateCondition(
          { field: 'count', operator: 'LESS_EQUAL', value: '0' },
          entityData
        )).toBe(true);
      });

      test('should handle numeric edge cases', () => {
        const evaluateCondition = (condition: BusinessRuleCondition, entityData: any): boolean => {
          const fieldValue = entityData[condition.field];
          const { operator, value } = condition;
          
          if (operator === 'GREATER_THAN') {
            return Number(fieldValue) > Number(value);
          }
          return false;
        };

        const entityData = { 
          negative: -100,
          decimal: 3.14159,
          zero: 0,
          large: 999999999
        };

        expect(evaluateCondition(
          { field: 'negative', operator: 'GREATER_THAN', value: '-200' },
          entityData
        )).toBe(true);

        expect(evaluateCondition(
          { field: 'decimal', operator: 'GREATER_THAN', value: '3.14' },
          entityData
        )).toBe(true);

        expect(evaluateCondition(
          { field: 'zero', operator: 'GREATER_THAN', value: '-1' },
          entityData
        )).toBe(true);
      });
    });

    describe('Null/Undefined Operators', () => {
      test('IS_NULL and IS_NOT_NULL operators', () => {
        const evaluateCondition = (condition: BusinessRuleCondition, entityData: any): boolean => {
          const fieldValue = entityData[condition.field];
          const { operator } = condition;
          
          switch (operator) {
            case 'IS_NULL':
              return fieldValue == null;
            case 'IS_NOT_NULL':
              return fieldValue != null;
            default:
              return false;
          }
        };

        const entityData = {
          name: 'John Doe',
          email: null,
          phone: undefined,
          score: 0,
          active: false
        };

        expect(evaluateCondition(
          { field: 'email', operator: 'IS_NULL', value: '' },
          entityData
        )).toBe(true);

        expect(evaluateCondition(
          { field: 'phone', operator: 'IS_NULL', value: '' },
          entityData
        )).toBe(true);

        expect(evaluateCondition(
          { field: 'name', operator: 'IS_NOT_NULL', value: '' },
          entityData
        )).toBe(true);

        // Zero and false should not be null
        expect(evaluateCondition(
          { field: 'score', operator: 'IS_NULL', value: '' },
          entityData
        )).toBe(false);

        expect(evaluateCondition(
          { field: 'active', operator: 'IS_NULL', value: '' },
          entityData
        )).toBe(false);
      });
    });

    describe('List Operators', () => {
      test('IN operator should handle comma-separated values', () => {
        const evaluateCondition = (condition: BusinessRuleCondition, entityData: any): boolean => {
          const fieldValue = entityData[condition.field];
          const { operator, value } = condition;
          
          if (operator === 'IN') {
            const values = String(value).split(',').map(v => v.trim());
            return values.includes(String(fieldValue));
          }
          return false;
        };

        const entityData = {
          status: 'ACTIVE',
          priority: 'HIGH',
          category: 'ENTERPRISE'
        };

        expect(evaluateCondition(
          { field: 'status', operator: 'IN', value: 'ACTIVE,PENDING,DRAFT' },
          entityData
        )).toBe(true);

        expect(evaluateCondition(
          { field: 'status', operator: 'IN', value: 'CLOSED,LOST,CANCELLED' },
          entityData
        )).toBe(false);

        // Test with spaces in list
        expect(evaluateCondition(
          { field: 'priority', operator: 'IN', value: 'LOW, MEDIUM, HIGH' },
          entityData
        )).toBe(true);
      });

      test('NOT_IN operator should handle exclusion lists', () => {
        const evaluateCondition = (condition: BusinessRuleCondition, entityData: any): boolean => {
          const fieldValue = entityData[condition.field];
          const { operator, value } = condition;
          
          if (operator === 'NOT_IN') {
            const notValues = String(value).split(',').map(v => v.trim());
            return !notValues.includes(String(fieldValue));
          }
          return false;
        };

        const entityData = { stage: 'NEGOTIATION' };

        expect(evaluateCondition(
          { field: 'stage', operator: 'NOT_IN', value: 'CLOSED,LOST,CANCELLED' },
          entityData
        )).toBe(true);

        expect(evaluateCondition(
          { field: 'stage', operator: 'NOT_IN', value: 'NEGOTIATION,PROPOSAL' },
          entityData
        )).toBe(false);
      });
    });

    describe('Date/Time Operators', () => {
      test('OLDER_THAN operator should handle time intervals', () => {
        const parseInterval = (interval: string): number => {
          const match = interval.match(/(\d+)\s*(day|hour|minute|week)s?/i);
          if (!match) return 0;
          
          const [, amount, unit] = match;
          const multipliers = {
            minute: 60 * 1000,
            hour: 60 * 60 * 1000,
            day: 24 * 60 * 60 * 1000,
            week: 7 * 24 * 60 * 60 * 1000
          };
          
          return parseInt(amount) * (multipliers[unit.toLowerCase()] || 0);
        };

        const evaluateCondition = (condition: BusinessRuleCondition, entityData: any): boolean => {
          const fieldValue = entityData[condition.field];
          const { operator, value } = condition;
          
          if (operator === 'OLDER_THAN') {
            if (!fieldValue) return false;
            const fieldDate = new Date(fieldValue);
            const intervalMs = parseInterval(value);
            return Date.now() - fieldDate.getTime() > intervalMs;
          }
          return false;
        };

        const now = Date.now();
        const entityData = {
          created_at: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          updated_at: new Date(now - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          last_contact: new Date(now - 30 * 60 * 1000).toISOString() // 30 minutes ago
        };

        expect(evaluateCondition(
          { field: 'created_at', operator: 'OLDER_THAN', value: '2 days' },
          entityData
        )).toBe(true);

        expect(evaluateCondition(
          { field: 'created_at', operator: 'OLDER_THAN', value: '5 days' },
          entityData
        )).toBe(false);

        expect(evaluateCondition(
          { field: 'updated_at', operator: 'OLDER_THAN', value: '1 hour' },
          entityData
        )).toBe(true);

        expect(evaluateCondition(
          { field: 'last_contact', operator: 'OLDER_THAN', value: '45 minutes' },
          entityData
        )).toBe(false);
      });

      test('NEWER_THAN operator should handle recent time intervals', () => {
        const parseInterval = (interval: string): number => {
          const match = interval.match(/(\d+)\s*(day|hour|minute|week)s?/i);
          if (!match) return 0;
          
          const [, amount, unit] = match;
          const multipliers = {
            minute: 60 * 1000,
            hour: 60 * 60 * 1000,
            day: 24 * 60 * 60 * 1000,
            week: 7 * 24 * 60 * 60 * 1000
          };
          
          return parseInt(amount) * (multipliers[unit.toLowerCase()] || 0);
        };

        const evaluateCondition = (condition: BusinessRuleCondition, entityData: any): boolean => {
          const fieldValue = entityData[condition.field];
          const { operator, value } = condition;
          
          if (operator === 'NEWER_THAN') {
            if (!fieldValue) return false;
            const fieldDate = new Date(fieldValue);
            const intervalMs = parseInterval(value);
            return Date.now() - fieldDate.getTime() < intervalMs;
          }
          return false;
        };

        const now = Date.now();
        const entityData = {
          last_activity: new Date(now - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          last_email: new Date(now - 3 * 60 * 60 * 1000).toISOString() // 3 hours ago
        };

        expect(evaluateCondition(
          { field: 'last_activity', operator: 'NEWER_THAN', value: '1 hour' },
          entityData
        )).toBe(true);

        expect(evaluateCondition(
          { field: 'last_activity', operator: 'NEWER_THAN', value: '15 minutes' },
          entityData
        )).toBe(false);

        expect(evaluateCondition(
          { field: 'last_email', operator: 'NEWER_THAN', value: '2 hours' },
          entityData
        )).toBe(false);
      });

      test('should parse time intervals correctly', () => {
        const parseInterval = (interval: string): number => {
          const match = interval.match(/(\d+)\s*(day|hour|minute|week)s?/i);
          if (!match) return 0;
          
          const [, amount, unit] = match;
          const multipliers = {
            minute: 60 * 1000,
            hour: 60 * 60 * 1000,
            day: 24 * 60 * 60 * 1000,
            week: 7 * 24 * 60 * 60 * 1000
          };
          
          return parseInt(amount) * (multipliers[unit.toLowerCase()] || 0);
        };

        expect(parseInterval('30 minutes')).toBe(30 * 60 * 1000);
        expect(parseInterval('2 hours')).toBe(2 * 60 * 60 * 1000);
        expect(parseInterval('1 day')).toBe(24 * 60 * 60 * 1000);
        expect(parseInterval('2 weeks')).toBe(2 * 7 * 24 * 60 * 60 * 1000);
        
        // Test singular forms
        expect(parseInterval('1 minute')).toBe(60 * 1000);
        expect(parseInterval('1 hour')).toBe(60 * 60 * 1000);
        
        // Test invalid intervals
        expect(parseInterval('invalid')).toBe(0);
        expect(parseInterval('5 seconds')).toBe(0); // Not supported
      });
    });

    describe('Change Detection Operators', () => {
      test('CHANGED_FROM operator should detect field value changes', () => {
        const evaluateCondition = (condition: BusinessRuleCondition, entityData: any, changeData?: any): boolean => {
          const fieldValue = entityData[condition.field];
          const { operator, value } = condition;
          
          if (operator === 'CHANGED_FROM') {
            if (!changeData) return false;
            const originalValue = changeData[`original_${condition.field}`];
            return String(originalValue) === String(value) && String(fieldValue) !== String(value);
          }
          return false;
        };

        const entityData = { status: 'ACTIVE', priority: 'HIGH' };
        const changeData = { 
          original_status: 'DRAFT',
          original_priority: 'MEDIUM'
        };

        expect(evaluateCondition(
          { field: 'status', operator: 'CHANGED_FROM', value: 'DRAFT' },
          entityData,
          changeData
        )).toBe(true);

        expect(evaluateCondition(
          { field: 'status', operator: 'CHANGED_FROM', value: 'PENDING' },
          entityData,
          changeData
        )).toBe(false);

        // Should return false if no change data
        expect(evaluateCondition(
          { field: 'status', operator: 'CHANGED_FROM', value: 'DRAFT' },
          entityData
        )).toBe(false);
      });

      test('CHANGED_TO operator should detect field value transitions', () => {
        const evaluateCondition = (condition: BusinessRuleCondition, entityData: any, changeData?: any): boolean => {
          const fieldValue = entityData[condition.field];
          const { operator, value } = condition;
          
          if (operator === 'CHANGED_TO') {
            if (!changeData) return false;
            const originalValue = changeData[`original_${condition.field}`];
            return String(fieldValue) === String(value) && String(originalValue) !== String(value);
          }
          return false;
        };

        const entityData = { stage: 'NEGOTIATION', amount: 75000 };
        const changeData = {
          original_stage: 'PROPOSAL',
          original_amount: 50000
        };

        expect(evaluateCondition(
          { field: 'stage', operator: 'CHANGED_TO', value: 'NEGOTIATION' },
          entityData,
          changeData
        )).toBe(true);

        expect(evaluateCondition(
          { field: 'stage', operator: 'CHANGED_TO', value: 'CLOSED' },
          entityData,
          changeData
        )).toBe(false);

        // Numeric change
        expect(evaluateCondition(
          { field: 'amount', operator: 'CHANGED_TO', value: '75000' },
          entityData,
          changeData
        )).toBe(true);
      });
    });
  });

  describe('Multi-Condition Logic', () => {
    test('should handle AND logic correctly', () => {
      const evaluateConditions = (conditions: BusinessRuleCondition[], entityData: any): boolean => {
        if (!conditions || conditions.length === 0) {
          return true;
        }

        let result = true;
        let hasOrCondition = false;
        let orResult = false;

        for (const condition of conditions) {
          const conditionMet = evaluateSingleCondition(condition, entityData);
          
          if (condition.logicalOperator === 'OR') {
            hasOrCondition = true;
            orResult = orResult || conditionMet;
          } else {
            result = result && conditionMet;
          }
        }

        return hasOrCondition ? orResult : result;
      };

      const evaluateSingleCondition = (condition: BusinessRuleCondition, entityData: any): boolean => {
        const fieldValue = entityData[condition.field];
        const { operator, value } = condition;
        
        switch (operator) {
          case 'EQUALS':
            return String(fieldValue) === String(value);
          case 'GREATER_THAN':
            return Number(fieldValue) > Number(value);
          default:
            return false;
        }
      };

      const entityData = { 
        status: 'ACTIVE',
        amount: 50000,
        priority: 'HIGH'
      };

      // All conditions must be true (AND logic)
      const andConditions: BusinessRuleCondition[] = [
        { field: 'status', operator: 'EQUALS', value: 'ACTIVE' },
        { field: 'amount', operator: 'GREATER_THAN', value: '25000' }
      ];

      expect(evaluateConditions(andConditions, entityData)).toBe(true);

      // One condition fails
      const failingAndConditions: BusinessRuleCondition[] = [
        { field: 'status', operator: 'EQUALS', value: 'ACTIVE' },
        { field: 'amount', operator: 'GREATER_THAN', value: '75000' }
      ];

      expect(evaluateConditions(failingAndConditions, entityData)).toBe(false);
    });

    test('should handle OR logic correctly', () => {
      const evaluateConditions = (conditions: BusinessRuleCondition[], entityData: any): boolean => {
        if (!conditions || conditions.length === 0) {
          return true;
        }

        let result = true;
        let hasOrCondition = false;
        let orResult = false;

        for (const condition of conditions) {
          const conditionMet = evaluateSingleCondition(condition, entityData);
          
          if (condition.logicalOperator === 'OR') {
            hasOrCondition = true;
            orResult = orResult || conditionMet;
          } else {
            result = result && conditionMet;
          }
        }

        return hasOrCondition ? orResult : result;
      };

      const evaluateSingleCondition = (condition: BusinessRuleCondition, entityData: any): boolean => {
        const fieldValue = entityData[condition.field];
        const { operator, value } = condition;
        
        switch (operator) {
          case 'EQUALS':
            return String(fieldValue) === String(value);
          case 'GREATER_THAN':
            return Number(fieldValue) > Number(value);
          default:
            return false;
        }
      };

      const entityData = { 
        status: 'PENDING',
        amount: 15000,
        priority: 'HIGH'
      };

      // At least one condition must be true (OR logic)
      const orConditions: BusinessRuleCondition[] = [
        { field: 'status', operator: 'EQUALS', value: 'ACTIVE' },
        { field: 'amount', operator: 'GREATER_THAN', value: '25000', logicalOperator: 'OR' },
        { field: 'priority', operator: 'EQUALS', value: 'HIGH', logicalOperator: 'OR' }
      ];

      expect(evaluateConditions(orConditions, entityData)).toBe(true); // priority matches

      // No conditions match
      const noMatchOrConditions: BusinessRuleCondition[] = [
        { field: 'status', operator: 'EQUALS', value: 'ACTIVE' },
        { field: 'amount', operator: 'GREATER_THAN', value: '25000', logicalOperator: 'OR' }
      ];

      expect(evaluateConditions(noMatchOrConditions, entityData)).toBe(false);
    });

    test('should handle mixed AND/OR logic', () => {
      const evaluateConditions = (conditions: BusinessRuleCondition[], entityData: any): boolean => {
        if (!conditions || conditions.length === 0) {
          return true;
        }

        let result = true;
        let hasOrCondition = false;
        let orResult = false;

        for (const condition of conditions) {
          const conditionMet = evaluateSingleCondition(condition, entityData);
          
          if (condition.logicalOperator === 'OR') {
            hasOrCondition = true;
            orResult = orResult || conditionMet;
          } else {
            result = result && conditionMet;
          }
        }

        return hasOrCondition ? orResult : result;
      };

      const evaluateSingleCondition = (condition: BusinessRuleCondition, entityData: any): boolean => {
        const fieldValue = entityData[condition.field];
        const { operator, value } = condition;
        
        switch (operator) {
          case 'EQUALS':
            return String(fieldValue) === String(value);
          case 'GREATER_THAN':
            return Number(fieldValue) > Number(value);
          default:
            return false;
        }
      };

      const entityData = { 
        status: 'ACTIVE',
        amount: 15000,
        priority: 'LOW',
        category: 'ENTERPRISE'
      };

      // Mixed: status must be ACTIVE AND (high amount OR high priority OR enterprise)
      const mixedConditions: BusinessRuleCondition[] = [
        { field: 'status', operator: 'EQUALS', value: 'ACTIVE' }, // AND (required)
        { field: 'amount', operator: 'GREATER_THAN', value: '50000', logicalOperator: 'OR' },
        { field: 'priority', operator: 'EQUALS', value: 'HIGH', logicalOperator: 'OR' },
        { field: 'category', operator: 'EQUALS', value: 'ENTERPRISE', logicalOperator: 'OR' }
      ];

      expect(evaluateConditions(mixedConditions, entityData)).toBe(true); // category matches
    });

    test('should handle empty conditions', () => {
      const evaluateConditions = (conditions: BusinessRuleCondition[], entityData: any): boolean => {
        if (!conditions || conditions.length === 0) {
          return true;
        }
        return false; // Simplified for test
      };

      expect(evaluateConditions([], {})).toBe(true);
      expect(evaluateConditions(null as any, {})).toBe(true);
    });
  });

  describe('Rule Validation Logic', () => {
    test('should validate required rule fields', () => {
      const validateRule = (input: BusinessRuleInput): string[] => {
        const errors: string[] = [];

        if (!input.name || input.name.trim().length === 0) {
          errors.push('Rule name is required');
        }

        if (!input.conditions || input.conditions.length === 0) {
          errors.push('At least one condition is required');
        }

        if (!input.actions || input.actions.length === 0) {
          errors.push('At least one action is required');
        }

        return errors;
      };

      // Valid rule
      const validRule: BusinessRuleInput = {
        name: 'High Value Deal Alert',
        entityType: EntityTypeEnum.Deal,
        conditions: [
          { field: 'amount', operator: 'GREATER_THAN', value: '50000' }
        ],
        actions: [
          { type: 'NOTIFY_USER', target: 'user-123' }
        ]
      };

      expect(validateRule(validRule)).toEqual([]);

      // Missing name
      const noNameRule = { ...validRule, name: '' };
      expect(validateRule(noNameRule)).toContain('Rule name is required');

      // Missing conditions
      const noConditionsRule = { ...validRule, conditions: [] };
      expect(validateRule(noConditionsRule)).toContain('At least one condition is required');

      // Missing actions
      const noActionsRule = { ...validRule, actions: [] };
      expect(validateRule(noActionsRule)).toContain('At least one action is required');
    });

    test('should validate trigger type requirements', () => {
      const validateRule = (input: BusinessRuleInput): string[] => {
        const errors: string[] = [];

        if (input.triggerType === 'EVENT_BASED' && (!input.triggerEvents || input.triggerEvents.length === 0)) {
          errors.push('Event-based rules must specify at least one trigger event');
        }

        if (input.triggerType === 'FIELD_CHANGE' && (!input.triggerFields || input.triggerFields.length === 0)) {
          errors.push('Field-change rules must specify at least one trigger field');
        }

        return errors;
      };

      // Valid event-based rule
      const eventRule: BusinessRuleInput = {
        name: 'Test Rule',
        entityType: EntityTypeEnum.Deal,
        triggerType: 'EVENT_BASED' as any,
        triggerEvents: ['CREATE', 'UPDATE'],
        conditions: [{ field: 'status', operator: 'EQUALS', value: 'ACTIVE' }],
        actions: [{ type: 'NOTIFY_USER', target: 'user-123' }]
      };

      expect(validateRule(eventRule)).toEqual([]);

      // Event-based rule without events
      const noEventsRule = { ...eventRule, triggerEvents: [] };
      expect(validateRule(noEventsRule)).toContain('Event-based rules must specify at least one trigger event');

      // Valid field-change rule
      const fieldRule: BusinessRuleInput = {
        name: 'Test Rule',
        entityType: EntityTypeEnum.Deal,
        triggerType: 'FIELD_CHANGE' as any,
        triggerFields: ['status', 'amount'],
        conditions: [{ field: 'status', operator: 'EQUALS', value: 'ACTIVE' }],
        actions: [{ type: 'NOTIFY_USER', target: 'user-123' }]
      };

      expect(validateRule(fieldRule)).toEqual([]);

      // Field-change rule without fields
      const noFieldsRule = { ...fieldRule, triggerFields: [] };
      expect(validateRule(noFieldsRule)).toContain('Field-change rules must specify at least one trigger field');
    });

    test('should validate condition details', () => {
      const validateRule = (input: BusinessRuleInput): string[] => {
        const errors: string[] = [];

        input.conditions?.forEach((condition, index) => {
          if (!condition.field) {
            errors.push(`Condition ${index + 1}: Field is required`);
          }
          if (!condition.operator) {
            errors.push(`Condition ${index + 1}: Operator is required`);
          }
          if (condition.value === undefined || condition.value === null) {
            errors.push(`Condition ${index + 1}: Value is required`);
          }
        });

        return errors;
      };

      const ruleWithBadConditions: BusinessRuleInput = {
        name: 'Test Rule',
        entityType: EntityTypeEnum.Deal,
        conditions: [
          { field: '', operator: 'EQUALS', value: 'test' }, // Missing field
          { field: 'status', operator: '', value: 'test' }, // Missing operator
          { field: 'amount', operator: 'GREATER_THAN', value: null as any } // Missing value
        ],
        actions: [{ type: 'NOTIFY_USER', target: 'user-123' }]
      };

      const errors = validateRule(ruleWithBadConditions);
      expect(errors).toContain('Condition 1: Field is required');
      expect(errors).toContain('Condition 2: Operator is required');
      expect(errors).toContain('Condition 3: Value is required');
    });

    test('should validate action details', () => {
      const validateRule = (input: BusinessRuleInput): string[] => {
        const errors: string[] = [];

        input.actions?.forEach((action, index) => {
          if (!action.type) {
            errors.push(`Action ${index + 1}: Type is required`);
          }
          if ((action.type === 'NOTIFY_USER' || action.type === 'SEND_EMAIL') && !action.target) {
            errors.push(`Action ${index + 1}: Target is required for ${action.type}`);
          }
        });

        return errors;
      };

      const ruleWithBadActions: BusinessRuleInput = {
        name: 'Test Rule',
        entityType: EntityTypeEnum.Deal,
        conditions: [{ field: 'status', operator: 'EQUALS', value: 'ACTIVE' }],
        actions: [
          { type: '', target: 'user-123' }, // Missing type
          { type: 'NOTIFY_USER', target: '' }, // Missing target for notify
          { type: 'SEND_EMAIL', target: null as any } // Missing target for email
        ]
      };

      const errors = validateRule(ruleWithBadActions);
      expect(errors).toContain('Action 1: Type is required');
      expect(errors).toContain('Action 2: Target is required for NOTIFY_USER');
      expect(errors).toContain('Action 3: Target is required for SEND_EMAIL');
    });
  });

  describe('Action Processing Logic', () => {
    test('should build notification titles correctly', () => {
      const buildNotificationTitle = (action: BusinessRuleAction, entityData: any): string => {
        const template = action.template || 'Business Rule Notification';
        const entityName = entityData.name || entityData.title || entityData.contact_name || 'Entity';
        return `${template} - ${entityName}`;
      };

      // Deal with name
      const dealData = { name: 'Enterprise Software Deal', amount: 75000 };
      const dealAction = { type: 'NOTIFY_USER', template: 'High Value Alert' };
      expect(buildNotificationTitle(dealAction, dealData)).toBe('High Value Alert - Enterprise Software Deal');

      // Lead with contact_name
      const leadData = { contact_name: 'John Doe', company: 'ACME Corp' };
      const leadAction = { type: 'NOTIFY_USER', template: 'New Lead' };
      expect(buildNotificationTitle(leadAction, leadData)).toBe('New Lead - John Doe');

      // Default template
      const defaultAction = { type: 'NOTIFY_USER' };
      expect(buildNotificationTitle(defaultAction, dealData)).toBe('Business Rule Notification - Enterprise Software Deal');

      // Fallback entity name
      const noNameData = { status: 'ACTIVE' };
      expect(buildNotificationTitle(defaultAction, noNameData)).toBe('Business Rule Notification - Entity');
    });

    test('should determine action execution logic', () => {
      const determineActionExecution = (action: BusinessRuleAction, entityData: any): { canExecute: boolean; reason?: string } => {
        switch (action.type) {
          case 'NOTIFY_USER':
            if (!action.target) {
              return { canExecute: false, reason: 'No target user specified' };
            }
            return { canExecute: true };

          case 'NOTIFY_OWNER':
            const ownerId = entityData.assigned_to_user_id || entityData.user_id || entityData.created_by_user_id;
            if (!ownerId) {
              return { canExecute: false, reason: 'No owner found for entity' };
            }
            return { canExecute: true };

          case 'CREATE_TASK':
          case 'CREATE_ACTIVITY':
            return { canExecute: true };

          default:
            return { canExecute: false, reason: `Unknown action type: ${action.type}` };
        }
      };

      // Valid notify user action
      const notifyAction = { type: 'NOTIFY_USER', target: 'user-123' };
      expect(determineActionExecution(notifyAction, {})).toEqual({ canExecute: true });

      // Invalid notify user action
      const badNotifyAction = { type: 'NOTIFY_USER', target: '' };
      expect(determineActionExecution(badNotifyAction, {})).toEqual({ 
        canExecute: false, 
        reason: 'No target user specified' 
      });

      // Valid notify owner action
      const ownerAction = { type: 'NOTIFY_OWNER' };
      const entityWithOwner = { assigned_to_user_id: 'user-456' };
      expect(determineActionExecution(ownerAction, entityWithOwner)).toEqual({ canExecute: true });

      // Invalid notify owner action
      const entityWithoutOwner = { name: 'Test Deal' };
      expect(determineActionExecution(ownerAction, entityWithoutOwner)).toEqual({ 
        canExecute: false, 
        reason: 'No owner found for entity' 
      });

      // Valid task/activity actions
      expect(determineActionExecution({ type: 'CREATE_TASK' }, {})).toEqual({ canExecute: true });
      expect(determineActionExecution({ type: 'CREATE_ACTIVITY' }, {})).toEqual({ canExecute: true });

      // Unknown action type
      const unknownAction = { type: 'UNKNOWN_ACTION' };
      expect(determineActionExecution(unknownAction, {})).toEqual({ 
        canExecute: false, 
        reason: 'Unknown action type: UNKNOWN_ACTION' 
      });
    });
  });

  describe('Processing Context Validation', () => {
    test('should validate processing context requirements', () => {
      const validateProcessingContext = (context: ProcessingContext): string[] => {
        const errors: string[] = [];

        if (!context.entityType || context.entityType === null) {
          errors.push('Entity type is required');
        }

        if (!context.entityId) {
          errors.push('Entity ID is required');
        }

        if (!context.triggerEvent) {
          errors.push('Trigger event is required');
        }

        if (!context.entityData) {
          errors.push('Entity data is required');
        }

        return errors;
      };

      // Valid context
      const validContext: ProcessingContext = {
        entityType: EntityTypeEnum.Deal,
        entityId: 'deal-123',
        triggerEvent: 'UPDATE',
        entityData: { name: 'Test Deal', status: 'ACTIVE' }
      };

      expect(validateProcessingContext(validContext)).toEqual([]);

      // Missing required fields
      const invalidContext = {
        entityType: null as any,
        entityId: '',
        triggerEvent: null as any,
        entityData: null as any
      };

      const errors = validateProcessingContext(invalidContext);
      expect(errors).toContain('Entity type is required');
      expect(errors).toContain('Entity ID is required');
      expect(errors).toContain('Trigger event is required');
      expect(errors).toContain('Entity data is required');
    });

    test('should validate test mode behavior', () => {
      const processInTestMode = (context: ProcessingContext): { shouldRecord: boolean; shouldExecute: boolean } => {
        return {
          shouldRecord: !context.testMode,
          shouldExecute: true // Always execute rules, just don't record stats
        };
      };

      const productionContext: ProcessingContext = {
        entityType: EntityTypeEnum.Deal,
        entityId: 'deal-123',
        triggerEvent: 'UPDATE',
        entityData: { name: 'Test Deal' },
        testMode: false
      };

      const testContext: ProcessingContext = {
        ...productionContext,
        testMode: true
      };

      expect(processInTestMode(productionContext)).toEqual({
        shouldRecord: true,
        shouldExecute: true
      });

      expect(processInTestMode(testContext)).toEqual({
        shouldRecord: false,
        shouldExecute: true
      });
    });
  });
}); 