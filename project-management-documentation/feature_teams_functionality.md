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
    role TEXT DEFAULT 'member' NOT NULL, -- Added role as per migration
    PRIMARY KEY (team_id, user_id, role) -- Corrected Primary Key
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

### 3.3. `deal_followers` Table (New)

This table links users to specific deals they are "following" or "watching," granting them visibility and potentially notifications, even if they are not the owner or part of the owner's team.

```sql
CREATE TABLE public.deal_followers (
    deal_id uuid NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    followed_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (deal_id, user_id)
);

COMMENT ON TABLE public.deal_followers IS 'Links users to deals they are following, for visibility and notifications.';

-- RLS Policies for deal_followers
ALTER TABLE public.deal_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_followers FORCE ROW LEVEL SECURITY;

-- Policy: Admins can manage any deal's followers (requires a general admin permission or specific 'deal:manage_any_followers')
CREATE POLICY "Admins can manage all deal followers" ON public.deal_followers
    FOR ALL
    USING (public.check_permission(auth.uid(), 'manage_any', 'deal_follower')) -- Requires new 'deal_follower', 'manage_any' permission
    WITH CHECK (public.check_permission(auth.uid(), 'manage_any', 'deal_follower'));

-- Policy: Users who can update a deal can manage its followers (e.g., owner, or user with 'deal:update_any' or 'deal:update_own')
-- This is a common pattern. Alternatively, specific 'deal:manage_followers_own_deal' permission can be created.
CREATE POLICY "Users with deal update access can manage its followers" ON public.deal_followers
    FOR ALL
    USING (
        -- Check if user can update the specific deal associated with this follower entry
        (SELECT EXISTS (
            SELECT 1 FROM public.deals d
            WHERE d.id = deal_followers.deal_id AND
                  (
                    (public.check_permission(auth.uid(), 'update_own', 'deal') AND d.user_id = auth.uid()) OR
                    public.check_permission(auth.uid(), 'update_any', 'deal')
                  )
        ))
    )
    WITH CHECK (
         (SELECT EXISTS (
            SELECT 1 FROM public.deals d
            WHERE d.id = deal_followers.deal_id AND
                  (
                    (public.check_permission(auth.uid(), 'update_own', 'deal') AND d.user_id = auth.uid()) OR
                    public.check_permission(auth.uid(), 'update_any', 'deal')
                  )
        ))
    );

-- Policy: Users can see follower entries for deals they are allowed to view.
-- This allows users to see who else is following a deal they have access to.
CREATE POLICY "Users can view followers of deals they can see" ON public.deal_followers
    FOR SELECT
    USING (
        (SELECT EXISTS (
            SELECT 1 FROM public.deals d
            WHERE d.id = deal_followers.deal_id AND (
                (public.check_permission(auth.uid(), 'read_own', 'deal') AND d.user_id = auth.uid()) OR
                public.check_permission(auth.uid(), 'read_any', 'deal') OR
                -- Placeholder for team lead visibility logic (if RLS based)
                -- is_team_lead_of_owner(auth.uid(), d.user_id, 'deal') OR 
                -- Placeholder for follower visibility (current user is a follower of the deal - this row!)
                deal_followers.user_id = auth.uid()
            )
        ))
    );
```

### 3.4. SQL Helper Function for Team Lead Visibility

To support RLS checks for team lead visibility, a helper function is introduced:

```sql
-- Located in migration: 20250729090100_create_is_team_lead_of_item_owner_function.sql
CREATE OR REPLACE FUNCTION public.is_team_lead_of_item_owner(viewer_user_id UUID, item_owner_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.teams t
        JOIN public.team_members tm ON t.id = tm.team_id
        WHERE t.team_lead_user_id = viewer_user_id
          AND tm.user_id = item_owner_user_id
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
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
INSERT INTO public.permissions (resource, action, description) VALUES ('deal', 'reassign', 'Reassign a deal to another user');
INSERT INTO public.permissions (resource, action, description) VALUES ('deal_follower', 'manage_any', 'Manage followers for any deal (Admin)');
-- Note: Specific permissions like 'deal:add_follower' or 'deal:remove_follower' could be added if more granularity is needed
-- than tying follower management to general deal update permissions.
-- Add these permissions to the 'admin' role
-- Add 'team_membership_manage_own' to a new 'team_lead' role or directly to users who become team leads.
-- Grant `deal:reassign` to relevant roles (e.g., admin, potentially team leads under specific conditions).
-- Grant `deal_follower:manage_any` to admin role.
```

Consider creating a `team_lead` role in `public.roles` or dynamically assigning these permissions when a user is set as `team_lead_user_id` on a team.

### 4.2. Team Creation and Management

*   Users with the `'team', 'create'` permission (likely admins) can create new teams and assign a team lead.
*   Users with `'team', 'update_any'` and `'team', 'delete_any'` (admins) can modify or delete teams.
*   Users with `'team_membership', 'manage_any'` (admins) or `'team_membership', 'manage_own'` (team leads for their specific team) can add/remove users from teams.

### 4.3. Team Lead Visibility

A team lead (`team_lead_user_id` on the `teams` table) should have visibility into all data items (Deals, People, Organizations, Activities etc.) where the `user_id` (owner) of that item is a member of any team they lead.

This requires modifications to how data is fetched, likely within the service layer functions (e.g., in `lib/dealService/dealCrud.ts`, `lib/personService.ts`, etc.) or by enhancing the `check_permission` SQL function or related RLS policies.

**Option A: Modifying Service Layer Queries (Initial Consideration, Not Implemented for Core Visibility)**

When fetching lists of items (e.g., `getDeals`), the service functions would:
1.  Check if the requesting user is a team lead for any team(s).
2.  If so, retrieve the `user_id`s of all members in those teams.
3.  Modify the data retrieval query (e.g., Supabase query) to include items where `item.user_id` is IN the list of their team members' `user_id`s OR satisfies existing permission checks (e.g., `read_any` or `read_own`).

This would need to be augmented. The service layer would fetch deals where:
`deals.user_id = currentUser.id` (for `read_own`)
OR `currentUser has 'read_any' for 'deal'`
OR `deals.user_id IN (SELECT team_member_user_id FROM team_members_of_current_user_as_lead)`

This logic is likely best implemented in the TypeScript service files by dynamically constructing the Supabase query filters.

**✅ Option B: Modifying RLS / `check_permission` function (Implemented)**

This approach has been implemented. It involved creating the `public.is_team_lead_of_item_owner` SQL helper function (see Section 3.4) and updating RLS policies on relevant tables.

The RLS policy `USING` clauses for tables like `deals`, `people`, `organizations`, and `activities` have been updated to include a check for team lead visibility:

```sql
-- Example for 'deals' table (see migration 20250729090101_update_deals_rls_for_team_visibility.sql)
USING (
    (public.check_permission(auth.uid(), 'read_own', 'deal') AND auth.uid() = deals.user_id) OR
    (public.check_permission(auth.uid(), 'read_any', 'deal')) OR
    (public.is_team_lead_of_item_owner(auth.uid(), deals.user_id)) -- New SQL helper function
)
```
This pattern has been applied via migrations:
* `20250729090101_update_deals_rls_for_team_visibility.sql`
* `20250729090102_update_people_rls_for_team_visibility.sql`
* `20250729090103_update_organizations_rls_for_team_visibility.sql`
* `20250729090104_update_activities_rls_for_team_visibility.sql`

This ensures that team lead visibility is enforced at the database level.

### 4.4. Team Member Visibility (Optional/Future)

Consider a permission like `'read_team_member_data', 'deal'`. If a user has this, they can see deals from others in their team.
*   This would also be implemented in the service layer, similar to team lead visibility, but checking for common team membership instead of leadership.
*   This adds complexity and should be scoped carefully. For the initial implementation, focus on Team Lead visibility.

### 4.5. Deal Reassignment

Users with the appropriate permissions should be able to reassign a deal from its current owner to another user.

*   **Functionality:** Changes the `user_id` (owner) of a specific deal.
*   **Permissions:**
    *   A user with the `'deal', 'reassign'` permission can reassign any deal. This is typically an admin-level permission.
    *   Team leads might also be granted this permission, possibly restricted to reassigning deals currently owned by their team members, or reassigning deals *to* their team members. This specific restriction would be enforced in the service layer logic for the reassignment action if a more granular permission like `'deal', 'reassign_team_deal'` is not created.
*   **Process:**
    1.  The authorized user selects a deal.
    2.  The authorized user selects a new user to be the owner.
    3.  The system updates the `deals.user_id` for that deal to the new user's ID.
    4.  **Retained Visibility for Previous Owner:** Upon reassignment, the previous owner will lose direct owner-based visibility. To maintain their access, the system could:
        *   Automatically add the previous owner as a "follower" of the deal (see Section 4.6).
        *   Prompt the reassigning user if they wish to add the previous owner as a follower.
    5.  This change (ownership and potentially new follower) should be logged in the deal's history.
*   **Impact:** Ownership change will affect visibility based on "owner only" rules and potentially team-based visibility if the new owner is in a different team or has a different role. Visibility will also be granted to any followers of the deal.

### 4.6. Follower/Watcher Visibility (New)

This mechanism allows users to gain visibility into specific deals they don't own or wouldn't see through team structures.

*   **Functionality:** Users can be designated as "followers" of a deal.
*   **Permissions for Management:**
    *   Users with `deal:update_own` or `deal:update_any` permissions for a specific deal can typically add or remove followers from that deal.
    *   Users with `deal_follower:manage_any` (Admins) can manage followers for any deal.
*   **Visibility Rules:**
    *   If a user is listed in the `deal_followers` table for a particular `deal_id`, they are granted read access to that deal.
    *   This visibility is additive to ownership-based, role-based (`read_any`), and team-based visibility.
*   **Implementation:** Primarily in the service layer. When fetching a deal or list of deals, the queries will be augmented to include deals where the current user is a follower.
    *   Example: `SELECT * FROM deals WHERE id = ? AND (user_id = ? OR id IN (SELECT deal_id FROM deal_followers WHERE user_id = ?))` (simplified).

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
  reassignDeal(dealId: ID!, newOwnerUserId: ID!): Deal # New mutation for reassigning a deal
  addDealFollower(dealId: ID!, followerUserId: ID!): Deal!
  removeDealFollower(dealId: ID!, followerUserId: ID!): Deal!
}

# Potentially extend User type
# extend type User {
#   teams: [Team!] # Teams this user belongs to
#   leadingTeams: [Team!] # Teams this user leads
# }
# This might be better resolved via Query.myTeams / Query.myLedTeams to avoid over-fetching.

**Changes to `deal.graphql` (or relevant existing file where Deal type is defined)**
```graphql
extend type Deal {
  followers: [User!] # Users following this deal
}
```

### 5.2. Resolvers

New resolvers will be needed in `netlify/functions/graphql/resolvers/` for:
*   ✅ `Query.teams` (Basic implementation relying on RLS; advanced filtering by user relation not yet in resolver)
*   ✅ `Query.team(id: ID!)` (Returns generated `Team` type, not `TeamWithMembers` as suggested in MD schema)
*   ✅ `Query.myTeams`
*   ✅ `Query.myLedTeams`
*   ✅ `Mutation.createTeam(input: CreateTeamInput!)` (Uses `CreateTeamInput` from current schema; MD proposes additional `memberUserIds` field not yet handled)
*   ✅ `Mutation.updateTeam(id: ID!, input: UpdateTeamInput!)`
*   ✅ `Mutation.deleteTeam(id: ID!)`
*   ✅ `Mutation.addTeamMembers(input: AddTeamMembersInput!)` (Implemented, replacing single `addTeamMember`)
*   ✅ `Mutation.removeTeamMembers(input: RemoveTeamMembersInput!)` (Implemented, replacing single `removeTeamMember`)
*   ✅ `Mutation.reassignDeal(dealId: ID!, newOwnerUserId: ID!)` (Marking as done based on previous work)
*   ✅ `Mutation.addDealFollower(dealId: ID!, followerUserId: ID!)` (Resolver uses `userId` for `followerUserId`)
*   ✅ `Mutation.removeDealFollower(dealId: ID!, followerUserId: ID!)` (Resolver uses `userId` for `followerUserId`)
*   ✅ Field resolvers for `Team.teamLead`
*   ✅ Field resolvers for `Team.members` (Does not use `TeamWithMembers.membersConnection` from MD schema, but `TeamWithMembers` is now returned by bulk mutations)
*   ✅ Field resolvers for `Team.createdBy`
*   ✅ Field resolvers for `Deal.followers`

These resolvers will use new service functions (e.g., `teamService.ts`, `dealService.ts`) that interact with the tables and enforce permissions.

## 6. Service Layer (`lib/teamService.ts` - New File)

The `lib/teamService.ts` file has been created and populated with functions to manage teams and team memberships.

**Type Safety and Database Interaction:**
*   The service functions now utilize `SupabaseClient<Database>` imported from `./database.types.ts`, ensuring that interactions with the Supabase client are strongly typed based on the generated database schema.
*   Specific types like `DbTeam` (defined as `Database['public']['Tables']['teams']['Row']`) are used for data objects, enhancing code clarity and reducing runtime errors.
*   Most `any` types have been eliminated or replaced with `unknown` in `catch` blocks for safer error handling.

**Handling of `team_members.role`:**
*   A notable issue was identified where the `supabase gen types typescript` command does not correctly include the `role` column in the generated types for the `team_members` table (i.e., in `Database['public']['Tables']['team_members']['Insert']` or `...['Row']`), even though the column is correctly defined in the database migration (`20250729090054_create_team_members_table.sql`) with a `DEFAULT 'member' NOT NULL` constraint.
*   **Workaround in `addTeamMemberToDb`**:
    *   A custom type `TeamMemberInsert = Database['public']['Tables']['team_members']['Insert'] & { role: string };` is used for the `insertPayload` to ensure the `role` field (defaulting to 'member' if not provided) is included.
    *   The payload `(insertPayload as any)` is cast to `any` before the `.insert()` call to bypass TypeScript errors caused by the incomplete generated type.
    *   The return type is `Promise<TeamMemberRowWithRole>` where `TeamMemberRowWithRole = Database['public']['Tables']['team_members']['Row'] & { role?: string };` to acknowledge that the `role` field is expected from the database.
*   This workaround allows the application to function correctly with team member roles while acknowledging the current limitation of the type generation tool.

**Implemented Service Functions (summary):**
*   `getTeamById(supabase, teamId)`
*   `createTeamInDb(supabase, input, creatorUserId)`
*   `getTeams(supabase, filter, pagination)`
*   `getTeamsForUser(supabase, userId)` (fetches teams a user is a member of)
*   `getTeamsLedByUser(supabase, userId)` (fetches teams a user leads)
*   `updateTeamInDb(supabase, teamId, updatePayload)`
*   `deleteTeamFromDb(supabase, teamId)`
*   `addTeamMemberToDb(supabase, teamId, userId, role)` (Kept for potential single add use cases, though GQL uses bulk)
*   `removeTeamMemberFromDb(supabase, teamId, userId)` (Kept for potential single remove use cases, though GQL uses bulk)
*   ✅ `addTeamMembersToDb(supabase, teamId, userIds, role)` (New for bulk operations)
*   ✅ `removeTeamMembersFromDb(supabase, teamId, userIds)` (New for bulk operations)

These functions rely on Supabase RLS for security. The following functions were originally planned in earlier design stages but their direct equivalents are covered by the above functions, RLS capabilities, or can be easily derived:
*   `getTeamMembers(teamId)`: RLS on `team_members` table and a `select()` query can achieve this when needed.
*   `isUserTeamLead(userId, teamId)`: This can be checked by querying the `teams` table for a specific `teamId` and `team_lead_user_id`.
*   `getMemberUserIdsOfTeamsLedByUser(leadUserId)`: This can be derived by querying `teams` to find teams led by `leadUserId`, then querying `team_members` for those `team_id`s.

The originally listed functions like `createTeam(userId, input)` etc. are now implemented as `createTeamInDb(supabase, input, creatorUserId)` with the Supabase client passed as an argument.

A similar new function would be needed in `lib/dealService/dealCrud.ts` (or a general `dealService.ts`):
*   `reassignDeal(actingUserId, dealId, newOwnerUserId)`: Checks permissions, updates `deals.user_id`, and logs history. Optionally adds previous owner as follower.
*   `addDealFollower(actingUserId, dealId, followerUserId)`: Checks permissions, adds entry to `deal_followers`.
*   `removeDealFollower(actingUserId, dealId, followerUserId)`: Checks permissions, removes entry from `deal_followers`.
*   `getDealFollowers(dealId)`: Retrieves followers for a deal.

## 7. Impact on Existing Functionality & Services

*   **Data Fetching Services (Deals, People, Orgs, Activities):**
    *   **Team Lead Visibility:** Core list-fetching functions (e.g., `getDealsInternal` in `lib/dealService/dealCrud.ts`) already benefit from the updated RLS policies (Option B in Section 4.3). These policies enforce team lead visibility at the database level, so team leads will automatically see data owned by their team members if they have the appropriate base read permissions (e.g., 'read_own' combined with the RLS logic).
    *   **Deal Follower Visibility:** ✅ Implemented via RLS. The RLS policies for the `deals` table have been updated (see migration `20250730000000_update_deals_rls_for_follower_visibility.sql`). Users can now view deals they are following directly due to the `SELECT` RLS policy including a check against the `deal_followers` table. Service layer modifications to explicitly add follower deals are no longer required for basic visibility.
    *   Conceptual Supabase query addition for follower visibility in service layer:
        `query = query.or(\`id.in.(SELECT deal_id FROM deal_followers WHERE user_id = ${currentUserId})\`)` (This is an addition to existing filters like owner, admin, or team lead visibility).
*   **Deal Ownership:** The ability to reassign deals (as described in section 4.5, now ✅) directly impacts `deals.user_id` and subsequent visibility and ownership checks. This has been implemented.
*   **`check_permission` SQL function:** No immediate changes were required for the implemented RLS-based team lead visibility.
*   **RLS Policies for existing entities:** These *were updated* (as detailed in Section 4.3, Option B) for `deals`, `people`, `organizations`, and `activities` to incorporate the `is_team_lead_of_item_owner` function, successfully implementing team lead visibility at the database level.

## 8. UI Considerations (High-Level)

*   **Admin Area:**
    *   New section for "Team Management" to create/edit/delete teams, assign leads, and manage team members.
*   **User Profile/Settings:**
    *   Display teams a user belongs to.
    *   If a user is a team lead, provide a link/section to manage their team(s).
*   **Data Views (Lists/Kanban for Deals, People etc.):**
    *   Existing filters could be enhanced with a "Team" filter, allowing users (especially admins or team leads) to view data by specific teams.
    *   Team leads should automatically see their team members' data reflected in their standard views.
    *   An option to "Reassign Deal" could be added to the Deal Detail page or context menus in deal lists for authorized users.
    *   The Deal Detail page should display a list of "Followers" and allow authorized users to add/remove followers.

## 9. Future Considerations / Open Questions

*   **Sub-teams / Hierarchical Teams:** The current model is flat. Hierarchical teams would require more complex parent-child relationships in the `teams` table.
*   **Cross-Team Visibility Rules:** More granular rules for visibility between specific teams.
*   **Team-Specific Permissions:** Assigning permissions directly to a team rather than just roles/users.
*   **Notifications:** Notifications for team assignments, or when important events happen within a team's data. **Followers should also receive relevant notifications for deals they follow.**
*   **Default Team for New Users:** Automatically assigning new users to a default team.
*   **"Follower" vs. "Member" concepts:** Currently, users are members of teams. Followers are specific to individual records (like Deals). This distinction is now clearer.
*   **Generic Item Followers:** The `deal_followers` table could be generalized to an `item_followers` table with an `item_type` column if follower functionality is desired for People, Organizations, etc., in the future. For now, `deal_followers` is a good starting point.
*   **Impact of User Deletion/Role Changes:** How does deleting a user or changing their role (e.g., from team lead) affect team data and memberships? (Current `ON DELETE SET NULL` / `ON DELETE CASCADE` provide some handling). Similar considerations apply to `deal_followers` (current `ON DELETE CASCADE` for `user_id` seems appropriate).

This design provides a solid foundation for the Teams functionality, balancing feature richness with integration into the existing robust RBAC system. The addition of a Follower/Watcher system significantly enhances flexibility and future-proofing for complex collaboration and visibility needs. 