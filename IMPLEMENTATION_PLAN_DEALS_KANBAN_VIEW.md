# Implementation Plan: Deals Kanban View

**Feature ID:** DEALS-KAN-001
**Status:** Planning
**Priority:** High
**Reporter:** User Request
**Assignee:** TBD

## 1. Overview

This plan outlines the steps to implement a Kanban board view for the Deals page. This view will allow users to visualize deals across different stages of a selected pipeline and manually drag-and-drop deal cards between these stages to update their status. A foundational step will be to enhance stages with a `stage_type` to clearly define open, won, and lost states, which is critical for Kanban functionality.

## 2. Goals

*   Enhance Stages with a `stage_type` property ('OPEN', 'WON', 'LOST') to define their role in the deal lifecycle.
*   Provide an alternative "Kanban" view on the Deals page, switchable from the existing table view.
*   Display stages of a selected pipeline as columns, respecting their `stage_type`.
*   Display deal cards within their respective stage columns.
*   Allow users to drag deal cards from one stage column to another.
*   Update the deal's `stage_id` in the backend upon a successful drag-and-drop.
*   Automatically adjust `deal_probability` based on the `stage_type` of the target stage (1.0 for 'WON', 0.0 for 'LOST').
*   Persist the user's view preference (table vs. Kanban) locally (e.g., `localStorage`).
*   Ensure a smooth user experience with optimistic updates and clear visual feedback.

## 3. Key Components & Technologies

*   **Database (Supabase/PostgreSQL):**
    *   Migration to add `stage_type` to `stages` table.
*   **Frontend:**
    *   React, Chakra UI, Zustand
    *   Drag-and-Drop Library (e.g., `@hello-pangea/dnd` or `dnd-kit`)
    *   Existing/Updated React components:
        *   `CreateStageModal.tsx`, `EditStageModal.tsx` (to manage `stage_type`)
    *   New React components:
        *   `DealsKanbanView.tsx`
        *   `PipelineSelectorDropdown.tsx`
        *   `StageColumn.tsx`
        *   `DealCardKanban.tsx`
        *   View switcher UI
*   **Backend (GraphQL API & Services):**
    *   Updates to `stageService.ts` for `stage_type`.
    *   Updates to GraphQL schema for `Stage` type and inputs.
    *   Existing `updateDeal` mutation.
*   **State Management (Zustand):**
    *   Store selected pipeline for the Kanban view.
    *   Store deals data, potentially re-structured or filtered for Kanban display.
    *   Manage loading/error states for Kanban-specific operations.
    *   Handle optimistic updates for deal stage changes.

## 4. Detailed Implementation Steps

### Phase 1: Foundational Stage Enhancements (Terminal Stage Properties)

1.  **Database Migration for `stage_type`:**
    *   **Task:** Add a `stage_type` column to the `public.stages` table.
    *   **Details:**
        *   Column type: `TEXT` or an `ENUM` if preferred (`CREATE TYPE stage_category AS ENUM ('OPEN', 'WON', 'LOST');`). `TEXT` with a `CHECK` constraint is also viable.
        *   Allowed values: 'OPEN', 'WON', 'LOST'. (Consider 'ON_HOLD' if needed later, but start with these three).
        *   Default value: 'OPEN'.
        *   `NOT NULL`.
    *   **Acceptance:** Migration script created and successfully applied. `stages` table has the new `stage_type` column with constraints.

2.  **Update Backend Services (`stageService.ts`):**
    *   **Task:** Modify `createStage` and `updateStage` functions to handle the `stage_type` property.
    *   **Details:**
        *   `createStage`: Accept `stage_type` in input. If `stage_type` is 'WON', set `deal_probability` to 1.0. If 'LOST', set to 0.0. If 'OPEN', use provided `deal_probability` or default.
        *   `updateStage`: Accept `stage_type` in input. Apply similar logic for `deal_probability` based on the new `stage_type`.
    *   **Acceptance:** Service functions correctly process and set `stage_type` and adjust `deal_probability` accordingly.

3.  **Update GraphQL Schema & Resolvers:**
    *   **Task:** Reflect `stage_type` in the GraphQL `Stage` type, `CreateStageInput`, and `UpdateStageInput`.
    *   **Details:**
        *   `Stage` type: Add `stage_type: String!`.
        *   `CreateStageInput`: Add `stage_type: String` (optional, defaults to 'OPEN' in service or DB).
        *   `UpdateStageInput`: Add `stage_type: String`.
        *   Update resolvers for `createStage` and `updateStage` to pass `stage_type` to service layer and return it.
    *   **Acceptance:** GraphQL schema is updated. Mutations correctly handle and return `stage_type`.

4.  **Update Frontend Modals (`CreateStageModal.tsx`, `EditStageModal.tsx`):**
    *   **Task:** Allow users to select/edit the `stage_type`.
    *   **Details:**
        *   Add a `Select` dropdown for `stage_type` ('Open', 'Won', 'Lost').
        *   When 'Won' or 'Lost' is selected, the `deal_probability` input field could become disabled and automatically set to 100% or 0% respectively.
        *   Ensure the selected `stage_type` is included in the data sent to `createStage`/`updateStage` mutations.
    *   **Acceptance:** Modals allow setting `stage_type`. `deal_probability` field behaves correctly based on `stage_type` selection.

### Phase 2: Backend & State Preparation for Kanban (Minimal Changes Expected beyond Phase 1)

1.  **Verify `updateDeal` Mutation:**
    *   **Task:** Ensure the existing `updateDeal` GraphQL mutation and `dealService.updateDeal` can handle `stage_id` updates and correctly trigger deal history.
    *   **Details:** This should already be functional. Pay attention to how `deal_probability` on the deal might be affected if it's now primarily driven by the target stage's `stage_type` and `deal_probability`. The `updateDeal` service might need to look up the target stage's properties.
    *   **Acceptance:** Manual test of updating a deal's stage shows correct data persistence, history logging, and appropriate `deal_probability` update on the deal if dictated by the new stage's type/probability.

2.  **Zustand Store Enhancements (`useAppStore.ts` or `useDealsStore.ts`):**
    *   **Task:** Add state and actions for the Kanban view.
    *   **State:**
        *   `selectedKanbanPipelineId: string | null`
        *   `dealsViewMode: 'table' | 'kanban'` (default to 'table')
    *   **Actions:**
        *   `setSelectedKanbanPipelineId(pipelineId: string)`
        *   `setDealsViewMode(mode: 'table' | 'kanban')`
        *   Ensure `fetchDeals` and `fetchStages` (from respective stores) are available and provide necessary data.
    *   **Persistence:** Implement saving and loading `dealsViewMode` from `localStorage`.
    *   **Acceptance:** State changes are reflected, and view mode persists across sessions.

### Phase 3: Frontend - Kanban View Structure & Components

1.  **View Switcher UI (`DealsPage.tsx`):**
    *   **Task:** Add UI controls (e.g., SegmentedControl, ButtonGroup) to `DealsPage.tsx` to allow users to toggle between "Table" and "Kanban" views.
    *   **Details:** This control will update the `dealsViewMode` in the Zustand store.
    *   **Acceptance:** UI control exists and correctly switches the view mode in the store. `DealsPage.tsx` conditionally renders either the existing table or the new `DealsKanbanView` based on this state.

2.  **Pipeline Selector for Kanban View (`DealsKanbanView.tsx` / `PipelineSelectorDropdown.tsx`):**
    *   **Task:** Create or integrate a dropdown component to select the active pipeline for the Kanban board.
    *   **Details:**
        *   Fetches and displays available pipelines (likely from `useAppStore` or `usePipelinesStore`).
        *   On selection, updates `selectedKanbanPipelineId` in the Zustand store.
        *   Defaults to the first available pipeline if none is selected.
    *   **Acceptance:** Dropdown populates with pipelines, selection updates the store.

3.  **Main Kanban Container (`DealsKanbanView.tsx`):**
    *   **Task:** Develop the main component that will host the Kanban board.
    *   **Details:**
        *   Fetches/selects stages for the `selectedKanbanPipelineId` from the store.
        *   Fetches/selects deals and groups them by `stage_id` for the `selectedKanbanPipelineId`.
        *   Sets up the main drag-and-drop context provider from the chosen library (e.g., `<DragDropContext>`).
        *   Renders `StageColumn.tsx` components for each stage.
    *   **Acceptance:** Basic structure renders with stage columns based on selected pipeline.

4.  **Stage Column Component (`StageColumn.tsx`):**
    *   **Task:** Create a component to represent a single column (stage) in the Kanban board.
    *   **Details:**
        *   Receives `stage` data and the list of `deals` belonging to that stage as props.
        *   Uses the chosen D&D library's `Droppable` component to define the column as a drop target.
        *   Renders a header with the stage name and potentially a deal count or total amount.
        *   Maps over its deals and renders `DealCardKanban.tsx` for each.
    *   **Acceptance:** Columns are displayed with stage names. Deals for each stage are listed (statically for now).

5.  **Deal Card Kanban Component (`DealCardKanban.tsx`):**
    *   **Task:** Create a component to display a deal as a draggable card.
    *   **Details:**
        *   Receives `deal` data as props.
        *   Uses the chosen D&D library's `Draggable` component to make the card draggable.
        *   Displays key deal information (name, amount, perhaps person/organization).
        *   Styled appropriately for a Kanban card.
    *   **Acceptance:** Deal cards are displayed within their stage columns and are visually distinct.

### Phase 4: Drag-and-Drop Logic & Backend Integration

1.  **Implement `onDragEnd` Handler (`DealsKanbanView.tsx`):**
    *   **Task:** Implement the core drag-and-drop logic.
    *   **Details:**
        *   This function is provided to the D&D context (`<DragDropContext onDragEnd={this.onDragEnd}>`).
        *   It's called when a drag operation concludes.
        *   **Logic:**
            *   Check if the deal was dropped outside a valid column (do nothing).
            *   Check if the deal was dropped in the same position (do nothing).
            *   Identify the source stage, destination stage, and the dragged deal.
            *   **Optimistic Update (Frontend):**
                *   Immediately update the Zustand store to reflect the deal moving to the new stage. This provides a fast UX.
                *   The UI should re-render based on this optimistic state.
            *   **Backend Update (Async):**
                *   Call the `updateDeal` mutation with the deal's ID and the new `stage_id`.
                *   **On Success:** The optimistic update is now confirmed. Potentially re-fetch or ensure store consistency if needed (though often not necessary if the mutation returns the updated deal and the store handles it).
                *   **On Failure:**
                    *   Revert the optimistic update in the Zustand store to move the deal card back to its original stage.
                    *   Display an error toast/message to the user.
    *   **Acceptance:** Deals can be dragged between columns. The UI optimistically updates. The backend `updateDeal` mutation is called with correct `dealId` and new `stage_id`. Error handling and rollback work.

2.  **Visual Feedback During Drag:**
    *   **Task:** Ensure the D&D library provides good visual cues during drag (e.g., card placeholder, highlighting drop zones).
    *   **Details:** This is often configurable within the chosen D&D library.
    *   **Acceptance:** Drag operations are visually clear and intuitive.

### Phase 5: Styling, Refinements, and Testing

1.  **Styling and UX Refinements:**
    *   **Task:** Ensure the Kanban board is visually appealing, responsive, and user-friendly.
    *   **Details:**
        *   Use Chakra UI components and styling props.
        *   Ensure columns and cards are well-spaced and readable.
        *   Consider loading states for pipeline/deal fetching.
        *   Empty states for when a pipeline has no stages or a stage has no deals.
        *   Ensure accessibility.
    *   **Acceptance:** The Kanban view is polished and provides a good user experience.

2.  **Error Handling:**
    *   **Task:** Implement comprehensive error handling.
    *   **Details:**
        *   Errors fetching pipelines, stages, or deals.
        *   Errors during the `updateDeal` mutation (already handled by rollback, but ensure clear user feedback).
    *   **Acceptance:** Users are informed of errors gracefully.

3.  **Testing:**
    *   **Task:** Write unit, integration, and potentially E2E tests.
    *   **Unit/Integration (Vitest):**
        *   Test Zustand store logic for Kanban view.
        *   Test individual components (`StageColumn`, `DealCardKanban`) for rendering and basic props.
        *   Test the `onDragEnd` logic (mocking API calls).
    *   **E2E (Playwright):**
        *   Test switching to Kanban view.
        *   Test selecting a pipeline.
        *   Test dragging a deal to a new stage and verifying the update (either via UI change or by checking data after refresh/re-navigation if necessary).
    *   **Acceptance:** Feature is well-tested.

## 5. Non-Goals (Potential Future Enhancements)

*   Dragging stages to reorder them.
*   Adding new deals directly from the Kanban view (unless trivial to include).
*   Complex filtering or sorting within the Kanban view beyond pipeline selection.
*   Real-time updates from other users collaborating on the same Kanban board (requires WebSocket or similar).
*   Summaries per stage (e.g., total deal amount in stage). This could be a V2.

## 6. Open Questions & Considerations

*   **Choice of D&D Library:** `@hello-pangea/dnd` is a strong candidate due to its similarity to the original `react-beautiful-dnd` and active maintenance. `dnd-kit` offers more flexibility but might have a steeper learning curve. Decision needed early.
*   **Performance:** For pipelines with many stages or deals, performance of rendering and drag operations needs to be monitored. Virtualization could be a future optimization if needed.
*   **Touch Device Support:** Ensure the chosen D&D library has good support for touch devices.
*   **Consolidating Deal Fetching Logic:** Review if existing deal fetching logic in the store can be efficiently reused/adapted for the Kanban view's needs (grouping by stage for a specific pipeline).

## 7. Estimated Effort (Rough)

*   Phase 1 (Terminal Stage Properties): 1.5 - 2.5 days (DB, GQL, Service, Modals)
*   Phase 2 (Kanban Backend/State Prep): 0.5 - 1 day
*   Phase 3 (Kanban Frontend Structure): 2 - 3 days
*   Phase 4 (Kanban D&D Logic): 2 - 3 days
*   Phase 5 (Kanban Styling & Testing): 1 - 2 days
*   **Total:** Approximately 7 - 11.5 days (Adjusted for the new Phase 1)

## 8. Definition of Done

*   All goals listed in Section 2 are met, including `stage_type` implementation.
*   All tasks in Section 4 (including new Phase 1) are completed.
*   The feature is reviewed, tested, and merged to the main branch.
*   Documentation (e.g., `