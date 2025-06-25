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
  hasCalendarAccess: boolean;
  hasContactsAccess: boolean;
  tokenExpiry?: string;
  missingScopes: string[];
}

const REQUIRED_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/contacts.readonly'
];

/**
 * Refresh expired Google OAuth token using refresh token
 */
const refreshAccessToken = async (refreshToken: string): Promise<GoogleTokenData> => {
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    console.error('Google OAuth credentials not found in environment variables');
    throw new Error('Google OAuth configuration error. Please check server configuration.');
  }

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token refresh failed:', errorText);
      throw new Error('Failed to refresh Google access token');
    }

    const tokens = await response.json();
    
    return {
      access_token: tokens.access_token,
      refresh_token: refreshToken, // Keep the same refresh token
      expires_at: tokens.expires_in ? 
        new Date(Date.now() + tokens.expires_in * 1000).toISOString() : 
        undefined,
      granted_scopes: [] // Will be preserved from existing token
    };
  } catch (error) {
    console.error('Error refreshing Google access token:', error);
    throw new Error('Failed to refresh Google access token. Please reconnect your Google account.');
  }
};

/**
 * Get valid Google tokens, automatically refreshing if expired
 */
const getValidTokens = async (userId: string, accessToken: string): Promise<GoogleTokenData | null> => {
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

    // Check if token is expired or will expire in the next 5 minutes
    const expiresAt = tokenData.expires_at ? new Date(tokenData.expires_at) : null;
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
    
    const isExpiredOrExpiringSoon = expiresAt && expiresAt <= fiveMinutesFromNow;
    
    if (isExpiredOrExpiringSoon && tokenData.refresh_token) {
      // console.log('Google token expired or expiring soon, refreshing...');
      
      try {
        // Refresh the token
        const refreshedTokens = await refreshAccessToken(tokenData.refresh_token);
        
        // Update the database with new tokens
        const updatedTokenData = {
          access_token: refreshedTokens.access_token,
          expires_at: refreshedTokens.expires_at,
          granted_scopes: tokenData.granted_scopes, // Preserve existing scopes
          last_used_at: new Date().toISOString()
        };
        
        const { error: updateError } = await supabase
          .from('google_oauth_tokens')
          .update(updatedTokenData)
          .eq('user_id', userId);

        if (updateError) {
          handleSupabaseError(updateError, 'updating refreshed Google tokens');
        }
        
                  // console.log('Google token refreshed successfully');
        
        return {
          access_token: refreshedTokens.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: refreshedTokens.expires_at,
          granted_scopes: tokenData.granted_scopes || []
        };
      } catch (refreshError) {
        console.error('Failed to refresh Google token:', refreshError);
        // If refresh fails, return null so the user knows to reconnect
        return null;
      }
    }

    // Token is still valid, return it
    await updateTokenUsage(userId, accessToken);
    
    return {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: tokenData.expires_at,
      granted_scopes: tokenData.granted_scopes || []
    };
  } catch (error) {
    console.error('Error getting valid Google tokens:', error);
    throw new GraphQLError('Failed to get Google integration tokens');
  }
};

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
    
    // Check for extended tokens in our database (using the new getValidTokens method)
    const tokenData = await getValidTokens(userId, accessToken);

    if (!tokenData) {
      return {
        isConnected: false,
        hasGoogleAuth,
        hasDriveAccess: false,
        hasGmailAccess: false,
        hasCalendarAccess: false,
        hasContactsAccess: false,
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
      hasCalendarAccess: grantedScopes.includes('https://www.googleapis.com/auth/calendar'),
      hasContactsAccess: grantedScopes.includes('https://www.googleapis.com/auth/contacts.readonly'),
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
    // First, deactivate any existing tokens for this user
    await supabase
      .from('google_oauth_tokens')
      .update({ is_active: false })
      .eq('user_id', userId);

    // Then insert the new tokens
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
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      });

    handleSupabaseError(error, 'storing Google tokens');
  } catch (error) {
    console.error('Error storing extended Google tokens:', error);
    throw new GraphQLError('Failed to store Google integration tokens');
  }
};

/**
 * Get stored Google tokens for API access - now with automatic refresh
 */
const getStoredTokens = async (userId: string, accessToken: string): Promise<GoogleTokenData | null> => {
  // Use the new getValidTokens method which handles refresh automatically
  return await getValidTokens(userId, accessToken);
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

/**
 * Test function to verify token refresh is working
 * This function can be called to manually test token refresh logic
 */
const testTokenRefresh = async (userId: string, accessToken: string): Promise<{ success: boolean; message: string }> => {
  try {
    const tokens = await getValidTokens(userId, accessToken);
    
    if (!tokens) {
      return { success: false, message: 'No tokens found for user' };
    }
    
    const expiresAt = tokens.expires_at ? new Date(tokens.expires_at) : null;
    const now = new Date();
    
    if (expiresAt && expiresAt > now) {
      const minutesUntilExpiry = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60));
      return { 
        success: true, 
        message: `Token is valid and expires in ${minutesUntilExpiry} minutes` 
      };
    } else {
      return { 
        success: true, 
        message: 'Token was expired and has been refreshed' 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      message: `Error testing token refresh: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
};

// Export service object following PipeCD patterns
export const googleIntegrationService = {
  getIntegrationStatus,
  storeExtendedTokens,
  getStoredTokens,
  getValidTokens,
  updateTokenUsage,
  revokeIntegration,
  checkAuthRequirements,
  testTokenRefresh,
  
  // Constants
  REQUIRED_SCOPES
}; 