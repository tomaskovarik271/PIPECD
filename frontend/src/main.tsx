import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { supabase } from './lib/supabase';
import './index.css'
import App from './App.tsx'

// Create HTTP link
const httpLink = createHttpLink({
  uri: '/api/graphql',
});

// Create Auth link to set headers
const authLink = setContext(async (_, { headers }) => {
  // Get the authentication token from Supabase session
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting Supabase session in authLink:', error);
  }

  const token = session?.access_token;

  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

// Create Apollo Client instance using the combined link
const client = new ApolloClient({
  link: authLink.concat(httpLink), // Combine authLink and httpLink
  cache: new InMemoryCache(),
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={client}> 
      <ChakraProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ChakraProvider>
    </ApolloProvider>
  </StrictMode>,
)
