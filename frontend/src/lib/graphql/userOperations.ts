import { gql } from 'graphql-request';

export const GET_ASSIGNABLE_USERS_QUERY = gql`
  query GetAssignableUsers {
    assignableUsers {
      id
      display_name
      email
      avatar_url
      roles {
        id
        name
        description
      }
    }
  }
`;

export const GET_USER_LIST_QUERY = gql`
  query GetUserList {
    users {
      id
      display_name
      email
      avatar_url
      roles {
        id
        name
        description
      }
    }
  }
`; 