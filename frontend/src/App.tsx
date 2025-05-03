import { Routes, Route, Link as RouterLink } from 'react-router-dom';
import { useEffect, useState } from 'react'; // Import hooks
// import { gql, useQuery } from '@apollo/client'; // Removed unused gql
// import { gqlClient } from './lib/graphqlClient'; // Removed unused gqlClient
import { supabase } from './lib/supabase'; // Import frontend supabase client
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import type { Session } from '@supabase/supabase-js';
import DealsPage from './pages/DealsPage';
import PeoplePage from './pages/PeoplePage';
import OrganizationsPage from './pages/OrganizationsPage'; // Import the new page
import LeadsPage from './pages/LeadsPage'; // Import the new LeadsPage
import { 
  Box, 
  Heading, 
  Link, // Use Chakra Link
  Button, 
  Flex,
  useToast,
  VStack,
} from '@chakra-ui/react';

// Define the health query
// const HEALTH_QUERY = gql` ... `; // Removed unused HEALTH_QUERY

// const ME_QUERY = gql` ... `; // Removed unused ME_QUERY

// Interface for the 'me' query result
// interface MeQueryResult { ... } // Removed unused MeQueryResult

// --- Page Components (using Chakra UI) ---
// NOTE: HomePage, AboutPage, NotFoundPage are unused and can be removed or kept for future use.
// For now, just removing the references causing build errors.

// function HomePage() { ... } // Removed reference

// function AboutPage() { ... } // Removed reference

// function NotFoundPage() { ... } // Removed reference

// --- Component for Logged-In State (using Chakra UI) ---
function AppContent() {
  // Add sign out handler here
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
    // Session state should update via onAuthStateChange listener in App
  };

  return (
    <Flex height="100vh" direction="column"> {/* Change direction to column */}
       {/* Top Bar with Logout */}
       <Flex 
         as="header" 
         align="center" 
         justify="space-between" 
         p={4} 
         borderBottomWidth="1px"
         bg="gray.50"
       >
         <Heading size="md">PIPECD CRM</Heading>
         <Button size="sm" onClick={handleSignOut}>Sign Out</Button>
       </Flex>

      <Flex flex="1"> {/* Inner flex for sidebar + content */}
          {/* Sidebar */}
          <Box width="200px" bg="gray.100" p={4}>
            {/* <Heading size="md" mb={6}>PIPECD</Heading> -- Removed redundant heading */}
            <VStack align="stretch" spacing={3}>
              <Link as={RouterLink} to="/people" >People</Link>
              <Link as={RouterLink} to="/organizations">Organizations</Link>
              <Link as={RouterLink} to="/deals">Deals</Link>
              <Link as={RouterLink} to="/leads">Leads</Link>
            </VStack>
          </Box>

          {/* Main Content */}
          <Box flex="1" p={5} overflowY="auto">
            <Routes>
               <Route path="/people" element={<PeoplePage />} />
               <Route path="/organizations" element={<OrganizationsPage />} />
               <Route path="/deals" element={<DealsPage />} />
               <Route path="/leads" element={<LeadsPage />} />
               {/* Redirect root to people page */}
               <Route path="/" element={<PeoplePage />} /> 
            </Routes>
          </Box>
      </Flex>
    </Flex>
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
// function TempNav() { ... }

export default App;
