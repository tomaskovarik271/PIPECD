# Code Review Findings

## Frontend (`frontend/src/App.tsx`)

*   **Duplicated Route Definitions**: The `AppContent` component in `frontend/src/App.tsx` has duplicated route definitions for different themes. This could be refactored to a single set of routes, with theme-specific layout components.

## Backend (`netlify/functions/graphql.ts`)

*   **Debugging Code in Schema Loading**: The `loadTypeDefs` function in `netlify/functions/graphql.ts` contains a `filesToLoad` array, which appears to be for debugging purposes. This should be removed or managed via environment variables for production builds to prevent accidental exclusion of schema files.

## Backend (`netlify/functions/inngest.ts`)

*   **Inconsistent Handling of `SYSTEM_USER_ID`**: The `SYSTEM_USER_ID` environment variable check at the beginning of `inngest.ts` only logs a warning if it's not set. However, the `createDealAssignmentTask` function throws an error if this variable is missing. This should be consistent. It's recommended to throw an error in both places if `SYSTEM_USER_ID` is critical for the application's functionality.

## Core Logic (`lib/supabaseClient.ts`)

*   **Potential Null `supabaseAdmin` Client**: In `lib/supabaseClient.ts`, if the `SUPABASE_SERVICE_ROLE_KEY` environment variable is not set, `supabaseAdmin` is initialized to `null` and a warning is logged. However, downstream code (e.g., `getServiceLevelUserProfileData`) might rely on `supabaseAdmin` being a valid client. This could lead to runtime errors. Consider throwing an error during initialization if `SUPABASE_SERVICE_ROLE_KEY` is essential, or ensure all call sites of `supabaseAdmin` gracefully handle the `null` case.

## Supabase Configuration (`supabase/config.toml`)

*   **Disabled Email Confirmations**: The `supabase/config.toml` has `[auth.email] enable_confirmations = false`. While acceptable for development, this should be enabled for production environments to ensure users verify their email addresses.

## Frontend Components (`frontend/src/components/CreateDealModal.tsx`)

*   **Complex State and Effects**: `CreateDealModal.tsx` is a large component with numerous `useState` variables and `useEffect` hooks. While this is sometimes necessary for complex forms, consider opportunities to simplify or consolidate effects. For instance, the logic for initializing and filtering custom fields might be streamlined. Excessive `useEffect` hooks can make component lifecycle harder to reason about.
*   **Hardcoded Default Project Type Name**: The component uses a hardcoded string `DEFAULT_SALES_PROJECT_TYPE_NAME` ("Sales Deal") for auto-selecting a project type. If this name is critical and might change, consider moving it to a configuration file or fetching it dynamically if it's stored elsewhere. 

## Frontend Pages (`frontend/src/pages/DealDetailPage.tsx`)

*   **Large Component**: `DealDetailPage.tsx` is a very large component (approx. 1200 lines). Consider refactoring it into smaller, more focused sub-components to improve readability and maintainability.

## General Codebase Observations

*   **Numerous `TODO` Comments**: The codebase contains many `TODO` comments. While many are for future enhancements, some indicate potentially incomplete or critical missing functionality:
    *   `lib/priceQuoteService.ts`: Contains comments like "TODO: Implement fully - this is a placeholder" for helper functions (`calculateAndSnapshotQuoteOutputs`, `generateInvoiceScheduleForQuote`). However, these functions do have existing implementations that call `priceCalculator.ts`. The comments might be outdated or refer to a more advanced intended state. The service otherwise appears to implement CRUD operations for price quotes.
    *   `frontend/src/components/CreatePersonForm.tsx`: Has `TODOs` related to multi-select custom fields. Currently, a `Textarea` is used for input (expecting comma-separated values), and the submission logic processes this. A more user-friendly multi-select component (e.g., checkboxes, specialized dropdown) is not yet implemented.
    *   `frontend/src/pages/ProjectBoardPage.tsx`: Contains a `TODO` comment `// TODO: Replace with actual ProjectBoard component call` within a function `renderProjectBoard`. However, this function does not appear to be actively used. The page itself calls a `ProjectBoard` component directly. The `renderProjectBoard` function with the `TODO` could be removed as dead code.
    *   Various services and resolvers (`wfmStatusService.ts`, GraphQL resolvers for custom fields) have `TODOs` for permission checks, which are critical for security.
    *   `frontend/src/theme/themes/daliDarkTheme.ts`: The "Dali" theme appears to be incomplete.

*   **`seeding_sql.txt` File**: This file in the root directory contains a collection of SQL scripts for manual database setup and data seeding (e.g., creating pipelines, assigning roles, adding sample orgs/people). The `supabase/config.toml` points to `supabase/seed.sql` for automated seeding. To avoid confusion, `seeding_sql.txt` could be moved to a documentation directory or renamed (e.g., `manual_setup_queries.sql`) to better reflect its purpose as a reference/manual script rather than an automated seed file.

## Testing

*   **Missing Automated Tests for Pricing Module**: The `deal-pricing-quoting-module-implementation-plan.md` indicates that for Stage 1, backend unit tests (Vitest for `priceCalculator.ts`, `priceQuoteService.ts`), integration tests (Vitest for GraphQL resolvers), and frontend component/store tests for the pricing module are largely not yet implemented (`[ ]`). While manual E2E tests have been partially conducted, the lack of automated tests is a significant risk for maintainability and future development of this critical module. 