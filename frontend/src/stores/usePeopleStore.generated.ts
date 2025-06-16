import { gql } from 'graphql-request';
import { createCrudStore, commonExtractors } from './createCrudStore';
import type { 
  Person, 
  PersonInput
} from '../generated/graphql/graphql';

// GraphQL Operations
const GET_PEOPLE_QUERY = gql`
  query GetPeople {
    people {
      id
      created_at
      updated_at
      first_name
      last_name
      email
      phone
      notes
      organization_id
    customFieldValues {
      stringValue
      numberValue
      booleanValue
      dateValue
      selectedOptionValues
      definition {
        id
        fieldName
        fieldLabel
        fieldType
        isRequired
        dropdownOptions { value label }
      }
    }
      
    organization { 
      id 
      name 
    }
      
      deals {
        id
        name
        amount
        expected_close_date
      }
    }
  }
`;

const GET_PERSON_BY_ID_QUERY = gql`
  query GetPersonById($id: ID!) {
    person(id: $id) {
      id
      created_at
      updated_at
      first_name
      last_name
      email
      phone
      notes
      organization_id
    customFieldValues {
      stringValue
      numberValue
      booleanValue
      dateValue
      selectedOptionValues
      definition {
        id
        fieldName
        fieldLabel
        fieldType
        isRequired
        dropdownOptions { value label }
      }
    }
      
    organization { 
      id 
      name 
    }
      
      deals {
        id
        name
        amount
        expected_close_date
      }
    }
  }
`;

const CREATE_PERSON_MUTATION = gql`
  mutation CreatePerson($input: PersonInput!) {
    createPerson(input: $input) {
      id
      created_at
      updated_at
      first_name
      last_name
      email
      phone
      notes
      organization_id
    customFieldValues {
      stringValue
      numberValue
      booleanValue
      dateValue
      selectedOptionValues
      definition {
        id
        fieldName
        fieldLabel
        fieldType
        isRequired
        dropdownOptions { value label }
      }
    }
      
    organization { 
      id 
      name 
    }
      
      deals {
        id
        name
        amount
        expected_close_date
      }
    }
  }
`;

const UPDATE_PERSON_MUTATION = gql`
  mutation UpdatePerson($id: ID!, $input: PersonInput!) {
    updatePerson(id: $id, input: $input) {
      id
      created_at
      updated_at
      first_name
      last_name
      email
      phone
      notes
      organization_id
    customFieldValues {
      stringValue
      numberValue
      booleanValue
      dateValue
      selectedOptionValues
      definition {
        id
        fieldName
        fieldLabel
        fieldType
        isRequired
        dropdownOptions { value label }
      }
    }
      
    organization { 
      id 
      name 
    }
      
      deals {
        id
        name
        amount
        expected_close_date
      }
    }
  }
`;

const DELETE_PERSON_MUTATION = gql`
  mutation DeletePerson($id: ID!) {
    deletePerson(id: $id)
  }
`;

// Create the People store using the factory
export const usePeopleStore = createCrudStore<Person, PersonInput, Partial<PersonInput>>({
  entityName: 'person',
  entityNamePlural: 'people',
  
  queries: {
    getItems: GET_PEOPLE_QUERY,
    getItemById: GET_PERSON_BY_ID_QUERY,
  },
  
  mutations: {
    create: CREATE_PERSON_MUTATION,
    update: UPDATE_PERSON_MUTATION,
    delete: DELETE_PERSON_MUTATION,
  },
  
  extractItems: commonExtractors.items('people'),
  extractSingleItem: commonExtractors.singleItem('person'),
  extractCreatedItem: commonExtractors.createdItem('createPerson'),
  extractUpdatedItem: commonExtractors.updatedItem('updatePerson'),
  extractDeleteResult: commonExtractors.deleteResult('deletePerson'),
});

// Export types for convenience
export type { Person, PersonInput };

// Store state type alias
export type PeopleStoreState = ReturnType<typeof usePeopleStore>;