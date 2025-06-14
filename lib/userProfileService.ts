import { supabase, supabaseAdmin } from './supabaseClient';
import type { UpdateUserProfileInput } from './generated/graphql'; // Adjust path as necessary based on final codegen output location
import { getAuthenticatedClient } from './serviceUtils'; // ADDED: Import for authenticated client
import type { SupabaseClient } from '@supabase/supabase-js'; // ADDED: For type safety

// Interface representing the structure in the user_profiles table
export interface DbUserProfile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  email?: string | null; // Added optional email
  created_at: string; // Assuming TIMESTAMPTZ is stringified
  updated_at: string;
}

// New interface for the combined data
export interface ServiceLevelUserProfile {
    user_id: string;
    display_name: string | null;
    avatar_url: string | null;
    email: string; // Email is expected to be non-null from auth.users
}

/**
 * Fetches a user's profile (display_name, avatar_url) from user_profiles table
 * AND their email from auth.users table.
 * This function is intended for service-level backend use, using the default/service Supabase client.
 * @param userId The UUID of the user.
 * @returns Combined profile and email data, or null if user or profile not found. Email is non-null if user found.
 */
export const getServiceLevelUserProfileData = async (userId: string): Promise<ServiceLevelUserProfile | null> => {
  if (!userId) {
    console.warn('[userProfileService] getServiceLevelUserProfileData: User ID is required.');
    return null;
  }

  // Ensure supabaseAdmin is available early
  if (!supabaseAdmin) {
    console.error('[userProfileService] Supabase Admin client is not available. Ensure SUPABASE_SERVICE_ROLE_KEY is set and the server has restarted.');
    return null; // Or throw an error if admin client is critical for this function
  }

      // console.log(`[userProfileService] getServiceLevelUserProfileData: Fetching data for user_id: ${userId}`);

  // Fetch email from auth.users table using supabaseAdmin
  let authUserEmail: string;
  try {
    const { data: userResponse, error: adminUserError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (adminUserError) {
      console.error(`[userProfileService] getServiceLevelUserProfileData: Error fetching user with supabaseAdmin.auth.admin.getUserById for ${userId}:`, adminUserError.message);
      return null;
    }
    if (!userResponse?.user || !userResponse.user.email) {
      console.warn(`[userProfileService] getServiceLevelUserProfileData: User not found via admin API or email is null for ${userId}. User object from response:`, userResponse?.user);
      return null; 
    }
    authUserEmail = userResponse.user.email;
  } catch (e: any) {
    console.error(`[userProfileService] getServiceLevelUserProfileData: Exception during supabaseAdmin.auth.admin.getUserById for ${userId}:`, e.message);
    return null;
  }

  // Fetch display_name and avatar_url from user_profiles table using supabaseAdmin for consistency and to bypass RLS
  let profileDisplayName: string | null = null;
  let profileAvatarUrl: string | null = null;

  try {
    const { data: profileData, error: profileError } = await supabaseAdmin // Use supabaseAdmin here
    .from('user_profiles')
    .select('display_name, avatar_url')
    .eq('user_id', userId)
    .maybeSingle();

  if (profileError) {
      console.error(`[userProfileService] getServiceLevelUserProfileData: Error fetching profile from user_profiles using supabaseAdmin for ${userId}:`, profileError.message);
    // If profile fetch fails but email was found, decide on behavior.
      // For now, continue and use nulls for display_name/avatar_url, as email is the critical part for User!
    } else if (profileData) {
      profileDisplayName = profileData.display_name;
      profileAvatarUrl = profileData.avatar_url;
    }
  } catch (e: any) {
    console.error(`[userProfileService] getServiceLevelUserProfileData: Exception during user_profiles fetch using supabaseAdmin for ${userId}:`, e.message);
    // Continue with nulls for display_name/avatar_url if an exception occurs here too.
  }

  return {
    user_id: userId,
    display_name: profileDisplayName, // Will be null if profile not found or error during fetch
    avatar_url: profileAvatarUrl,   // Will be null if profile not found or error during fetch
    email: authUserEmail, // Email is guaranteed non-null if we reached here from the auth user fetch
  };
};

/**
 * Fetches a user's profile from the user_profiles table.
 * @param userId The UUID of the user.
 * @param accessToken The access token for authenticated operations.
 * @returns The user profile data or null if not found.
 */
export const getUserProfile = async (userId: string, accessToken: string): Promise<DbUserProfile | null> => {
  if (!userId) {
    throw new Error('User ID is required to fetch a profile.');
  }
  if (!accessToken) {
    throw new Error('Access token is required to fetch a profile.');
  }

  // console.log(`[userProfileService] Fetching profile for user_id: ${userId} using token.`);
  const authenticatedSupabase = getAuthenticatedClient(accessToken);

  const { data, error } = await authenticatedSupabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle(); // Use maybeSingle() if you expect at most one row

  if (error) {
    console.error('[userProfileService] Error fetching user profile:', error.message);
    throw new Error(`Failed to fetch user profile: ${error.message}`);
  }

  // console.log(`[userProfileService] Fetched profile data for ${userId}:`, data);
  return data as DbUserProfile | null;
};

/**
 * Creates or updates a user's profile in the user_profiles table.
 * If a profile for the user_id already exists, it will be updated.
 * If not, a new profile will be inserted.
 * Only non-null fields from the input will be used for the update.
 * @param userId The UUID of the user.
 * @param input The profile data to update.
 * @param accessToken The access token for authenticated operations.
 * @returns The updated or created user profile data.
 */
export const updateUserProfile = async (
  userId: string,
  input: UpdateUserProfileInput,
  accessToken: string // ADDED: accessToken parameter
): Promise<DbUserProfile> => {
  if (!userId) {
    throw new Error('User ID is required to update a profile.');
  }
  if (!accessToken) { // ADDED: Check for accessToken
    throw new Error('Access token is required to update a profile.');
  }

  // Construct the object with fields to update. Allow explicit nulls to clear fields.
  const updateData: Partial<Pick<DbUserProfile, 'display_name' | 'avatar_url'>> = {};
  if (input.display_name !== undefined) { // If display_name is provided in input (even if null)
    updateData.display_name = input.display_name;
  }
  if (input.avatar_url !== undefined) { // If avatar_url is provided in input (even if null)
    updateData.avatar_url = input.avatar_url;
  }

  // If there's nothing to update (e.g. input object was empty, not just fields being nullified).
  // This check might need refinement based on how `UpdateUserProfileInput` is structured
  // and whether an empty input implies no-op or clearing all optional fields.
  // For now, if `input` had properties (even if they were null), `updateData` won't be empty.
  if (Object.keys(updateData).length === 0 && 
      input.display_name === undefined && 
      input.avatar_url === undefined) {
              // console.log(`[userProfileService] No recognized fields in input for user_id: ${userId}. Fetching current profile.`);
    const currentProfile = await getUserProfile(userId, accessToken);
    if (currentProfile) {
      return currentProfile;
    }
    // If no current profile and nothing to update, this case might need specific handling.
    // For now, we'll proceed to upsert, which will insert with user_id and defaults if it's an empty updateData.
    // However, our RLS for INSERT requires user_id to match auth.uid().
    // Supabase upsert with { onConflict: 'user_id' } will attempt an INSERT if no row matches user_id.
  }

          // console.log(`[userProfileService] Updating profile for user_id: ${userId} with data:`, updateData);

  const authenticatedSupabase = getAuthenticatedClient(accessToken); // ADDED: Get authenticated client

  // Upsert operation: update if exists, insert if not.
  // RLS policies will ensure the user can only affect their own row.
  const { data, error } = await authenticatedSupabase // CHANGED: use authenticatedSupabase
    .from('user_profiles')
    .upsert({ user_id: userId, ...updateData })
    .select()
    .single(); // Expect a single row to be returned after upsert

  if (error) {
    console.error('[userProfileService] Error updating user profile:', error.message);
    throw new Error(`Failed to update user profile: ${error.message}`);
  }

  if (!data) {
    console.error('[userProfileService] No data returned after upsert for user_id:', userId);
    throw new Error('Failed to update user profile: no data returned.');
  }

          // console.log(`[userProfileService] Successfully updated profile for ${userId}:`, data);
  return data as DbUserProfile;
}; 