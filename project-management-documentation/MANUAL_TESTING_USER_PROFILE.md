Okay, here's a list of manual tests you can perform to verify the User Profile Management feature. I've tried to cover the main functionality and some edge cases.

**Prerequisites:**
*   Ensure your development server (frontend and backend/Netlify Dev) is running.
*   Ensure the database migration (`20250728000000_create_user_profiles.sql`) has been successfully applied to your development Supabase instance.
*   You'll need at least one authenticated user. It would be good to test with:
    *   A brand new user (who wouldn't have a profile in `user_profiles` yet).
    *   An existing user (if applicable, though for now, all users will be "new" to this feature).

**Test Cases for User Profile Management:**

**I. Viewing Profile (New User - No existing `user_profiles` record):**
1.  **Test Case:** Navigate to Profile Page (New User)
    *   **Steps:**
        1.  Log in as a new user (or a user for whom you've ensured no record exists in `user_profiles`). OK
        2.  Click on the "My Profile" link in the sidebar. OK
    *   **Expected Result:**
        *   The "My Profile" page loads. OK
        *   The `ProfileView` component is displayed. OK
        *   The user's email (from Supabase Auth) is correctly shown. OK
        *   Display Name might show a default like "User Profile" or be blank/null (as per `ProfileView` logic). OK
        *   Avatar should show a default placeholder (as per `ProfileView` logic, since `avatar_url` will be null). OK
        *   No errors in the console related to fetching profile data (though a 404 for the profile itself is handled by the service returning null, which is fine). OK
        *   An "Edit Profile" button/icon is visible. OK

**II. Editing and Saving Profile:**
2.  **Test Case:** Edit Profile - Add Display Name and Avatar URL
    *   **Steps:**
        1.  On the "My Profile" page (as any authenticated user). OK
        2.  Click the "Edit Profile" button/icon. OK
        3.  The `ProfileEditForm` should appear, pre-filled with current values (email non-editable, display name and avatar URL likely empty or from previous edits). OK
        4.  Enter a new "Display Name" (e.g., "Test User One"). OK
        5.  Enter a valid URL for "Avatar URL" (e.g., `https://www.gravatar.com/avatar/`). OK
        6.  Click "Save Changes". OK
    *   **Expected Result:**
        *   A success toast notification appears ("Profile Updated"). OK
        *   The form switches back to `ProfileView`. OK
        *   The `ProfileView` now displays the new "Test User One" as the display name and shows the new avatar. OK
        *   The email remains unchanged. OK
        *   (Verify in Supabase `user_profiles` table: a new record should exist for this `user_id` with the entered `display_name` and `avatar_url`.) OK
    * * Reported bug (The user reports that after successfully editing and saving their profile (Test Case II.2 works), if they navigate away from the "My Profile" page and then return, the previously saved display_name and avatar_url are not displayed. ) FIXED

3.  **Test Case:** Edit Profile - Update Existing Display Name and Avatar URL
    *   **Steps:**
        1.  Using the user from Test Case 2 (who now has a profile).OK
        2.  Go to "My Profile", click "Edit Profile".OK
        3.  Change the "Display Name" to something else (e.g., "Test User Updated").OK
        4.  Change the "Avatar URL" to a different valid URL.OK
        5.  Click "Save Changes".OK
    *   **Expected Result:**
        *   Success toast.OK
        *   `ProfileView` updates with the new "Test User Updated" and the new avatar.OK
        *   (Verify in Supabase `user_profiles` table: the existing record for this `user_id` should be updated.) OK

4.  **Test Case:** Edit Profile - Clear Display Name and Avatar URL
    *   **Steps:**
        1.  Using a user with an existing display name and avatar URL.OK
        2.  Go to "My Profile", click "Edit Profile".OK
        3.  Delete the text from "Display Name".OK
        4.  Delete the text from "Avatar URL".OK
        5.  Click "Save Changes".OK
    *   **Expected Result:**
        *   Success toast.
        *   `ProfileView` updates: Display Name might show a default or be blank (as per `ProfileView` logic for null `display_name`), Avatar should revert to placeholder. OK
        *   (Verify in Supabase `user_profiles` table: `display_name` and `avatar_url` columns should be `NULL` for this user.) OK

5.  **Test Case:** Edit Profile - Invalid Avatar URL
    *   **Steps:**
        1.  Go to "My Profile", click "Edit Profile". OK
        2.  Enter an invalid string in "Avatar URL" (e.g., "not_a_url").OK
        3.  Click "Save Changes".
    *   **Expected Result:**
        *   A form validation error message appears below the Avatar URL field (e.g., "Please enter a valid URL."). OK
        *   The profile is not saved. No API call is made. OK

6.  **Test Case:** Edit Profile - No Changes Made
    *   **Steps:**
        1.  Go to "My Profile", click "Edit Profile". OK
        2.  Make no changes to the pre-filled form.OK
        3.  Click "Save Changes".OK
    *   **Expected Result:**
        *   An informational toast notification appears ("No Changes").OK
        *   The form might close or stay in edit mode (current `ProfileEditForm` logic closes it if `onCancel` is used, which it is).OK
        *   No API call to update the profile is made.

7.  **Test Case:** Edit Profile - Cancel Editing
    *   **Steps:**
        1.  Go to "My Profile", click "Edit Profile".
        2.  Make some changes in the form (e.g., type in Display Name).
        3.  Click the "Cancel" button/icon.
    *   **Expected Result:**
        *   The form switches back to `ProfileView`.
        *   The changes made in the form are discarded and not saved. `ProfileView` shows the original data.

**III. Navigation and State Persistence:**
8.  **Test Case:** Navigate Away and Back to Profile Page
    *   **Steps:**
        1.  Update profile information successfully.
        2.  Navigate to another page (e.g., "Deals").
        3.  Navigate back to "My Profile".
    *   **Expected Result:**
        *   The "My Profile" page displays the most recently saved profile information (display name, avatar).

9.  **Test Case:** Page Refresh on Profile Page
    *   **Steps:**
        1.  Update profile information successfully.
        2.  Refresh the "My Profile" browser page.
    *   **Expected Result:**
        *   The page reloads and displays the most recently saved profile information.

**IV. Error Handling (Simulated if necessary):**
10. **Test Case:** API Error During Profile Fetch (`GET_ME`)
    *   **Steps:** (May require manually simulating a network error or backend failure for `Query.me`)
        1.  Attempt to load the "My Profile" page when the backend API is unreachable or returns an error for the `me` query.
    *   **Expected Result:**
        *   The `ProfilePage.tsx` should display a user-friendly error message (e.g., "Error Loading Profile," "Could not load your profile data.").
        *   No broken UI elements.

11. **Test Case:** API Error During Profile Update (`updateUserProfile`)
    *   **Steps:** (May require manually simulating a network error or backend failure for `Mutation.updateUserProfile`)
        1.  In the edit form, make valid changes.
        2.  Click "Save Changes" when the backend API is set to fail the update.
    *   **Expected Result:**
        *   An error toast notification appears ("Update Failed," with an error message).
        *   The form remains in edit mode with the entered data.
        *   The profile is not updated.

**V. Display Consistency (Post-Setup):**
12. **Test Case:** User Display in Sidebar/Header (If Applicable)
    *   **Steps:** (This depends on if other parts of the UI already use `user.email` or `user.name` from a store that `Query.me` might now populate more fully).
        1.  Update your display name via the profile page.
        2.  Check if the display name in other parts of the application that show user identity (e.g., a welcome message in a header, user menu in the sidebar if it were to show name instead of just email) updates.
    *   **Expected Result:**
        *   Other UI elements should reflect the new `display_name` if they are designed to use it and the data is propagated correctly (e.g., through Apollo cache updates affecting other queries or a shared store). *(Note: This test might fail if those integrations aren't implemented yet, which is fine for this initial feature but good to note for HIST-001 task)*.

Remember to check the browser's developer console for any errors or unexpected log messages during these tests. Good luck!
