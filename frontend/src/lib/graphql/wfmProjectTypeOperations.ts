import { gql } from 'graphql-request';

export const GET_WFM_PROJECT_TYPES = gql`
  query GetWFMProjectTypes($isArchived: Boolean) {
    wfmProjectTypes(isArchived: $isArchived) {
      id
      name
      description
      defaultWorkflow {
        id
        name
      }
      iconName
      isArchived
      createdAt
      updatedAt
      createdByUser {
        id
        display_name
      }
      updatedByUser {
        id
        display_name
      }
    }
  }
`;

export const GET_WFM_PROJECT_TYPE_BY_ID = gql`
  query GetWFMProjectTypeById($id: ID!) {
    wfmProjectType(id: $id) {
      id
      name
      description
      defaultWorkflow {
        id
        name
      }
      iconName
      isArchived
      createdAt
      updatedAt
      createdByUser {
        id
        display_name
      }
      updatedByUser {
        id
        display_name
      }
    }
  }
`;

export const CREATE_WFM_PROJECT_TYPE = gql`
  mutation CreateWFMProjectType($input: CreateWFMProjectTypeInput!) {
    createWFMProjectType(input: $input) {
      id
      name
      description
      defaultWorkflow {
        id
        name
      }
      iconName
      isArchived
      createdAt
      updatedAt
      createdByUser {
        id
        display_name
      }
      updatedByUser {
        id
        display_name
      }
    }
  }
`;

export const UPDATE_WFM_PROJECT_TYPE = gql`
  mutation UpdateWFMProjectType($id: ID!, $input: UpdateWFMProjectTypeInput!) {
    updateWFMProjectType(id: $id, input: $input) {
      id
      name
      description
      defaultWorkflow {
        id
        name
      }
      iconName
      isArchived
      createdAt
      updatedAt
      createdByUser {
        id
        display_name
      }
      updatedByUser {
        id
        display_name
      }
    }
  }
`;

// For Project Types, we will also use an update mutation to archive/unarchive
// as there isn't a separate delete mutation in the GraphQL schema for it.
// The `isArchived` field in UpdateWFMProjectTypeInput handles this.
export const ARCHIVE_WFM_PROJECT_TYPE = UPDATE_WFM_PROJECT_TYPE;
export const UNARCHIVE_WFM_PROJECT_TYPE = UPDATE_WFM_PROJECT_TYPE;

// If a hard delete operation is ever added to the GraphQL schema for Project Types, it would look like this:
// export const DELETE_WFM_PROJECT_TYPE = gql`
//   mutation DeleteWFMProjectType($id: ID!) {
//     deleteWFMProjectType(id: $id) {
//       success
//       message
//     }
//   }
// `; 