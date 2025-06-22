import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { supabase } from './lib/supabase'; 
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

// Lazy load all page components for better performance
const DealsPage = lazy(() => import('./pages/DealsPage'));
const LeadsPage = lazy(() => import('./pages/LeadsPage'));
const LeadDetailPage = lazy(() => import('./pages/LeadDetailPage'));
const PeoplePage = lazy(() => import('./pages/PeoplePage'));
const PersonDetailPage = lazy(() => import('./pages/PersonDetailPage'));
const OrganizationsPage = lazy(() => import('./pages/OrganizationsPage'));
const OrganizationDetailPage = lazy(() => import('./pages/OrganizationDetailPage'));
const ActivitiesPage = lazy(() => import('./pages/ActivitiesPage'));
const ActivityDetailPage = lazy(() => import('./pages/ActivityDetailPage'));
const DealDetailPage = lazy(() => import('./pages/DealDetailPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const GoogleIntegrationPage = lazy(() => import('./pages/GoogleIntegrationPage'));
const GoogleOAuthCallback = lazy(() => import('./pages/GoogleOAuthCallback'));
const AgentPage = lazy(() => import('./pages/AgentPage'));
const AgentV2Page = lazy(() => import('./pages/AgentV2Page').then(module => ({ default: module.AgentV2Page })));
const CustomFieldsPage = lazy(() => import('./pages/admin/CustomFieldsPage'));
const WfmAdminPage = lazy(() => import('./pages/admin/WfmAdminPage'));
const WFMStatusesPage = lazy(() => import('./pages/admin/WFMStatusesPage'));
const WFMWorkflowsPage = lazy(() => import('./pages/admin/WFMWorkflowsPage'));
const WFMProjectTypesPage = lazy(() => import('./pages/admin/WFMProjectTypesPage'));
const GoogleDriveSettingsPage = lazy(() => import('./pages/admin/GoogleDriveSettingsPage'));
const UserRoleManagementPage = lazy(() => import('./pages/admin/UserRoleManagementPage').then(module => ({ default: module.UserRoleManagementPage })));
const MyAccountsPage = lazy(() => import('./pages/MyAccountsPage'));

import { 
  Box, 
  Heading, 
  Flex,
  useToast,
  VStack,
  Spinner,
  Center,
  Text,
} from '@chakra-ui/react';
import { useAppStore } from './stores/useAppStore';
import { useWFMConfigStore } from './stores/useWFMConfigStore';
import Sidebar from './components/layout/Sidebar';
import { useThemeColors } from './hooks/useThemeColors';

// Loading component for lazy-loaded routes
function PageLoader() {
  const colors = useThemeColors();
  
  return (
    <Center h="200px" w="100%">
      <VStack spacing={4}>
        <Spinner size="lg" color={colors.interactive.default} thickness="3px" />
        <Text color={colors.text.secondary} fontSize="sm">Loading...</Text>
      </VStack>
    </Center>
  );
}

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
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Navigate to="/deals" replace />} />
              <Route path="/people" element={<PeoplePage />} />
              <Route path="/people/:personId" element={<PersonDetailPage />} />
              <Route path="/deals" element={<DealsPage />} />
              <Route path="/deals/:dealId" element={<DealDetailPage />} />
              <Route path="/leads" element={<LeadsPage />} />
              <Route path="/leads/:leadId" element={<LeadDetailPage />} />
              <Route path="/organizations" element={<OrganizationsPage />} />
              <Route path="/organizations/:organizationId" element={<OrganizationDetailPage />} />
              
              <Route path="/activities" element={<ActivitiesPage />} />
              <Route path="/activities/:activityId" element={<ActivityDetailPage />} />
              <Route path="/agent" element={<AgentPage />} />
              <Route path="/agent-v2" element={<AgentV2Page />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/my-accounts" element={<MyAccountsPage />} />
              <Route path="/google-integration" element={<GoogleIntegrationPage />} />
              <Route path="/auth/google/callback" element={<GoogleOAuthCallback />} />
              <Route path="/admin/custom-fields" element={<CustomFieldsPage />} />
              <Route path="/admin/google-drive" element={<GoogleDriveSettingsPage />} />
              <Route path="/admin/user-roles" element={<UserRoleManagementPage />} />
              <Route path="/admin/wfm" element={<WfmAdminPage />}>
                <Route index element={<WFMStatusesPage />} />
                <Route path="statuses" element={<WFMStatusesPage />} />
                <Route path="workflows" element={<WFMWorkflowsPage />} />
                <Route path="project-types" element={<WFMProjectTypesPage />} />
              </Route>
              <Route path="*" element={<Heading size="lg" p={6} color={colors.text.primary}>404 Not Found</Heading>} />
            </Routes>
          </Suspense>
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
              providers={['github', 'google']} 
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
