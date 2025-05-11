# Implementation Plan: Deal History / Audit Trail

**Feature Goal:** To track and display a chronological history of significant changes made to a deal, including its creation, updates to key fields (with old and new values), and deletion. This history should indicate what changed, when it changed, and who made the change.

This plan focuses on an application-level approach for recording history, primarily within `dealService.ts`, and using a JavaScript library for diffing object changes.

## Phase 1: Backend Foundation & Database Changes

### 1.1: Database Migration - `deal_history` Table

*   **Action:** Create a new Supabase migration file (e.g., `supabase migrations new create_deal_history_table`).
*   **SQL Definition:**
    ```sql
    -- supabase/migrations/<timestamp>_create_deal_history_table.sql

    CREATE TABLE public.deal_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
        user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Who performed the action
        event_type TEXT NOT NULL, -- e.g., 'DEAL_CREATED', 'DEAL_UPDATED', 'DEAL_DELETED'
        changes JSONB NULL, -- Stores details of what changed or initial state
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- Optional: Add a comment to describe the table
    COMMENT ON TABLE public.deal_history IS 'Stores audit trail/history of changes for deals.';

    -- Indexes for performance
    CREATE INDEX idx_deal_history_deal_id ON public.deal_history(deal_id);
    CREATE INDEX idx_deal_history_created_at ON public.deal_history(created_at DESC);
    CREATE INDEX idx_deal_history_user_id ON public.deal_history(user_id);

    -- Enable RLS
    ALTER TABLE public.deal_history ENABLE ROW LEVEL SECURITY;

    -- RLS Policies (Example: Allow users to see history for deals they can access)
    -- This policy assumes that if a user can read a deal, they can read its history.
    -- It might need to be more granular based on specific permissions for viewing history.
    CREATE POLICY "Allow users to read history for accessible deals"
    ON public.deal_history
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1
        FROM public.deals d
        WHERE d.id = deal_history.deal_id
        -- Assuming RLS on 'deals' table correctly filters what deals the current user can see.
        -- If 'deals' RLS is based on 'SELECT TRUE', this implies direct access.
        -- If 'deals' RLS is more complex (e.g., check_permission), that logic might need to be
        -- considered or replicated here if direct deal access doesn't imply history access.
        -- For simplicity, we'll start with the assumption that deal visibility implies history visibility.
      )
    );

    -- Only authenticated users can be linked to history entries (implicitly handled by FK and app logic)
    -- No specific INSERT/UPDATE/DELETE policies are defined here for users on this table directly,
    -- as history records are created by the backend service logic.
    ```
*   **Apply Migration:** After creating the file, run `supabase db reset` (for local dev) or `supabase migration up` if you want to preserve existing data.

### 1.2: Choose and Install a JavaScript Diffing Library

*   **Action:** Select a library to help identify changes between object states for the `DEAL_UPDATED` event. `deep-diff` is a good candidate.
*   **Installation:**
    ```bash
    npm install deep-diff
    # If using TypeScript and types are available:
    npm install --save-dev @types/deep-diff
    ```
    (Add this to the root `package.json` as it's for backend `lib` usage).

### 1.3: Helper Function for Recording History

*   **Action:** Create a helper function, potentially in `lib/serviceUtils.ts` or a new `lib/historyService.ts`, to centralize the creation of history records.
*   **Example (`lib/serviceUtils.ts`):**
    ```typescript
    // In lib/serviceUtils.ts
    // ... (other helper functions)

    export interface HistoryChangeDetail {
      field: string;
      oldValue: any;
      newValue: any;
    }

    export async function recordEntityHistory(
      supabase: SupabaseClient, // Authenticated Supabase client
      entityTable: string, // e.g., 'deal_history'
      entityIdField: string, // e.g., 'deal_id'
      entityId: string,
      userId: string | undefined, // User performing the action
      eventType: string,
      changes?: Record<string, { oldValue: any; newValue: any }> | Record<string, any> | null // Flexible changes object
    ): Promise<void> {
      try {
        const historyRecord: any = {
          [entityIdField]: entityId,
          user_id: userId,
          event_type: eventType,
          changes: changes || null,
        };

        const { error }_ = await supabase.from(entityTable).insert(historyRecord);
        if (error) {
          console.error(`[recordEntityHistory] Error recording history for ${entityTable} (${entityIdField}: ${entityId}):`, error);
          // Decide if this error should be re-thrown or just logged
          // For now, log and continue to not break main operation
        }
      } catch (err) {
        console.error(`[recordEntityHistory] Exception recording history for ${entityTable}:`, err);
      }
    }
    ```

### 1.4: Update `lib/dealService.ts` to Record History

*   **Import `deep-diff` and the `recordEntityHistory` helper.**
*   **Modify `createDeal`:**
    *   After successful deal creation.
    *   Call `recordEntityHistory` with:
        *   `entityTable`: 'deal_history'
        *   `entityIdField`: 'deal_id'
        *   `entityId`: `newDealRecord.id`
        *   `userId`: `userId` from function arguments
        *   `eventType`: 'DEAL_CREATED'
        *   `changes`: An object containing the initial values of key fields from `newDealRecord` (e.g., `{ name: newDealRecord.name, stage_id: newDealRecord.stage_id, amount: newDealRecord.amount, ... }`).
*   **Modify `updateDeal`:**
    1.  **Fetch Old State:** Before calling `supabase.from('deals').update(...)`, fetch the current deal record using `getDealById` or a direct query to get its current values.
        ```typescript
        // Inside updateDeal, before the actual update
        const oldDealData = await this.getDealById(userId, id, accessToken); // Assuming 'this' context or direct call
        if (!oldDealData) {
            throw new GraphQLError('Deal not found for history tracking', { extensions: { code: 'NOT_FOUND' } });
        }
        ```
    2.  **Perform Update:** Proceed with the existing update logic.
    3.  **Calculate Diff & Record History:** After a successful update:
        *   Use `deep-diff` to compare `oldDealData` with the `input` (or `updatedDealRecord` if you select it back). Focus on relevant fields: `name`, `stage_id`, `amount`, `expected_close_date`, `person_id`, `organization_id`, `deal_specific_probability`.
        *   Transform the diff output into a simpler `changes` object: `Record<string, { oldValue: any; newValue: any }>`.
            ```typescript
            // Example using deep-diff (simplified)
            // import { diff, Diff } from 'deep-diff';
            // const differences: Diff<typeof oldDealData, typeof input>[] | undefined = diff(oldDealData, input);
            // const actualChanges: Record<string, { oldValue: any; newValue: any }> = {};
            // if (differences) {
            //   differences.forEach(d => {
            //     if (d.path && d.path.length === 1) { // Simple top-level field changes
            //       const key = d.path[0] as string;
            //       // Filter for relevant keys
            //       if (['name', 'stage_id', 'amount', /* ...other tracked fields */].includes(key)) {
            //         actualChanges[key] = { oldValue: d.lhs, newValue: d.rhs };
            //       }
            //     }
            //   });
            // }
            // if (Object.keys(actualChanges).length > 0) {
            //   await recordEntityHistory(supabase, 'deal_history', 'deal_id', id, userId, 'DEAL_UPDATED', actualChanges);
            // }
            ```
*   **Modify `deleteDeal`:**
    *   After successful deal deletion (or soft delete).
    *   Call `recordEntityHistory` with:
        *   `entityTable`: 'deal_history'
        *   `entityIdField`: 'deal_id'
        *   `entityId`: `id` (the ID of the deal being deleted)
        *   `userId`: `userId`
        *   `eventType`: 'DEAL_DELETED'
        *   `changes`: `null` or a minimal object like `{ deleted_deal_id: id }`.

### 1.5: Update GraphQL Schema

*   **Create `history.graphql` (or add to an existing relevant schema file):**
    ```graphql
    # netlify/functions/graphql/schema/history.graphql (or similar)

    type DealHistoryEntry {
      id: ID!
      user: User # To be resolved to a User type
      eventType: String!
      changes: JSON # Represents the structured changes
      createdAt: DateTime!
    }

    # Extend User type if not already available for simple lookup by resolver
    # If User type is complex, resolver might only return a subset like { id, name, email }
    # Ensure base.graphql or similar defines/extends User appropriately.
    # Example:
    # type User {
    #   id: ID!
    #   email: String
    #   # Add other fields like name, avatar_url if available and needed
    # }
    ```
*   **Extend `Deal` Type in `deal.graphql`:**
    ```graphql
    # netlify/functions/graphql/schema/deal.graphql
    # ... existing Deal type ...
    extend type Deal {
      history(limit: Int, offset: Int): [DealHistoryEntry!]
    }
    ```
    (Added optional `limit` and `offset` for future pagination).

### 1.6: Implement GraphQL Resolvers

*   **`Deal.history` resolver (in `netlify/functions/graphql/resolvers/deal.ts`):**
    ```typescript
    // In netlify/functions/graphql/resolvers/deal.ts
    // ...
    export const Deal: DealResolvers = {
      // ... other Deal field resolvers (stage, pipeline, weighted_amount, etc.)
      history: async (parent, args, context, info) => {
        requireAuthentication(context);
        const { supabase } = context; // Assuming supabase client is in context

        const { data, error } = await supabase
          .from('deal_history')
          .select('*')
          .eq('deal_id', parent.id)
          .order('created_at', { ascending: false })
          .limit(args.limit || 20) // Default limit
          .range(args.offset || 0, (args.offset || 0) + (args.limit || 20) - 1);

        if (error) {
          console.error('Error fetching deal history:', error);
          throw new GraphQLError('Could not fetch deal history.');
        }
        return data || [];
      },
    };
    ```
*   **`DealHistoryEntry.user` resolver (e.g., create `netlify/functions/graphql/resolvers/history.ts`):**
    ```typescript
    // In netlify/functions/graphql/resolvers/history.ts
    import { DealHistoryEntryResolvers, User as GraphQLUser } from '../../../../lib/generated/graphql'; // Adjust path
    import { requireAuthentication, GraphQLContext } from '../helpers';

    export const DealHistoryEntry: DealHistoryEntryResolvers<GraphQLContext> = {
      user: async (parent, _args, context, _info) => {
        if (!parent.user_id) return null;
        requireAuthentication(context);
        const { supabase } = context;

        // This assumes you have a way to get basic user info.
        // Supabase auth.users is protected. You might need a view or a specific query.
        // For simplicity, let's assume a 'users' table or a function to get basic user details.
        // If your 'users' table is the public profile table linked to auth.users:
        const { data, error } = await supabase
          .from('users') // Or 'profiles' or whatever your public user table is
          .select('id, email, first_name, last_name') // Adjust fields as needed
          .eq('id', parent.user_id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116: No rows found
          console.error('Error fetching user for history entry:', error);
          return null; // Or throw error
        }
        if (!data) return null;

        // Map to GraphQLUser type
        return {
          id: data.id,
          email: data.email,
          // Construct name if available
          name: [data.first_name, data.last_name].filter(Boolean).join(' ') || data.email,
          // ... other User fields
        } as GraphQLUser; // Cast carefully or ensure types match
      },
    };
    ```
    *   **Note:** Ensure `history.ts` resolvers are added to the `resolvers` array in `netlify/functions/graphql.ts`.

### 1.7: Regenerate GraphQL Types

*   **Action:** Run `npm run codegen` to update all frontend and backend GraphQL types.

## Phase 2: Frontend - Display

### 2.1: Create a Deal Detail Page/View

*   **Action:** Since this feature inherently belongs on a view showing details of a single deal, and we don't have one yet, create it.
*   **Routing:** Add a new route like `/deals/:dealId` in `frontend/src/App.tsx`.
*   **New Page Component:** `frontend/src/pages/DealDetailPage.tsx`.
    *   This page will fetch the specific deal using its ID from the route params.
    *   It will display core deal information (name, amount, stage, etc.).

### 2.2: Update Zustand Store (`useDealsStore.ts` or a new `useDealDetailStore.ts`)

*   **Action:** Add functionality to fetch a single deal by ID, including its history.
*   **GraphQL Query:**
    ```graphql
    query GetDealWithHistory($dealId: ID!) {
      deal(id: $dealId) {
        id
        name
        amount
        # ... other core deal fields ...
        stage {
          id
          name
          pipeline_id
        }
        history(limit: 50) { # Fetch, e.g., last 50 history entries
          id
          eventType
          changes
          createdAt
          user {
            id
            name # Or first_name, last_name, email
            # avatar_url (if you add it)
          }
        }
      }
    }
    ```
*   **Store State:** The store slice for deal details should hold the fetched `deal` object (which now includes `history`).

### 2.3: Create Deal History Display Components

*   **Location:** `frontend/src/components/deals/`
*   **`DealHistoryList.tsx`:**
    *   Props: `historyEntries: DealHistoryEntry[]` (from generated frontend types).
    *   Renders a list (e.g., using Chakra UI `VStack` or `List`).
    *   Maps over `historyEntries` and renders a `DealHistoryItem.tsx` for each.
*   **`DealHistoryItem.tsx`:**
    *   Props: `entry: DealHistoryEntry`.
    *   Displays:
        *   User's name (or email if name not available) from `entry.user`.
        *   A human-readable description of `entry.eventType` (e.g., "created this deal", "updated details", "deleted this deal").
        *   `entry.createdAt` formatted (e.g., using `date-fns`).
        *   A human-readable summary of `entry.changes`. This is the most complex part.

### 2.4: Logic for Human-Readable Changes in `DealHistoryItem.tsx`

*   **Input:** The `changes` JSONB object from `entry.changes`.
*   **Output:** A user-friendly string or set of strings.
*   **Examples:**
    *   **`DEAL_CREATED`:** "Created deal with Name: 'Initial Name', Amount: $1000, Stage: 'Prospecting'." (Iterate over `changes` object which holds initial values).
    *   **`DEAL_UPDATED`:**
        *   "Changed Name from 'Old Name' to 'New Name'."
        *   "Changed Stage from 'Prospecting' (ID: ...) to 'Negotiation' (ID: ...)." (Requires fetching stage names if only IDs are stored in `changes`).
        *   "Set Amount to $1500 (was $1000)."
        *   "Cleared Specific Probability (was 50%)."
    *   **`DEAL_DELETED`:** "Deleted this deal."
*   **Implementation Details:**
    *   A helper function within `DealHistoryItem.tsx` or a utility file.
    *   It will need to iterate over the keys in the `changes` object.
    *   For fields like `stage_id`, `person_id`, `organization_id`, if only IDs are stored in `changes.oldValue` and `changes.newValue`, you might need to:
        *   Have access to relevant stores (stages, people, organizations) to look up names by ID.
        *   Or, ensure the backend `dealService` enriches the `changes` object with names when it records history for foreign key fields (this would make the `changes` JSONB larger but frontend simpler). *Initial approach: Store IDs, resolve names on frontend if possible.*
    *   Format currency, dates, and percentages appropriately.

### 2.5: Integrate History Display

*   In `DealDetailPage.tsx`, fetch the deal data (including history).
*   Pass the `deal.history` array to the `DealHistoryList.tsx` component.
*   Display this list in a dedicated section or tab on the deal detail page.

## Phase 3: Refinements & Future Considerations (Post-MVP)

*   **Pagination for History:** If history lists become very long.
*   **Filtering History:** By event type or user.
*   **More Granular Permissions:** Specific permissions for viewing deal history.
*   **Real-time Updates (Optional):** If another user changes a deal you are viewing, history could update via subscriptions (more complex).
*   **Generic History Service:** If extending to other entities, refactor `recordEntityHistory` and history resolvers to be more generic.
*   **Performance Optimization:** For diffing and history recording if it becomes a bottleneck.
*   **Enhanced Diff Display:** More sophisticated UI for showing complex changes (e.g., side-by-side diffs for text fields).

This plan provides a comprehensive roadmap for implementing the Deal History feature. 