import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
  Spinner,
  Badge,
  Card,
  CardBody,
  HStack,
  Icon,
  useToast,
  Divider,
} from '@chakra-ui/react';
import { CheckIcon, WarningIcon, InfoIcon } from '@chakra-ui/icons';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useThemeColors } from '../hooks/useThemeColors';
import { supabase } from '../lib/supabase';

// GraphQL Queries and Mutations
const GET_GOOGLE_INTEGRATION_STATUS = gql`
  query GetGoogleIntegrationStatus {
    googleIntegrationStatus {
      isConnected
      hasGoogleAuth
      hasDriveAccess
      hasGmailAccess
      hasCalendarAccess
      hasContactsAccess
      tokenExpiry
      missingScopes
    }
  }
`;

const REVOKE_GOOGLE_INTEGRATION = gql`
  mutation RevokeGoogleIntegration {
    revokeGoogleIntegration
  }
`;

const CONNECT_GOOGLE_INTEGRATION = gql`
  mutation ConnectGoogleIntegration($input: ConnectGoogleIntegrationInput!) {
    connectGoogleIntegration(input: $input) {
      isConnected
      hasGoogleAuth
      hasDriveAccess
      hasGmailAccess
      hasCalendarAccess
      hasContactsAccess
      tokenExpiry
      missingScopes
    }
  }
`;

interface GoogleIntegrationStatus {
  isConnected: boolean;
  hasGoogleAuth: boolean;
  hasDriveAccess: boolean;
  hasGmailAccess: boolean;
  hasCalendarAccess: boolean;
  hasContactsAccess: boolean;
  tokenExpiry?: string;
  missingScopes: string[];
}

const GoogleIntegrationPage: React.FC = () => {
  const colors = useThemeColors();
  const toast = useToast();

  const { data, loading, error, refetch } = useQuery<{
    googleIntegrationStatus: GoogleIntegrationStatus;
  }>(GET_GOOGLE_INTEGRATION_STATUS);

  const [revokeIntegration, { loading: revoking }] = useMutation(REVOKE_GOOGLE_INTEGRATION, {
    onCompleted: () => {
      toast({
        title: 'Google integration revoked',
        description: 'Your Google Drive and Gmail access has been disconnected.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Error revoking integration',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const [connectIntegration, { loading: connecting }] = useMutation(CONNECT_GOOGLE_INTEGRATION, {
    onCompleted: () => {
      toast({
        title: 'Google integration connected',
        description: 'Successfully connected Google Drive and Gmail access!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Error connecting integration',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleConnectGoogle = async () => {
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in first.',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      // Try custom OAuth flow first
      try {
        // Build OAuth URL with extended scopes
        const clientId = '172184569099-m5tk63veob6p3gt38p329d4kllo0k6t8.apps.googleusercontent.com';
        const redirectUri = `${window.location.origin}/auth/google/callback`;
        const scopes = [
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/drive',
          'https://www.googleapis.com/auth/gmail.readonly',
          'https://www.googleapis.com/auth/gmail.send',
          'https://www.googleapis.com/auth/gmail.modify',
          'https://www.googleapis.com/auth/calendar',
          'https://www.googleapis.com/auth/contacts.readonly'
        ].join(' ');

        const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${clientId}&` +
          `redirect_uri=${encodeURIComponent(redirectUri)}&` +
          `response_type=code&` +
          `scope=${encodeURIComponent(scopes)}&` +
          `access_type=offline&` +
          `prompt=consent&` +
          `state=${session.user.id}`;

        // Open popup window for OAuth
        const popup = window.open(
          oauthUrl,
          'google-oauth',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );

        // Listen for the OAuth callback
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
            const { tokens } = event.data;
            
            // Store tokens via GraphQL mutation
            connectIntegration({
              variables: {
                input: {
                  tokenData: {
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token,
                    expires_at: tokens.expires_at,
                    granted_scopes: tokens.scope?.split(' ') || []
                  }
                }
              }
            });
            
            popup?.close();
            window.removeEventListener('message', handleMessage);
          } else if (event.data.type === 'GOOGLE_OAUTH_ERROR') {
            toast({
              title: 'OAuth Error',
              description: event.data.error,
              status: 'error',
              duration: 5000,
            });
            popup?.close();
            window.removeEventListener('message', handleMessage);
          }
        };

        window.addEventListener('message', handleMessage);

        // Check if popup was blocked
        if (!popup) {
          throw new Error('Popup blocked');
        }

        // Monitor popup to detect manual closure
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', handleMessage);
          }
        }, 1000);

      } catch (customOAuthError) {
        console.log('Custom OAuth failed, trying Supabase OAuth as fallback:', customOAuthError);
        
        // Fallback: Use Supabase OAuth with additional scopes
        // Note: This may not include all the scopes we need, but it's a temporary workaround
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            scopes: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/contacts.readonly',
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });

        if (error) {
          throw error;
        }

        toast({
          title: 'Redirect URI Configuration Needed',
          description: 'Using fallback OAuth. Please add the redirect URI to Google Console for full functionality.',
          status: 'warning',
          duration: 8000,
        });
      }

    } catch (error) {
      console.error('Error initiating Google OAuth:', error);
      toast({
        title: 'OAuth Error',
        description: error instanceof Error ? error.message : 'Failed to start Google authentication. Please add the redirect URI to Google Console.',
        status: 'error',
        duration: 8000,
      });
    }
  };

  const handleRevokeIntegration = () => {
    revokeIntegration();
  };

  if (loading) {
    return (
      <Box p={6} bg={colors.bg.app} minH="100vh">
        <VStack spacing={4} align="center" pt={20}>
          <Spinner size="xl" color={colors.interactive.default} />
          <Text color={colors.text.secondary}>Loading Google integration status...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={6} bg={colors.bg.app} minH="100vh">
        <Alert status="error">
          <AlertIcon />
          <Text>Failed to load Google integration status: {error.message}</Text>
        </Alert>
      </Box>
    );
  }

  const status = data?.googleIntegrationStatus;

  return (
    <Box p={6} bg={colors.bg.app} minH="100vh">
      <VStack spacing={6} align="stretch" maxW="4xl" mx="auto">
        <Heading size="lg" color={colors.text.primary}>
          Google Integration Settings
        </Heading>

        <Text color={colors.text.secondary}>
          Connect your Google account to enable Google Drive file management, Gmail integration,
          and Google Calendar scheduling for deals, contacts, and organizations.
        </Text>

        {/* Integration Status Card */}
        <Card bg={colors.bg.surface} borderColor={colors.border.default}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md" color={colors.text.primary}>
                Integration Status
              </Heading>

              <HStack spacing={4}>
                <Icon
                  as={status?.isConnected ? CheckIcon : WarningIcon}
                  color={status?.isConnected ? 'green.500' : 'orange.500'}
                />
                <Text color={colors.text.primary} fontWeight="medium">
                  {status?.isConnected ? 'Connected' : 'Not Connected'}
                </Text>
                <Badge
                  colorScheme={status?.isConnected ? 'green' : 'orange'}
                  variant="subtle"
                >
                  {status?.isConnected ? 'Active' : 'Inactive'}
                </Badge>
              </HStack>

              <Divider />

              {/* Detailed Status */}
              <VStack spacing={3} align="stretch">
                <Text fontWeight="medium" color={colors.text.primary}>
                  Service Access:
                </Text>

                <HStack spacing={4}>
                  <Icon
                    as={status?.hasGoogleAuth ? CheckIcon : WarningIcon}
                    color={status?.hasGoogleAuth ? 'green.500' : 'red.500'}
                  />
                  <Text color={colors.text.secondary}>Google Authentication</Text>
                  <Badge
                    colorScheme={status?.hasGoogleAuth ? 'green' : 'red'}
                    variant="subtle"
                    size="sm"
                  >
                    {status?.hasGoogleAuth ? 'Connected' : 'Not Connected'}
                  </Badge>
                </HStack>

                <HStack spacing={4}>
                  <Icon
                    as={status?.hasDriveAccess ? CheckIcon : InfoIcon}
                    color={status?.hasDriveAccess ? 'green.500' : 'gray.500'}
                  />
                  <Text color={colors.text.secondary}>Google Drive Access</Text>
                  <Badge
                    colorScheme={status?.hasDriveAccess ? 'green' : 'gray'}
                    variant="subtle"
                    size="sm"
                  >
                    {status?.hasDriveAccess ? 'Enabled' : 'Not Enabled'}
                  </Badge>
                </HStack>

                <HStack spacing={4}>
                  <Icon
                    as={status?.hasGmailAccess ? CheckIcon : InfoIcon}
                    color={status?.hasGmailAccess ? 'green.500' : 'gray.500'}
                  />
                  <Text color={colors.text.secondary}>Gmail Access</Text>
                  <Badge
                    colorScheme={status?.hasGmailAccess ? 'green' : 'gray'}
                    variant="subtle"
                    size="sm"
                  >
                    {status?.hasGmailAccess ? 'Enabled' : 'Not Enabled'}
                  </Badge>
                </HStack>

                <HStack spacing={4}>
                  <Icon
                    as={status?.hasCalendarAccess ? CheckIcon : InfoIcon}
                    color={status?.hasCalendarAccess ? 'green.500' : 'gray.500'}
                  />
                  <Text color={colors.text.secondary}>Google Calendar Access</Text>
                  <Badge
                    colorScheme={status?.hasCalendarAccess ? 'green' : 'gray'}
                    variant="subtle"
                    size="sm"
                  >
                    {status?.hasCalendarAccess ? 'Enabled' : 'Not Enabled'}
                  </Badge>
                </HStack>

                <HStack spacing={4}>
                  <Icon
                    as={status?.hasContactsAccess ? CheckIcon : InfoIcon}
                    color={status?.hasContactsAccess ? 'green.500' : 'gray.500'}
                  />
                  <Text color={colors.text.secondary}>Google Contacts Access</Text>
                  <Badge
                    colorScheme={status?.hasContactsAccess ? 'green' : 'gray'}
                    variant="subtle"
                    size="sm"
                  >
                    {status?.hasContactsAccess ? 'Enabled' : 'Not Enabled'}
                  </Badge>
                </HStack>
              </VStack>

              {/* Missing Scopes */}
              {status?.missingScopes && status.missingScopes.length > 0 && (
                <Alert status="warning">
                  <AlertIcon />
                  <VStack align="stretch" spacing={2}>
                    <Text fontWeight="medium">Missing Permissions:</Text>
                    <VStack align="stretch" spacing={1}>
                      {status.missingScopes.map((scope) => (
                        <Text key={scope} fontSize="sm">
                          • {scope}
                        </Text>
                      ))}
                    </VStack>
                  </VStack>
                </Alert>
              )}

              {/* Token Expiry */}
              {status?.tokenExpiry && (
                <Text fontSize="sm" color={colors.text.muted}>
                  Token expires: {new Date(status.tokenExpiry).toLocaleString()}
                </Text>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Action Buttons */}
        <HStack spacing={4}>
          {!status?.isConnected || (status?.missingScopes && status.missingScopes.length > 0) ? (
            <Button
              colorScheme="blue"
              onClick={handleConnectGoogle}
              leftIcon={<Icon as={CheckIcon} />}
              isLoading={connecting}
              loadingText="Connecting..."
            >
              {status?.hasGoogleAuth ? 'Enable Drive & Gmail Access' : 'Connect Google Account'}
            </Button>
          ) : (
            <Button
              colorScheme="red"
              variant="outline"
              onClick={handleRevokeIntegration}
              isLoading={revoking}
              loadingText="Disconnecting..."
            >
              Disconnect Google Integration
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => refetch()}
            colorScheme="gray"
          >
            Refresh Status
          </Button>
        </HStack>

        {/* Feature Info */}
        <Card bg={colors.bg.surface} borderColor={colors.border.default}>
          <CardBody>
            <VStack spacing={3} align="stretch">
              <Heading size="sm" color={colors.text.primary}>
                Available Features
              </Heading>
              <Text color={colors.text.secondary} fontSize="sm">
                When connected, you'll be able to:
              </Text>
              <VStack align="stretch" spacing={2}>
                <Text fontSize="sm" color={colors.text.secondary}>
                  📁 <strong>Google Drive:</strong> Attach files directly to deals, contacts, and organizations
                </Text>
                <Text fontSize="sm" color={colors.text.secondary}>
                  📧 <strong>Gmail:</strong> Sync email conversations and track communication history
                </Text>
                <Text fontSize="sm" color={colors.text.secondary}>
                  📅 <strong>Google Calendar:</strong> Schedule meetings and track upcoming events with CRM context
                </Text>
                <Text fontSize="sm" color={colors.text.secondary}>
                  🔄 <strong>Auto-sync:</strong> Automatically organize files, emails, and events by entity
                </Text>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default GoogleIntegrationPage; 