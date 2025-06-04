# ADR-007: HR Foundation for Team Management

* Status: Proposed
* Date: {{YYYY-MM-DD}} <!-- Will be filled with current date -->
* Deciders: Product Owner, Engineering Lead
* Consulted: Development Team
* Informed: All Stakeholders

## Context and Problem Statement

As the application matures and we introduce more collaborative features, especially around deal management and broader workflows, there is a growing need for a foundational Human Resources (HR) module. Currently, user identity is managed via `user_profiles`, but there is no formal structure for teams, departments, reporting lines (like team leads), or associating users with these structures.

This lack of a formal HR structure limits our ability to:

*   Implement role-based access control that reflects organizational hierarchy (e.g., team leads having visibility into their team's deals).
*   Assign tasks, deals, or other entities to entire teams.
*   Build features that require knowledge of team membership or leadership (e.g., team-specific dashboards, notifications, approval workflows).
*   Scale user management and permissions effectively as the organization grows.

The immediate driver for this ADR is the requirement for team leads to see deals created and worked on by their team members, which was identified during discussions about future deal functionalities.

## Decision Drivers

*   **Scalability:** The solution must support a growing number of users and teams.
*   **Reusability:** The HR structures should be generic enough to be leveraged by various modules (Deals, Projects, WFM, etc.).
*   **Clarity of Roles & Permissions:** It should facilitate clearer and more granular permission management.
*   **Future Growth:** The design should be extensible to accommodate future HR-related features (e.g., departments, more complex role management).
*   **Performance:** Querying team structures and related permissions should be efficient.

## Considered Options

### Option 1: Ad-hoc Team/Role Fields on Specific Entities

*   Add specific fields like `team_lead_id` or `assigned_team_id` directly to entities like `deals`.
*   Manage team memberships informally or through separate, non-centralized mechanisms.
*   **Pros:** Quick to implement for very specific, isolated use cases.
*   **Cons:** Not scalable, leads to data duplication and inconsistency, doesn't provide a reusable foundation, makes complex queries (like "show all deals for a team lead's members") very difficult.

### Option 2: Basic Team Structure

*   Introduce a `teams` table (name, description, lead_user_id).
*   Introduce a `team_members` table (team_id, user_id, optional membership_role like 'member' or 'deputy lead').
*   **Pros:** Provides a good balance of structure and simplicity, directly addresses the immediate need for team lead visibility and team assignments. Forms a solid foundation.
*   **Cons:** May need future extensions for more complex hierarchies (e.g., departments, sub-teams as distinct entities if `parent_team_id` is not used initially).

### Option 3: Comprehensive HR Suite (Premature)

*   Design and implement a full-fledged HR system from the outset, including departments, org charts, detailed employee roles, leave management, etc.
*   **Pros:** Would eventually cover all conceivable HR needs.
*   **Cons:** Significant upfront development effort, likely over-engineering for current requirements, high risk of building features that are not immediately needed or are designed sub-optimally without concrete use cases.

## Decision Outcome

**Chosen Option: Option 2: Basic Team Structure**

We will implement a foundational HR structure consisting of `teams` and `team_members` tables.

### `teams` Table Schema:

*   `id`: UUID, Primary Key
*   `name`: TEXT, Not Null
*   `description`: TEXT, Optional
*   `lead_user_id`: UUID, Foreign Key to `user_profiles.id` (identifies the team lead)
*   `parent_team_id`: UUID, Foreign Key to `teams.id` (Optional, allows for hierarchical team structures/sub-teams)
*   `created_at`: TIMESTAMPTZ, Default `now()`
*   `updated_at`: TIMESTAMPTZ, Default `now()`

### `team_members` Table Schema (Junction Table):

*   `id`: UUID, Primary Key
*   `team_id`: UUID, Foreign Key to `teams.id`, Not Null
*   `user_id`: UUID, Foreign Key to `auth.users.id` (or `user_profiles.id` if `user_profiles` is the canonical source for user linkage), Not Null
*   `membership_role`: TEXT, Optional (e.g., 'Member', 'Deputy Lead', 'Contributor'. Default to 'Member'. This is distinct from application-level roles).
*   `created_at`: TIMESTAMPTZ, Default `now()`
*   `updated_at`: TIMESTAMPTZ, Default `now()`
*   Constraint: UNIQUE (`team_id`, `user_id`) to prevent duplicate memberships.

This structure provides a reusable foundation for:
1.  Identifying team leads.
2.  Listing members of a team.
3.  Allowing entities (like deals) to be associated with teams or individuals within teams.
4.  Building RLS policies and application logic to grant team leads visibility into their team's activities.

### Phased Implementation

*   **Phase 1 (Core Team Structure - Current Scope):**
    *   Create the `teams` and `team_members` tables with the schemas defined above.
    *   Develop basic Admin UI for creating, updating, and deleting teams, and for adding/removing users from teams and assigning team leads.
    *   Implement RLS policies and/or GraphQL resolver logic on the `deals` table to allow team leads to view deals associated with their team members (based on `created_by_user_id`, `assigned_to_user_id`).

*   **Phase 2 (Deal Teams & Enhanced Assignments - Future Scope):**
    *   Introduce a generic `deal_assigned_entities` table (or similar for other entities like `projects`):
        *   `id`: UUID, PK
        *   `deal_id`: UUID, FK to `deals.id`
        *   `entity_type`: TEXT ('USER' or 'TEAM')
        *   `entity_id`: UUID (references `user_profiles.id` or `teams.id` based on `entity_type`)
        *   `assignment_role`: TEXT (e.g., 'Owner', 'Stakeholder', 'Contributor' - specific to the deal context)
    *   Enhance the Deal Detail Page UI to manage these assignments (assigning individual users or whole teams to a deal with a specific deal role).
    *   Update RLS policies and data fetching logic to incorporate these more granular assignments for team lead visibility.

## Consequences

### Positive

*   **Improved Visibility:** Team leads will be able to see their team's deals, enhancing management oversight.
*   **Foundation for Collaboration:** Enables features like assigning entities to teams.
*   **Better Access Control:** Facilitates more sophisticated permission models based on team structure.
*   **Reduced Redundancy:** Centralizes team and membership information.
*   **Clear Path for Future Expansion:** The `parent_team_id` and potential for `deal_assigned_entities` provide clear extension points.

### Negative

*   **Initial Development Effort:** Requires creating new tables, APIs, and UI components.
*   **Data Migration/Backfill:** If there are implicit teams currently, a strategy for migrating to the new structure might be needed (though likely not an issue for a new feature).
*   **Increased Complexity:** Adds new entities and relationships to the data model.

## Rationale for Team Lead Visibility (Example Implementation Detail)

To enable a team lead to see all deals created by or assigned to their team members, the RLS policy on the `deals` table for `SELECT` operations would be augmented.

A user (`auth.uid()`) would be granted `SELECT` permission on a `deal` row if:

1.  They are the `created_by_user_id`.
2.  They are the `assigned_to_user_id`.
3.  (New) They are a `lead_user_id` for a `team` where the `deal.created_by_user_id` OR `deal.assigned_to_user_id` is a member of that `team` (via `team_members` table).
    ```sql
    -- Simplified conceptual RLS example for team lead visibility
    EXISTS (
        SELECT 1
        FROM teams t
        JOIN team_members tm ON t.id = tm.team_id
        WHERE t.lead_user_id = auth.uid()
        AND (tm.user_id = deal.created_by_user_id OR tm.user_id = deal.assigned_to_user_id)
    )
    ```
4.  (Future - Phase 2) They are a `lead_user_id` for a `team` that is an `entity_id` in `deal_assigned_entities` for that deal, OR a `team_member` from their team is an `entity_id` in `deal_assigned_entities`.

GraphQL resolvers fetching lists of deals would implicitly respect these RLS policies. For performance-sensitive dashboards or aggregated views for team leads, dedicated SQL functions might be created.

## Alternatives Explored

*   **Application-Level Roles System:** While important, a full-blown application role system (e.g., "Sales Manager," "Admin") is a separate concern that can be built on top of or alongside this foundational HR team structure. The current proposal focuses on the structural aspect of teams and direct leadership.

## Open Questions

*   What are the exact initial `membership_role` values needed in `team_members` beyond a default 'Member'? (For now, keep it simple).
*   How will `user_profiles.id` vs `auth.users.id` be consistently used for foreign keys in `team_members.user_id` and `teams.lead_user_id`? (Decision: `user_profiles.id` should be the standard if it's the enriched user record, assuming `user_profiles.id` is equivalent to or directly linked from `auth.users.id`).

## Next Steps

*   Review and finalize this ADR.
*   Create database migration scripts for the new tables.
*   Develop backend services/APIs for managing teams and memberships.
*   Develop frontend UI for team administration.
*   Implement the RLS policies or update GraphQL resolvers for team lead deal visibility.
*   Write tests for the new functionality.

---
*This ADR is a living document and may be updated as the project evolves.* 