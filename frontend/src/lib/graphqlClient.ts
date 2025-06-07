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
    console.log('[requestMiddleware] Attempting to get session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('[requestMiddleware] Error getting session:', sessionError);
    }
    if (!session) {
      console.log('[requestMiddleware] No active session found.');
    } else {
      console.log('[requestMiddleware] Active session found:', session);
      if (session.access_token) {
        console.log('[requestMiddleware] Access token found:', session.access_token.substring(0, 20) + '...'); // Log a snippet
      } else {
        console.log('[requestMiddleware] Session found, but NO access token.');
      }
    }

    // Initialize headers, potentially from existing request headers
    const headers = new Headers(request.headers);

    // Add the Authorization header if a session exists
    if (session?.access_token) {
      headers.set('Authorization', `Bearer ${session.access_token}`);
      console.log('[requestMiddleware] Authorization header SET.');
    } else {
      console.log('[requestMiddleware] Authorization header NOT SET (no session/token).');
    }
    
    // Add cache-busting headers to prevent stale data
    headers.set('Cache-Control', 'no-cache');
    headers.set('Pragma', 'no-cache');
    
    console.log('[requestMiddleware] Final headers being sent:', Object.fromEntries(headers.entries()));

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