# Implementation Plan: User Profile Management

**ID:** USER-PROF-001
**Status:** Done
**Priority:** Medium
**Reporter:** AI Assistant
**Assignee:** TBD
**Related To:** HIST-001 (Implement Robust User Lookup for Deal History)

## 1. Introduction & Goals

This document outlines the plan to implement a User Profile Management feature. The primary goals are:

*   Allow authenticated users to view and update their own profile information (e.g., display name, avatar).
*   Provide a centralized and consistent way to manage user-specific details that are not part of the core authentication data (e.g., email, which is managed by Supabase Auth).
*   Enhance user experience by allowing personalization.
*   Improve data accuracy for user-related information displayed across the application.
*   Support the "Robust User Lookup for Deal History" (HIST-001) by ensuring user display names and avatars are readily available and manageable.

## 2. Scope

### 2.1. In Scope

*   **View Profile:** Users can view their own profile page displaying their email (from auth), display name, and avatar URL.
*   **Edit Profile:** Users can update their display name and avatar URL.
*   **Dedicated Profile Page:** A new frontend page for viewing and editing the user's profile.
*   **Backend Support:** GraphQL queries and mutations to fetch and update user profile data.
*   **Database:** A new table or extension of existing Supabase user metadata to store profile information.
*   **UI Integration:** Link to the profile page from the main navigation (e.g., Sidebar or a user dropdown menu).

### 2.2. Out of Scope (for this iteration)

*   **Admin Management of User Profiles:** Administrators managing other users' profiles.
*   **Changing Email/Password:** These actions are typically handled directly by the Supabase authentication system/UI.
*   **Complex Profile Settings:** Advanced settings like notification preferences, detailed personal information beyond name/avatar.
*   **Direct Avatar File Uploads:** Initially, the avatar will be managed as a URL. Direct file uploads and storage can be a future enhancement.
*   **Role/Permission Management:** This is handled by the existing `get_my_permissions` RPC and is separate from user-editable profile data.

## 3. Proposed Solution

### 3.1. Database (Supabase)

*   **New Table:** `user_profiles`
    *   `user_id (UUID, Primary Key, Foreign Key to auth.users.id ON DELETE CASCADE)`: Links to the Supabase auth user. If the auth user is deleted, their profile will also be deleted.
    *   `display_name (TEXT)`: User's preferred display name.
    *   `avatar_url (TEXT)`: URL to the user's avatar image.
    *   `created_at (TIMESTAMPTZ, default now())`
    *   `updated_at (TIMESTAMPTZ, default now())`
*   **Row Level Security (RLS):**
    *   Enable RLS on `user_profiles`.
    *   Users can only select their own profile: `auth.uid() = user_id`.
    *   Users can only update their own profile: `auth.uid() = user_id`.
    *   Users can insert their own profile (if it doesn't exist): `auth.uid() = user_id`.
*   **Trigger (Recommended):** A trigger on `user_profiles` to update `updated_at` timestamp automatically.
    *   Example: `CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime (updated_at);`
    *   (Ensure the `moddatetime` extension is enabled in your Supabase project).

### 3.2. Backend (Netlify Functions - GraphQL API)

*   **Schema Changes (`netlify/functions/graphql/schema/*.graphql`):**
    ```graphql
    type UserProfile {
      id: ID! # User's Supabase Auth ID
      email: String! # From Supabase Auth
      display_name: String
      avatar_url: String
    }

    input UpdateUserProfileInput {
      display_name: String
      avatar_url: String
    }

    extend type Query {
      me: UserProfile
    }

    extend type Mutation {
      updateUserProfile(input: UpdateUserProfileInput!): UserProfile
    }
    ```
*   **Service Layer (`lib/userProfileService.ts`):**
    *   Create a new service file `lib/userProfileService.ts`.
    *   This service will encapsulate all database interactions for user profiles using the global Supabase client (from `lib/supabaseClient.ts`). RLS policies on the database will enforce user-specific access.
    *   Functions:
        *   `getUserProfile(userId: string): Promise<UserProfileData | null>`
        *   `updateUserProfile(userId: string, data: UpdateUserProfileInput): Promise<UserProfileData>`
        *   (Define `UserProfileData` or similar interface for service return types, mapping to database columns).
*   **Resolvers (`netlify/functions/graphql/resolvers/`):**
    *   **`Query.me`:**
        *   Call `requireAuthentication(context)`.
        *   Get `userId` from `context.currentUser.id`.
        *   Call `userProfileService.getUserProfile(userId)`.
        *   Construct the `UserProfile` response, including `email` from `context.currentUser.email` and data from the service.
        *   If no profile exists in `user_profiles`, it could return defaults or nulls for `display_name` and `avatar_url`. Consider having the service create a basic profile entry on first fetch if desired.
    *   **`Mutation.updateUserProfile`:**
        *   Call `requireAuthentication(context)`.
        *   Get `userId` from `context.currentUser.id`.
        *   Validate `args.input` (using helpers from `validators.ts` if applicable).
        *   Call `userProfileService.updateUserProfile(userId, args.input)`.
        *   Return the updated `UserProfile` (data from the service combined with `id` and `email` from context).
    *   **`UserProfile` type resolver (if needed):**
        *   `id`: Resolves to `context.currentUser.id`.

### 3.3. Frontend (React Application - `frontend/src`)

*   **New Page (`frontend/src/pages/ProfilePage.tsx`):**
    *   Route: `/profile`.
    *   Fetches user profile data using the `me` GraphQL query.
    *   Displays profile information using `ProfileView` component.
    *   Allows editing via `ProfileEditForm` component.
*   **New Components (`frontend/src/components/profile/`):**
    *   `ProfileView.tsx`: Displays `display_name`, `email`, `avatar_url`.
    *   `ProfileEditForm.tsx`: Form with input fields for `display_name` and `avatar_url`. Handles form submission and calls the `updateUserProfile` GraphQL mutation.
*   **Routing (`frontend/src/App.tsx`):**
    *   Add a new route: `<Route path="/profile" element={<ProfilePage />} />` (within the authenticated section of `AppContent`).
*   **Navigation (`frontend/src/components/layout/Sidebar.tsx` or similar):**
    *   Add a link/menu item navigating to `/profile`. This could be achieved by adding an entry to the `NAV_ITEMS` array in `Sidebar.tsx` (e.g., `{ path: '/profile', label: 'My Profile', icon: <SettingsIcon /> }` or a suitable user icon), or by adding a link within the user information section at the bottom of the sidebar.
*   **State Management (e.g., `frontend/src/stores/useAppStore.ts` or new `useUserProfileStore.ts`):**
    *   May not need a dedicated store if data is fetched on page load and mutations update the cache. Apollo Client (which is used in the project) and its cache might suffice.
    *   If global access to profile info (like display name for a header) is needed frequently, caching it in a store could be beneficial.
*   **GraphQL Operations (`frontend/src/lib/graphql/` or similar):**
    *   Define `GET_ME` query.
    *   Define `UPDATE_USER_PROFILE` mutation.

### 3.4. Authentication & Authorization

*   **Frontend:** The `/profile` route will be a protected route, accessible only to authenticated users (as handled by `App.tsx` logic).
*   **Backend:** Resolvers for `me` and `updateUserProfile` will use `context.currentUser.id` to ensure users can only access and modify their own data. Supabase RLS provides database-level protection.

## 4. Task Breakdown

### 4.1. Phase 1: Backend & Database

1.  **Database:**
    *   [ ] Define and finalize `user_profiles` table schema.
    *   [ ] Write Supabase migration script for `user_profiles` table (including RLS and any triggers).
    *   [ ] Apply migration to development Supabase instance.
2.  **GraphQL Schema:**
    *   [ ] Add `UserProfile` type, `UpdateUserProfileInput` input, `Query.me`, and `Mutation.updateUserProfile` to `.graphql` schema files.
    *   [ ] Run `codegen` script to update generated types.
3.  **GraphQL Resolvers:**
    *   [ ] Implement `Query.me` resolver.
    *   [ ] Implement `Mutation.updateUserProfile` resolver.
    *   [ ] Implement field resolvers for `UserProfile` type if necessary.
4.  **Testing (Backend):**
    *   [ ] Write unit/integration tests for the new resolvers (e.g., using Vitest if applicable for backend services).

### 4.2. Phase 2: Frontend

1.  **GraphQL Operations:**
    *   [ ] Define `GET_ME` query in frontend.
    *   [ ] Define `UPDATE_USER_PROFILE` mutation in frontend.
2.  **Components:**
    *   [ ] Create `ProfileView.tsx` component.
    *   [ ] Create `ProfileEditForm.tsx` component.
3.  **Page:**
    *   [ ] Create `ProfilePage.tsx`.
    *   [ ] Implement data fetching for user profile.
    *   [ ] Integrate `ProfileView` and `ProfileEditForm`.
    *   [ ] Implement profile update logic using the mutation.
4.  **Routing & Navigation:**
    *   [ ] Add `/profile` route in `App.tsx`.
    *   [ ] Add navigation link to profile page in `Sidebar.tsx` or user menu.
5.  **Testing (Frontend):**
    *   [ ] Write component tests for `ProfileView` and `ProfileEditForm`.
    *   [ ] Write tests for `ProfilePage`.

### 4.3. Phase 3: Integration & Refinement

1.  **UI Polish:** Ensure the profile page and components are well-styled and user-friendly.
2.  **Cross-Cutting Concerns:** Update other parts of the application (e.g., headers, user mentions) to use `display_name` and `avatar_url` from the profile where appropriate. This directly supports HIST-001.
3.  **Documentation:** Update any relevant developer or user documentation.

## 5. Dependencies

*   Existing Supabase authentication setup.
*   GraphQL client setup on the frontend (e.g., Apollo Client).

## 6. Risks, Considerations, and Mitigation Strategies

This section outlines potential risks, important considerations, and strategies to mitigate them.

*   **Risk:** Migration script errors or RLS (Row Level Security) misconfiguration.
    *   **Consideration:** SQL migration scripts can be complex and RLS policies must be precise.
    *   **Mitigation Strategies:**
        *   **Code Review for Migrations:** Have at least one other developer review SQL migration scripts before application.
        *   **Staged Rollout & Testing:** Apply migrations to a staging/testing Supabase instance that mirrors production as closely as possible. Perform thorough testing of RLS policies by attempting to access/modify data as different users.
        *   **Dry Runs/Syntax Checking:** Use tools or manual checks to validate SQL syntax before execution where possible.
        *   **Document RLS Policies Clearly:** Ensure RLS logic is well-documented within the migration script or related documentation.

*   **Risk:** `moddatetime` extension issues (not enabled, permissions).
    *   **Consideration:** The `updated_at` trigger relies on the `moddatetime` PostgreSQL extension.
    *   **Mitigation Strategies:**
        *   **Pre-migration Check:** Add a step in the deployment/migration process to verify the `moddatetime` extension is enabled and accessible. Include enabling it as a prerequisite if not already handled by an earlier migration.

*   **Risk:** Backend service logic bugs or resolver errors (`userProfileService.ts`, GraphQL resolvers).
    *   **Consideration:** Errors in fetching, updating, or transforming data can lead to incorrect behavior or API failures.
    *   **Mitigation Strategies:**
        *   **Comprehensive Unit & Integration Tests:** Write thorough tests for `userProfileService.ts` covering successful CRUD operations, error cases (e.g., user not found, Supabase errors), and edge cases.
        *   **Resolver Testing:** Test GraphQL resolvers to ensure correct data transformation, context usage, and error propagation from the service layer.
        *   **Defensive Programming:** Implement null checks, proper error handling (try-catch blocks), and consistent error responses in services and resolvers.
        *   **Logging:** Add detailed logging in the service layer and resolvers (especially for errors or unexpected states) to aid in debugging.

*   **Risk:** Input validation gaps for `display_name` or `avatar_url`.
    *   **Consideration:** Malicious or improperly formatted input can lead to errors or security vulnerabilities.
    *   **Mitigation Strategies:**
        *   **Schema-Level Validation:** Utilize GraphQL schema features for basic type validation.
        *   **Service-Level Validation:** Implement robust validation in `userProfileService.ts` for `display_name` (length, allowed characters) and `avatar_url` (e.g., basic URL format check). Leverage existing patterns in `validators.ts`.
        *   **Frontend Validation:** Implement client-side validation for immediate user feedback, but always rely on backend validation as the source of truth.

*   **Risk:** GraphQL codegen mismatches between schema and generated types.
    *   **Consideration:** Developers might forget to run `npm run codegen` after schema changes.
    *   **Mitigation Strategies:**
        *   **Pre-commit Hook/CI Check:** Consider implementing a pre-commit hook or a CI step that runs `npm run codegen` and checks if there are any uncommitted changes to generated files.
        *   **Developer Process:** Emphasize the importance of running `npm run codegen` after any `.graphql` schema changes.

*   **Risk:** Frontend UI/UX bugs and inconsistent states (loading, error, empty profile).
    *   **Consideration:** The profile page must provide a clear and correct user experience under various conditions.
    *   **Mitigation Strategies:**
        *   **Component Storybook/Previews:** If Storybook or a similar tool is in use, create stories for `ProfileView.tsx` and `ProfileEditForm.tsx` to test various states.
        *   **Manual UI Testing:** Conduct thorough manual testing across different browsers (if applicable) and with various user inputs/states.
        *   **Graceful Handling of Nulls:** Explicitly define UI behavior for null/empty `display_name` or `avatar_url` (e.g., show a placeholder avatar, default display name like "User").

*   **Risk:** Apollo Client cache not updating correctly after mutations, leading to stale data.
    *   **Consideration:** The UI should reflect profile changes immediately without a page reload.
    *   **Mitigation Strategies:**
        *   **Explicit Cache Updates:** Utilize Apollo Client's cache update mechanisms (`update` function in `useMutation`, `refetchQueries`, or `updateQuery`) to ensure the `me` query data is updated after a successful `updateUserProfile` mutation.
        *   **Test Cache Behavior:** Specifically test that the UI reflects changes immediately after a profile update.

*   **Risk:** Data Seeding/Backfill: If existing users need profiles, a backfill strategy might be needed.
    *   **Consideration:** How will profiles be created for users who signed up before this feature?
    *   **Mitigation Strategies:**
        *   **On-Demand Creation with Robustness:** The planned approach of creating a basic profile entry when `Query.me` is first called for a user without one should be made robust. Handle potential creation errors gracefully (e.g., log the error, return a default profile object to the client to prevent UI breakage, and perhaps schedule a retry or notify an admin).
        *   **Alternative (Consider):** Evaluate creating a `user_profiles` entry automatically on new user sign-up via a Supabase trigger on `auth.users` for future users, which might simplify logic for new sign-ups.

*   **Risk:** Issues integrating profile data into existing features (e.g., Deal History for HIST-001).
    *   **Consideration:** Updating multiple components to use new profile data can be complex.
    *   **Mitigation Strategies:**
        *   **Identify Touchpoints Early:** Before starting implementation, search the codebase for all places where user identifiers are currently used to display user information.
        *   **Phased Refactoring:** Consider refactoring existing features in a separate phase or as distinct sub-tasks after the core profile functionality is stable.

*   **Risk:** Security of avatar URLs (e.g., if URLs are not handled carefully, though less likely if just used as `src` in `<img>`).
    *   **Consideration:** Users can input external URLs.
    *   **Mitigation Strategies:**
        *   **Output Encoding/Sanitization (Context-Dependent):** While `<img>` tags are generally safe with URLs in `src`, if `avatar_url` were ever to be rendered as part of an `<a>` tag's `href` or directly into HTML in other contexts, ensure proper sanitization/encoding.
        *   **Content Security Policy (CSP):** Ensure a strong CSP is in place to mitigate risks from externally linked content.

*   **Risk:** Environment/Configuration issues across different setups.
    *   **Consideration:** Missing or incorrect environment variables can cause runtime failures.
    *   **Mitigation Strategies:**
        *   **`.env.example` File:** Ensure `env.example.txt` is comprehensive and up-to-date with all required environment variables for this feature.
        *   **Configuration Checks on Startup (Backend):** Where feasible, have the backend application perform basic checks on startup for essential environment variables related to Supabase.

*   **Error Handling:** General consideration for robust error handling for API requests and form submissions on both frontend and backend.
*   **Scalability of `user_profiles` table:** For the current scale, this should be fine. If user numbers grow massively, standard database optimizations apply.

## 7. Open Questions

*   What are the specific default/fallback values if a `display_name` or `avatar_url` is not set?
*   Is there a need to create a `user_profiles` entry automatically on new user sign-up via Supabase, or is on-demand creation (e.g., first visit to profile page or first `me` query) acceptable?
*   Are there any specific UI/UX guidelines for the profile page?

---
This plan provides a structured approach to implementing user profile management. Adjustments can be made as development progresses and more details emerge. 