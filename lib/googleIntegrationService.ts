// Google Integration Service - Leverages Supabase Google Auth
// Follows PipeCD service patterns for consistency
import { SupabaseClient } from '@supabase/supabase-js';
import { GraphQLError } from 'graphql';
import { getAuthenticatedClient, handleSupabaseError } from './serviceUtils';

export interface GoogleTokenData {
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
  granted_scopes: string[];
}

export interface GoogleIntegrationStatus {
  isConnected: boolean;
  hasGoogleAuth: boolean;
  hasDriveAccess: boolean;
  hasGmailAccess: boolean;
  tokenExpiry?: string;
  missingScopes: string[];
}

const REQUIRED_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send'
];

/**
 * Check user's Google integration status
 * Leverages Supabase's existing Google auth + our extended tokens
 */
const getIntegrationStatus = async (userId: string, accessToken: string): Promise<GoogleIntegrationStatus> => {
  const supabase = getAuthenticatedClient(accessToken);
  
  try {
    // Check if user has Google auth through Supabase
    const { data: user } = await supabase.auth.getUser();
    const hasGoogleAuth = user?.user?.app_metadata?.provider === 'google';
    
    // Check for extended tokens in our database
    const { data: tokenData, error } = await supabase
      .from('google_oauth_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      handleSupabaseError(error, 'fetching Google tokens');
    }

    if (!tokenData) {
      return {
        isConnected: false,
        hasGoogleAuth,
        hasDriveAccess: false,
        hasGmailAccess: false,
        missingScopes: REQUIRED_SCOPES
      };
    }

    const grantedScopes = tokenData.granted_scopes || [];
    const missingScopes = REQUIRED_SCOPES.filter((scope: string) => 
      !grantedScopes.includes(scope)
    );

    return {
      isConnected: true,
      hasGoogleAuth,
      hasDriveAccess: grantedScopes.includes('https://www.googleapis.com/auth/drive'),
      hasGmailAccess: grantedScopes.some((scope: string) => scope.includes('gmail')),
      tokenExpiry: tokenData.expires_at,
      missingScopes
    };
  } catch (error) {
    console.error('Error checking Google integration status:', error);
    throw new GraphQLError('Failed to check Google integration status');
  }
};

/**
 * Store extended Google OAuth tokens after user grants additional permissions
 */
const storeExtendedTokens = async (
  userId: string, 
  tokenData: GoogleTokenData, 
  accessToken: string
): Promise<void> => {
  const supabase = getAuthenticatedClient(accessToken);
  
  try {
    const { error } = await supabase
      .from('google_oauth_tokens')
      .upsert({
        user_id: userId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: tokenData.expires_at,
        granted_scopes: tokenData.granted_scopes,
        is_active: true,
        last_used_at: new Date().toISOString()
      });

    handleSupabaseError(error, 'storing Google tokens');
  } catch (error) {
    console.error('Error storing extended Google tokens:', error);
    throw new GraphQLError('Failed to store Google integration tokens');
  }
};

/**
 * Get stored Google tokens for API access
 */
const getStoredTokens = async (userId: string, accessToken: string): Promise<GoogleTokenData | null> => {
  const supabase = getAuthenticatedClient(accessToken);
  
  try {
    const { data: tokenData, error } = await supabase
      .from('google_oauth_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      handleSupabaseError(error, 'fetching stored Google tokens');
    }

    if (!tokenData) {
      return null;
    }

    return {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: tokenData.expires_at,
      granted_scopes: tokenData.granted_scopes || []
    };
  } catch (error) {
    console.error('Error getting stored Google tokens:', error);
    throw new GraphQLError('Failed to get Google integration tokens');
  }
};

/**
 * Update token usage timestamp
 */
const updateTokenUsage = async (userId: string, accessToken: string): Promise<void> => {
  const supabase = getAuthenticatedClient(accessToken);
  
  try {
    const { error } = await supabase
      .from('google_oauth_tokens')
      .update({ 
        last_used_at: new Date().toISOString() 
      })
      .eq('user_id', userId);

    handleSupabaseError(error, 'updating token usage');
  } catch (error) {
    console.error('Error updating Google token usage:', error);
    throw new GraphQLError('Failed to update Google token usage');
  }
};

/**
 * Revoke Google integration
 */
const revokeIntegration = async (userId: string, accessToken: string): Promise<void> => {
  const supabase = getAuthenticatedClient(accessToken);
  
  try {
    const { error } = await supabase
      .from('google_oauth_tokens')
      .update({ is_active: false })
      .eq('user_id', userId);

    handleSupabaseError(error, 'revoking Google integration');
  } catch (error) {
    console.error('Error revoking Google integration:', error);
    throw new GraphQLError('Failed to revoke Google integration');
  }
};

/**
 * Check if user needs additional Google permissions
 * Returns null if no additional auth needed, otherwise returns info about missing scopes
 */
const checkAuthRequirements = async (userId: string, accessToken: string): Promise<{
  needsAuth: boolean;
  missingScopes: string[];
  hasGoogleAuth: boolean;
} | null> => {
  try {
    const status = await getIntegrationStatus(userId, accessToken);
    
    return {
      needsAuth: !status.isConnected || status.missingScopes.length > 0,
      missingScopes: status.missingScopes,
      hasGoogleAuth: status.hasGoogleAuth
    };
  } catch (error) {
    console.error('Error checking Google auth requirements:', error);
    throw new GraphQLError('Failed to check Google authentication requirements');
  }
};

// Export service object following PipeCD patterns
export const googleIntegrationService = {
  getIntegrationStatus,
  storeExtendedTokens,
  getStoredTokens,
  updateTokenUsage,
  revokeIntegration,
  checkAuthRequirements,
  
  // Constants
  REQUIRED_SCOPES
}; 