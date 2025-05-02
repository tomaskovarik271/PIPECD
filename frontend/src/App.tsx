import { Routes, Route, Link as RouterLink } from 'react-router-dom';
import { useEffect, useState } from 'react'; // Import hooks
import { gql } from 'graphql-request'; // Import gql
import { gqlClient } from './lib/graphqlClient'; // Import client
import { supabase } from './lib/supabase'; // Import frontend supabase client
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import type { Session } from '@supabase/supabase-js';
import ContactsPage from './pages/ContactsPage'; // Import the Contacts page
import DealsPage from './pages/DealsPage'; // Import the Deals page
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Link, // Use Chakra Link
  Button, 
  HStack, 
  // Divider // Keep Divider as it's used in AppContent - Removing temporarily
} from '@chakra-ui/react';

// Define the health query
const HEALTH_QUERY = gql`
  query {
    health
  }
`;

const ME_QUERY = gql`
  query {
    me {
      id
      email
    }
  }
`;

// Interface for the 'me' query result
interface MeQueryResult {
  me: {
    id: string;
    email?: string; // Email might be null depending on Supabase settings
  } | null;
}

// --- Page Components (using Chakra UI) ---
function HomePage() {
  const [healthStatus, setHealthStatus] = useState<string>('Checking...');
  const [userInfo, setUserInfo] = useState<string>('Fetching...');

  useEffect(() => {
    // Fetch health status
    gqlClient.request(HEALTH_QUERY)
      .then((data: any) => setHealthStatus(data.health || 'Unknown'))
      .catch((error) => {
        console.error('Error fetching health:', error);
        setHealthStatus('Error');
      });

    // Fetch user info
    gqlClient.request<MeQueryResult>(ME_QUERY)
      .then((data) => {
        if (data.me) {
          setUserInfo(`Logged in as: ${data.me.email} (ID: ${data.me.id})`);
        } else {
          setUserInfo('Not logged in (backend)');
        }
      })
      .catch((error) => {
        console.error('Error fetching user info:', error);
        setUserInfo('Error fetching user info');
      });

  }, []); 

  return (
    <Box p={4}>
      <Heading as="h2" size="lg" mb={4}>
        Home Page
      </Heading>
      <Text mb={2}>Welcome to the CRM!</Text>
      <Text mb={2}>
        <strong>API Health:</strong> {healthStatus}
      </Text>
      <Text>
        <strong>User Status:</strong> {userInfo}
      </Text>
    </Box>
  );
}

function AboutPage() {
  return (
    <Box p={4}>
      <Heading as="h2" size="lg" mb={4}>About Page</Heading>
      <Text>This is a custom CRM system built with React, Vite, Netlify, Supabase, GraphQL Yoga, and Chakra UI.</Text>
    </Box>
  );
}

function NotFoundPage() {
  return (
    <Box p={4}>
      <Heading as="h2" size="lg" mb={4}>404 - Not Found</Heading>
      <Text mb={4}>The page you are looking for does not exist.</Text>
      <Link as={RouterLink} to="/" color="teal.500">Go Home</Link>
    </Box>
  );
}

// --- Component for Logged-In State (using Chakra UI) ---
function AppContent() {
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Box>
      <Box as="nav" bg="gray.100" p={4}>
        <HStack spacing={4}>
          <Link as={RouterLink} to="/">Home</Link>
          <Link as={RouterLink} to="/contacts">Contacts</Link>
          <Link as={RouterLink} to="/deals">Deals</Link>
          <Link as={RouterLink} to="/about">About</Link>
          <Button size="sm" onClick={handleSignOut}>Sign Out</Button>
        </HStack>
      </Box>

      {/* <Divider /> */}

      <Container maxW="container.xl" mt={4}>
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </Container>
    </Box>
  );
}

// --- Main App Component with Auth Logic (Auth UI uses Chakra theme via ThemeSupa) ---
function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Check initial session state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    // Render Supabase Auth UI if not logged in
    return (
      <Container maxW="sm" mt="10vh">
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }} // ThemeSupa integrates well with Chakra
          providers={['google', 'github']}
        />
      </Container>
    );
  } else {
    // Render the main application content if logged in
    return <AppContent />;
  }
}

export default App;
