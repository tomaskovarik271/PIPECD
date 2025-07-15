import { gql } from 'graphql-request';

// Fragment for deal label fields
const DEAL_LABEL_FIELDS_FRAGMENT = gql`
  fragment DealLabelFields on DealLabel {
    id
    dealId
    labelText
    colorHex
    createdByUserId
    createdAt
    updatedAt
  }
`;

// Query to get label suggestions for autocomplete
export const GET_LABEL_SUGGESTIONS_QUERY = gql`
  query SuggestLabels($input: String!, $dealId: ID, $limit: Int) {
    suggestLabels(input: $input, dealId: $dealId, limit: $limit) {
      labelText
      usageCount
      colorHex
      isExactMatch
      similarityScore
    }
  }
`;

// Mutation to add a label to a deal
export const ADD_DEAL_LABEL_MUTATION = gql`
  mutation AddLabelToDeal($input: AddLabelToDealInput!) {
    addLabelToDeal(input: $input) {
      id
      name
      labels {
        id
        dealId
        labelText
        colorHex
        createdByUserId
        createdAt
        updatedAt
      }
    }
  }
`;

// Mutation to remove a label from a deal
export const REMOVE_DEAL_LABEL_MUTATION = gql`
  mutation RemoveLabelFromDeal($input: RemoveLabelFromDealInput!) {
    removeLabelFromDeal(input: $input) {
      id
      name
      labels {
        id
        dealId
        labelText
        colorHex
        createdByUserId
        createdAt
        updatedAt
      }
    }
  }
`;

// Query to get popular labels for suggestions
export const GET_POPULAR_LABELS_QUERY = gql`
  query PopularLabels($limit: Int) {
    popularLabels(limit: $limit) {
      labelText
      usageCount
      colorHex
    }
  }
`;

// Query to get all labels for a specific deal
export const GET_DEAL_LABELS_QUERY = gql`
  query DealLabels($dealId: ID!) {
    dealLabels(dealId: $dealId) {
      id
      dealId
      labelText
      colorHex
      createdByUserId
      createdAt
      updatedAt
    }
  }
`; 