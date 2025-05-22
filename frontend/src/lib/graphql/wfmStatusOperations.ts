import { gql } from 'graphql-request'; // Or your preferred gql tag import

export const GET_WFM_STATUSES = gql`
  query GetWFMStatuses($isArchived: Boolean) {
    wfmStatuses(isArchived: $isArchived) {
      id
      name
      description
      color
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

export const GET_WFM_STATUS_BY_ID = gql`
  query GetWFMStatusById($id: ID!) {
    wfmStatus(id: $id) {
      id
      name
      description
      color
      isArchived
      createdAt
      updatedAt
      createdByUser {
        id
        display_name
        email
        avatar_url
      }
      updatedByUser {
        id
        display_name
        email
        avatar_url
      }
    }
  }
`;

export const CREATE_WFM_STATUS = gql`
  mutation CreateWFMStatus($input: CreateWFMStatusInput!) {
    createWFMStatus(input: $input) {
      id
      name
      description
      color
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

export const UPDATE_WFM_STATUS = gql`
  mutation UpdateWFMStatus($id: ID!, $input: UpdateWFMStatusInput!) {
    updateWFMStatus(id: $id, input: $input) {
      id
      name
      description
      color
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

export const DELETE_WFM_STATUS = gql`
  mutation DeleteWFMStatus($id: ID!) {
    deleteWfmStatus(id: $id) {
      success
      message
      # status { id name } # Optional: if you want to confirm what was deleted, though typically not needed
    }
  }
`; 