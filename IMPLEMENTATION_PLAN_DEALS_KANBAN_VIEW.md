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
    *   **Status:** Done (Migration script `supabase/migrations/20250513195309_add_stage_type_to_stages.sql` created and applied locally via `supabase db reset`).

2.  **Update Backend Services (`stageService.ts`):**
    *   **Task:** Modify `createStage` and `updateStage` functions to handle the `stage_type` property.
    *   **Details:**
        *   `createStage`: Accept `stage_type` in input. If `stage_type` is 'WON', set `deal_probability` to 1.0. If 'LOST', set to 0.0. If 'OPEN', use provided `deal_probability` or default.
        *   `updateStage`: Accept `stage_type` in input. Apply similar logic for `deal_probability` based on the new `stage_type`.
    *   **Acceptance:** Service functions correctly process and set `stage_type` and adjust `deal_probability` accordingly.
    *   **Status:** Done

3.  **Update GraphQL Schema & Resolvers:**
    *   **Task:** Reflect `stage_type` in the GraphQL `Stage` type, `CreateStageInput`, and `UpdateStageInput`.
    *   **Details:**
        *   `Stage` type: Add `stage_type: String!`.
        *   `CreateStageInput`: Add `stage_type: String` (optional, defaults to 'OPEN' in service or DB).
        *   `UpdateStageInput`: Add `stage_type: String`.
        *   Update resolvers for `createStage` and `updateStage` to pass `stage_type` to service layer and return it.
    *   **Acceptance:** GraphQL schema is updated. Mutations correctly handle and return `stage_type`.
    *   **Status:** Done

4.  **Update Frontend Modals (`CreateStageModal.tsx`, `EditStageModal.tsx`):**
    *   **Task:** Allow users to select/edit the `stage_type`.
    *   **Details:**
        *   Add a `Select` dropdown for `stage_type` ('Open', 'Won', 'Lost').
        *   When 'Won' or 'Lost' is selected, the `deal_probability` input field could become disabled and automatically set to 100% or 0% respectively.
        *   Ensure the selected `stage_type` is included in the data sent to `createStage`/`updateStage` mutations.
    *   **Acceptance:** Deals can be dragged between columns. The UI optimistically updates. The backend `updateDeal` mutation is called with correct `dealId` and new `stage_id`. Error handling and rollback work. The backend correctly adjusts probability and weighted amount.
    *   **Status:** Done

### Phase 2: Backend & State Preparation for Kanban (Minimal Changes Expected beyond Phase 1)

1.  **Verify `updateDeal` Mutation:**
    *   **Task:** Enhance the existing `updateDeal` GraphQL mutation and `dealService.updateDeal` to correctly handle `stage_id` updates, automatically adjust deal-specific probability, recalculate weighted amount, and trigger deal history accurately.
    *   **Details:**
        *   The `dealService.updateDeal` function, when a `stage_id` is being updated, must:
            1.  Fetch the target stage's properties (specifically `stage_type` and its `deal_probability`).
            2.  Based on the target `stage_type`:
                *   If 'WON': Set the deal's `deal_specific_probability` field to 1.0.
                *   If 'LOST': Set the deal's `deal_specific_probability` field to 0.0.
                *   If 'OPEN': Clear the deal's `deal_specific_probability` field (set to `null`). This allows the deal to inherit the `deal_probability` of the new 'OPEN' stage.
            3.  Recalculate and update the deal's `weighted_amount` based on its `amount` and the new effective probability (which is `deal_specific_probability` if set, otherwise the new stage's `deal_probability`).
            4.  The update to the database should include the new `stage_id`, the adjusted `deal_specific_probability` (or its clearance), and the recalculated `weighted_amount`.
        *   Ensure `deal_history` accurately records all these changes (e.g., `stage_id`, `deal_specific_probability`, `weighted_amount`).
    *   **Acceptance:** Updating a deal's stage (e.g., via Kanban drag) results in:
        *   Correct `stage_id` persistence.
        *   Deal's `deal_specific_probability` is correctly set to 1.0 for 'WON' stages, 0.0 for 'LOST' stages, or cleared for 'OPEN' stages.
        *   Deal's `weighted_amount` is accurately recalculated.
        *   Comprehensive history logging of all modified fields.
    *   **Status:** Done.

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
    *   **Status:** Done.

### Phase 3: Frontend - Kanban View Structure & Components

1.  **View Switcher UI (`DealsPage.tsx`):**
    *   **Task:** Add UI controls (e.g., SegmentedControl, ButtonGroup) to `DealsPage.tsx` to allow users to toggle between "Table" and "Kanban" views.
    *   **Details:** This control will update the `dealsViewMode` in the Zustand store.
    *   **Acceptance:** UI control exists and correctly switches the view mode in the store. `DealsPage.tsx` conditionally renders either the existing table or the new `DealsKanbanView` based on this state.
    *   **Status:** Done.

2.  **Pipeline Selector for Kanban View (`DealsKanbanView.tsx` / `PipelineSelectorDropdown.tsx`):**
    *   **Task:** Create or integrate a dropdown component to select the active pipeline for the Kanban board.
    *   **Details:**
        *   Fetches and displays available pipelines (likely from `useAppStore` or `usePipelinesStore`).
        *   On selection, updates `selectedKanbanPipelineId` in the Zustand store.
        *   Defaults to the first available pipeline if none is selected.
    *   **Acceptance:** Dropdown populates with pipelines, selection updates the store.
    *   **Status:** Done.

3.  **Main Kanban Container (`DealsKanbanView.tsx`):**
    *   **Task:** Develop the main component that will host the Kanban board.
    *   **Details:**
        *   Fetches/selects stages for the `selectedKanbanPipelineId` from the store.
        *   Fetches/selects deals and groups them by `stage_id` for the `selectedKanbanPipelineId`.
        *   Sets up the main drag-and-drop context provider from the chosen library (e.g., `<DragDropContext>`).
        *   Renders `StageColumn.tsx` components for each stage.
    *   **Acceptance:** Basic structure renders with stage columns based on selected pipeline.
    *   **Status:** Done.

4.  **Stage Column Component (`StageColumn.tsx`):**
    *   **Task:** Create a component to represent a single column (stage) in the Kanban board.
    *   **Details:**
        *   Receives `stage` data and the list of `deals` belonging to that stage as props.
        *   Uses the chosen D&D library's `Droppable` component to define the column as a drop target.
        *   Renders a header with the stage name and potentially a deal count or total amount.
        *   Maps over its deals and renders `DealCardKanban.tsx` for each.
    *   **Acceptance:** Columns are displayed with stage names. Deals for each stage are listed.
    *   **Status:** Done.

5.  **Deal Card Kanban Component (`DealCardKanban.tsx`):**
    *   **Task:** Create a component to display a deal as a draggable card.
    *   **Details:**
        *   Receives `deal` data as props.
        *   Uses the chosen D&D library's `Draggable` component to make the card draggable.
        *   Displays key deal information (name, amount, perhaps person/organization).
        *   Styled appropriately for a Kanban card.
    *   **Acceptance:** Deal cards are displayed within their stage columns and are visually distinct.
    *   **Status:** Done.

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
                *   Immediately update the Zustand store to reflect the deal moving to the new stage. This provides a fast UX. The optimistic update should also attempt to reflect the anticipated probability and weighted amount changes on the frontend for immediate visual feedback, if feasible.
                *   The UI should re-render based on this optimistic state.
            *   **Backend Update (Async):**
                *   Call the `updateDeal` mutation with the deal's ID and the new `stage_id`. The backend service (`dealService.updateDeal`) is now responsible for handling adjustments to `deal_specific_probability` and `weighted_amount` based on the new stage's properties (as detailed in Phase 2.1).
                *   **On Success:** The optimistic update is now confirmed. The data returned from the mutation (which includes the updated probability and weighted amount from the backend) should be used to reconcile the Zustand store.
                *   **On Failure:**
                    *   Revert the optimistic update in the Zustand store to move the deal card back to its original stage.
                    *   Display an error toast/message to the user.
    *   **Acceptance:** Deals can be dragged between columns. The UI optimistically updates. The backend `updateDeal` mutation is called with correct `dealId` and new `stage_id`. Error handling and rollback work. The backend correctly adjusts probability and weighted amount.
    *   **Status:** Done

2.  **Visual Feedback During Drag:**
    *   **Task:** Ensure the D&D library provides good visual cues during drag (e.g., card placeholder, highlighting drop zones).
    *   **Details:** This is often configurable within the chosen D&D library.
    *   **Acceptance:** Drag operations are visually clear and intuitive.
    *   **Status:** Done (Handled by `@hello-pangea/dnd` defaults).

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

## 9. User Manual: Deals Kanban View

This guide explains how to use the new Kanban view for managing your deals.

### 9.1 Accessing the Kanban View

1.  Navigate to the **Deals** page from the main sidebar.
2.  On the Deals page, you will see view switcher controls (typically near the top, e.g., "Table" / "Kanban").
3.  Click on **"Kanban"** to switch to the Kanban board interface.
    *   Your preference for Table or Kanban view will be remembered for your next visit to the Deals page.

### 9.2 Selecting a Pipeline

*   Once in the Kanban view, you will see a **Pipeline Selector Dropdown**.
*   The Kanban board displays stages and deals for one pipeline at a time.
*   If you have multiple pipelines, the first pipeline in your list will usually be selected by default, and its stages and deals will load automatically.
*   To view deals from a different pipeline, click the dropdown and select the desired pipeline. The board will update to show the stages and deals for the newly selected pipeline.

### 9.3 Understanding the Kanban Board

*   **Stage Columns:** Each column on the board represents a stage in the selected pipeline (e.g., "Prospecting," "Proposal Sent," "Negotiation").
*   **Deal Cards:** Deals are represented as cards within their respective stage columns. Each card typically displays key information like the deal's name and amount.
*   **Stage Types:** Stages are categorized as 'OPEN', 'WON', or 'LOST'. This influences how deal probabilities are handled.
    *   'WON' stages typically represent a 100% probability.
    *   'LOST' stages typically represent a 0% probability.
    *   'OPEN' stages can have a default probability, or you can set a specific probability for a deal within that stage.

### 9.4 Moving Deals (Updating Stage)

The primary way to update a deal's stage in the Kanban view is by dragging and dropping its card:

1.  **Click and hold** on a deal card you wish to move.
2.  **Drag** the card to the desired stage column.
3.  **Release** the mouse button to drop the deal into the new stage.

**What happens when you move a deal:**

*   **Immediate UI Update:** The deal card will visually move to the new stage column instantly.
*   **Backend Update:** The system will automatically:
    *   Update the deal's `stage_id` to reflect its new position.
    *   Adjust the deal's probability based on the type of the new stage:
        *   If moved to a 'WON' stage, probability becomes 100%.
        *   If moved to an 'LOST' stage, probability becomes 0%.
        *   If moved to an 'OPEN' stage, any deal-specific probability override is cleared, and the deal will inherit the default probability of that 'OPEN' stage (if one is set on the stage).
    *   Recalculate the deal's `weighted_amount` based on its amount and the new effective probability.
    *   Record these changes in the deal's history.
*   **Error Handling:** If there's an issue saving the change to the backend, the deal card will typically revert to its original position, and an error message may be displayed.

### 9.5 Creating and Editing Deals

*   **Creating Deals:** Use the "New Deal" button (usually available on the main Deals page layout) to open the deal creation modal. You can select the pipeline and initial stage for the new deal here.
*   **Editing Deals:**
    *   You can typically edit deals by clicking on them (either from the Kanban card if supported, or by switching to the Table view and using its edit functionality).
    *   When editing a deal, you can change its name, amount, associated person/organization, and its stage/pipeline.
    *   Changes to the stage in the edit modal will also trigger the automatic probability and weighted amount adjustments described above.

### 9.6 Tips for Using Kanban View

*   Use the Kanban view for a quick visual overview of your deal flow within a specific pipeline.
*   Drag and drop is a fast way to progress deals through your sales process.
*   Pay attention to how deal probabilities and weighted amounts update automatically when you move deals to 'WON', 'LOST', or different 'OPEN' stages. This helps keep your forecasting accurate.