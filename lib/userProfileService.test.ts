// lib/userProfileService.test.ts
import { describe, it, expect, vi, beforeEach, MockedFunction } from 'vitest';
import { userProfileService } from './userProfileService'; // Assuming named export
import { createClient, PostgrestError } from '@supabase/supabase-js';
import type { UserProfileListData } from './userProfileService'; // Import the interface

// --- Mock Setup ---
const mockSupabaseClientInstance = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  // Add other methods if needed by other functions in userProfileService, but select is key for getAllUserProfiles
};

// Mock the getAuthenticatedClient utility to return our mock Supabase client instance
vi.mock('./serviceUtils', () => ({
  getAuthenticatedClient: vi.fn(() => mockSupabaseClientInstance),
}));

// --- Test Suite ---
describe('userProfileService', () => {
  const mockAccessToken = 'mock-access-token';

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mocks on the client instance itself
    mockSupabaseClientInstance.from.mockClear().mockReturnThis();
    mockSupabaseClientInstance.select.mockClear().mockReturnThis();
  });

  describe('getAllUserProfiles', () => {
    const mockUserProfilesData: UserProfileListData[] = [
      { user_id: 'user-1', display_name: 'User One', email: 'one@example.com', avatar_url: null },
      { user_id: 'user-2', display_name: 'User Two', email: 'two@example.com', avatar_url: 'http://example.com/avatar2.png' },
    ];

    it('should fetch all user profiles successfully', async () => {
      // Mock the select method to resolve with the mock data
      mockSupabaseClientInstance.select.mockResolvedValueOnce({
        data: mockUserProfilesData,
        error: null,
      });

      const profiles = await userProfileService.getAllUserProfiles(mockAccessToken);

      // Assertions
      expect(mockSupabaseClientInstance.from).toHaveBeenCalledWith('user_profiles');
      expect(mockSupabaseClientInstance.select).toHaveBeenCalledWith('user_id, display_name, email, avatar_url');
      expect(profiles).toEqual(mockUserProfilesData);
    });

    it('should return an empty array if no user profiles are found', async () => {
      // Mock the select method to resolve with empty data
      mockSupabaseClientInstance.select.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      const profiles = await userProfileService.getAllUserProfiles(mockAccessToken);

      expect(profiles).toEqual([]);
      expect(mockSupabaseClientInstance.from).toHaveBeenCalledWith('user_profiles');
      expect(mockSupabaseClientInstance.select).toHaveBeenCalledWith('user_id, display_name, email, avatar_url');
    });

    it('should throw an error if Supabase select fails', async () => {
      const mockDbError: Partial<PostgrestError> = {
        message: 'Database select failed',
        details: 'Some details',
        hint: 'Some hint',
        code: 'PGRST100', // Example error code
      };

      // Mock the select method to resolve with an error
      mockSupabaseClientInstance.select.mockResolvedValueOnce({
        data: null,
        error: mockDbError as PostgrestError,
      });

      // Assertions
      await expect(userProfileService.getAllUserProfiles(mockAccessToken))
        .rejects
        .toThrow(`Failed to fetch all user profiles: ${mockDbError.message}`);
      
      expect(mockSupabaseClientInstance.from).toHaveBeenCalledWith('user_profiles');
      expect(mockSupabaseClientInstance.select).toHaveBeenCalledWith('user_id, display_name, email, avatar_url');
    });

    it('should return an empty array if access token is not provided (as per current implementation)', async () => {
        // Note: The service function currently logs an error and returns [].
        // The resolver should ideally prevent this by checking auth first.
        const profiles = await userProfileService.getAllUserProfiles(''); // Pass empty token
        expect(profiles).toEqual([]);
        // Ensure Supabase client was NOT called because accessToken was missing
        expect(mockSupabaseClientInstance.from).not.toHaveBeenCalled();
    });
  });
  
  // Add other test suites for other functions in userProfileService if needed
});
