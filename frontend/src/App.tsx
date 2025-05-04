import { Routes, Route, Link as RouterLink } from 'react-router-dom';
import { useEffect /* , useState */ } from 'react'; // Removed useState
import { supabase } from './lib/supabase'; 
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
// import type { Session } from '@supabase/supabase-js'; // No longer needed here
import DealsPage from './pages/DealsPage';
import PeoplePage from './pages/PeoplePage';
import OrganizationsPage from './pages/OrganizationsPage'; 
import PipelinesPage from './pages/PipelinesPage'; // Import the new page
import StagesPage from './pages/StagesPage'; // Import the Stages page
import ActivitiesPage from './pages/ActivitiesPage'; // Import the new Activities page
import { 
  Box, 
  Heading, 
  Link, 
  Button, 
  HStack, 
  Flex,
  useToast,
  VStack,
  Spinner, // Added Spinner
} from '@chakra-ui/react';
import { useAppStore } from './stores/useAppStore'; // Import the store

// REMOVED unused HEALTH_QUERY
// const HEALTH_QUERY = gql` ... `;

// REMOVED unused ME_QUERY
// const ME_QUERY = gql` ... `;

// REMOVED unused MeQueryResult
// interface MeQueryResult { ... }

// REMOVED unused page components
// function HomePage() { ... }
// function AboutPage() { ... }
// function NotFoundPage() { ... }

// --- Component for Logged-In State --- 
function AppContent() {
  return (
    <>
      <TempNav />
      <Box p={4}>
          <Routes>
          <Route path="/" element={<Heading size="lg">Home</Heading>} />
          <Route path="/people" element={<PeoplePage />} />
            <Route path="/deals" element={<DealsPage />} />
          <Route path="/organizations" element={<OrganizationsPage />} />
          <Route path="/pipelines" element={<PipelinesPage />} /> {/* Add route for pipelines */}
          <Route path="/pipelines/:pipelineId/stages" element={<StagesPage />} /> {/* Add route for stages */}
          <Route path="/activities" element={<ActivitiesPage />} /> {/* Add route for activities */}
          <Route path="*" element={<Heading size="lg">404 Not Found</Heading>} />
          </Routes>
    </Box>
    </>
  );
}

// --- Main App Component with Auth Logic --- 
function App() {
  // Use state from Zustand store
  const session = useAppStore((state) => state.session);
  const isLoadingAuth = useAppStore((state) => state.isLoadingAuth);
  const setSession = useAppStore((state) => state.setSession);
  const checkAuth = useAppStore((state) => state.checkAuth);
  const toast = useToast();

  useEffect(() => {
    // Initial check
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        console.log('Auth state changed:', _event, session ? 'Session exists' : 'No session');
        setSession(session); // Update store state
      // Optionally show toast on login/logout
      if (_event === 'SIGNED_IN') {
          toast({ title: "Signed In", status: "success", duration: 3000, isClosable: true });
      }
      if (_event === 'SIGNED_OUT') {
          toast({ title: "Signed Out", status: "info", duration: 3000, isClosable: true });
      }
    });

    return () => {
        console.log('Unsubscribing from auth changes.');
        subscription.unsubscribe();
    }
  }, [checkAuth, setSession, toast]); // Add dependencies

  // Show loading spinner during initial auth check
  if (isLoadingAuth) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  // Show Auth UI if not logged in
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
    // Show main app content if logged in
    return <AppContent />;
  }
}

// Temporary simple navigation
function TempNav() {
    // Get signout action from the store
    const handleSignOutAction = useAppStore((state) => state.handleSignOut);
    // Optional: Get loading state for signout button visual feedback
    // const isSigningOut = useAppStore((state) => state.isLoadingAuth); // Reusing isLoadingAuth temporarily

    const handleSignOutClick = () => {
        handleSignOutAction(); // Call the action from the store
    };
    
    return (
        <Box as="nav" bg="gray.100" p={4} mb={4}>
            <HStack spacing={4} justify="space-between">
                <HStack spacing={4}>
                    <Link as={RouterLink} to="/">Home (Placeholder)</Link>
                    <Link as={RouterLink} to="/people">People</Link>
                    <Link as={RouterLink} to="/deals">Deals</Link>
                    <Link as={RouterLink} to="/organizations">Organizations</Link>
                    <Link as={RouterLink} to="/pipelines">Pipelines</Link>
                    <Link as={RouterLink} to="/activities">Activities</Link> {/* Add link for activities */}
                </HStack>
                <Button 
                  size="sm" 
                  onClick={handleSignOutClick} 
                  // isLoading={isSigningOut} // Optional visual feedback
                >
                    Sign Out
                </Button>
            </HStack>
      </Box>
    );
}

export default App;
