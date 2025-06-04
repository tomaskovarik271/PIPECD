# User Manual: WFM-Powered Sales Kanban

## 1. Introduction

Welcome to the new Sales Kanban board, now powered by our flexible Workflow Management (WFM) system! This change allows for more dynamic and customizable sales processes. Instead of fixed pipelines and stages, your deal progression is now managed by configurable WFM Workflows.

This manual will guide you through using the new Sales Kanban board.

## 2. Accessing the Sales Kanban

You can access the Sales Kanban board from the main navigation menu, typically under a "Deals" or "Sales" section. It will be the primary view for managing your sales opportunities.

## 3. Understanding the Kanban View

The Kanban board provides a visual overview of your deals, organized by their current step in the sales workflow.

### 3.1 Columns as Workflow Steps

*   **Dynamic Columns:** Each column on the Kanban board represents a step in your organization's currently active "Sales Deal" workflow (e.g., "Lead In", "Opportunity Scoping", "Contract Negotiation", "Closed Won", "Closed Lost").
*   **Workflow Driven:** The columns are determined by the `WFMWorkflowSteps` defined in the WFM "Sales Deal" `WFMProjectType`'s default workflow.
*   **Step Order:** Columns are displayed in the order defined in the workflow.

### 3.2 Deal Cards

Each card on the board represents a deal. Key information displayed on a deal card includes:

*   **Deal Name:** The name of the deal.
*   **Deal Amount:** The potential or actual value of the deal.
*   **Expected Close Date:** The anticipated date for closing the deal.
*   **Current WFM Status:** Derived from the WFM step the deal is currently in.
*   **(Coming Soon) Deal Probability:** The likelihood of winning the deal, often influenced by the current WFM step.
*   Other relevant icons or quick indicators.

## 4. Moving Deals (Updating WFM Progress)

You can move deals between columns by dragging and dropping them.

*   **Drag & Drop:** Click and hold a deal card, drag it to the desired column (target WFM step), and release.
*   **Behind the Scenes:** When you move a deal, the system attempts to update its `WFMProject` to the new `WFMWorkflowStep`.

## 5. How Transitions Work (Workflow Logic)

The WFM system enforces predefined rules about how deals can move between steps. These are called "Workflow Transitions."

*   **Valid Moves:** If a transition from the deal's current step to the target step is allowed in the underlying "Sales Deal" workflow, the deal will move, and its `currentWfmStep` (and thus `currentWfmStatus`) will be updated. You'll see a success message.
*   **Invalid Moves:** If the workflow does not permit a direct transition from the current step to the target step:
    *   The deal will **not** move on the Kanban board.
    *   An error message will appear, explaining that the transition is not allowed.
    *   The message will also list the valid next steps available from the deal's current step. For example:
        > "Transition from 'Proposal Development' to 'Opportunity Scoping' is not allowed. Allowed next steps from 'Proposal Development' are: Proposal Sent, Closed Lost."
*   **Why Transitions?** This ensures that deals follow a structured process, maintaining data integrity and adherence to your sales methodology.

## 6. Configuring Sales Workflows (Admin)

The steps, their order, and the allowed transitions that you see on the Sales Kanban board are all configured within the WFM administration section.

*   **WFM Admin Area:** Users with appropriate permissions can access the WFM admin UIs to:
    *   Define `WFMStatus` records (e.g., "Lead", "Negotiation").
    *   Create and edit `WFMWorkflow` definitions (e.g., "Standard Sales Process").
    *   Manage `WFMWorkflowSteps` within a workflow, including setting their order, marking initial/final steps, and adding metadata (like default deal probabilities).
    *   Define `WFMWorkflowTransitions` to specify which steps can follow others.
    *   Configure `WFMProjectTypes` like "Sales Deal" and assign them a default workflow.

If you need changes to the sales process (e.g., adding a new stage, modifying allowed movements), please contact your system administrator or the team responsible for WFM configuration.

---

We hope this new WFM-powered Sales Kanban enhances your productivity and provides a more flexible way to manage your sales deals! 