## Implementation Plan: Deal-Specific Probability & Weighted Value

**Status:** Done

**Overall Goal:** Allow users to set a specific probability for individual deals, and display a calculated "weighted amount" for deals based on this probability (with a fallback to stage probability).

---

### **Phase 1: Backend Foundation & Database Changes**
*This phase focuses on establishing the data storage and backend logic, testable via API calls.*

**Step 1.1: Database Migration (Deals Table Enhancement)**
*   **Task:** Add a field to store deal-specific probability.
*   **Action:**
    1.  Create a new Supabase migration file using `supabase migrations new add_deal_specific_probability_to_deals`.
    2.  In the new migration SQL file, add a nullable `deal_specific_probability` column to the `public.deals` table:
        ```sql
        ALTER TABLE public.deals
        ADD COLUMN deal_specific_probability REAL CHECK (deal_specific_probability IS NULL OR (deal_specific_probability >= 0.0 AND deal_specific_probability <= 1.0));
        COMMENT ON COLUMN public.deals.deal_specific_probability IS 'Deal-specific probability (0.0 to 1.0), overrides stage probability if set.';
        ```
        *(Storing as a float 0.0-1.0 is common; frontend can display as %).*
*   **Verification:**
    *   Apply the migration locally: `supabase db reset` (if clean slate needed) or ensure Supabase picks it up.
    *   Inspect the `deals` table schema in Supabase Studio to confirm the new column, its type, and check constraint.
*   **Current Functionality Reference:** Pattern follows existing migration files in `supabase/migrations/` (e.g., `20250504024435_pipeline_stages_schema.sql` which added `deal_probability` to the `stages` table).

**Step 1.2: Update Backend Shared Types (If applicable)**
*   **Task:** Ensure internal backend types are consistent.
*   **Action:** If `lib/types.ts` (or similar) defines a manual `Deal` interface that `dealService.ts` relies on *before* GraphQL types are generated/used, update it:
    ```typescript
    // In lib/types.ts or equivalent
    export interface Deal {
      // ... existing fields
      deal_specific_probability?: number | null;
    }
    ```
*   **Verification:** TypeScript should compile without errors in `dealService.ts` if it uses this type. *(Note: The primary types will come from GraphQL codegen next).*

**Step 1.3: Update GraphQL Schema (`deal.graphql`)**
*   **Task:** Expose deal-specific probability and weighted amount via the API.
*   **Action:** In `netlify/functions/graphql/schema/deal.graphql`:
    1.  Modify `type Deal`:
        ```graphql
        type Deal {
          # ... existing fields
          deal_specific_probability: Float # Nullable, actual probability (0.0 to 1.0)
          weighted_amount: Float          # Calculated: amount * effective_probability
        }
        ```
    2.  Modify `input DealInput`:
        ```graphql
        input DealInput {
          # ... existing fields
          deal_specific_probability: Float # Nullable, for setting/unsetting
        }
        ```
*   **Verification:** Review schema for correctness. Subsequent codegen will also validate this.
*   **Current Functionality Reference:** Existing structure of `deal.graphql` and how `deal_probability` is handled in `stage.graphql`.

**Step 1.4: Regenerate GraphQL Types**
*   **Task:** Update all generated TypeScript types based on schema changes.
*   **Action:** Run the codegen script defined in `package.json` (likely `npm run codegen`).
*   **Verification:**
    *   Inspect `lib/generated/graphql.ts`. Confirm that `Deal` type now includes `deal_specific_probability` and `weighted_amount`.
    *   Confirm `DealInput` includes `deal_specific_probability`.
*   **Current Functionality Reference:** `codegen.ts` file and `DEVELOPER_GUIDE_V2.md` section on "GraphQL Code Generation (Backend)".

**Step 1.5: Update Zod Validation Schema (`validators.ts`)**
*   **Task:** Ensure input validation for the new field.
*   **Action:** In `netlify/functions/graphql/validators.ts`, update `DealBaseSchema` (or `DealCreateSchema`/`DealUpdateSchema` if they diverge significantly for this field):
    ```typescript
    export const DealBaseSchema = z.object({
        // ... existing fields
        deal_specific_probability: z.number().min(0).max(1).optional().nullable(),
    });
    ```
*   **Verification:** TypeScript compilation. If unit tests for Zod schemas exist, add cases for this new field.
*   **Current Functionality Reference:** Existing Zod schemas in `validators.ts`.

**Step 1.6: Update `dealService.ts`**
*   **Task:** Adapt service layer to handle storage and retrieval of `deal_specific_probability`.
*   **Action:** In `lib/dealService.ts`:
    1.  **`createDeal`**: Ensure `input.deal_specific_probability` (if provided) is included in the object passed to `supabase.from('deals').insert(...)`.
    2.  **`updateDeal`**: Ensure `input.deal_specific_probability` (if provided, or `null` to unset it) is included in the object passed to `supabase.from('deals').update(...)`.
    3.  **`getDealById` and `getDeals`**: Ensure `deal_specific_probability` is part of the `select('*')` (which it should be by default) and returned.
*   **Testing (Unit - `dealService.test.ts`):**
    *   Add new test cases or modify existing ones:
        *   Verify `createDeal` correctly stores `deal_specific_probability`.
        *   Verify `updateDeal` can set and clear `deal_specific_probability`.
        *   Verify `getDealById` and `getDeals` return deals with the `deal_specific_probability` field populated correctly.
*   **Current Functionality Reference:** Existing CRUD operations in `lib/dealService.ts`.

**Step 1.7: Update GraphQL Resolvers (`mutation.ts`, `query.ts`, `deal.ts`)**
*   **Task:** Integrate the new field into API request/response logic and implement the calculated `weighted_amount`.
*   **Actions:**
    1.  **Mutations (`netlify/functions/graphql/resolvers/mutation.ts`):**
        *   In `createDeal` and `updateDeal` resolvers, ensure the `validatedInput.deal_specific_probability` is passed to the respective `dealService` calls.
        *   Ensure the returned `Deal` object from the service (which now includes `deal_specific_probability`) is correctly mapped to the GraphQL response.
    2.  **Queries (`netlify/functions/graphql/resolvers/query.ts`):**
        *   In `deal` and `deals` resolvers, ensure `deal_specific_probability` from the service layer is mapped to the GraphQL response.
    3.  **Type Resolver for `Deal.weighted_amount` (`netlify/functions/graphql/resolvers/deal.ts`):**
        *   Add/update the `Deal` type resolver:
            ```typescript
            // In netlify/functions/graphql/resolvers/deal.ts
            import type { DealResolvers, Stage } from '../../../../lib/generated/graphql'; // Ensure Stage is imported if you access parent.stage

            export const Deal: DealResolvers<GraphQLContext> = {
              // ... existing person and stage resolvers
              weighted_amount: (parent, _args, _context) => {
                if (parent.amount == null) {
                  return null;
                }
                let probabilityToUse: number | null | undefined = parent.deal_specific_probability;

                // Fallback to stage probability if deal-specific one isn't set
                if (probabilityToUse == null && parent.stage && parent.stage.deal_probability != null) {
                  // Assuming parent.stage is populated by the Deal.stage resolver
                  // and contains deal_probability (0.0 to 1.0)
                  probabilityToUse = parent.stage.deal_probability;
                }

                if (probabilityToUse != null) {
                  return parent.amount * probabilityToUse;
                }
                // If no probability is available, business rule: return null or amount?
                // For now, returning null if no probability can be determined.
                return null; 
              },
            };
            ```
*   **Testing (API Level):**
    *   Using a GraphQL client:
        *   **Create:** Send `createDeal` mutation with `deal_specific_probability`. Verify it's in the response, and `weighted_amount` is calculated.
        *   **Update:** Send `updateDeal` to set/change/nullify `deal_specific_probability`. Verify response and calculation.
        *   **Query (Single Deal):** Fetch a deal. Check `deal_specific_probability` and `weighted_amount`. Test with:
            *   Deal-specific probability set.
            *   Deal-specific probability null, stage probability set.
            *   Both null.
        *   **Query (List Deals):** Fetch all deals, check fields for various deals.
*   **Current Functionality Reference:** Existing mutation patterns in `mutation.ts`, query patterns in `query.ts`, and the `Deal.stage` resolver in `deal.ts`. The `Deal.stage` resolver ensures that `parent.stage.deal_probability` is available.

---

### **Phase 2: Frontend - Display and Input**
*This phase focuses on allowing users to interact with the new fields.*

**Step 2.1: Update Zustand Store (`useDealsStore.ts`)**
*   **Task:** Ensure frontend state management includes the new fields.
*   **Action:** In `frontend/src/stores/useDealsStore.ts`:
    1.  Review and update the GraphQL query strings (`GET_DEALS_QUERY`, `CREATE_DEAL_MUTATION`, `UPDATE_DEAL_MUTATION`) to:
        *   Include `deal_specific_probability` in the input object for create/update mutations.
        *   Request `deal_specific_probability` and `weighted_amount` in the selection set for all queries/mutations that return a `Deal`.
    2.  Ensure the local `Deal` type definition within the store (if one exists separate from the generated types) is updated to reflect these new fields. (Typically, you'd rely on the generated `Deal` type from `../generated/graphql/graphql`).
*   **Verification:** TypeScript compilation. Any existing store unit tests should pass or be updated.
*   **Current Functionality Reference:** Existing GraphQL query constants and type usage in `useDealsStore.ts`.

**Step 2.2: Update Deal Modals (`EditDealModal.tsx` and optionally `CreateDealModal.tsx`)**
*   **Task:** Provide UI for users to set the deal-specific probability.
*   **Action (Focus on `EditDealModal.tsx` first):**
    1.  In `frontend/src/components/EditDealModal.tsx`:
        *   Add state for `dealSpecificProbability` (e.g., `useState<number | string>('')`).
        *   In `useEffect` that populates the form when `deal` prop changes, set `dealSpecificProbability` from `deal.deal_specific_probability` (handle 0.0-1.0 to 0-100% conversion if displaying as percentage).
        *   Add a `FormControl` and `NumberInput` for "Deal Specific Probability (%)":
            ```tsx
            <FormControl>
              <FormLabel>Deal Specific Probability (%)</FormLabel>
              <NumberInput
                min={0}
                max={100}
                value={dealSpecificProbability} // state variable
                onChange={(valueAsString, valueAsNumber) => setDealSpecificProbability(isNaN(valueAsNumber) ? valueAsString : valueAsNumber)}
                allowMouseWheel
              >
                <NumberInputField placeholder="Optional (e.g., 75)" />
                {/* Consider NumberInputStepper */}
              </NumberInput>
            </FormControl>
            ```
        *   In the `handleSubmit` function, when preparing `DealInput` for `updateDealAction`:
            *   Convert the probability back to 0.0-1.0 if stored as such.
            *   Include `deal_specific_probability: parsedProbabilityOrNull` in the input.
    2.  **(Optional for initial increment) `CreateDealModal.tsx`**: Decide if this field should be available on creation. If so, implement similarly.
*   **Testing (Manual UI):**
    *   Open the "Edit Deal" modal. Verify the new probability field is present.
    *   If a deal has a specific probability, verify it's pre-filled correctly (after % conversion).
    *   Change the value, save the deal.
    *   Re-open the modal and check if the new value persisted (frontend state/backend check).
    *   Test clearing the value (setting to null).
*   **Current Functionality Reference:** The "Amount" `NumberInput` in `EditDealModal.tsx` or the "Deal Probability (%)" field in `frontend/src/components/stages/EditStageModal.tsx`.

**Step 2.3: Display in Deals List (`DealsPage.tsx`)**
*   **Task:** Show the new probability and weighted amount in the main deals view.
*   **Action:** In `frontend/src/pages/DealsPage.tsx`:
    1.  Update the `ColumnDefinition<Deal>[]` array:
        *   Add a new column for "Specific Prob. (%)":
            ```tsx
            {
              key: 'deal_specific_probability',
              header: 'Specific Prob. (%)',
              renderCell: (deal) => deal.deal_specific_probability != null ? `${deal.deal_specific_probability * 100}%` : '-',
              isSortable: true,
              // sortAccessor if needed
            },
            ```
        *   Add a new column for "Weighted Amount":
            ```tsx
            {
              key: 'weighted_amount',
              header: 'Weighted Amount',
              renderCell: (deal) => formatCurrency(deal.weighted_amount), // Use existing formatCurrency helper
              isSortable: true,
              isNumeric: true,
              // sortAccessor if needed
            },
            ```
*   **Testing (Manual UI):**
    *   Navigate to the `DealsPage`.
    *   Verify the two new columns ("Specific Prob. (%)", "Weighted Amount") are visible.
    *   For various deals (with specific probability, without it but with stage probability, with neither), verify the displayed values are correct.
    *   Test sorting for these new columns.
*   **Current Functionality Reference:** Existing column definitions and `formatCurrency` helper in `DealsPage.tsx`.

**Step 2.4: Display in Deal Detail View (If applicable)**
*   **Task:** If a separate, more detailed view for a single deal exists or is planned as part of near-term work, ensure these fields are also displayed there.
*   **Action:** Add display logic for `deal_specific_probability` and `weighted_amount` in the relevant detail component.
*   **Testing (Manual UI):** Verify correct display in the detail view.

---

### **Phase 3: Refinements & Extended Testing**
*This phase ensures robustness and covers edge cases.*

**Step 3.1: Solidify Weighted Amount Fallback Logic & Display**
*   **Task:** Ensure the fallback logic in the `Deal.weighted_amount` resolver (Step 1.7.3) is robust and clearly reflects business rules.
*   **Action:**
    *   Confirm with stakeholders: If `deal_specific_probability` is null, should it use `stage.deal_probability`? If both are null, should `weighted_amount` be `null`, `0`, or equal to `deal.amount`? The current plan assumes `null` if no probability can be determined.
    *   Refine the resolver if necessary.
    *   Ensure frontend display of `weighted_amount` gracefully handles `null` (e.g., shows '-' as per current `formatCurrency`).
*   **Testing:** Add specific backend integration tests for the `Deal.weighted_amount` resolver covering all fallback scenarios. Manually test these scenarios in the UI.

**Step 3.2: Comprehensive End-to-End (E2E) Tests**
*   **Task:** Create E2E tests covering the user flow for this feature.
*   **Action:** Using Playwright (current E2E tool):
    1.  Create a new test file (e.g., `e2e/deal-probability.spec.ts`).
    2.  Write tests for:
        *   Opening the "Edit Deal" modal, setting a deal-specific probability, saving, and verifying the change in the deals list (both new columns).
        *   Editing a deal to clear its specific probability, saving, and verifying the weighted amount updates (potentially based on stage probability).
        *   Verifying the weighted amount calculation correctly reflects deal-specific vs. stage probability fallback in the list view.
*   **Current Functionality Reference:** Existing E2E tests in the `e2e/` directory (e.g., `e2e/people.spec.ts`).

**Step 3.3: User Documentation/Guide Update (If applicable)**
*   **Task:** Update any user-facing guides or internal documentation.
*   **Action:** Briefly explain the new fields and how weighted amount is calculated. 