import { create } from 'zustand';
import { gql } from 'graphql-request';
import { gqlClient } from '../lib/graphqlClient';
// import { supabase } from '../lib/supabase'; // REMOVED
import type { Person as GeneratedPerson, PersonInput, MutationCreatePersonArgs, MutationUpdatePersonArgs, MutationDeletePersonArgs } from '../generated/graphql/graphql';
import { isGraphQLErrorWithMessage /*, GraphQLErrorWithMessage REMOVED */ } from '../lib/graphqlUtils';

// Re-export Person type for convenience by consumers
export type { GeneratedPerson as Person };

// GQL Operations for People
const GET_PEOPLE_QUERY = gql`
  query GetPeople {
    people {
      id
      first_name
      last_name
      email
      phone
      notes
      created_at
      updated_at
      organization_id
      organization { id name }
    }
  }
`;

const CREATE_PERSON_MUTATION = gql`
  mutation CreatePerson($input: PersonInput!) {
    createPerson(input: $input) {
      id
      first_name
      last_name
      email
      phone
      notes
      created_at
      updated_at
      organization_id
      organization { id name }
    }
  }
`;

const UPDATE_PERSON_MUTATION = gql`
  mutation UpdatePerson($id: ID!, $input: PersonInput!) {
    updatePerson(id: $id, input: $input) {
      id
      first_name
      last_name
      email
      phone
      notes
      created_at
      updated_at
      organization_id
      organization { id name }
    }
  }
`;

const DELETE_PERSON_MUTATION = gql`
  mutation DeletePerson($id: ID!) {
    deletePerson(id: $id)
  }
`;

interface PeopleState {
  people: GeneratedPerson[];
  peopleLoading: boolean;
  peopleError: string | null;
  fetchPeople: () => Promise<void>;
  createPerson: (input: PersonInput) => Promise<GeneratedPerson | null>;
  updatePerson: (id: string, input: PersonInput) => Promise<GeneratedPerson | null>;
  deletePerson: (id: string) => Promise<boolean>;
}

export const usePeopleStore = create<PeopleState>((set, _) => ({
  people: [],
  peopleLoading: false,
  peopleError: null,

  fetchPeople: async () => {
    set({ peopleLoading: true, peopleError: null });
    try {
      type GetPeopleQueryResponse = { people: GeneratedPerson[] }; 
      const response = await gqlClient.request<GetPeopleQueryResponse>(GET_PEOPLE_QUERY);
      set({ people: response.people || [], peopleLoading: false });
    } catch (error: unknown) {
      let message = 'An unknown error occurred';
      if (isGraphQLErrorWithMessage(error)) {
        message = error.response?.errors?.[0]?.message || 'GraphQL error';
      } else if (error instanceof Error) {
        message = error.message;
      }
      set({ peopleError: message, peopleLoading: false });
      console.error("Error fetching people:", error);
    }
  },

  createPerson: async (input: PersonInput) => {
    set({ peopleLoading: true, peopleError: null });
    try {
      const variables: MutationCreatePersonArgs = { input };
      type CreatePersonMutationResponse = { createPerson?: GeneratedPerson | null }; 
      const response = await gqlClient.request<CreatePersonMutationResponse>(
        CREATE_PERSON_MUTATION,
        variables
      );
      if (response.createPerson) {
        set((state) => ({ 
          people: [...state.people, response.createPerson!], 
          peopleLoading: false 
        }));
        return response.createPerson;
      }
      set({ peopleLoading: false });
      return null;
    } catch (error: unknown) {
      let message = 'An unknown error occurred during person creation';
      if (isGraphQLErrorWithMessage(error)) {
        message = error.response?.errors?.[0]?.message || 'GraphQL error';
      } else if (error instanceof Error) {
        message = error.message;
      }
      set({ peopleError: message, peopleLoading: false });
      console.error("Error creating person:", error);
      return null;
    }
  },

  updatePerson: async (id: string, input: PersonInput) => {
    set({ peopleLoading: true, peopleError: null });
    try {
      const variables: MutationUpdatePersonArgs = { id, input };
      type UpdatePersonMutationResponse = { updatePerson?: GeneratedPerson | null };
      const response = await gqlClient.request<UpdatePersonMutationResponse>(
        UPDATE_PERSON_MUTATION,
        variables
      );
      if (response.updatePerson) {
        set((state) => ({
          people: state.people.map((p) => (p.id === id ? response.updatePerson! : p)),
          peopleLoading: false,
        }));
        return response.updatePerson;
      }
      set({ peopleLoading: false });
      return null;
    } catch (error: unknown) {
      let message = 'An unknown error occurred during person update';
      if (isGraphQLErrorWithMessage(error)) {
        message = error.response?.errors?.[0]?.message || 'GraphQL error';
      } else if (error instanceof Error) {
        message = error.message;
      }
      set({ peopleError: message, peopleLoading: false });
      console.error("Error updating person:", error);
      return null;
    }
  },

  deletePerson: async (id: string) => {
    try {
      const variables: MutationDeletePersonArgs = { id };
      type DeletePersonMutationResponse = { deletePerson?: boolean | null };
      await gqlClient.request<DeletePersonMutationResponse>(DELETE_PERSON_MUTATION, variables);
      set((state) => ({ people: state.people.filter((p) => p.id !== id) }));
      return true;
    } catch (error: unknown) {
      let message = 'An unknown error occurred during person deletion';
      if (isGraphQLErrorWithMessage(error)) {
        message = error.response?.errors?.[0]?.message || 'GraphQL error';
      } else if (error instanceof Error) {
        message = error.message;
      }
      set({ peopleError: message }); 
      console.error("Error deleting person:", error);
      return false;
    }
  },
})); 