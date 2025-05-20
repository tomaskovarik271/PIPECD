# Feature Plan: Google Email Integration for Deals

## 1. Overview

This document outlines the plan to integrate Google (Gmail) emails into the Deal Detail view. The goal is to allow users to see emails from a specific sender related to a deal, directly within the application. The implementation will prioritize best practices, direct integration with Google APIs, and leverage existing architectural patterns where possible.

## 2. Core Requirements

*   Users must be able to authenticate their Google account securely using OAuth 2.0.
*   The application must be able to fetch emails from the authenticated user's Gmail account.
*   Emails should be filterable by a specific sender email address.
*   Relevant emails (or their metadata) should be displayed on the Deal Detail page.
*   Access tokens and refresh tokens must be stored securely.

## 3. Backend Implementation

### 3.1. Google Cloud Project Setup

*   Create a new project in Google Cloud Console.
*   Enable the **Gmail API**.
*   Configure the OAuth 2.0 consent screen (user type, scopes, authorized domains).
    *   **Scopes**: `https://www.googleapis.com/auth/gmail.readonly` will be sufficient for the initial version.
*   Create OAuth 2.0 Credentials (Client ID and Client Secret).
*   Store `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI` as secure environment variables in Netlify and `.env` for local development.
    *   `GOOGLE_REDIRECT_URI` will point to a frontend route (e.g., `YOUR_APP_URL/auth/google/callback`).

### 3.2. Authentication & Authorization Service (`lib/googleAuthService.ts`)

*   **Dependencies**: `googleapis` (Google's official Node.js client library). Add to `package.json`.
*   **Responsibilities**:
    *   Manage OAuth 2.0 flow with Google.
    *   Store and retrieve user tokens securely from the database.
    *   Handle token refresh.
*   **Key Functions**:
    *   `getAuthUrl(userId: string, redirectUri: string): string`
        *   Generates the Google OAuth consent page URL.
        *   `redirectUri` should be passed from the caller to ensure flexibility (e.g. dev vs prod).
    *   `handleOAuthCallback(code: string, userId: string): Promise<void>`
        *   Exchanges the authorization `code` for an access token and refresh token.
        *   Stores these tokens securely in the `user_google_authorizations` table.
    *   `getRefreshedTokens(userId: string): Promise<{ accessToken: string, expiryDate: number } | null>`
        *   Retrieves stored refresh token.
        *   Uses it to get a new access token if the current one is expired or near expiry.
        *   Updates the stored access token and expiry.
    *   `getGoogleApiClient(userId: string): Promise<gmail_v1.Gmail | null>`
        *   A helper to get an initialized Gmail API client instance with valid (potentially refreshed) credentials for a user.

### 3.3. Email Service (`lib/googleEmailService.ts`)

*   **Dependencies**: `googleapis`, `googleAuthService`.
*   **Responsibilities**:
    *   Interact with the Gmail API to fetch and process emails.
*   **Key Functions**:
    *   `fetchEmailsForDeal(userId: string, dealContext: Deal, senderEmail: string, maxResults: number = 20): Promise<EmailMessage[]>`
        *   Uses `googleAuthService.getGoogleApiClient(userId)` to get an authenticated Gmail client.
        *   Constructs a Gmail API query string (e.g., `from:${senderEmail} in:anywhere`). Consider adding keywords from `dealContext` (like deal name or associated people's emails if available and user consents to broader search) for better relevance in future iterations.
        *   Fetches a list of email threads/messages.
        *   Parses message metadata (ID, subject, snippet, date, from).
        *   Returns an array of `EmailMessage` objects.
        *   Handles API errors and pagination if necessary (though `maxResults` provides a simple start).

### 3.4. Database Schema (`supabase/migrations`)

*   **New Table: `user_google_authorizations`**
    *   `id`: `uuid` (Primary Key, default: `gen_random_uuid()`)
    *   `user_id`: `uuid` (Foreign Key to `auth.users.id` ON DELETE CASCADE, UNIQUE)
    *   `access_token`: `text` (Consider Supabase Vault or pgsodium for encryption if direct encryption in Supabase is preferred over application-level before insert)
    *   `refresh_token`: `text` (Similarly, consider encryption)
    *   `token_expiry_date`: `timestamptz`
    *   `scopes_granted`: `text[]`
    *   `created_at`: `timestamptz` (Default: `now()`)
    *   `updated_at`: `timestamptz` (Default: `now()`)
    *   **RLS Policies**:
        *   User can select/update/delete their own authorization record.
        *   Service role/backend can operate as needed.

*   **(Optional V2+) Table: `deal_linked_gmail_messages`**
    *   For caching, manual linking, or more complex relationships if live fetching becomes insufficient.
    *   `id`: `uuid`
    *   `deal_id`: `uuid` (FK to `deals.id`)
    *   `gmail_message_id`: `text` (UNIQUE with `deal_id` or `user_id` perhaps)
    *   `subject`: `text`
    *   `snippet`: `text`
    *   `from_email`: `text`
    *   `email_date`: `timestamptz`
    *   `created_at`, `updated_at`

### 3.5. GraphQL Layer (`netlify/functions/graphql/`)

*   **Schema (`schema/deal.graphql` or `schema/googleIntegration.graphql`):**
    ```graphql
    type GoogleEmailMessage {
      id: ID!
      subject: String
      snippet: String
      from: String
      date: DateTime
      # permalinkToEmail: String # If a direct link can be constructed or is provided
    }

    extend type Deal {
      # Fetches emails live. senderEmail is required for V1.
      googleEmails(senderEmail: String!): [GoogleEmailMessage!]
    }

    type InitiateGoogleAuthResponse {
      authUrl: String!
      # Client should generate and verify state. State is passed through here.
      # state: String 
    }

    extend type Mutation {
      # state parameter is generated by the client and passed through
      initiateGoogleEmailAuth(state: String!): InitiateGoogleAuthResponse
      # client sends back the original state for verification if needed, and the code
      finalizeGoogleEmailAuth(code: String!, state: String!): Boolean # Or a status object
      revokeGoogleEmailAuth: Boolean
    }
    ```
*   **Resolvers (`resolvers/dealResolvers.ts`, `resolvers/googleIntegrationResolvers.ts`):**
    *   `Deal.googleEmails`:
        *   Requires authenticated Supabase user (e.g., `const user = context.currentUser; if (!user) throw new AuthenticationError('Not authenticated');`).
        *   Instantiates `googleEmailService`.
        *   Calls `googleEmailService.fetchEmailsForDeal(user.id, parentDeal, args.senderEmail)`.
    *   `Mutation.initiateGoogleEmailAuth`:
        *   Requires authenticated Supabase user (`const user = context.currentUser; ...`).
        *   The `args.state` is generated by the client for CSRF protection.
        *   Instantiates `googleAuthService`.
        *   Calls `googleAuthService.getAuthUrl(user.id, process.env.GOOGLE_REDIRECT_URI, args.state)` (note: `getAuthUrl` will need to accept and include the state in the URL it builds).
        *   Returns `{ authUrl }`. The client is responsible for storing `args.state` to verify on callback.
    *   `Mutation.finalizeGoogleEmailAuth`:
        *   Requires authenticated Supabase user (`const user = context.currentUser; ...`).
        *   The client should have already verified `args.state` against its stored value before calling this mutation.
        *   (Optional Server-Side Double Check for `state`): If desired, the `args.state` could be matched against a short-lived record previously created by `initiateGoogleEmailAuth` if a server-managed CSRF flow was chosen. For a client-centric CSRF state, this step is primarily client-side.
        *   Instantiates `googleAuthService`.
        *   Calls `googleAuthService.handleOAuthCallback(args.code, user.id)`.
    *   `Mutation.revokeGoogleEmailAuth`:
        *   Requires authenticated Supabase user (`const user = context.currentUser; ...`).
        *   Deletes the user's record from `user_google_authorizations` based on `user.id`.
        *   (Optional) Attempts to revoke token with Google if API allows.

### 3.6. Background Processing with Inngest (`inngest/`) (Recommended for V2+)

*   **Purpose**:
    *   Periodically refresh access tokens before they expire.
    *   Proactively fetch/cache new emails for active deals/users to improve performance and avoid hitting API limits on page loads.
*   **Inngest Functions**:
    *   `refresh-google-tokens`: Scheduled job (e.g., daily) that queries `user_google_authorizations` for tokens nearing expiry and calls `googleAuthService.getRefreshedTokens`.
    *   `sync-deal-emails`: Triggered by deal updates or on a schedule. For deals with active Google integration, fetches recent emails via `googleEmailService` and potentially populates `deal_linked_gmail_messages`.

## 4. Frontend Implementation (`frontend/src/`)

### 4.1. State Management (`stores/`)

*   **New Store: `useGoogleIntegrationStore.ts`**
    *   **State**: `isGoogleAuthed: boolean`, `googleAuthUrl: string | null`, `authLoading: boolean`, `authError: string | null`.
    *   **Actions**:
        *   `checkAuthStatus()`: (Optional) On app load, check if tokens exist for the user (might require a lightweight backend check).
        *   `initiateAuth()`: Calls `initiateGoogleEmailAuth` mutation, stores `authUrl`, redirects user or provides link.
        *   `finalizeAuth(code: string, state: string)`: Calls `finalizeGoogleEmailAuth` mutation. Updates `isGoogleAuthed`.
        *   `revokeAuth()`: Calls `revokeGoogleEmailAuth` mutation. Updates `isGoogleAuthed`.
*   **Augment `useDealsStore.ts`:**
    *   Modify `GET_DEAL_BY_ID_QUERY` to include `googleEmails(senderEmail: $senderEmail)` field.
    *   The `fetchDealById` action will need to accept `senderEmail` or have a way to get it.

### 4.2. UI Components

*   **Settings/Profile Page (`pages/ProfilePage.tsx` or new `pages/SettingsPage.tsx`):**
    *   Section for "Google Integration".
    *   Display connection status (`isGoogleAuthed` from store).
    *   "Connect Google Account" button (calls `store.initiateAuth()`).
    *   "Disconnect Google Account" button (calls `store.revokeAuth()`).
*   **OAuth Callback Route (`pages/GoogleAuthCallbackPage.tsx`):**
    *   Route: `/auth/google/callback`.
    *   On mount, extracts `code` and `state` from URL query params.
    *   Calls `store.finalizeAuth(code, state)`.
    *   Displays loading/success/error messages.
    *   Redirects to settings page or previous page on success.
*   **Deal Detail Page (`pages/DealDetailPage.tsx`):**
    *   New section/tab: "Google Emails".
    *   Input field for "Sender Email" (for V1, this could be a simple text input).
    *   "Fetch Emails" button or fetch on sender input change.
    *   If `store.isGoogleAuthed` is false, show "Connect Google Account" prompt linking to settings.
    *   If true, and sender is provided, display emails fetched via `currentDeal.googleEmails`.
    *   Render each `GoogleEmailMessage` (subject, from, date, snippet).
    *   Loading and error states for email fetching.

## 5. Security Considerations

*   **CSRF Protection**: Utilize the `state` parameter in the OAuth 2.0 flow.
    *   **Recommended Approach (Client-centric `state`):**
        1.  The frontend client generates a cryptographically random, non-guessable string for the `state` parameter.
        2.  The client calls the `initiateGoogleEmailAuth(state: "generated-state-value")` mutation.
        3.  The backend's `initiateGoogleEmailAuth` resolver includes this exact `state` value (received from the client) when constructing the Google `authUrl`.
        4.  The client stores its generated `state` value locally (e.g., in `localStorage` or `sessionStorage`).
        5.  After the user authenticates with Google, Google redirects back to the client's `GOOGLE_REDIRECT_URI` with the `code` and the original `state` in the URL parameters.
        6.  The client-side callback handler retrieves the `state` from the URL and **must** verify that it exactly matches the `state` value it stored locally in step 4.
        7.  If the states match, the client then calls the `finalizeGoogleEmailAuth(code: "...", state: "...")` mutation. The `state` can be sent for logging or potential (but not primary) server-side validation if a temporary server-side record of initiated states was kept. The primary CSRF validation happens on the client in this model before calling `finalizeGoogleEmailAuth`.
*   **Token Storage**:
    *   **Never store tokens on the frontend.**
    *   Backend: Encrypt access and refresh tokens at rest in the database. Supabase Vault or `pgsodium` extension can be explored for direct database-level encryption. Alternatively, encrypt before writing to DB / decrypt after reading in the service layer.
*   **Least Privilege**: Only request `gmail.readonly` scope initially.
*   **Input Validation**: Validate all inputs, especially `code` and `state` in the OAuth callback.
*   **Secure Communication**: Ensure HTTPS is used for all communication.
*   **Environment Variables**: Store Google Client ID/Secret securely, not in frontend code.
*   **Error Handling**: Gracefully handle API errors from Google, token refresh failures, etc.

## 6. Development Phases (Suggestion)

*   **Phase 1: Backend Auth & Token Management**
    *   Google Cloud setup.
    *   `user_google_authorizations` table.
    *   `googleAuthService.ts` (auth URL, callback handling, basic token storage - encryption can be V1.1).
    *   GraphQL mutations for `initiate` and `finalize` auth.
    *   Basic frontend settings UI to trigger auth and callback route.
*   **Phase 2: Basic Email Fetching & Display**
    *   `googleEmailService.ts` for fetching emails by sender (live fetch).
    *   Extend `Deal` type in GraphQL and add resolver for `googleEmails`.
    *   Update `DealDetailPage.tsx` to query and display emails with a hardcoded or simple input for sender.
*   **Phase 3: Refinements & Security Hardening**
    *   Implement robust token encryption.
    *   Full CSRF protection.
    *   Improve error handling and UX for auth flow.
    *   UI for specifying sender on Deal Detail Page.
*   **Phase 4 (V2+): Background Processing & Advanced Features**
    *   Inngest for token refresh and proactive email syncing.
    *   More sophisticated email-to-deal linking logic.
    *   UI for managing linked emails if `deal_linked_gmail_messages` is implemented.

This plan provides a comprehensive approach. We can adjust and prioritize phases based on your immediate needs. 