import { gql } from '@apollo/client';

export const TASK_FRAGMENT = gql`
  fragment TaskFragment on Task {
    id
    title
    description
    status
    priority
    taskType
    assignedToUser {
      id
      display_name
      email
    }
    createdByUser {
      id
      display_name
      email
    }
    dueDate
    completedAt
    blocksStageProgression
    requiredForDealClosure
    calculatedPriority
    businessImpactScore
    tags
    estimatedHours
    actualHours
    createdAt
    updatedAt
  }
`;

export const GET_TASKS_FOR_DEAL = gql`
  ${TASK_FRAGMENT}
  query GetTasksForDeal($dealId: ID!, $filters: TaskFiltersInput) {
    tasksForDeal(dealId: $dealId, filters: $filters) {
      ...TaskFragment
    }
  }
`;

export const GET_TASKS_FOR_LEAD = gql`
  ${TASK_FRAGMENT}
  query GetTasksForLead($leadId: ID!, $filters: TaskFiltersInput) {
    tasksForLead(leadId: $leadId, filters: $filters) {
      ...TaskFragment
    }
  }
`;

export const GET_MY_TASKS = gql`
  ${TASK_FRAGMENT}
  query GetMyTasks($filters: TaskFiltersInput) {
    myTasks(filters: $filters) {
      ...TaskFragment
    }
  }
`;

export const GET_MY_OVERDUE_TASKS = gql`
  ${TASK_FRAGMENT}
  query GetMyOverdueTasks {
    myOverdueTasks {
      ...TaskFragment
    }
  }
`;

export const CREATE_TASK = gql`
  ${TASK_FRAGMENT}
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      ...TaskFragment
    }
  }
`;

export const UPDATE_TASK = gql`
  ${TASK_FRAGMENT}
  mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) {
      ...TaskFragment
    }
  }
`;

export const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

export const COMPLETE_TASK = gql`
  ${TASK_FRAGMENT}
  mutation CompleteTask($id: ID!, $completionData: TaskCompletionInput) {
    completeTask(id: $id, completionData: $completionData) {
      ...TaskFragment
    }
  }
`;

export const GET_TASK_STATS = gql`
  query GetTaskStats($entityType: TaskEntityType, $entityId: ID) {
    taskStats(entityType: $entityType, entityId: $entityId) {
      totalTasks
      completedTasks
      overdueTasks
      tasksByStatus {
        status
        count
      }
      tasksByPriority {
        priority
        count
      }
      tasksByType {
        taskType
        count
      }
      averageCompletionTime
      completionRate
    }
  }
`;

export const GET_DEAL_TASK_INDICATORS = gql`
  query GetDealTaskIndicators($dealIds: [ID!]!) {
    dealTaskIndicators(dealIds: $dealIds) {
      dealId
      tasksDueToday
      tasksOverdue
      totalActiveTasks
    }
  }
`; 