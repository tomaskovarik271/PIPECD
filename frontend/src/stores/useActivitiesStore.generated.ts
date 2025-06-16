import { gql } from 'graphql-request';
import { createCrudStore, commonExtractors } from './createCrudStore';
import type { 
  Activity, 
  ActivityInput
} from '../generated/graphql/graphql';

// GraphQL Operations
const GET_ACTIVITIES_QUERY = gql`
  query GetActivities {
    activities {
      id
      created_at
      updated_at
      type
      subject
      notes
      due_date
      is_done
      is_system_activity
      user_id
      assigned_to_user_id
      deal_id
      person_id
      organization_id
      lead_id
    assignedToUser {
      id
      display_name
      email
      avatar_url
    }
    }
  }
`;

const GET_ACTIVITY_BY_ID_QUERY = gql`
  query GetActivityById($id: ID!) {
    activity(id: $id) {
      id
      created_at
      updated_at
      type
      subject
      notes
      due_date
      is_done
      is_system_activity
      user_id
      assigned_to_user_id
      deal_id
      person_id
      organization_id
      lead_id
    assignedToUser {
      id
      display_name
      email
      avatar_url
    }
    }
  }
`;

const CREATE_ACTIVITY_MUTATION = gql`
  mutation CreateActivity($input: ActivityInput!) {
    createActivity(input: $input) {
      id
      created_at
      updated_at
      type
      subject
      notes
      due_date
      is_done
      is_system_activity
      user_id
      assigned_to_user_id
      deal_id
      person_id
      organization_id
      lead_id
    assignedToUser {
      id
      display_name
      email
      avatar_url
    }
    }
  }
`;

const UPDATE_ACTIVITY_MUTATION = gql`
  mutation UpdateActivity($id: ID!, $input: ActivityInput!) {
    updateActivity(id: $id, input: $input) {
      id
      created_at
      updated_at
      type
      subject
      notes
      due_date
      is_done
      is_system_activity
      user_id
      assigned_to_user_id
      deal_id
      person_id
      organization_id
      lead_id
    assignedToUser {
      id
      display_name
      email
      avatar_url
    }
    }
  }
`;

const DELETE_ACTIVITY_MUTATION = gql`
  mutation DeleteActivity($id: ID!) {
    deleteActivity(id: $id)
  }
`;

// Create the Activities store using the factory
export const useActivitiesStore = createCrudStore<Activity, ActivityInput, Partial<ActivityInput>>({
  entityName: 'activity',
  entityNamePlural: 'activities',
  
  queries: {
    getItems: GET_ACTIVITIES_QUERY,
    getItemById: GET_ACTIVITY_BY_ID_QUERY,
  },
  
  mutations: {
    create: CREATE_ACTIVITY_MUTATION,
    update: UPDATE_ACTIVITY_MUTATION,
    delete: DELETE_ACTIVITY_MUTATION,
  },
  
  extractItems: commonExtractors.items('activities'),
  extractSingleItem: commonExtractors.singleItem('activity'),
  extractCreatedItem: commonExtractors.createdItem('createActivity'),
  extractUpdatedItem: commonExtractors.updatedItem('updateActivity'),
  extractDeleteResult: commonExtractors.deleteResult('deleteActivity'),
});

// Export types for convenience
export type { Activity, ActivityInput };

// Store state type alias
export type ActivitiesStoreState = ReturnType<typeof useActivitiesStore>;