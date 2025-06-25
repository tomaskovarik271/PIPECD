import { gql } from '@apollo/client';

// Task fragments
export const TASK_CORE_FIELDS = gql`
  fragment TaskCoreFields on Task {
    id
    title
    description
    type
    status
    priority
    dueDate
    completedAt
    estimatedDuration
    emailThreadId
    calendarEventId
    notes
    tags
    createdAt
    updatedAt
  }
`;

export const TASK_WITH_USERS = gql`
  fragment TaskWithUsers on Task {
    ...TaskCoreFields
    assignedToUser {
      id
      email
      firstName
      lastName
      avatarUrl
    }
    createdByUser {
      id
      email
      firstName
      lastName
      avatarUrl
    }
  }
  ${TASK_CORE_FIELDS}
`;

export const TASK_WITH_BUSINESS_CONTEXT = gql`
  fragment TaskWithBusinessContext on Task {
    ...TaskWithUsers
    deal {
      id
      name
      amount
      currency
    }
    lead {
      id
      contactName
      contactEmail
      estimatedValue
      currency
    }
    person {
      id
      firstName
      lastName
      email
    }
    organization {
      id
      name
    }
  }
  ${TASK_WITH_USERS}
`;

// Queries
export const GET_TASKS = gql`
  query GetTasks($filters: TaskFilters) {
    tasks(filters: $filters) {
      ...TaskWithBusinessContext
    }
  }
  ${TASK_WITH_BUSINESS_CONTEXT}
`;

export const GET_TASK = gql`
  query GetTask($id: ID!) {
    task(id: $id) {
      ...TaskWithBusinessContext
    }
  }
  ${TASK_WITH_BUSINESS_CONTEXT}
`;

export const GET_TIMELINE_TASKS = gql`
  query GetTimelineTasks($dealId: ID!, $startDate: DateTime, $endDate: DateTime) {
    timelineTasks(dealId: $dealId, startDate: $startDate, endDate: $endDate) {
      ...TaskWithBusinessContext
    }
  }
  ${TASK_WITH_BUSINESS_CONTEXT}
`;

export const GET_MY_DAILY_TASKS = gql`
  query GetMyDailyTasks($date: DateTime!) {
    myDailyTasks(date: $date) {
      ...TaskWithBusinessContext
    }
  }
  ${TASK_WITH_BUSINESS_CONTEXT}
`;

export const GET_TASK_STATS = gql`
  query GetTaskStats($userId: ID) {
    taskStats(userId: $userId) {
      total
      pending
      inProgress
      completed
      overdue
    }
  }
`;

// Mutations
export const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      ...TaskWithBusinessContext
    }
  }
  ${TASK_WITH_BUSINESS_CONTEXT}
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) {
      ...TaskWithBusinessContext
    }
  }
  ${TASK_WITH_BUSINESS_CONTEXT}
`;

export const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id)
  }
`;

export const COMPLETE_TASK = gql`
  mutation CompleteTask($id: ID!, $notes: String) {
    completeTask(id: $id, notes: $notes) {
      ...TaskWithBusinessContext
    }
  }
  ${TASK_WITH_BUSINESS_CONTEXT}
`;

export const RESCHEDULE_TASK = gql`
  mutation RescheduleTask($id: ID!, $newDueDate: DateTime!) {
    rescheduleTask(id: $id, newDueDate: $newDueDate) {
      ...TaskWithBusinessContext
    }
  }
  ${TASK_WITH_BUSINESS_CONTEXT}
`;

export const REASSIGN_TASK = gql`
  mutation ReassignTask($id: ID!, $newAssigneeId: ID!) {
    reassignTask(id: $id, newAssigneeId: $newAssigneeId) {
      ...TaskWithBusinessContext
    }
  }
  ${TASK_WITH_BUSINESS_CONTEXT}
`;

export const BULK_UPDATE_TASKS = gql`
  mutation BulkUpdateTasks($ids: [ID!]!, $input: UpdateTaskInput!) {
    bulkUpdateTasks(ids: $ids, input: $input) {
      ...TaskWithBusinessContext
    }
  }
  ${TASK_WITH_BUSINESS_CONTEXT}
`; 