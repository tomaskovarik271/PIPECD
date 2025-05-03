import { BrowserRouter as Router, Routes, Route, Link as RouterLink } from 'react-router-dom';
import { useEffect, useState } from 'react'; // Import hooks
import { gql } from 'graphql-request'; // Import gql
import { gqlClient } from './lib/graphqlClient'; // Import client
import { supabase } from './lib/supabase'; // Import frontend supabase client
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import type { Session } from '@supabase/supabase-js';
import DealsPage from './pages/DealsPage';
import PeoplePage from './pages/PeoplePage';
import OrganizationsPage from './pages/OrganizationsPage'; // Import the new page
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Link, // Use Chakra Link
  Button, 
  HStack, 
  Flex,
  Spacer,
  useToast,
  VStack,
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
    <>
      <TempNav />
      <Box p={4}>
        <Routes>
          <Route path="/" element={<Heading size="lg">Home</Heading>} />
          <Route path="/people" element={<PeoplePage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/organizations" element={<OrganizationsPage />} />
          <Route path="*" element={<Heading size="lg">404 Not Found</Heading>} />
        </Routes>
      </Box>
    </>
  );
}

// --- Main App Component with Auth Logic (Auth UI uses Chakra theme via ThemeSupa) ---
function App() {
  const [session, setSession] = useState<Session | null>(null);
  const toast = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // Optionally show toast on login/logout
      if (_event === 'SIGNED_IN') {
          toast({ title: "Signed In", status: "success", duration: 3000, isClosable: true });
      }
      if (_event === 'SIGNED_OUT') {
          toast({ title: "Signed Out", status: "info", duration: 3000, isClosable: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  if (!session) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="gray.50">
        <Box maxW="md" w="full" bg="white" boxShadow="lg" rounded="lg" p={8}>
          <VStack spacing={4} align="stretch">
            <Heading fontSize="2xl" textAlign="center">Sign in to your account</Heading>
            <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={['github']} />
          </VStack>
        </Box>
      </Flex>
    );
  }
  else {
    return <AppContent />;
  }
}

// Temporary simple navigation
function TempNav() {
    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Error signing out:', error);
    };
    return (
        <Box as="nav" bg="gray.100" p={4} mb={4}>
            <HStack spacing={4} justify="space-between">
                <HStack spacing={4}>
                    <Link as={RouterLink} to="/">Home (Placeholder)</Link>
                    <Link as={RouterLink} to="/people">People</Link>
                    <Link as={RouterLink} to="/deals">Deals</Link>
                    <Link as={RouterLink} to="/organizations">Organizations</Link>
                </HStack>
                <Button size="sm" onClick={handleSignOut}>Sign Out</Button>
            </HStack>
      </Box>
    );
}

export default App;
