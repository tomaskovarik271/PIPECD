import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from, // Use 'from' to combine links
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { supabase } from './supabase'; // Your Supabase client

const graphqlUri = '/.netlify/functions/graphql';

const httpLink = new HttpLink({
  uri: graphqlUri,
});

const authLink = setContext(async (_, { headers }) => {
  // Get the authentication token from Supabase session
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error getting Supabase session for Apollo Link:', error);
  }

  const token = session?.access_token;

  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError, operation: _operation, forward: _forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}, Code: ${extensions?.code}`
      );
      // Handle specific error codes if needed
      // For example, if (extensions?.code === 'UNAUTHENTICATED') { /* handle auth error */ }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError.message}`, networkError);
    // Handle network errors (e.g., show a toast, retry logic)
  }
  
  // You can still forward the operation if you want to proceed despite the error,
  // or handle it and not forward.
  // return forward(operation);
});

export const apolloClient = new ApolloClient({
  link: from([
    authLink,
    errorLink, // errorLink can be placed before or after authLink, depending on desired error handling for auth itself
    httpLink,
  ]),
  cache: new InMemoryCache(),
  connectToDevTools: import.meta.env.DEV, // Enable DevTools only in development
}); 