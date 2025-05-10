import { GraphQLClient } from 'graphql-request';
import { supabase } from './supabase'; // Import the frontend Supabase client

// Determine the API endpoint URL based on the environment
// REMOVED: Previous endpoint logic attempts
// const endpoint = import.meta.env.DEV
//   ? 'http://localhost:8888/.netlify/functions/graphql' // Use the typical netlify dev port
//   : '/.netlify/functions/graphql'; // Relative path for production

// REMOVED DEBUGGING
// console.log("GraphQL Endpoint determined:", endpoint);
// console.log("Is DEV environment?", import.meta.env.DEV);

// Construct absolute URL: Use relative path in prod, prefixing with origin.
const relativeEndpoint = '/.netlify/functions/graphql';
const endpoint = import.meta.env.DEV
  ? `http://localhost:8888${relativeEndpoint}` // Local dev absolute URL
  : `${window.location.origin}${relativeEndpoint}`; // Production absolute URL

// Create and export the GraphQL client instance
export const gqlClient: GraphQLClient = new GraphQLClient(endpoint, {
  // Dynamically set headers before each request
  requestMiddleware: async (request) => {
    // Get the current session from Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    // Initialize headers, potentially from existing request headers
    const headers = new Headers(request.headers);

    // Add the Authorization header if a session exists
    if (session?.access_token) {
      headers.set('Authorization', `Bearer ${session.access_token}`);
    }
    
    return {
      ...request,
      headers,
    };
  },
});

// REMOVED: Example usage
/*
import { gql } from '@apollo/client';

const query = gql`
  query {
    health
  }
`;

async function fetchHealth() {
  try {
    const data = await gqlClient.request(query);
    console.log('GraphQL Health Check:', data);
  } catch (error) {
    console.error('Error fetching health:', error);
  }
}

// fetchHealth();
*/ 