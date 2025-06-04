import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from './lib/supabase'; 
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import DealsPage from './pages/DealsPage';
import LeadsPage from './pages/LeadsPage';
import PeoplePage from './pages/PeoplePage';
import PersonDetailPage from './pages/PersonDetailPage';
import OrganizationsPage from './pages/OrganizationsPage'; 
import OrganizationDetailPage from './pages/OrganizationDetailPage';
import ActivitiesPage from './pages/ActivitiesPage';
import ActivityDetailPage from './pages/ActivityDetailPage';
import DealDetailPage from './pages/DealDetailPage';
import ProfilePage from './pages/ProfilePage';
import AgentPage from './pages/AgentPage';
import CustomFieldsPage from './pages/admin/CustomFieldsPage';
import WfmAdminPage from './pages/admin/WfmAdminPage';
import WFMStatusesPage from './pages/admin/WFMStatusesPage';
import WFMWorkflowsPage from './pages/admin/WFMWorkflowsPage';
import WFMProjectTypesPage from './pages/admin/WFMProjectTypesPage';
import ProjectBoardPage from './pages/ProjectBoardPage';
import { GraphPage } from './pages/GraphPage';
import { 
  Box, 
  Heading, 
  Flex,
  useToast,
  VStack,
  Spinner,
} from '@chakra-ui/react';
import { useAppStore } from './stores/useAppStore';
import { useWFMConfigStore } from './stores/useWFMConfigStore';
import Sidebar from './components/layout/Sidebar';
import { useThemeStore } from './stores/useThemeStore';
import { useThemeColors } from './hooks/useThemeColors';

function AppContent() {
  const isSidebarCollapsed = useAppStore((state) => state.isSidebarCollapsed);
  const sidebarWidth = isSidebarCollapsed ? "70px" : "280px";
  
  const colors = useThemeColors();

  return (
    <Box minH="100vh" bg={colors.bg.app}>
      <Flex>
        <Box 
          w={sidebarWidth}
          minH="100vh" 
          bg={colors.bg.sidebar}
          position="fixed" 
          left="0" 
          top="0"
          zIndex="10"
        >
          <Sidebar />
        </Box>
        
        <Box 
          flex="1" 
          ml={sidebarWidth}
          bg={colors.bg.app}
          transition="margin-left 0.2s ease-in-out"
        >
          <Routes>
            <Route path="/" element={<Navigate to="/deals" replace />} />
            <Route path="/people" element={<PeoplePage />} />
            <Route path="/people/:personId" element={<PersonDetailPage />} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/deals/:dealId" element={<DealDetailPage />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/organizations" element={<OrganizationsPage />} />
            <Route path="/organizations/:organizationId" element={<OrganizationDetailPage />} />
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/activities/:activityId" element={<ActivityDetailPage />} />
            <Route path="/agent" element={<AgentPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin/custom-fields" element={<CustomFieldsPage />} />
            <Route path="/admin/wfm" element={<WfmAdminPage />}>
              <Route index element={<WFMStatusesPage />} />
              <Route path="statuses" element={<WFMStatusesPage />} />
              <Route path="workflows" element={<WFMWorkflowsPage />} />
              <Route path="project-types" element={<WFMProjectTypesPage />} />
            </Route>
            <Route path="/project-board" element={<ProjectBoardPage />} />
            <Route path="/graph" element={<GraphPage />} />
            <Route path="*" element={<Heading size="lg" p={6} color={colors.text.primary}>404 Not Found</Heading>} />
          </Routes>
        </Box>
      </Flex>
    </Box>
  );
}

function App() {
  const session = useAppStore((state) => state.session);
  const isLoadingAuth = useAppStore((state) => state.isLoadingAuth);
  const setSession = useAppStore((state) => state.setSession);
  const checkAuth = useAppStore((state) => state.checkAuth);
  const fetchSalesDealWorkflowId = useWFMConfigStore((state) => state.fetchSalesDealWorkflowId);
  const toast = useToast();
  
  const colors = useThemeColors();

  useEffect(() => {
    checkAuth();
    fetchSalesDealWorkflowId();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      // console.log('Auth state changed:', _event, session ? 'Session exists' : 'No session');
      setSession(session);
      if (session?.user?.id && _event === 'SIGNED_IN') {
        toast({ title: "Signed In", status: "success", duration: 3000, isClosable: true });
      }
      if (_event === 'SIGNED_OUT') {
        toast({ title: "Signed Out", status: "info", duration: 3000, isClosable: true });
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
      // console.log('Unsubscribing from auth changes.');
    };
  }, [checkAuth, setSession, toast, fetchSalesDealWorkflowId]);

  if (isLoadingAuth) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={colors.bg.app}>
        <Spinner size="xl" color={colors.interactive.default} />
      </Flex>
    );
  }

  if (!session) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg={colors.bg.app}>
        <Box maxW="md" w="full" bg={colors.bg.surface} boxShadow="lg" rounded="lg" p={8} borderWidth="1px" borderColor={colors.border.default}>
          <VStack spacing={4} align="stretch">
            <Heading fontSize="2xl" textAlign="center" color={colors.text.primary}>Sign in to your account</Heading>
            <Auth 
              supabaseClient={supabase} 
              appearance={{ 
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: colors.interactive.default,
                      brandAccent: colors.interactive.hover,
                      brandButtonText: colors.text.onAccent,
                      defaultButtonBackground: colors.bg.input,
                      defaultButtonBackgroundHover: colors.interactive.hover,
                      defaultButtonBorder: colors.border.input,
                      defaultButtonText: colors.text.primary,
                      dividerBackground: colors.border.divider,
                      inputBackground: colors.bg.input,
                      inputBorder: colors.border.input,
                      inputBorderHover: colors.border.focus,
                      inputBorderFocus: colors.border.focus,
                      inputText: colors.text.primary,
                      inputLabelText: colors.text.secondary,
                      inputPlaceholder: colors.text.muted,
                      messageText: colors.text.primary,
                      messageTextDanger: colors.text.error,
                      anchorTextColor: colors.text.link,
                      anchorTextHoverColor: colors.interactive.hover,
                    },
                    space: {
                      spaceSmall: '4px',
                      spaceMedium: '8px',
                      spaceLarge: '16px',
                      labelBottomMargin: '8px',
                      anchorBottomMargin: '4px',
                      emailInputSpacing: '4px',
                      socialAuthSpacing: '4px',
                      buttonPadding: '10px 15px',
                      inputPadding: '10px 15px',
                    },
                    fontSizes: {
                      baseBodySize: '13px',
                      baseInputSize: '14px',
                      baseLabelSize: '14px',
                      baseButtonSize: '14px',
                    },
                    fonts: {
                      bodyFontFamily: `ui-sans-serif, sans-serif`,
                      buttonFontFamily: `ui-sans-serif, sans-serif`,
                      inputFontFamily: `ui-sans-serif, sans-serif`,
                      labelFontFamily: `ui-sans-serif, sans-serif`,
                    },
                    borderWidths: {
                      buttonBorderWidth: '1px',
                      inputBorderWidth: '1px',
                    },
                    radii: {
                      borderRadiusButton: '6px',
                      buttonBorderRadius: '6px',
                      inputBorderRadius: '6px',
                    },
                  },
                },
                style: {
                  button: {
                    fontSize: '14px',
                    fontWeight: '500',
                  },
                  input: {
                    fontSize: '14px',
                    fontWeight: '400',
                  },
                  label: {
                    fontSize: '14px',
                    fontWeight: '500',
                  },
                  message: {
                    fontSize: '13px',
                  },
                },
              }} 
              providers={['github']} 
            />
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
