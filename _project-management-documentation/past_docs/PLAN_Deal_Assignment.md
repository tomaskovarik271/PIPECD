# Plan: Deal Assignment to Users (and Future Teams)

**Document Version:** 1.0
**Date:** 2023-10-27

## 1. Introduction & Goals

This document outlines the plan to implement functionality allowing deals to be explicitly assigned to individual users, distinct from the deal's original creator. This plan also considers architectural choices that facilitate future expansion to include team-based assignments.

**Primary Goals:**

1.  Enable clear ownership and responsibility for deals by assigning them to specific users.
2.  Provide a mechanism for users (with appropriate permissions) to assign or reassign deals.
3.  Ensure the system remains scalable and that RLS/RBAC policies correctly govern access and modification rights related to deal assignment.
4.  Lay a foundation that can be extended for team-based deal assignments in a future phase.

## 2. Proposed Solution: Phased Approach

We will adopt a phased approach to manage complexity and deliver value incrementally.

### Phase 1: Individual User Assignment

*   Introduce a new nullable field `assigned_to_user_id` to the `deals` table.
*   The existing `user_id` field will continue to represent the deal creator.
*   Implement new RBAC permissions and update RLS policies to manage who can assign/reassign deals and who can view/edit deals based on this new assignment.
*   Provide GraphQL mutations for assigning/reassigning deals.

### Phase 2 (Future): Team-Based Assignment

*   Introduce new tables: `teams`, `team_members`.
*   Add a new nullable field `assigned_to_team_id` to the `deals` table.
*   Define how individual assignments (`assigned_to_user_id`) interact with team assignments (e.g., a deal assigned to a team can optionally have a specific team member also assigned).
*   Update RBAC/RLS to incorporate team-based permissions.

This document focuses on the detailed plan for **Phase 1**.

## 3. Detailed Plan for Phase 1: Individual User Assignment

### 3.1. Data Model Changes (Supabase Migration)

*   **Modify `deals` Table:**
    *   Add a new column: `assigned_to_user_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL`.
    *   Add an index on `assigned_to_user_id`.
    *   **Migration File Example (`supabase/migrations/<timestamp>_add_deal_assignment.sql`):**
        ```sql
        BEGIN;

        ALTER TABLE public.deals
        ADD COLUMN assigned_to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

        COMMENT ON COLUMN public.deals.assigned_to_user_id IS 'The user currently assigned to manage or work on this deal.';

        CREATE INDEX IF NOT EXISTS idx_deals_assigned_to_user_id ON public.deals(assigned_to_user_id);

        COMMIT;
        ```

### 3.2. RBAC - Permissions

*   **Add New Permissions (in `supabase/migrations/<timestamp>_rbac_schema_and_policies.sql` or a new RBAC migration):**
    *   In `public.permissions` table:
        *   `('deal', 'assign_own', 'Assign deals they created or are currently assigned to')`
        *   `('deal', 'assign_any', 'Assign any deal to any user (typically admin)')`
*   **Assign to Roles (in `public.role_permissions`):**
    *   `member` role: Grant `deal:assign_own`.
    *   `admin` role: Grant `deal:assign_any` (admins likely already have `deal:update_any` which could also be leveraged, but explicit assign permissions are clearer).

### 3.3. RLS Policy Updates for `deals` Table

The existing RLS policy for `deals` (found in `supabase/migrations/20250505072153_rbac_schema_and_policies.sql`) needs significant updates.

*   **`USING` Clause (for SELECT, UPDATE, DELETE access determination):**
    *   Users with `read_any` can see all deals.
    *   Users with `read_own` can see deals where `auth.uid() = deals.user_id` (creator) OR `auth.uid() = deals.assigned_to_user_id` (current assignee).
    ```sql
    -- Example modification for the USING part of the "Allow access based on RBAC permissions for deals" policy
    USING (
        (
            check_permission(auth.uid(), 'read_own', 'deal') AND
            (auth.uid() = user_id OR auth.uid() = assigned_to_user_id)
        ) OR
        (check_permission(auth.uid(), 'read_any', 'deal'))
    )
    ```

*   **`WITH CHECK` Clause (for INSERT, UPDATE operations):**
    *   **INSERT:** The `user_id` (creator) must still be `auth.uid()`. `assigned_to_user_id` can be set at creation if the user has permission (e.g., `assign_own` implicitly allows assigning to self or unassigned, or to others if `assign_any`).
    *   **UPDATE:** This is the most complex part.
        *   Users with `update_any` can change any field, including `user_id` and `assigned_to_user_id`.
        *   Users with `update_own`:
            *   Can update non-assignment fields if they are the creator (`user_id`) or current assignee (`assigned_to_user_id`).
            *   Cannot change `user_id` (creator).
            *   Can change `assigned_to_user_id` *only if* they also have `assign_own` permission and the update is primarily an assignment change.
        *   Users with `assign_own` (but not necessarily `update_own` for all fields):
            *   Can update `assigned_to_user_id` on deals they created or are currently assigned to.
            *   Should ideally not be able to change other fields during a pure assignment action unless they also have `update_own`.

    *   **Revised `WITH CHECK` logic (conceptual - will need careful SQL implementation):**
        ```sql
        WITH CHECK (
            -- Scenario: Admin with full update rights
            (check_permission(auth.uid(), 'update_any', 'deal')) OR

            -- Scenario: Creating a new deal
            (
                check_permission(auth.uid(), 'create', 'deal') AND
                user_id = auth.uid() -- Creator must be self
                -- assigned_to_user_id can be set at creation
            ) OR

            -- Scenario: Updating an existing deal (regular user)
            (
                ( -- User is creator or current assignee
                  auth.uid() = OLD.user_id OR auth.uid() = OLD.assigned_to_user_id
                ) AND
                NEW.user_id = OLD.user_id AND -- Creator cannot be changed by regular users
                (
                    -- Sub-Scenario: General update of other fields (requires 'update_own')
                    (
                        check_permission(auth.uid(), 'update_own', 'deal') AND
                        NEW.assigned_to_user_id IS NOT DISTINCT FROM OLD.assigned_to_user_id -- Assignment not changing OR changing to self
                    ) OR
                    -- Sub-Scenario: Explicitly changing assignment (requires 'assign_own')
                    (
                        check_permission(auth.uid(), 'assign_own', 'deal') AND
                        NEW.assigned_to_user_id IS DISTINCT FROM OLD.assigned_to_user_id
                        -- Optionally, restrict other field changes during a pure 'assign_own' action
                        -- e.g., AND NEW.name = OLD.name AND NEW.amount = OLD.amount ...
                    )
                )
            )
        )
        ```
    *   **Note:** The exact SQL for `WITH CHECK` will need careful crafting and testing to cover all cases correctly and prevent unintended bypasses. It might be beneficial to separate concerns further, e.g., by having the `assignDeal` mutation operate with elevated privileges for the specific task of changing `assigned_to_user_id` after checking business-level permissions, rather than encoding all logic into RLS. However, robust RLS is a strong foundation.

### 3.4. GraphQL Schema Changes

*   **`deal.graphql`:**
    *   Modify `Deal` type:
        ```graphql
        type Deal {
          # ... existing fields
          user_id: ID! # Creator
          user: User    # Creator (resolved)
          assigned_to_user_id: ID
          assignedToUser: User # Resolved assignee
        }
        ```
    *   Modify `DealInput` (for creation):
        ```graphql
        input DealInput {
          # ... existing fields
          assigned_to_user_id: ID # Optional: Assign at creation
        }
        ```
    *   Modify `DealUpdateInput`:
        ```graphql
        input DealUpdateInput {
          # ... existing fields
          assigned_to_user_id: ID # Allow changing assignment
        }
        ```
    *   Add new Mutation:
        ```graphql
        type Mutation {
          # ... existing mutations
          assignDeal(dealId: ID!, assigneeUserId: ID): Deal # assigneeUserId can be null to unassign
        }
        ```

### 3.5. GraphQL Resolvers

*   **`Deal` Resolver (`deal.ts`):**
    *   Add resolver for `Deal.assignedToUser` to fetch user details based on `assigned_to_user_id`.
    *   The existing `Deal.user` resolver should continue to resolve `user_id` (creator).
*   **`dealMutations.ts`:**
    *   **`createDeal`:**
        *   Pass `assigned_to_user_id` from input to `dealService.createDeal` if provided.
    *   **`updateDeal`:**
        *   If `assigned_to_user_id` is present in `args.input`:
            *   The service call `dealService.updateDeal` will handle it.
            *   Ensure RLS allows this change based on user's permissions (`update_own` with `assign_own`, or `update_any`).
    *   **New `assignDeal` Mutation:**
        *   Requires authentication.
        *   Check if user has `deal:assign_own` or `deal:assign_any` permission via `check_permission`.
        *   Fetch the deal.
        *   If `assign_own`, verify that `auth.uid()` is `deal.user_id` (creator) or `deal.assigned_to_user_id` (current assignee).
        *   Call a new service function, e.g., `dealService.assignDeal(dealId, assigneeUserId, currentUserId, context)`.
        *   Record deal history for assignment change.
        *   Return the updated deal.

### 3.6. Service Layer (`lib/dealService/dealCrud.ts`)

*   **`createDeal` function:**
    *   Accept optional `assigned_to_user_id` in its input object.
    *   Include it in the `finalDealInsertPayload`.
*   **`updateDeal` function:**
    *   Accept optional `assigned_to_user_id` in its `DealServiceUpdateData` input interface.
    *   Include it in `coreDataForDb` or `dbUpdatePayload`.
*   **New `assignDeal` function (optional, could be part of `updateDeal` if RLS is simple enough):**
    *   If created separately, this function would specifically handle the logic of updating only the `assigned_to_user_id` field and ensuring appropriate history is recorded.
*   **History Tracking (`dealHistory.ts` and `recordEntityHistory`):**
    *   Ensure `generateDealChanges` can correctly identify changes to `assigned_to_user_id`.
    *   Log a specific event type, e.g., `DEAL_ASSIGNED`, with old and new assignee IDs/names.

### 3.7. Frontend UI

*   Display the "Assigned To" user on deal views/cards.
*   Provide an interface (e.g., a dropdown in the deal detail view or a context menu on a Kanban card) to assign/reassign deals.
    *   This UI would call the new `assignDeal` mutation or the updated `updateDeal` mutation.
    *   The list of users to assign to should be filterable/searchable.

## 4. Considerations for Future Team Assignment (Phase 2)

*   **Interaction:** When `assigned_to_team_id` is introduced:
    *   A deal could be assigned to a team, and `assigned_to_user_id` could then be a specific member of that team taking lead (or be null if the whole team is "assigned").
    *   Alternatively, assignment could be *either* to a team *or* to a user, but not both simultaneously (using a check constraint or application logic). This is simpler.
*   **Data Model:**
    *   `teams` (id, name, ...)
    *   `team_members` (team_id, user_id, role_in_team, ...)
    *   `deals.assigned_to_team_id UUID NULL REFERENCES teams(id) ON DELETE SET NULL`.
*   **RLS/Permissions:** Would need `deal:assign_team_own`, `deal:assign_team_any` permissions and RLS checks based on user's team memberships.

Choosing the simpler model where `assigned_to_user_id` and `assigned_to_team_id` might be mutually exclusive (or `assigned_to_user_id` is only valid if the user is part of `assigned_to_team_id`) is often a good starting point for Phase 2.

## 5. Scalability & Architecture

*   **Indexing:** The new `assigned_to_user_id` column (and future `assigned_to_team_id`) must be indexed for efficient querying.
*   **Clear RLS/RBAC:** Relying on the database's RLS and a clear RBAC permission model enforced via `check_permission` is scalable and secure.
*   **Service Layer:** Keeping business logic in the service layer (`dealService`) maintains separation of concerns.
*   **GraphQL API:** Provides a flexible interface for frontends.
*   **Asynchronous Operations:** For notifications upon reassignment, Inngest or similar background job processing can be used if real-time updates become too slow (unlikely for simple assignments).

## 6. Milestones for Phase 1 (Individual User Assignment)

1.  **DB & RBAC Setup:**
    *   Migration for `assigned_to_user_id` column.
    *   Define and assign new `deal:assign_own` / `deal:assign_any` permissions.
2.  **RLS Policy Update:**
    *   Carefully implement and test updated RLS policies for `deals` table.
3.  **Backend - GraphQL & Service Layer:**
    *   Update GraphQL schema (`Deal`, `DealInput`, `DealUpdateInput`).
    *   Add `Query.users` to fetch all users for selectors.
    *   Implement resolver logic for `Deal.assignedToUser`, `Query.users`, and updated mutations (`createDeal`, `updateDeal`).
    *   Update `dealService` functions (`createDeal`, `updateDeal`) to handle `assignedToUserId` (camelCase from GraphQL) and map to `assigned_to_user_id` (snake_case for DB).
    *   Implement history tracking for assignments (partially done via generic deal update history).
4.  **Frontend Implementation:**
    *   Update GraphQL queries/mutations in `useDealsStore.ts` to include `assigned_to_user_id` and `assignedToUser`.
    *   Display assigned user in `DealCardKanban.tsx`.
    *   Add "Assigned To" column in `DealsTableView.tsx` (via `useDealsTableColumns.tsx` and `DealsPage.tsx`).
    *   Create `useUserListStore.ts` to fetch and manage a list of users for selectors.
    *   Implement user selector dropdown in `CreateDealModal.tsx` and `EditDealModal.tsx`.
        *   Logic for enabling/disabling and populating options based on user permissions (admin, creator, assignee) and current RLS limitations.
5.  **Testing:**
    *   Unit tests for service logic and RLS behavior (can be tricky for RLS but essential).
    *   Integration tests for GraphQL API.
    *   End-to-end tests for the user assignment flow.
6.  **Documentation:** Update relevant user and developer documentation.

## 7. Implementation & Testing Notes - Phase 1 (As of 2023-10-28)

This section summarizes the progress and findings from the initial backend implementation and testing of individual user assignments.

### 7.1. Successfully Implemented & Tested (Backend):

*   **Database & GraphQL Schema:**
    *   `deals` table correctly includes `assigned_to_user_id UUID NULL REFERENCES auth.users(id)`.
    *   GraphQL `Deal` type includes `assignedToUser: User` and `assigned_to_user_id: ID`.
    *   GraphQL `DealInput` and `DealUpdateInput` include `assignedToUserId: ID` (camelCase).
    *   GraphQL `Query` type includes `users: [User!]!` for fetching user lists.
*   **RBAC/RLS:**
    *   `deal:assign_own` and `deal:assign_any` permissions created and assigned to roles ('member', 'admin').
    *   RLS policies for `deals` table updated for `SELECT` (creator OR assignee for `read_own`) and `UPDATE` (permission checks for assignment changes).
        *   *Known Issue:* RLS for `UPDATE` is currently too restrictive for non-admins trying to reassign deals not created by them, even if they are the current assignee and have `deal:assign_own`. This requires further Supabase RLS investigation.
*   **Resolvers & Service Layer:**
    *   `Deal.assignedToUser` resolver implemented in `deal.ts`.
    *   `Query.users` resolver implemented in `query.ts` to fetch users from `user_profiles`.
    *   `createDeal` mutation (`dealMutations.ts`, `dealCrud.ts`):
        *   Accepts `assignedToUserId`.
        *   Correctly maps camelCase `assignedToUserId` from GraphQL to snake_case `assigned_to_user_id` for database operations in `dealCrud.ts` (fix applied for linter error).
        *   Passes `assigned_to_user_id` to `dealService.createDeal`.
    *   `updateDeal` mutation (`dealMutations.ts`, `dealCrud.ts`):
        *   Accepts `assignedToUserId`.
        *   Includes permission checks for `deal:assign_any` or `deal:assign_own` when `assignedToUserId` is changed.
        *   Passes `assigned_to_user_id` to `dealService.updateDeal`.
*   **Zod Validators (`validators.ts`):**
    *   Updated to handle `assignedToUserId` (camelCase) correctly.
*   **Basic Backend Test Cases (GraphQL Yoga Client):**
    *   TC1 (Create Unassigned by Member): Passed.
    *   TC2 (Create Assigned to Self by Member): Passed (after Zod/resolver fixes).
    *   TC3 (Create Assigned to Other by Admin): Passed.
    *   TC4 (Update by Admin - Assign): Passed.
    *   TC5 (Update by Member - Assign to Self, was creator): Passed.
    *   TC6 (Update by Member - Assign to Other, was creator): Failed (Forbidden - as expected by resolver logic, `deal:assign_own` doesn't mean assign to *any* other).
    *   TC7 (Update by Member - Unassign, was creator & assignee): Passed.
    *   TC8.1 (Setup: Admin assigns deal to User A): Passed.
    *   TC8.2 (Update by User A - Unassign, non-creator but assignee with `deal:assign_own`): Failed (RLS Violation - "new row violates row-level security policy"). This confirms the RLS limitation noted above.

### 7.2. Frontend Implementation Progress (As of Current Date):

*   **Display of Assignee:**
    *   `DealCardKanban.tsx`: Displays "Assigned: [User Name]" or "Unassigned".
    *   `DealsTableView.tsx` (via `useDealsTableColumns.tsx` and `DealsPage.tsx`): Includes a sortable "Assigned To" column.
*   **User List for Selectors:**
    *   `useUserListStore.ts`: Created to fetch users (`id`, `display_name`, `email`, `avatar_url`) via the new `Query.users`.
*   **Assignment in Modals:**
    *   `CreateDealModal.tsx`:
        *   Includes a "Assign To" `Select` dropdown.
        *   Populated by `useUserListStore`.
        *   Admins can select any user or "Unassigned".
        *   Non-admins with `deal:assign_own` can select themselves or "Unassigned".
        *   Sends `assignedToUserId` to the `createDeal` mutation.
    *   `EditDealModal.tsx`:
        *   Includes a "Assign To" `Select` dropdown, pre-filled with the current assignee.
        *   Populated by `useUserListStore`.
        *   Selector is disabled/options limited based on permissions (Admin full control; Non-admin creator with `deal:assign_own` can assign to self/unassign; other non-admin scenarios are restricted due to RLS and UI simplification).
        *   Sends `assignedToUserId` to the `updateDeal` mutation.
*   **Deals Table Actions (`useDealsTableColumns.tsx`):**
    *   The "Edit" button logic has been corrected to allow users with `deal:update_own` to edit deals if they are the creator OR the current assignee, aligning with backend RLS capabilities.
*   **GraphQL Operations (`useDealsStore.ts`):**
    *   Queries and mutations (`GET_DEALS_QUERY`, `CREATE_DEAL_MUTATION`, `UPDATE_DEAL_MUTATION`) updated to fetch and send `assigned_to_user_id` and `assignedToUser` fields.

### 7.3. Current Limitations & Next Steps (Phase 1):

*   **RLS Policy for Non-Creator Assignees:** The primary backend limitation is the RLS policy preventing a non-admin user (who did not create the deal but is the current assignee and has `deal:assign_own`) from unassigning or reassigning the deal from themselves. This requires deeper investigation into Supabase RLS.
    *   **Decision:** For now, accept this limitation. The UI in `EditDealModal.tsx` reflects this by disabling the assignee field for non-creators (even if they are the current assignee, if they are not also the creator). Admins retain full control. The deals list "Edit" button, however, now correctly allows assignees to edit (which RLS supports for general field updates).
*   **Frontend Testing:** Thorough testing of the implemented UI flows is the immediate next step.
*   **Refine UI/UX for Assignee Selector:** Based on testing, minor adjustments might be needed.
*   **Custom Field Rendering in `EditDealModal.tsx`:** Needs to be fully implemented to match `CreateDealModal.tsx`. (Separate from assignment feature but noted).
*   **Update User Manual:** After frontend testing.

## 8. Risks & Mitigation (Renumbered)

*   **RLS Complexity:** Incorrect RLS can lead to data leaks or users being unable to perform valid actions.
    *   **Mitigation:** Thorough testing, peer reviews of RLS policies, start with slightly more permissive RLS in dev and tighten, rather than too restrictive. Consider writing SQL tests for RLS.
*   **Scope Creep into Team Assignment:** Defer team-specific logic to Phase 2.
    *   **Mitigation:** Clear definition of Phase 1 deliverables.
*   **Impact on Existing Deal Queries/Performance:**
    *   **Mitigation:** Ensure proper indexing on `assigned_to_user_id`. Monitor query performance after rollout.

This plan provides a structured approach to implementing individual deal assignments while keeping future team functionality in view. The RLS changes are the most critical and sensitive part. 