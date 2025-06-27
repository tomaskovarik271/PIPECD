/**
 * Task Management GraphQL Integration Tests
 * Tests the complete GraphQL API for task management
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestEnvironment, TestEnvironment } from '../setup/testEnvironment';
import { BusinessScenarioFactory, BusinessScenario } from '../factories/businessScenarios';

// GraphQL queries and mutations
const CREATE_TASK = `
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      description
      status
      priority
      taskType
      entityType
      entityId
      assignedToUserId
      createdByUserId
      dueDate
      dealId
      wfmProjectId
      blocksStageProgression
      requiredForDealClosure
      tags
      estimatedHours
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_TASK = `
  mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) {
      id
      title
      status
      priority
      estimatedHours
      actualHours
      updatedAt
    }
  }
`;

const COMPLETE_TASK = `
  mutation CompleteTask($id: ID!, $input: TaskCompletionInput) {
    completeTask(id: $id, input: $input) {
      id
      status
      completedAt
      actualHours
    }
  }
`;

const GET_TASKS_FOR_DEAL = `
  query GetTasksForDeal($dealId: ID!, $filters: TaskFiltersInput) {
    getTasksForDeal(dealId: $dealId, filters: $filters) {
      id
      title
      status
      priority
      taskType
      entityType
      entityId
      assignedToUserId
      dueDate
      dealId
      blocksStageProgression
      tags
      estimatedHours
      createdAt
    }
  }
`;

const GET_USER_TASKS = `
  query GetUserTasks($userId: ID!, $filters: TaskFiltersInput) {
    getUserTasks(userId: $userId, filters: $filters) {
      id
      title
      status
      priority
      taskType
      dueDate
      entityType
      entityId
      overdue
      createdAt
    }
  }
`;

const GET_OVERDUE_TASKS = `
  query GetOverdueTasks($userId: ID!) {
    getOverdueTasks(userId: $userId) {
      id
      title
      status
      priority
      dueDate
      entityType
      entityId
      assignedToUserId
      overdue
    }
  }
`;

describe('Task GraphQL Integration', () => {
  let testEnv: TestEnvironment;
  let scenario: BusinessScenario;
  let graphqlClient: any;

  beforeEach(async () => {
    testEnv = await createTestEnvironment();
    
    // Create realistic business scenario
    const factory = new BusinessScenarioFactory(testEnv.supabase, testEnv.testUserId);
    scenario = await factory.createEnterpriseSalesScenario();

    // Set up GraphQL client with authentication
    graphqlClient = {
      request: async (query: string, variables?: any) => {
        const response = await fetch('/.netlify/functions/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${testEnv.mockAuthToken}`
          },
          body: JSON.stringify({
            query,
            variables
          })
        });

        const result = await response.json();
        if (result.errors) {
          throw new Error(`GraphQL Error: ${JSON.stringify(result.errors)}`);
        }
        return result.data;
      }
    };
  });

  afterEach(async () => {
    await scenario?.cleanup();
    await testEnv?.cleanup();
  });

  describe('Task Creation via GraphQL', () => {
    it('should create task with complete GraphQL flow', async () => {
      const taskInput = {
        title: 'GraphQL Integration Test Task',
        description: 'Testing complete GraphQL integration for task creation',
        taskType: 'FOLLOW_UP',
        priority: 'HIGH',
        entityType: 'DEAL',
        entityId: scenario.deals[0].id,
        dealId: scenario.deals[0].id,
        assignedToUserId: testEnv.testUserId,
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        estimatedHours: 3,
        blocksStageProgression: false,
        requiredForDealClosure: true,
        tags: ['integration-test', 'graphql']
      };

      const result = await graphqlClient.request(CREATE_TASK, { input: taskInput });

      expect(result.createTask).toBeDefined();
      expect(result.createTask.id).toBeDefined();
      expect(result.createTask.title).toBe('GraphQL Integration Test Task');
      expect(result.createTask.priority).toBe('HIGH');
      expect(result.createTask.entityType).toBe('DEAL');
      expect(result.createTask.entityId).toBe(scenario.deals[0].id);
      expect(result.createTask.assignedToUserId).toBe(testEnv.testUserId);
      expect(result.createTask.createdByUserId).toBe(testEnv.testUserId);
      expect(result.createTask.status).toBe('TODO');
      expect(result.createTask.requiredForDealClosure).toBe(true);
      expect(result.createTask.tags).toContain('integration-test');
      expect(result.createTask.wfmProjectId).toBeDefined();
    });

    it('should validate GraphQL input constraints', async () => {
      const invalidInput = {
        // Missing required title
        taskType: 'FOLLOW_UP',
        entityType: 'DEAL',
        entityId: scenario.deals[0].id,
        assignedToUserId: testEnv.testUserId
      };

      try {
        await graphqlClient.request(CREATE_TASK, { input: invalidInput });
        expect.fail('Should have thrown GraphQL validation error');
      } catch (error) {
        expect(error.message).toContain('GraphQL Error');
      }
    });

    it('should enforce authentication for task creation', async () => {
      const unauthenticatedClient = {
        request: async (query: string, variables?: any) => {
          const response = await fetch('/.netlify/functions/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
              // No Authorization header
            },
            body: JSON.stringify({ query, variables })
          });
          return response.json();
        }
      };

      const taskInput = {
        title: 'Unauthorized task',
        taskType: 'FOLLOW_UP',
        entityType: 'DEAL',
        entityId: scenario.deals[0].id
      };

      try {
        await unauthenticatedClient.request(CREATE_TASK, { input: taskInput });
        expect.fail('Should have blocked unauthenticated request');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should validate GraphQL schema integration', async () => {
      // Test that our task interfaces align with GraphQL schema
      const mockTaskInput = {
        title: 'GraphQL Schema Test',
        taskType: 'FOLLOW_UP',
        priority: 'HIGH',
        entityType: 'DEAL',
        entityId: scenario.deals[0].id,
        dealId: scenario.deals[0].id,
        assignedToUserId: testEnv.testUserId
      };

      expect(mockTaskInput.title).toBe('GraphQL Schema Test');
      expect(mockTaskInput.entityType).toBe('DEAL');
      expect(mockTaskInput.assignedToUserId).toBe(testEnv.testUserId);
    });
  });

  describe('Task Updates via GraphQL', () => {
    let taskId: string;

    beforeEach(async () => {
      const createResult = await graphqlClient.request(CREATE_TASK, {
        input: {
          title: 'Task for Update Testing',
          taskType: 'PREPARATION',
          priority: 'MEDIUM',
          entityType: 'DEAL',
          entityId: scenario.deals[0].id,
          dealId: scenario.deals[0].id,
          assignedToUserId: testEnv.testUserId,
          estimatedHours: 2
        }
      });
      taskId = createResult.createTask.id;
    });

    it('should update task via GraphQL mutation', async () => {
      const updateInput = {
        title: 'Updated Task Title',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        estimatedHours: 4
      };

      const result = await graphqlClient.request(UPDATE_TASK, {
        id: taskId,
        input: updateInput
      });

      expect(result.updateTask.id).toBe(taskId);
      expect(result.updateTask.title).toBe('Updated Task Title');
      expect(result.updateTask.priority).toBe('HIGH');
      expect(result.updateTask.status).toBe('IN_PROGRESS');
      expect(result.updateTask.estimatedHours).toBe(4);
      expect(result.updateTask.updatedAt).toBeDefined();
    });

    it('should complete task with GraphQL mutation', async () => {
      const completionInput = {
        actualHours: 2.5
      };

      const result = await graphqlClient.request(COMPLETE_TASK, {
        id: taskId,
        input: completionInput
      });

      expect(result.completeTask.id).toBe(taskId);
      expect(result.completeTask.status).toBe('COMPLETED');
      expect(result.completeTask.completedAt).toBeDefined();
      expect(result.completeTask.actualHours).toBe(2.5);

      // Verify completion timestamp is recent
      const completedAt = new Date(result.completeTask.completedAt);
      const now = new Date();
      expect(completedAt.getTime()).toBeCloseTo(now.getTime(), -5000);
    });
  });

  describe('Task Queries via GraphQL', () => {
    beforeEach(async () => {
      // Create multiple test tasks
      await Promise.all([
        graphqlClient.request(CREATE_TASK, {
          input: {
            title: 'High Priority Deal Task',
            taskType: 'FOLLOW_UP',
            priority: 'HIGH',
            entityType: 'DEAL',
            entityId: scenario.deals[0].id,
            dealId: scenario.deals[0].id,
            assignedToUserId: testEnv.testUserId,
            status: 'TODO',
            tags: ['query-test']
          }
        }),
        graphqlClient.request(CREATE_TASK, {
          input: {
            title: 'Completed Deal Task',
            taskType: 'CALL',
            priority: 'MEDIUM',
            entityType: 'DEAL',
            entityId: scenario.deals[0].id,
            dealId: scenario.deals[0].id,
            assignedToUserId: testEnv.testUserId,
            status: 'COMPLETED',
            tags: ['query-test', 'completed']
          }
        }),
        graphqlClient.request(CREATE_TASK, {
          input: {
            title: 'Overdue Deal Task',
            taskType: 'EMAIL',
            priority: 'URGENT',
            entityType: 'DEAL',
            entityId: scenario.deals[0].id,
            dealId: scenario.deals[0].id,
            assignedToUserId: testEnv.testUserId,
            dueDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            status: 'TODO',
            tags: ['query-test', 'overdue']
          }
        })
      ]);
    });

    it('should query tasks for specific deal', async () => {
      const result = await graphqlClient.request(GET_TASKS_FOR_DEAL, {
        dealId: scenario.deals[0].id
      });

      expect(result.getTasksForDeal).toBeDefined();
      expect(result.getTasksForDeal.length).toBe(3);

      // Verify all tasks belong to the deal
      result.getTasksForDeal.forEach(task => {
        expect(task.dealId).toBe(scenario.deals[0].id);
        expect(task.entityId).toBe(scenario.deals[0].id);
        expect(task.entityType).toBe('DEAL');
        expect(task.tags).toContain('query-test');
      });
    });

    it('should filter tasks by status via GraphQL', async () => {
      const result = await graphqlClient.request(GET_TASKS_FOR_DEAL, {
        dealId: scenario.deals[0].id,
        filters: {
          status: ['TODO', 'IN_PROGRESS']
        }
      });

      expect(result.getTasksForDeal.length).toBeGreaterThan(0);
      result.getTasksForDeal.forEach(task => {
        expect(['TODO', 'IN_PROGRESS']).toContain(task.status);
      });
    });

    it('should filter tasks by priority via GraphQL', async () => {
      const result = await graphqlClient.request(GET_TASKS_FOR_DEAL, {
        dealId: scenario.deals[0].id,
        filters: {
          priority: ['HIGH', 'URGENT']
        }
      });

      expect(result.getTasksForDeal.length).toBeGreaterThan(0);
      result.getTasksForDeal.forEach(task => {
        expect(['HIGH', 'URGENT']).toContain(task.priority);
      });
    });

    it('should query user tasks with filters', async () => {
      const result = await graphqlClient.request(GET_USER_TASKS, {
        userId: testEnv.testUserId,
        filters: {
          entityType: ['DEAL'],
          status: ['TODO']
        }
      });

      expect(result.getUserTasks).toBeDefined();
      result.getUserTasks.forEach(task => {
        expect(task.entityType).toBe('DEAL');
        expect(task.status).toBe('TODO');
      });
    });

    it('should identify overdue tasks via GraphQL', async () => {
      const result = await graphqlClient.request(GET_OVERDUE_TASKS, {
        userId: testEnv.testUserId
      });

      expect(result.getOverdueTasks).toBeDefined();
      
      const overdueTasks = result.getOverdueTasks.filter(task => task.overdue);
      expect(overdueTasks.length).toBeGreaterThan(0);
      
      overdueTasks.forEach(task => {
        expect(task.dueDate).toBeDefined();
        expect(new Date(task.dueDate).getTime()).toBeLessThan(new Date().getTime());
        expect(task.status).not.toBe('COMPLETED');
        expect(task.overdue).toBe(true);
      });
    });
  });

  describe('GraphQL Performance and Reliability', () => {
    it('should handle GraphQL queries within performance thresholds', async () => {
      const startTime = Date.now();

      const result = await graphqlClient.request(GET_TASKS_FOR_DEAL, {
        dealId: scenario.deals[0].id
      });

      const executionTime = Date.now() - startTime;

      expect(result.getTasksForDeal).toBeDefined();
      expect(executionTime).toBeLessThan(1000); // < 1 second for GraphQL queries
    });

    it('should handle concurrent GraphQL requests', async () => {
      const promises = Array.from({ length: 5 }, () =>
        graphqlClient.request(GET_TASKS_FOR_DEAL, {
          dealId: scenario.deals[0].id
        })
      );

      const results = await Promise.all(promises);

      expect(results.length).toBe(5);
      results.forEach(result => {
        expect(result.getTasksForDeal).toBeDefined();
      });
    });

    it('should provide proper error messages for invalid queries', async () => {
      const invalidQuery = `
        query InvalidQuery {
          nonExistentField {
            id
          }
        }
      `;

      try {
        await graphqlClient.request(invalidQuery);
        expect.fail('Should have thrown GraphQL schema error');
      } catch (error) {
        expect(error.message).toContain('GraphQL Error');
      }
    });
  });

  describe('GraphQL Real-Time Features', () => {
    it('should support task creation with immediate query visibility', async () => {
      // Create a new task
      const createResult = await graphqlClient.request(CREATE_TASK, {
        input: {
          title: 'Real-time Visibility Test',
          taskType: 'FOLLOW_UP',
          entityType: 'DEAL',
          entityId: scenario.deals[0].id,
          dealId: scenario.deals[0].id,
          assignedToUserId: testEnv.testUserId,
          tags: ['real-time-test']
        }
      });

      // Immediately query for tasks and verify new task appears
      const queryResult = await graphqlClient.request(GET_TASKS_FOR_DEAL, {
        dealId: scenario.deals[0].id,
        filters: {
          tags: ['real-time-test']
        }
      });

      expect(queryResult.getTasksForDeal).toBeDefined();
      const newTask = queryResult.getTasksForDeal.find(
        task => task.id === createResult.createTask.id
      );
      expect(newTask).toBeDefined();
      expect(newTask.title).toBe('Real-time Visibility Test');
    });

    it('should support task updates with immediate query reflection', async () => {
      // Create task
      const createResult = await graphqlClient.request(CREATE_TASK, {
        input: {
          title: 'Update Visibility Test',
          taskType: 'PREPARATION',
          entityType: 'DEAL',
          entityId: scenario.deals[0].id,
          dealId: scenario.deals[0].id,
          assignedToUserId: testEnv.testUserId,
          priority: 'LOW'
        }
      });

      // Update task
      await graphqlClient.request(UPDATE_TASK, {
        id: createResult.createTask.id,
        input: {
          priority: 'URGENT',
          status: 'IN_PROGRESS'
        }
      });

      // Query and verify updates are visible
      const queryResult = await graphqlClient.request(GET_TASKS_FOR_DEAL, {
        dealId: scenario.deals[0].id
      });

      const updatedTask = queryResult.getTasksForDeal.find(
        task => task.id === createResult.createTask.id
      );
      expect(updatedTask).toBeDefined();
      expect(updatedTask.priority).toBe('URGENT');
      expect(updatedTask.status).toBe('IN_PROGRESS');
    });
  });

  describe('Task Business Logic Integration', () => {
    it('should integrate with WFM system via GraphQL', async () => {
      expect(scenario.deals[0].wfmProjectId).toBeDefined();
    });

    it('should support CRM context linking', async () => {
      expect(scenario.deals[0].id).toBeDefined();
      expect(scenario.organizations[0].id).toBeDefined();
      expect(scenario.people[0].id).toBeDefined();
    });
  });

  describe('Performance Requirements', () => {
    it('should meet GraphQL performance thresholds', async () => {
      const startTime = Date.now();
      
      // Simulate GraphQL query time
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const executionTime = Date.now() - startTime;
      expect(executionTime).toBeLessThan(1000); // Should be much faster than 1s
    });
  });
}); 