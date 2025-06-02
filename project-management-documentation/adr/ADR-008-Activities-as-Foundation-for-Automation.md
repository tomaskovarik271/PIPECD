# ADR-008: Activities as a Foundation for Automation

*   **Date**: {{TODAY}}
*   **Status**: Phase 1 In Progress (First automation implemented)

## Context and Problem Statement

Our CRM is evolving with advanced Workflow Management (WFM) and robust Activity tracking. To further enhance productivity, reduce manual effort, and ensure process consistency, there is a need for an automation layer. Users should be able to define rules that trigger actions based on events related to Deals and Activities. The current system lacks a dedicated automation engine.

This ADR explores how the existing "Activities" entity, in conjunction with the WFM system, can serve as the foundational layer for these automations, and outlines the role of system vs. human tasks.

**Note on Activity Reusability**: The core "Activity" entity (type, subject, due date, etc.) is inherently generic. With recent enhancements, activities now include `assigned_to_user_id` and `is_system_activity` fields, allowing them to function effectively as assignable tasks, whether user-created or system-generated. This strengthens their role as a foundational element. For broader reusability across future domains (e.g., Projects, Support Tickets), a polymorphic association model (linking activities to a `parent_entity_id` and `parent_entity_type`) would be a future architectural consideration. For the initial phases of automation outlined in this ADR, the current linking mechanism, augmented by assignability, is sufficient. This ADR does not mandate an immediate shift to polymorphic activities, but it is a related consideration for long-term platform architecture.

## Decision Drivers

*   **Efficiency**: Reduce repetitive manual tasks for users.
*   **Consistency**: Ensure standardized processes are followed.
*   **Proactivity**: Enable timely follow-ups and task generation.
*   **Leverage Existing Structures**: Utilize current WFM and Activity features as building blocks.
*   **Scalability**: Design a system that can grow from simple to complex automations.
*   **User Experience**: Provide clear visibility into automated actions and their triggers.

## Considered Options

1.  **Build a Full-Fledged Generic Automation Engine from Scratch Now**: Involves creating a complex UI for rule definition, a sophisticated trigger evaluation mechanism, and an extensive action execution engine immediately.
2.  **No Automation Layer**: Keep all tasks manual, relying solely on user discipline and WFM guidance.
3.  **Phased Approach: Activities & WFM as Core, Evolving to a Rule Engine**: Start by enabling specific, high-value automations triggered by Activity and WFM events, potentially hardcoded or managed via a simple internal mechanism. Gradually build out a more generic rule engine and UI based on learned needs. This could leverage event-driven architecture (e.g., using Inngest).

## Decision Outcome

**Chosen Option**: Option 3 - Phased Approach: Activities & WFM as Core, Evolving to a Rule Engine.

This approach allows us to deliver value incrementally, validate automation concepts with real-world usage, and build a more robust and tailored engine over time. Activities (creation, completion, due dates, **assignment**) and WFM transitions (stage changes) will be the primary triggers.

### How Activities and WFM Serve as a Foundation

*   **WFM for Process Structure**: Defines high-level stages and valid transitions.
*   **Activities for Granular Actions**: Represent specific tasks, events, and communications within WFM stages or triggered by WFM events.
*   **Events as Triggers**: 
    *   Activity Created (e.g., of a certain type)
    *   Activity Completed
    *   Activity Due Date Approaching/Passed
    *   Deal WFM Stage Changed
*   **Actions Performed by Automation**: 
    *   Create new Activities (e.g., follow-up tasks).
    *   Update Activities (e.g., mark as done, change due date).
    *   Update Deals (e.g., change stage, update custom fields).
    *   Send Notifications (internal).
*   **System-Generated Activities/Tasks**: Automated tasks to ensure consistency, enforce processes, and reduce manual entry. Example: Upon a deal being assigned, the system creates a "Welcome & Review" task for the assignee, including `assigned_to_user_id` and `is_system_activity = true`.
*   **Human-Driven Activities/Tasks**: Tasks requiring human judgment. Users can create activities and (now implicitly or explicitly in the future) assign them.

### System vs. Human Tasks

*   **System-Generated Activities**: Automated reminders for due dates, notifications for new assignments, and potentially validation checks (e.g., ensuring a prerequisite task is done before allowing a WFM stage change).
*   **Human-Driven Activities**: Tasks requiring human judgment, creativity, and relationship building. Example: A sales rep manually schedules a "Strategy Meeting" after an initial consultation.
*   **System Support for Human Tasks**: Automated reminders for due dates, notifications for new assignments, and potentially validation checks (e.g., ensuring a prerequisite task is done before allowing a WFM stage change).

## Phased Implementation Plan

1.  **Phase 1: Foundational Automations (Leveraging Inngest/Event-Driven Approach)**
    *   **Implemented**:
        *   Established a `system_user_id` for attributing automated actions.
        *   Enhanced `Activities` with `assigned_to_user_id` and `is_system_activity` fields and updated RLS policies.
        *   Implemented the "Welcome & Review" task automation: When a deal is assigned, an Inngest function (`createDealAssignmentTask`) creates a system task (Activity) for the assignee. This involved:
            *   Publishing `crm/deal.assigned` events from `dealService`.
            *   Updating GraphQL schema, resolvers, and frontend components to support and display assigned system tasks.
    *   **Next within Phase 1**:
        *   Identify and implement 1-2 more high-value, common automations (e.g., follow-up task on demo completion, task creation on a specific WFM stage change).
        *   Continue to refine event publishing as needed.
2.  **Phase 2: Basic Internal Rule Definition & Processing**
    *   Design and implement database tables for storing simple automation rules (trigger type, conditions, action type, parameters).
    *   Develop an internal mechanism or simple admin UI for managing these rules.
    *   Enhance the event processing mechanism to evaluate these stored rules.
3.  **Phase 3: User-Facing Automation Rule Builder & Expanded Capabilities**
    *   Develop an intuitive UI for end-users (likely admins initially) to create and manage their own automation rules.
    *   Expand trigger conditions (e.g., custom field values, time-based conditions beyond simple due dates).
    *   Introduce more action types (e.g., sending emails via an integrated service, calling external webhooks).

## Consequences

*   **Positive**:
    *   Increased user efficiency and productivity (validated with first automation).
    *   Improved data consistency and process adherence.
    *   Activities have become more versatile, functioning as assignable tasks.
    *   Scalable platform for future automation needs.
    *   Enhanced value proposition of the CRM.
*   **Potential Challenges**:
    *   Complexity in designing a flexible yet user-friendly rule definition UI (in later phases).
    *   Managing the execution and logging of a large number of automations.
    *   Potential for users to create conflicting or runaway automations if not carefully designed.
    *   Initial development effort for the foundational pieces (event handling, action execution).
    *   *(Self-correction during development: Data migration for existing activities to a polymorphic model is not an immediate concern as the application is still in the development phase with no production data.)*

## Rationale for Task Queues

*   **User Task Queues**: An enhanced view of a user's assigned activities (tasks, deadlines) will serve as their primary work queue. This involves improving sorting, filtering, and grouping on a dedicated "My Work" or enhanced "Activities" page.
*   **System Task Processing**: This will be managed via:
    *   **Event Queues (e.g., Inngest)**: For processing automation triggers from real-time events reliably.
    *   **Background Job Queues (e.g., Inngest, Supabase Edge Functions)**: For long-running automation actions.
    *   **Scheduled Execution (e.g., Cron, Inngest scheduled functions)**: For time-based automations.
    A dedicated, monolithic "system task queue" entity is not envisioned; instead, leveraging appropriate queuing and job processing mechanisms provided by the underlying platform (like Inngest) is preferred.

## Alternatives

*   **Third-Party Integration**: Relying entirely on external automation platforms (e.g., Zapier, Make) via APIs. While potentially faster for some use cases, it creates dependencies, may have cost implications, and offers less tight integration with internal WFM and Activity semantics.

## Open Questions

*   What are the top 3-5 initial automations users would find most valuable?
*   How granular should the initial event publishing be (e.g., specific field changes vs. just entity updates)?
*   What level of logging and history will be required for automated actions?

## Next Steps

*   Gather user feedback on desired initial automations (beyond the first one implemented).
*   Design and implement the next 1-2 foundational automations identified for Phase 1.
*   Continue to investigate the capabilities of Inngest for event handling and scheduled/background job processing.
*   *(Completed for now)* Design the schema for `system_user_id` and ensure it can be associated with activities.
*   Evaluate the long-term strategy for Activity entity linking (current direct links vs. future polymorphic associations) as new domains requiring activity tracking are conceptualized.

## Appendix A: Potential Future Automation Ideas (Examples)

This list includes brainstormed automation ideas that could be considered for implementation in various phases, building upon the foundational capabilities:

**Leveraging Current Capabilities (Activities, WFM, Deal Events):**

1.  **Task Creation on WFM Stage Change:**
    *   **Trigger:** Deal enters a specific `WFMWorkflowStep`.
    *   **Action:** Create a pre-defined Activity (task) assigned to `deal.assigned_to_user_id` or a specific role/user.
    *   **Examples:** "Follow up on proposal," "Schedule discovery call," "Initiate client onboarding."

2.  **Follow-up Task After Specific Activity Completion:**
    *   **Trigger:** An Activity of a certain `type` (e.g., "DEMO", "MEETING") linked to a Deal is marked `is_done: true`.
    *   **Action:** Create a follow-up Activity.
    *   **Examples:** "Send demo follow-up email," "Send consultation summary."

3.  **Reminder for Approaching Activity Due Dates:**
    *   **Trigger:** An open Activity's `due_date` is approaching (requires scheduled Inngest functions).
    *   **Action:** Create a "Reminder" Activity or send an internal notification.

4.  **Stale Deal Notification/Task:**
    *   **Trigger:** No new Activity or WFM stage change for a Deal in X days (requires scheduled Inngest function).
    *   **Action:** Create a review task for the deal owner; optionally notify a manager.

5.  **Automatic Deal WFM Stage Update on Key Activity Completion:**
    *   **Trigger:** A specific, critical Activity linked to a Deal is completed (e.g., "Contract Signed").
    *   **Action:** Automatically move the Deal to a corresponding `WFMWorkflowStep` (e.g., "Closed Won"). (Requires careful definition).

**Slightly More Advanced (May require minor schema/event enhancements):**

6.  **Task Reassignment on Deal Reassignment:**
    *   **Trigger:** `deal.assigned_to_user_id` changes.
    *   **Action:** Reassign open Activities for that deal to the new owner, or create a review task for the new owner.

7.  **Activity Creation Based on Email Received (Future - requires Email Integration):**
    *   **Trigger:** New email received from a Contact/Lead associated with an open Deal.
    *   **Action:** Create an Activity "Review email from..." for the deal owner.

8.  **Automated Logging of "System Touches":**
    *   **Trigger:** Certain system events (e.g., automated email sent).
    *   **Action:** Create a system Activity (type "SYSTEM_LOG") on the relevant entity.

9.  **Birthday/Anniversary Reminders for Contacts (Requires date fields on Contact & scheduled Inngest):**
    *   **Trigger:** Contact's birthday/anniversary approaching.
    *   **Action:** Create a task for the Contact owner to send wishes.

10. **Lead Qualification Score Update & Task Creation (Requires lead scoring logic):**
    *   **Trigger:** Lead data changes affecting qualification score.
    *   **Action:** If score crosses a threshold, create a follow-up task for sales. 