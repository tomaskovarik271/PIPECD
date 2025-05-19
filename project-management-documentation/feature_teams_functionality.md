# Feature: Teams Functionality

## 1. Introduction & Goals

This document outlines the design for a new "Teams" functionality within the CRM. The primary goals are:

1.  Allow grouping of users into teams.
2.  Designate team leads for each team.
3.  Enable team leads to view all CRM data (Deals, People, Organizations, Activities, etc.) created or owned by members of their team.
4.  Provide a mechanism for regular team members to potentially view data from other members within their own team (configurable).
5.  Align with best practices, drawing inspiration from how Pipedrive implements similar features, while leveraging the existing RBAC system.

## 2. Inspiration from Pipedrive

Pipedrive utilizes a combination of:

*   **Permission Sets:** Define *what actions* a user can take (e.g., create, edit, delete). This is analogous to our existing RBAC `permissions` and `roles`.
*   **Visibility Groups:** Define *what data* a user can see. Users are assigned to visibility groups, and item visibility can be set to "owner only," "owner's group," "owner's group and sub-groups," or "everyone."
*   **Teams:** Groups of users with a designated Team Manager. Primarily used for filtering and reporting. Visibility for a Team Manager over their team's data is typically achieved through appropriate visibility group settings or broader permissions.

We will adapt these concepts to fit our existing architecture.

## 3. Proposed Data Model Changes

We will introduce two new tables in the `public` schema (Supabase):

### 3.1. `teams` Table

```sql
CREATE TABLE public.teams (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    description text NULL,
    team_lead_user_id uuid REFERENCES public.user_profiles(user_id) ON DELETE SET NULL, -- Can be null if no lead assigned
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by_user_id uuid REFERENCES public.user_profiles(user_id) ON DELETE SET NULL -- User who created the team
);

COMMENT ON TABLE public.teams IS 'Stores information about different teams.';
COMMENT ON COLUMN public.teams.team_lead_user_id IS 'The user_id of the designated team lead.';

-- Trigger for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime (updated_at);

-- RLS Policies for teams (Admins can manage, team leads can see their team)
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams FORCE ROW LEVEL SECURITY;

-- Policy: Admins can do anything
CREATE POLICY "Admins can manage teams" ON public.teams
    FOR ALL
    USING (public.check_permission(auth.uid(), 'manage_any', 'team')) -- Requires new 'manage_any' 'team' permission
    WITH CHECK (public.check_permission(auth.uid(), 'manage_any', 'team'));

-- Policy: Team leads can view their own team details
CREATE POLICY "Team leads can view their team" ON public.teams
    FOR SELECT
    USING (auth.uid() = team_lead_user_id);

-- Policy: Team members can view the teams they are part of (indirectly through team_members table)
-- This might be better handled at the API/service layer when fetching teams a user belongs to.
```

### 3.2. `team_members` Table

```sql
CREATE TABLE public.team_members (
    team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    joined_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (team_id, user_id)
);

COMMENT ON TABLE public.team_members IS 'Links users to teams, establishing team membership.';

-- RLS Policies for team_members (Admins can manage, team leads can manage their team members)
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members FORCE ROW LEVEL SECURITY;

-- Policy: Admins can manage team memberships
CREATE POLICY "Admins can manage team members" ON public.team_members
    FOR ALL
    USING (public.check_permission(auth.uid(), 'manage_any', 'team_membership')) -- Requires new 'manage_any' 'team_membership' permission
    WITH CHECK (public.check_permission(auth.uid(), 'manage_any', 'team_membership'));

-- Policy: Team leads can manage members of their own team
CREATE POLICY "Team leads can manage their team members" ON public.team_members
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.teams t
            WHERE t.id = team_members.team_id AND t.team_lead_user_id = auth.uid()
        ) AND (
          public.check_permission(auth.uid(), 'manage_own', 'team_membership') -- Requires new 'manage_own' 'team_membership' permission for leads
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.teams t
            WHERE t.id = team_members.team_id AND t.team_lead_user_id = auth.uid()
        ) AND (
          public.check_permission(auth.uid(), 'manage_own', 'team_membership')
        )
    );
```

## 4. Permissions and Visibility Rules

### 4.1. New RBAC Permissions

We need to add new permissions to the `public.permissions` table:

```sql
INSERT INTO public.permissions (resource, action, description) VALUES
('team', 'create', 'Create a new team'),
('team', 'read_any', 'Read any team data'), -- For admins
('team', 'update_any', 'Update any team data'), -- For admins
('team', 'delete_any', 'Delete any team'), -- For admins
('team', 'manage_any', 'Full management of any team (used for RLS shortcut)'), -- For admins
('team_membership', 'manage_any', 'Manage memberships for any team'), -- For admins
('team_membership', 'manage_own', 'Manage memberships for teams the user leads'); -- For Team Leads
-- Add these permissions to the 'admin' role
-- Add 'team_membership_manage_own' to a new 'team_lead' role or directly to users who become team leads.
```

Consider creating a `team_lead` role in `public.roles` or dynamically assigning these permissions when a user is set as `team_lead_user_id` on a team.

### 4.2. Team Creation and Management

*   Users with the `'team', 'create'` permission (likely admins) can create new teams and assign a team lead.
*   Users with `'team', 'update_any'` and `'team', 'delete_any'` (admins) can modify or delete teams.
*   Users with `'team_membership', 'manage_any'` (admins) or `'team_membership', 'manage_own'` (team leads for their specific team) can add/remove users from teams.

### 4.3. Team Lead Visibility

A team lead (`team_lead_user_id` on the `teams` table) should have visibility into all data items (Deals, People, Organizations, Activities etc.) where the `user_id` (owner) of that item is a member of any team they lead.

This requires modifications to how data is fetched, likely within the service layer functions (e.g., in `lib/dealService/dealCrud.ts`, `lib/personService.ts`, etc.) or by enhancing the `check_permission` SQL function or related RLS policies.

**Option A: Modifying Service Layer Queries (Preferred for clarity & complex logic)**

When fetching lists of items (e.g., `getDeals`), the service functions would:
1.  Check if the requesting user is a team lead for any team(s).
2.  If so, retrieve the `user_id`s of all members in those teams.
3.  Modify the data retrieval query (e.g., Supabase query) to include items where `item.user_id` is IN the list of their team members' `user_id`s OR satisfies existing permission checks (e.g., `read_any` or `read_own`).

Example for fetching deals:
The existing RLS policy for deals is:
```sql
USING (
    (check_permission(auth.uid(), 'read_own', 'deal') AND auth.uid() = user_id) OR
    (check_permission(auth.uid(), 'read_any', 'deal'))
)
```
This would need to be augmented. The service layer would fetch deals where:
`deals.user_id = currentUser.id` (for `read_own`)
OR `currentUser has 'read_any' for 'deal'`
OR `deals.user_id IN (SELECT team_member_user_id FROM team_members_of_current_user_as_lead)`

This logic is likely best implemented in the TypeScript service files by dynamically constructing the Supabase query filters.

**Option B: Modifying RLS / `check_permission` function (More complex SQL)**

This would involve making the `check_permission` function or the RLS policies themselves team-aware. For example, a new permission like `'read_team'` could be introduced.
`check_permission(auth.uid(), 'read_team', 'deal', item_owner_id)` would return true if `auth.uid()` is a lead of a team that `item_owner_id` belongs to.

The RLS policy for deals could become:
```sql
USING (
    (check_permission(auth.uid(), 'read_own', 'deal') AND auth.uid() = user_id) OR
    (check_permission(auth.uid(), 'read_any', 'deal')) OR
    (is_team_lead_of_owner(auth.uid(), user_id, 'deal')) -- New SQL helper function
)
```
The `is_team_lead_of_owner` function would check team leadership and membership. This might be more performant for direct DB queries but harder to maintain for complex visibility rules.

**Chosen Approach for Team Lead Visibility:**
Start with **Option A (Service Layer Queries)**. It offers more flexibility and is easier to debug TypeScript logic than complex SQL. If performance becomes an issue for very large datasets/teams, Option B can be explored.

### 4.4. Team Member Visibility (Optional/Future)

Consider a permission like `'read_team_member_data', 'deal'`. If a user has this, they can see deals from others in their team.
*   This would also be implemented in the service layer, similar to team lead visibility, but checking for common team membership instead of leadership.
*   This adds complexity and should be scoped carefully. For the initial implementation, focus on Team Lead visibility.

## 5. API Design (GraphQL)

Extend the GraphQL schema and resolvers:

### 5.1. Schema Changes (`*.graphql` files)

**`team.graphql` (New File)**
```graphql
type Team {
  id: ID!
  name: String!
  description: String
  teamLead: User
  members: [User!]! # Users who are members of this team
  createdAt: DateTime!
  updatedAt: DateTime!
  createdBy: User
}

type TeamMemberEdge {
  user: User!
  joinedAt: DateTime!
}

type TeamWithMembers {
  id: ID!
  name: String!
  description: String
  teamLead: User
  membersConnection: TeamMembersConnection! # For paginated members if needed
  createdAt: DateTime!
  updatedAt: DateTime!
  createdBy: User
}

type TeamMembersConnection {
  edges: [TeamMemberEdge!]!
  # pageInfo: PageInfo! (if pagination is needed)
}


input CreateTeamInput {
  name: String!
  description: String
  teamLeadUserId: ID
  memberUserIds: [ID!]
}

input UpdateTeamInput {
  name: String
  description: String
  teamLeadUserId: ID # Use null to remove team lead
}

input AddTeamMembersInput {
  teamId: ID!
  memberUserIds: [ID!]!
}

input RemoveTeamMembersInput {
  teamId: ID!
  memberUserIds: [ID!]!
}

extend type Query {
  teams: [Team!]! # Returns all teams (admin) or teams user is part of/leads
  team(id: ID!): TeamWithMembers # Details of a specific team
  myTeams: [Team!]! # Teams the current user is a member of
  myLedTeams: [Team!]! # Teams the current user leads
}

extend type Mutation {
  createTeam(input: CreateTeamInput!): Team!
  updateTeam(id: ID!, input: UpdateTeamInput!): Team!
  deleteTeam(id: ID!): Boolean! # Returns true on success

  addTeamMembers(input: AddTeamMembersInput!): TeamWithMembers!
  removeTeamMembers(input: RemoveTeamMembersInput!): TeamWithMembers!
}

# Potentially extend User type
# extend type User {
#   teams: [Team!] # Teams this user belongs to
#   leadingTeams: [Team!] # Teams this user leads
# }
# This might be better resolved via Query.myTeams / Query.myLedTeams to avoid over-fetching.
```

### 5.2. Resolvers

New resolvers will be needed in `netlify/functions/graphql/resolvers/` for:
*   `Query.teams`, `Query.team`, `Query.myTeams`, `Query.myLedTeams`
*   `Mutation.createTeam`, `Mutation.updateTeam`, `Mutation.deleteTeam`, `Mutation.addTeamMembers`, `Mutation.removeTeamMembers`
*   Field resolvers for `Team.teamLead`, `Team.members` (or `TeamWithMembers.membersConnection`), `Team.createdBy`.

These resolvers will use new service functions (e.g., `teamService.ts`) that interact with the `teams` and `team_members` tables and enforce permissions.

## 6. Service Layer (`lib/teamService.ts` - New File)

Create `teamService.ts` to encapsulate business logic for teams:

*   `createTeam(userId, input)`
*   `updateTeam(userId, teamId, input)`
*   `deleteTeam(userId, teamId)`
*   `getTeamById(userId, teamId)`
*   `getTeams(userId)` (based on user's role/permissions)
*   `getMyTeams(userId)`
*   `getMyLedTeams(userId)`
*   `addMembersToTeam(userId, teamId, memberUserIds)`
*   `removeMembersFromTeam(userId, teamId, memberUserIds)`
*   `getTeamMembers(teamId)`
*   `isUserTeamLead(userId, teamId)`
*   `getMemberUserIdsOfTeamsLedByUser(leadUserId)`

These service functions will use `getAuthenticatedClient` for Supabase calls and perform permission checks (either by relying on RLS or by explicitly calling `check_permission` or similar logic for more complex scenarios not covered by simple RLS, e.g., a lead managing their own team's members).

## 7. Impact on Existing Functionality & Services

*   **Data Fetching Services (Deals, People, Orgs, Activities):**
    *   Core list-fetching functions (e.g., `getDealsInternal` in `lib/dealService/dealCrud.ts`) will need to be updated.
    *   They should accept an optional list of `accessibleUserIds` (derived from team lead's team members).
    *   The Supabase query builder will need to add an OR condition: `query.or(`user_id.in.(${accessibleUserIds.join(',')})`)` if `accessibleUserIds` is provided and non-empty.
    *   This should be additive to existing RLS and permission checks (i.e., a user still needs the basic `read_own` or `read_any` type of permission which RLS enforces at DB level, and then service layer expands this for team leads).
*   **`check_permission` SQL function:** No immediate changes required if visibility is handled in the service layer. If direct DB-level team visibility is pursued later, this function would need to be team-aware.
*   **RLS Policies for existing entities:** Initially, no changes. The service layer enhancements will broaden visibility for team leads. If performance dictates moving logic to DB, RLS would be updated.

## 8. UI Considerations (High-Level)

*   **Admin Area:**
    *   New section for "Team Management" to create/edit/delete teams, assign leads, and manage team members.
*   **User Profile/Settings:**
    *   Display teams a user belongs to.
    *   If a user is a team lead, provide a link/section to manage their team(s).
*   **Data Views (Lists/Kanban for Deals, People etc.):**
    *   Existing filters could be enhanced with a "Team" filter, allowing users (especially admins or team leads) to view data by specific teams.
    *   Team leads should automatically see their team members' data reflected in their standard views.

## 9. Future Considerations / Open Questions

*   **Sub-teams / Hierarchical Teams:** The current model is flat. Hierarchical teams would require more complex parent-child relationships in the `teams` table.
*   **Cross-Team Visibility Rules:** More granular rules for visibility between specific teams.
*   **Team-Specific Permissions:** Assigning permissions directly to a team rather than just roles/users.
*   **Notifications:** Notifications for team assignments, or when important events happen within a team's data.
*   **Default Team for New Users:** Automatically assigning new users to a default team.
*   **"Follower" vs. "Member" concepts:** Currently, users are members. Pipedrive also has "followers" for items.
*   **Impact of User Deletion/Role Changes:** How does deleting a user or changing their role (e.g., from team lead) affect team data and memberships? (Current `ON DELETE SET NULL` / `ON DELETE CASCADE` provide some handling).

This design provides a solid foundation for the Teams functionality, balancing feature richness with integration into the existing robust RBAC system. 