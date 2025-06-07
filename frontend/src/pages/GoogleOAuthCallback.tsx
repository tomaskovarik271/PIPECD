import React, { useEffect } from 'react';
import { Box, Spinner, Text, VStack } from '@chakra-ui/react';
import { useThemeColors } from '../hooks/useThemeColors';

const GoogleOAuthCallback: React.FC = () => {
  const colors = useThemeColors();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const state = urlParams.get('state'); // This is the user ID we passed

        if (error) {
          // Send error to parent window
          window.opener?.postMessage({
            type: 'GOOGLE_OAUTH_ERROR',
            error: error
          }, window.location.origin);
          window.close();
          return;
        }

        if (!code) {
          window.opener?.postMessage({
            type: 'GOOGLE_OAUTH_ERROR',
            error: 'No authorization code received'
          }, window.location.origin);
          window.close();
          return;
        }

        // Exchange code for tokens using our backend endpoint
        const tokenResponse = await fetch('/.netlify/functions/google-oauth-exchange', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: code,
            redirectUri: `${window.location.origin}/auth/google/callback`,
          }),
        });

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json();
          throw new Error(errorData.error || 'Failed to exchange code for tokens');
        }

        const tokens = await tokenResponse.json();

        // Send tokens to parent window
        window.opener?.postMessage({
          type: 'GOOGLE_OAUTH_SUCCESS',
          tokens: {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: tokens.expires_at,
            scope: tokens.scope
          }
        }, window.location.origin);

        window.close();

      } catch (err) {
        console.error('OAuth callback error:', err);
        window.opener?.postMessage({
          type: 'GOOGLE_OAUTH_ERROR',
          error: err instanceof Error ? err.message : 'Unknown error occurred'
        }, window.location.origin);
        window.close();
      }
    };

    handleCallback();
  }, []);

  return (
    <Box 
      minH="100vh" 
      bg={colors.bg.app} 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
    >
      <VStack spacing={4}>
        <Spinner size="xl" color={colors.interactive.default} />
        <Text color={colors.text.secondary}>
          Completing Google authentication...
        </Text>
      </VStack>
    </Box>
  );
};

export default GoogleOAuthCallback; 