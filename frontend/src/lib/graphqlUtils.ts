// --- GraphQL Error Handling Types ---
interface GQLError {
  message: string;
  // Depending on your GraphQL server, other properties like 'path' or 'extensions' might exist
}

interface GQLResponse {
  errors: GQLError[];
  // Data would also be here in a full response, but we only care about errors for this type
}

export interface GraphQLErrorWithMessage {
  response?: GQLResponse; // Make response optional as it might not always be there (e.g. network error)
  // Add other properties if your client might throw errors with different shapes
  // For instance, a plain Error object from a network issue won't have 'response'.
}

// Type guard to check if an error is a GraphQL-like error with a message
export function isGraphQLErrorWithMessage(error: unknown): error is GraphQLErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    // Check if 'response' exists and is an object
    (typeof (error as GraphQLErrorWithMessage).response === 'object' &&
      (error as GraphQLErrorWithMessage).response !== null &&
      // Check if 'response.errors' exists, is an array, and has at least one element
      Array.isArray((error as GraphQLErrorWithMessage).response?.errors) &&
      ((error as GraphQLErrorWithMessage).response?.errors?.length ?? 0) > 0 &&
      // Check if the first error has a 'message' property of type string
      typeof (error as GraphQLErrorWithMessage).response?.errors?.[0]?.message === 'string')
  );
} 