import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from './lib/supabase'; 
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import DealsPage from './pages/DealsPage';
import PeoplePage from './pages/PeoplePage';
import PersonDetailPage from './pages/PersonDetailPage';
import OrganizationsPage from './pages/OrganizationsPage'; 
import PipelinesPage from './pages/PipelinesPage';
import StagesPage from './pages/StagesPage';
import ActivitiesPage from './pages/ActivitiesPage';
import ActivityDetailPage from './pages/ActivityDetailPage';
import DealDetailPage from './pages/DealDetailPage';
import ProfilePage from './pages/ProfilePage';
import CustomFieldsPage from './pages/admin/CustomFieldsPage';
import WfmAdminPage from './pages/admin/WfmAdminPage';
import WFMStatusesPage from './pages/admin/WFMStatusesPage';
import WFMWorkflowsPage from './pages/admin/WFMWorkflowsPage';
import WFMProjectTypesPage from './pages/admin/WFMProjectTypesPage';
import ProjectBoardPage from './pages/ProjectBoardPage';
import { 
  Box, 
  Heading, 
  Flex,
  useToast,
  VStack,
  Spinner,
} from '@chakra-ui/react';
import { useAppStore } from './stores/useAppStore';
import Sidebar from './components/layout/Sidebar';

function AppContent() {
  return (
    <Flex minH="100vh">
      <Sidebar />
      <Box as="main" flex={1} p={6} bg={{ base: 'gray.50', _dark: 'gray.900' }}>
          <Routes>
            <Route path="/" element={<Heading size="lg">Home</Heading>} />
            <Route path="/people" element={<PeoplePage />} />
            <Route path="/people/:personId" element={<PersonDetailPage />} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/deals/:dealId" element={<DealDetailPage />} />
            <Route path="/organizations" element={<OrganizationsPage />} />
            <Route path="/pipelines" element={<PipelinesPage />} />
            <Route path="/pipelines/:pipelineId/stages" element={<StagesPage />} />
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/activities/:activityId" element={<ActivityDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin/custom-fields" element={<CustomFieldsPage />} />
            <Route path="/admin/wfm" element={<WfmAdminPage />}>
              <Route index element={<WFMStatusesPage />} />
              <Route path="statuses" element={<WFMStatusesPage />} />
              <Route path="workflows" element={<WFMWorkflowsPage />} />
              <Route path="project-types" element={<WFMProjectTypesPage />} />
            </Route>
            <Route path="/project-board" element={<ProjectBoardPage />} />
            <Route path="*" element={<Heading size="lg">404 Not Found</Heading>} />
          </Routes>
    </Box>
    </Flex>
  );
}

function App() {
  const session = useAppStore((state) => state.session);
  const isLoadingAuth = useAppStore((state) => state.isLoadingAuth);
  const setSession = useAppStore((state) => state.setSession);
  const checkAuth = useAppStore((state) => state.checkAuth);
  const toast = useToast();

  useEffect(() => {
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        console.log('Auth state changed:', _event, session ? 'Session exists' : 'No session');
        setSession(session);
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
  }, [checkAuth, setSession, toast]);

  if (isLoadingAuth) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

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

export default App;
