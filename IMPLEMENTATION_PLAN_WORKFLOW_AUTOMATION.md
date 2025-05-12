# Implementation Plan: Workflow Automation

## Business Functionality & Value

**What is Workflow Automation?**

Workflow automation enables users to automate repetitive, manual CRM tasks by defining rules that connect triggers (events), conditions, and actions. For example, a user can set up an automation such that "When a deal is moved to the 'Negotiation' stage, automatically create a follow-up activity for the deal owner." This reduces manual effort, ensures consistency, and helps users focus on high-value work.

**Key Business Benefits:**
- **Efficiency:** Automates routine tasks, saving time and reducing human error.
- **Consistency:** Ensures that important steps (like follow-ups or notifications) are never missed.
- **Responsiveness:** Enables real-time reactions to business events (e.g., sending a welcome email when a new contact is added).
- **Scalability:** Allows teams to handle more deals and contacts without increasing manual workload.
- **User Empowerment:** Users can tailor automations to their unique processes without developer intervention.

**Example Use Cases:**
- Automatically assign a task when a deal reaches a certain stage.
- Send a notification or email when a high-value deal is created.
- Create a follow-up activity if a deal has been inactive for a set period.
- Alert a manager when a deal is marked as lost.
- Trigger a webhook to integrate with external systems when a contact is updated.

---

**Feature Goal:**  
Enable users to automate repetitive CRM tasks by configuring workflows (triggers, conditions, actions) via a user-friendly interface. Example: "When a deal is moved to 'Negotiation', assign a follow-up activity to the owner."

---

## Phase 1: Backend Foundation & Database Changes

### 0: Mental Validation & Dry Run
* **Action:** Before writing code or running migrations, perform a step-by-step mental walkthrough of all planned changes in this phase. Validate assumptions, simulate the process, and update the plan if any new risks or questions arise.

### 1.1: Database Migrations

* **Action 1.1.1:** Create `workflow_automations` table.
    * **Migration:** `supabase migrations new create_workflow_automations_table`
    * **SQL Definition:**
      ```sql
      CREATE TABLE public.workflow_automations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        trigger JSONB NOT NULL,      -- e.g., { "type": "deal_stage_changed", "stage_id": "..." }
        condition JSONB NULL,        -- e.g., { "field": "amount", "operator": ">", "value": 1000 }
        action JSONB NOT NULL,       -- e.g., { "type": "create_activity", "template_id": "...", ... }
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX idx_workflow_automations_user_id ON public.workflow_automations(user_id);
      CREATE INDEX idx_workflow_automations_is_active ON public.workflow_automations(is_active);
      ALTER TABLE public.workflow_automations ENABLE ROW LEVEL SECURITY;
      ```
    * **Status:** Not Started

* **Action 1.1.2:** Add RLS policies.
    * Only allow users to manage their own automations.
    * **Status:** Not Started

* **Action 1.1.3:** Apply migrations with verification steps.
    * **Status:** Not Started

### 1.1R: Risk Mitigation for Database
* Migration verification checklist (no empty files, correct RLS, rollback scripts).
* Use JSONB for flexibility, but document schema for triggers/actions.
* Plan for future schema evolution (e.g., versioning).

---

### 1.2: Automation Engine (Backend Service)

* **Action 1.2.1:** Implement a workflow automation engine as a service or module.
    * Listens for entity events (e.g., deal updated, activity created).
    * Evaluates triggers and conditions for all active automations.
    * Executes actions if conditions are met.
    * **Status:** Not Started

* **Action 1.2.2:** Integrate with event bus (e.g., Inngest, or custom event system).
    * Ensure all relevant entity changes emit events.
    * **Status:** Not Started

* **Action 1.2.3:** Implement action handlers (e.g., create activity, send email).
    * **Status:** Not Started

### 1.2R: Risk Mitigation for Automation Engine
* Ensure idempotency (avoid duplicate actions).
* Add logging for all automation executions and failures.
* Monitor for performance bottlenecks (e.g., many automations on a single event).

---

### 1.3: GraphQL Schema & API

* **Action 1.3.1:** Define GraphQL types and queries/mutations for automations.
    ```graphql
    type WorkflowAutomation {
      id: ID!
      name: String!
      isActive: Boolean!
      trigger: JSON!
      condition: JSON
      action: JSON!
      createdAt: DateTime!
      updatedAt: DateTime!
    }

    extend type Query {
      myWorkflowAutomations: [WorkflowAutomation!]!
      workflowAutomation(id: ID!): WorkflowAutomation
    }

    input WorkflowAutomationInput {
      name: String!
      trigger: JSON!
      condition: JSON
      action: JSON!
    }

    extend type Mutation {
      createWorkflowAutomation(input: WorkflowAutomationInput!): WorkflowAutomation!
      updateWorkflowAutomation(id: ID!, input: WorkflowAutomationInput!): WorkflowAutomation!
      deactivateWorkflowAutomation(id: ID!): Boolean!
      reactivateWorkflowAutomation(id: ID!): Boolean!
      deleteWorkflowAutomation(id: ID!): Boolean!
    }
    ```
    * **Status:** Not Started

* **Action 1.3.2:** Implement resolvers with proper authorization.
    * **Status:** Not Started

### 1.3R: Risk Mitigation for API
* Validate JSON structure for triggers/actions on input.
* Ensure users can only access their own automations.

---

## Phase 2: Frontend - Automation Management UI

### 0: Mental Validation & Dry Run
* **Action:** Before implementing UI, mentally simulate the user journey for creating, editing, and troubleshooting automations.

### 2.1: Automation Settings Area

* **Action 2.1.1:** Add a new "Automations" or "Workflow Automation" section in settings.
    * Route: `/settings/automations` or similar.
    * **Status:** Not Started

* **Action 2.1.2:** List user's automations with status, trigger, and action summary.
    * **Status:** Not Started

* **Action 2.1.3:** Add create/edit form for automations.
    * Fields: Name, Trigger (dropdown + config), Condition (optional), Action (dropdown + config).
    * **Status:** Not Started

* **Action 2.1.4:** Add ability to activate/deactivate, delete, and view logs for each automation.
    * **Status:** Not Started

### 2.1R: Risk Mitigation for UI
* Validate all user input before saving.
* Provide clear error messages for invalid configurations.
* Show logs/history for troubleshooting.

---

### 2.2: Visual Workflow Builder (Future/Advanced)

* **Action:** (Optional, for later phase) Implement a drag-and-drop or visual builder for workflows.
    * **Status:** Not Started

---

## Phase 3: Automation Execution & Monitoring

### 0: Mental Validation & Dry Run
* **Action:** Before enabling automations for users, mentally simulate event flows, error cases, and user troubleshooting.

### 3.1: Execution Engine

* **Action 3.1.1:** Ensure all entity changes emit events.
* **Action 3.1.2:** Engine evaluates all active automations for each event.
* **Action 3.1.3:** Actions are executed, and results are logged.
* **Status:** Not Started

### 3.2: Logging & History

* **Action 3.2.1:** Store execution logs for each automation (success/failure, timestamp, details).
* **Action 3.2.2:** Expose logs in the UI for user review.
* **Status:** Not Started

### 3.2R: Risk Mitigation for Execution
* Add alerting for repeated failures.
* Allow users to disable automations that are failing.

---

## Phase 4: Advanced Features & Refinements

### 0: Mental Validation & Dry Run
* **Action:** Before adding advanced features, mentally simulate their impact on performance, security, and user experience.

### 4.1: Predefined Templates

* **Action:** Provide a library of common automation templates for quick setup.
* **Status:** Not Started

### 4.2: Advanced Conditions

* **Action:** Support complex conditions (AND/OR, multiple fields).
* **Status:** Not Started

### 4.3: Permissions

* **Action:** Allow workspace admins to manage automations for teams.
* **Status:** Not Started

### 4.4: Performance & Scalability

* **Action:** Monitor and optimize for large numbers of automations/events.
* **Status:** Not Started

---

## Implementation Checklist & Timeline

### Phase 1: Backend (Estimated: 2–3 weeks)
- [ ] **Mental Validation & Dry Run**
- [ ] Database migrations
- [ ] Automation engine implementation
- [ ] Event integration
- [ ] GraphQL schema & resolvers
- [ ] Testing & validation

### Phase 2: UI (Estimated: 1–2 weeks)
- [ ] **Mental Validation & Dry Run**
- [ ] Automation settings area
- [ ] Create/edit form
- [ ] Logs/history UI
- [ ] Testing

### Phase 3: Execution & Monitoring (Estimated: 1 week)
- [ ] **Mental Validation & Dry Run**
- [ ] Execution engine
- [ ] Logging/history
- [ ] User alerting

### Phase 4: Refinements (Estimated: 1+ weeks)
- [ ] **Mental Validation & Dry Run**
- [ ] Templates
- [ ] Advanced conditions
- [ ] Permissions
- [ ] Performance optimization

---

**This plan provides a robust, phased roadmap for implementing workflow automation, with a strong focus on flexibility, user experience, and risk mitigation.** 