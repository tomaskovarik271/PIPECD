# Code Refactoring Plan

## Overall Goals
- **Improve Code Quality:** Identify and remove dead code, reduce duplication (DRY principle), and simplify complex logic.
- **Enhance Maintainability:** Make the codebase easier to understand, debug, and extend in the future.
- **Boost Performance:** While not the primary goal, seek opportunities for performance improvements.
- **Ensure Consistency:** Standardize approaches and patterns across the codebase.
- **Solidify Understanding:** Deepen collective understanding of the system.

## Phase 1: Backend Refactoring (Netlify Functions & Supabase)

### 1. Service Layer (`lib/dealService/`, `lib/dealService/dealCrud.ts`, other services)
   - **Objective:** Clean up and solidify the core business logic.
   - **Tasks:**
     - [ ] Review permission checks: Eliminate redundancy if RLS or RPCs (`reassign_deal`) provide complete coverage.
     - [ ] Standardize error handling: Consistent use of `GraphQLError`, clear propagation paths.
     - [ ] Improve type safety: Reduce/eliminate `as any`, `as unknown as Type` casts. Investigate if more precise intermediate types or mapping functions are needed, especially for `DbDeal` vs. GraphQL `Deal`.
     - [ ] Simplify core logic in `dealCrud.ts#updateDeal` and `dealCrud.ts#createDeal`:
       - Review data preparation steps.
       - Analyze the sequence of operations for clarity and robustness (e.g., WFM project creation in `createDeal`).
     - [ ] Review other service files (e.g., `personService`, `organizationService`) for similar opportunities.

### 2. GraphQL Resolvers (`netlify/functions/graphql/resolvers/`)
   - **Objective:** Ensure resolvers are lean, consistent, and correctly bridge service outputs to the GraphQL schema.
   - **Tasks:**
     - [ ] Consistency in context usage (user, permissions, Supabase client).
     - [ ] Verify robust handling of `null` or error returns from services across all relevant resolvers.
     - [ ] Minimize complex data mapping; push transformations to the service layer or specific mapping functions if appropriate.
     - [ ] Review `dealMutations.ts` for any remaining complexities post-assignment logic changes.

### 3. Database (Supabase)
   - **Objective:** Ensure database schema, RLS, functions, and triggers are optimal and maintainable.
   - **Tasks:**
     - [ ] RLS Policies:
       - [ ] Review `deals` table RLS policies for any potential simplification or remaining edge cases.
       - [ ] Check policies on other tables (`user_profiles`, etc.) for clarity and correctness.
     - [ ] SQL Functions:
       - [ ] Review `reassign_deal(p_deal_id, p_new_assignee_id, p_current_user_id)` for clarity and efficiency.
       - [ ] Review `get_user_permissions(p_user_id)` for clarity and efficiency.
     - [ ] Triggers:
       - [ ] Confirm `sync_user_profile_from_auth_user` trigger (for `user_profiles.email` etc.) is working as expected and efficiently.

### 4. Helper Utilities (`netlify/functions/graphql/helpers.ts`, `lib/serviceUtils.ts`)
   - **Objective:** Consolidate and clarify shared utility functions.
   - **Tasks:**
     - [ ] Identify and merge any duplicated helper functions.
     - [ ] Ensure each helper has a clear single responsibility.
     - [ ] Check for any obsolete helpers.

## Phase 2: Frontend Refactoring (React/Zustand/GraphQL Client)

### 1. State Management (Zustand Stores: `useDealsStore.ts`, `useUserListStore.ts`, etc.)
   - **Objective:** Streamline global state, ensure predictable updates, and simplify store logic.
   - **Tasks:**
     - [ ] Identify and eliminate redundant state or state that can be derived.
     - [ ] Ensure store actions are well-defined and mutations are clear.
     - [ ] Move complex selectors or component-level logic into stores where appropriate.
     - [ ] Review error handling patterns within store actions that interact with the backend (e.g., `updateDeal` in `useDealsStore`).

### 2. GraphQL Operations & Hooks (Apollo Client usage)
   - **Objective:** Optimize data fetching, caching, and error handling related to GraphQL.
   - **Tasks:**
     - [ ] Review queries and mutations for consolidation opportunities.
     - [ ] Ensure frontend error handling for GraphQL requests is robust, user-friendly, and correctly interprets responses like `data.updateDeal: null` without an `errors` array.
     - [ ] Evaluate current caching strategies for effectiveness.
     - [ ] Examine custom hooks using GraphQL operations for clarity and efficiency.

### 3. Component Logic & Structure (Modals, Views, Common Components)
   - **Objective:** Improve component clarity, reduce complexity, and promote reusability.
   - **Tasks:**
     - [ ] Simplify components with complex conditional rendering.
     - [ ] Minimize prop drilling (consider Zustand selectors, React Context, or component composition).
     - [ ] Refine UI logic for disabled states, option filtering (e.g., "Assign To" dropdowns) to ensure it's clean and directly reflects permissions/state.
     - [ ] Identify and extract duplicated UI patterns or logic into reusable common components.
     - [ ] Review `EditDealModal.tsx` and `CreateDealModal.tsx` for any remaining convoluted logic post-assignment feature.

### 4. Type Safety & Code Style
   - **Objective:** Enhance overall code quality and developer experience.
   - **Tasks:**
     - [ ] Reduce usage of `any` type; apply more specific types where possible.
     - [ ] Ensure consistent and effective use of GraphQL generated types.
     - [ ] Enforce code style consistency (ESLint, Prettier). Resolve any outstanding linter warnings.

## General Approach for Each Task
1.  **Understand:** Thoroughly understand the existing code and its purpose.
2.  **Identify:** Pinpoint specific areas for improvement (e.g., duplication, complexity, dead code).
3.  **Plan:** Decide on the refactoring strategy.
4.  **Implement:** Make the changes incrementally.
5.  **Test:** Rigorously test the refactored code to ensure no regressions and that it behaves as expected. Unit tests, integration tests, and manual E2E testing are all valuable.
6.  **Commit:** Commit small, logical changes.

## Prioritization (Suggested Starting Points)
1.  **Backend - Service Layer (`dealCrud.ts#updateDeal`):** Given the recent complexities and fixes, ensuring this is robust and clean is a high priority. Focus on type safety around `DbDeal` vs. `Deal` for history generation.
2.  **Frontend - GraphQL Hooks & Store Error Handling:** Address the "Unexpected error." issue root cause by ensuring the frontend correctly handles `data.updateDeal: null` without an `errors` array.
3.  **Backend - RLS Policies & SQL Functions:** A quick review to ensure they are as simple and efficient as possible after the recent iterations.
4.  **Frontend - Modals (`CreateDealModal`, `EditDealModal`):** Review UI logic related to assignments and permissions.

This plan can be adapted and expanded as we proceed.
