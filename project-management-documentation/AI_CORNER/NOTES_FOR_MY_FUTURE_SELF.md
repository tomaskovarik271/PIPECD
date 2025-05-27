**Refactoring Session (Post-"Deal Assignment" Feature):**

**Key Backend Changes:**
*   `dealCrud.ts`: Improved type safety for deal probability calculations.
*   GraphQL `deal.ts` resolver for `Deal.weighted_amount`: Major refactor - now async, dynamically calculates based on `deal_specific_probability` or WFM step metadata (`outcome_type: "OPEN"` is crucial). Fixed RLS issues for `Deal.createdBy`/`assignedToUser` using `supabaseAdmin`.
*   GraphQL `dealMutations.ts`: Reviewed and refined permissions for `create/update/deleteDeal`.
*   WFM Step Metadata: Ensured "open" steps have `outcome_type: "OPEN"`.

**Key Frontend Changes:**
*   `useDealsStore.ts`: Introduced GraphQL fragments (e.g., `DEAL_CORE_FIELDS_FRAGMENT`). `updateDeal` action now returns `{ deal, error }` for better UI feedback.
*   `EditDealModal.tsx`: Updated to handle new `updateDeal` return, improved "Assign To" dropdown logic (permissions, `useMemo`).
*   `Sidebar.tsx`: Conditional rendering of "Custom Fields" based on permissions.
*   Kanban components: Optimized with `React.memo`.
*   General: `console.log` cleanup, `App.tsx` auth listener fix. Several "TODOs" remain.

**Overall:** Focused on type safety, permission consistency, dynamic data calculation (weighted amount), and frontend reactivity/UX for deal operations and assignments.
