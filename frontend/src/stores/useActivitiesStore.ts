import { create } from 'zustand';
import { gql } from 'graphql-request';
import { gqlClient } from '../lib/graphqlClient';
import { isGraphQLErrorWithMessage } from '../lib/graphqlUtils';
import type {
  Activity,
  ActivityFilterInput as GeneratedActivityFilterInput,
  CreateActivityInput as GeneratedCreateActivityInput,
  UpdateActivityInput as GeneratedUpdateActivityInput,
  QueryActivitiesArgs,
  MutationCreateActivityArgs,
  MutationUpdateActivityArgs,
  MutationDeleteActivityArgs,
  Maybe,
  ActivityType,
  CustomFieldValue,
  User,
  Deal,
  Person,
  Organization,
} from '../generated/graphql/graphql';

// Re-export core Activity types for convenience if components need them
export type { Activity, GeneratedCreateActivityInput, GeneratedUpdateActivityInput, GeneratedActivityFilterInput, Maybe, ActivityType };

// --- GraphQL Fragment for Custom Field Values ---
// const CUSTOM_FIELD_VALUES_FRAGMENT = gql`
//   fragment CustomFieldValuesDataActivity on CustomFieldValue {
//     definition {
//       id
//       fieldName
//       fieldLabel
//       fieldType
//       displayOrder
//       isRequired
//       isActive
//       dropdownOptions {
//         value
//         label
//       }
//     }
//     stringValue
//     numberValue
//     booleanValue
//     dateValue
//     selectedOptionValues
//   }
// `;

// GQL Constants (copied from useAppStore)
const GET_ACTIVITIES_QUERY = gql`
  query GetActivities($filter: ActivityFilterInput) {
    activities(filter: $filter) {
      id
      user_id
      created_at
      updated_at
      type
      subject
      due_date
      is_done
      notes
      deal_id
      person_id
      organization_id
      deal { id name }
      person { id first_name last_name }
      organization { id name }
    }
  }
`;

const CREATE_ACTIVITY_MUTATION = gql`
  mutation CreateActivity($input: CreateActivityInput!) {
    createActivity(input: $input) {
      id
      user_id
      created_at
      updated_at
      type
      subject
      due_date
      is_done
      notes
      deal_id
      person_id
      organization_id
      deal { id name }
      person { id first_name last_name }
      organization { id name }
    }
  }
`;

const UPDATE_ACTIVITY_MUTATION = gql`
  mutation UpdateActivity($id: ID!, $input: UpdateActivityInput!) {
    updateActivity(id: $id, input: $input) {
      id
      user_id
      created_at
      updated_at
      type
      subject
      due_date
      is_done
      notes
      deal_id
      person_id
      organization_id
      deal { id name }
      person { id first_name last_name }
      organization { id name }
    }
  }
`;

const DELETE_ACTIVITY_MUTATION = gql`
  mutation DeleteActivity($id: ID!) {
    deleteActivity(id: $id)
  }
`;

const GET_ACTIVITY_BY_ID_QUERY = gql`
  query GetActivityById($id: ID!) {
    activity(id: $id) {
      id
      type
      subject
      due_date
      is_done
      notes
      created_at
      updated_at
      user { 
        id
        email 
        display_name
      }
      deal { 
        id
        name
      }
      person { 
        id
        first_name
        last_name
      }
      organization { 
        id
        name
      }
    }
  }
`;

// Interface for single activity with details (aligns with GET_ACTIVITY_BY_ID_QUERY)
export interface ActivityWithDetails extends Omit<Activity, 'user' | 'deal' | 'person' | 'organization'> {
  user?: Maybe<Partial<Pick<User, 'id' | 'email' | 'display_name'> >>;
  deal?: Maybe<Pick<Deal, 'id' | 'name'> >;
  person?: Maybe<Pick<Person, 'id' | 'first_name' | 'last_name'> >;
  organization?: Maybe<Pick<Organization, 'id' | 'name'> >;
}

// State Interface
export interface ActivitiesState {
  activities: Activity[];
  activitiesLoading: boolean;
  activitiesError: string | null;
  currentActivity: ActivityWithDetails | null;
  currentActivityLoading: boolean;
  currentActivityError: string | null;
  fetchActivityById: (activityId: string) => Promise<void>;
  fetchActivities: (filter?: GeneratedActivityFilterInput) => Promise<void>;
  createActivity: (input: GeneratedCreateActivityInput) => Promise<Activity | null>;
  updateActivity: (id: string, input: GeneratedUpdateActivityInput) => Promise<Activity | null>;
  deleteActivity: (id: string) => Promise<boolean>;
}

// Store Implementation
export const useActivitiesStore = create<ActivitiesState>((set, get) => ({
  activities: [],
  activitiesLoading: false,
  activitiesError: null,
  currentActivity: null,
  currentActivityLoading: false,
  currentActivityError: null,

  fetchActivities: async (filter?: GeneratedActivityFilterInput) => {
    set({ activitiesLoading: true, activitiesError: null });
    try {
      const variables: QueryActivitiesArgs = {};
      if (filter) {
        variables.filter = filter;
      }
      const data = await gqlClient.request<{ activities: Activity[] }, QueryActivitiesArgs>(GET_ACTIVITIES_QUERY, variables);
      set({
        activities: (data.activities || []).sort((a, b) => {
          const aDate = a.due_date ? new Date(a.due_date).getTime() : Infinity;
          const bDate = b.due_date ? new Date(b.due_date).getTime() : Infinity;
          if (aDate !== bDate) return aDate - bDate;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }),
        activitiesLoading: false
      });
    } catch (error: unknown) {
      console.error("Error fetching activities:", error);
      let message = 'Failed to fetch activities';
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
        message = error.response.errors[0].message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      set({ activitiesError: message, activitiesLoading: false, activities: [] });
    }
  },

  createActivity: async (input: GeneratedCreateActivityInput): Promise<Activity | null> => {
    // set({ activitiesLoading: true, activitiesError: null }); // Global loading not typically set for create
    try {
      const response = await gqlClient.request<{ createActivity?: Maybe<Activity> }, MutationCreateActivityArgs>(
        CREATE_ACTIVITY_MUTATION,
        { input }
      );
      if (response.createActivity) {
        set((state) => ({
          activities: [...state.activities, response.createActivity!].sort((a, b) => {
            const aDate = a.due_date ? new Date(a.due_date).getTime() : Infinity;
            const bDate = b.due_date ? new Date(b.due_date).getTime() : Infinity;
            if (aDate !== bDate) return aDate - bDate;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }),
          activitiesError: null, // Clear any previous error on success
        }));
        return response.createActivity;
      }
      return null;
    } catch (error: unknown) {
      console.error("Error creating activity:", error);
      let message = 'Failed to create activity';
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
        message = error.response.errors[0].message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      set({ activitiesError: message });
      return null;
    }
  },

  updateActivity: async (id: string, input: GeneratedUpdateActivityInput): Promise<Activity | null> => {
    // set({ activitiesLoading: true, activitiesError: null }); // Global loading not typical for update
    try {
      const response = await gqlClient.request<{ updateActivity?: Maybe<Activity> }, MutationUpdateActivityArgs>(
        UPDATE_ACTIVITY_MUTATION,
        { id, input }
      );
      if (response.updateActivity) {
        set((state) => ({
          activities: state.activities.map(a => a.id === id ? response.updateActivity! : a)
            .sort((a, b) => {
              const aDate = a.due_date ? new Date(a.due_date).getTime() : Infinity;
              const bDate = b.due_date ? new Date(b.due_date).getTime() : Infinity;
              if (aDate !== bDate) return aDate - bDate;
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }),
          activitiesError: null, // Clear any previous error on success
        }));
        return response.updateActivity;
      }
      return null;
    } catch (error: unknown) {
      console.error(`Error updating activity ${id}:`, error);
      let message = `Failed to update activity ${id}`;
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
        message = error.response.errors[0].message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      set({ activitiesError: message });
      return null;
    }
  },

  deleteActivity: async (id: string): Promise<boolean> => {
    const originalActivities = get().activities;
    set((state) => ({
      activities: state.activities.filter(a => a.id !== id),
      activitiesError: null // Clear error for optimistic update attempt
    }));
    try {
      const response = await gqlClient.request<{ deleteActivity?: Maybe<string | boolean> }, MutationDeleteActivityArgs>(
        DELETE_ACTIVITY_MUTATION,
        { id }
      );
      // Assuming API returns true or the ID on successful deletion
      if (response.deleteActivity) { 
        return true;
      }
      // Deletion failed according to API but didn't throw an error (unlikely for GQL but good to handle)
      set({ activities: originalActivities, activitiesError: "Delete operation failed as reported by API." });
      return false;
    } catch (error: unknown) {
      console.error(`Error deleting activity ${id}:`, error);
      let message = `Failed to delete activity ${id}`;
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
        message = error.response.errors[0].message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      set({ activities: originalActivities, activitiesError: message }); // Revert optimistic update
      return false;
    }
  },

  fetchActivityById: async (activityId: string) => {
    set({ currentActivityLoading: true, currentActivityError: null, currentActivity: null });
    try {
      type GetActivityByIdQueryResponse = { activity: ActivityWithDetails | null };
      const response = await gqlClient.request<
        GetActivityByIdQueryResponse,
        { id: string } // Explicitly type variables for request
      >(GET_ACTIVITY_BY_ID_QUERY, { id: activityId });
      set({ currentActivity: response.activity || null, currentActivityLoading: false });
    } catch (error: unknown) {
      console.error(`Error fetching activity ${activityId}:`, error);
      let message = `Failed to fetch activity ${activityId}`;
      if (isGraphQLErrorWithMessage(error) && error.response?.errors?.[0]?.message) {
        message = error.response.errors[0].message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      set({ currentActivityError: message, currentActivityLoading: false });
    }
  },
}));

export default useActivitiesStore; 