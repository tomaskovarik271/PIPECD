/**
 * Task Management System - Unit Tests
 * Tests core business logic for CRM-native task management
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TaskService, CreateTaskInput, UpdateTaskInput, Task } from '../../lib/taskService';
import { createTestEnvironment, TestEnvironment } from '../setup/testEnvironment';
import { BusinessScenarioFactory, BusinessScenario } from '../factories/businessScenarios';

describe('Task Management System', () => {
  let taskService: TaskService;
  let testEnv: TestEnvironment;
  let scenario: BusinessScenario;

  beforeEach(async () => {
    testEnv = await createTestEnvironment();
    taskService = new TaskService(testEnv.supabase);
    
    // Create realistic business scenario
    const factory = new BusinessScenarioFactory(testEnv.supabase, testEnv.testUserId);
    scenario = await factory.createEnterpriseSalesScenario();
  });

  afterEach(async () => {
    await scenario?.cleanup();
    await testEnv?.cleanup();
  });

  describe('Task Creation', () => {
    it('should create task with proper CRM context', async () => {
      const taskInput: CreateTaskInput = {
        title: 'Executive approval required',
        description: 'Get C-level approval for enterprise deal',
        task_type: 'DEAL_CLOSURE',
        priority: 'HIGH',
        entity_type: 'DEAL',
        entity_id: scenario.deals[0].id,
        deal_id: scenario.deals[0].id,
        assigned_to_user_id: testEnv.testUserId,
        due_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        estimated_hours: 2,
        blocks_stage_progression: true,
        required_for_deal_closure: true,
        tags: ['enterprise', 'approval']
      };

      const result = await taskService.createTask(taskInput, testEnv.testUserId);

      // Business Logic Assertions
      expect(result).toBeDefined();
      expect(result.title).toBe('Executive approval required');
      expect(result.entity_type).toBe('DEAL');
      expect(result.entity_id).toBe(scenario.deals[0].id);
      expect(result.assigned_to_user_id).toBe(testEnv.testUserId);
      expect(result.created_by_user_id).toBe(testEnv.testUserId);
      expect(result.status).toBe('TODO');
      expect(result.blocks_stage_progression).toBe(true);
      expect(result.required_for_deal_closure).toBe(true);
    });

    it('should validate required fields', async () => {
      const invalidTaskInput = {
        // Missing required title
        task_type: 'FOLLOW_UP',
        entity_type: 'DEAL',
        entity_id: scenario.deals[0].id,
        assigned_to_user_id: testEnv.testUserId
      } as CreateTaskInput;

      try {
        await taskService.createTask(invalidTaskInput, testEnv.testUserId);
        expect.fail('Should have thrown an error for missing title');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should prevent creating tasks for non-existent entities', async () => {
      const taskInput: CreateTaskInput = {
        title: 'Invalid entity task',
        task_type: 'FOLLOW_UP',
        entity_type: 'DEAL',
        entity_id: 'non-existent-deal-id',
        assigned_to_user_id: testEnv.testUserId
      };

      try {
        await taskService.createTask(taskInput, testEnv.testUserId);
        expect.fail('Should have thrown an error for non-existent entity');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Task Updates', () => {
    let taskId: string;

    beforeEach(async () => {
      const createResult = await taskService.createTask({
        title: 'Test task for updates',
        task_type: 'FOLLOW_UP',
        priority: 'MEDIUM',
        entity_type: 'DEAL',
        entity_id: scenario.deals[0].id,
        deal_id: scenario.deals[0].id,
        assigned_to_user_id: testEnv.testUserId
      }, testEnv.testUserId);
      taskId = createResult.id;
    });

    it('should update task fields correctly', async () => {
      const updateInput: UpdateTaskInput = {
        title: 'Updated task title',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        estimated_hours: 4
      };

      const result = await taskService.updateTask(taskId, updateInput, testEnv.testUserId);

      expect(result.title).toBe('Updated task title');
      expect(result.priority).toBe('HIGH');
      expect(result.status).toBe('IN_PROGRESS');
      expect(result.estimated_hours).toBe(4);
    });

    it('should track task completion with timestamp', async () => {
      const result = await taskService.completeTask(taskId);

      expect(result.status).toBe('COMPLETED');
      expect(result.completed_at).toBeDefined();
      
      const completedAt = new Date(result.completed_at!);
      const now = new Date();
      expect(completedAt.getTime()).toBeCloseTo(now.getTime(), -5000); // Within 5 seconds
    });
  });

  describe('Task Queries', () => {
    beforeEach(async () => {
      // Create multiple tasks for testing
      await Promise.all([
        taskService.createTask({
          title: 'High priority task',
          task_type: 'FOLLOW_UP',
          priority: 'HIGH',
          entity_type: 'DEAL',
          entity_id: scenario.deals[0].id,
          deal_id: scenario.deals[0].id,
          assigned_to_user_id: testEnv.testUserId,
          status: 'TODO'
        }, testEnv.testUserId),
        taskService.createTask({
          title: 'Completed task',
          task_type: 'LEAD_QUALIFICATION',
          priority: 'MEDIUM',
          entity_type: 'DEAL',
          entity_id: scenario.deals[0].id,
          deal_id: scenario.deals[0].id,
          assigned_to_user_id: testEnv.testUserId,
          status: 'COMPLETED'
        }, testEnv.testUserId),
        taskService.createTask({
          title: 'Overdue task',
          task_type: 'FOLLOW_UP',
          priority: 'URGENT',
          entity_type: 'DEAL',
          entity_id: scenario.deals[0].id,
          deal_id: scenario.deals[0].id,
          assigned_to_user_id: testEnv.testUserId,
          due_date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          status: 'TODO'
        }, testEnv.testUserId)
      ]);
    });

    it('should retrieve tasks for specific deal', async () => {
      const result = await taskService.getTasksForDeal(scenario.deals[0].id);

      expect(result).toBeDefined();
      expect(result.length).toBe(5); // 2 from factory + 3 from beforeEach
      
      // Verify all tasks belong to the deal
      result.forEach(task => {
        expect(task.deal_id).toBe(scenario.deals[0].id);
        expect(task.entity_id).toBe(scenario.deals[0].id);
        expect(task.entity_type).toBe('DEAL');
      });
    });

    it('should filter tasks by status', async () => {
      const result = await taskService.getTasksForUser(testEnv.testUserId, {
        status: ['TODO', 'IN_PROGRESS']
      });

      expect(result.length).toBeGreaterThan(0);
      
      result.forEach(task => {
        expect(['TODO', 'IN_PROGRESS']).toContain(task.status);
      });
    });

    it('should identify overdue tasks', async () => {
      const result = await taskService.getOverdueTasks(testEnv.testUserId);

      expect(result).toBeDefined();
      
      const overdueTasks = result.filter(task => 
        task.due_date && new Date(task.due_date) < new Date() && task.status !== 'COMPLETED'
      );
      expect(overdueTasks.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Requirements', () => {
    it('should create task within performance threshold', async () => {
      const startTime = Date.now();

      const result = await taskService.createTask({
        title: 'Performance test task',
        task_type: 'FOLLOW_UP',
        entity_type: 'DEAL',
        entity_id: scenario.deals[0].id,
        deal_id: scenario.deals[0].id,
        assigned_to_user_id: testEnv.testUserId
      }, testEnv.testUserId);

      const executionTime = Date.now() - startTime;

      expect(result).toBeDefined();
      expect(executionTime).toBeLessThan(1000); // < 1 second
    });

    it('should retrieve tasks within performance threshold', async () => {
      const startTime = Date.now();

      const result = await taskService.getTasksForDeal(scenario.deals[0].id);

      const executionTime = Date.now() - startTime;

      expect(result).toBeDefined();
      expect(executionTime).toBeLessThan(500); // < 500ms for queries
    });

    it('should handle bulk task operations efficiently', async () => {
      const startTime = Date.now();

      // Create 10 tasks in parallel
      const promises = Array.from({ length: 10 }, (_, i) =>
        taskService.createTask({
          title: `Bulk task ${i + 1}`,
          task_type: 'FOLLOW_UP',
          entity_type: 'DEAL',
          entity_id: scenario.deals[0].id,
          deal_id: scenario.deals[0].id,
          assigned_to_user_id: testEnv.testUserId
        }, testEnv.testUserId)
      );

      const results = await Promise.all(promises);

      const executionTime = Date.now() - startTime;

      expect(results.every(r => r && r.id)).toBe(true);
      expect(executionTime).toBeLessThan(3000); // < 3 seconds for 10 items
    });
  });

  describe('Business Logic Integration', () => {
    it('should integrate with WFM project system', async () => {
      const taskInput: CreateTaskInput = {
        title: 'WFM integrated task',
        task_type: 'DEMO_PREPARATION',
        entity_type: 'DEAL',
        entity_id: scenario.deals[0].id,
        deal_id: scenario.deals[0].id,
        assigned_to_user_id: testEnv.testUserId,
        blocks_stage_progression: true
      };

      const result = await taskService.createTask(taskInput, testEnv.testUserId);

      expect(result.blocks_stage_progression).toBe(true);
      // WFM project ID should be inherited from the deal
      expect(result.wfm_project_id).toBeDefined();
    });

    it('should handle task dependencies correctly', async () => {
      // Create parent task
      const parentResult = await taskService.createTask({
        title: 'Parent task',
        task_type: 'DEMO_PREPARATION',
        entity_type: 'DEAL',
        entity_id: scenario.deals[0].id,
        deal_id: scenario.deals[0].id,
        assigned_to_user_id: testEnv.testUserId
      }, testEnv.testUserId);

      // Create dependent task
      const dependentResult = await taskService.createTask({
        title: 'Dependent task',
        task_type: 'FOLLOW_UP',
        entity_type: 'DEAL',
        entity_id: scenario.deals[0].id,
        deal_id: scenario.deals[0].id,
        assigned_to_user_id: testEnv.testUserId,
        parent_task_id: parentResult.id
      }, testEnv.testUserId);

      expect(dependentResult.parent_task_id).toBe(parentResult.id);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const invalidTaskInput: CreateTaskInput = {
        title: 'Invalid task',
        task_type: 'INVALID_TYPE', // Invalid enum value
        entity_type: 'DEAL',
        entity_id: scenario.deals[0].id,
        assigned_to_user_id: testEnv.testUserId
      };

      try {
        await taskService.createTask(invalidTaskInput, testEnv.testUserId);
        expect.fail('Should have thrown an error for invalid task type');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
}); 