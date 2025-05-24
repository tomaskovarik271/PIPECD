-- RBAC Implementation: Tables, Helper Function, and RLS Policies

BEGIN;

-- 1. Create RBAC Tables

-- Roles Table
CREATE TABLE public.roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL, -- e.g., 'admin', 'member'
    description text
);
COMMENT ON TABLE public.roles IS 'Defines user roles within the application.';

-- Permissions Table
CREATE TABLE public.permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    resource text NOT NULL, -- e.g., 'deal', 'pipeline', 'person'
    action text NOT NULL,   -- e.g., 'create', 'read_own', 'read_any', 'update_own', 'update_any', 'delete_own', 'delete_any'
    description text,
    CONSTRAINT unique_permission UNIQUE (resource, action)
);
COMMENT ON TABLE public.permissions IS 'Defines granular permissions for actions on resources.';

-- Role Permissions Linking Table
CREATE TABLE public.role_permissions (
    role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);
COMMENT ON TABLE public.role_permissions IS 'Maps permissions to roles.';

-- User Roles Linking Table
CREATE TABLE public.user_roles (
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);
COMMENT ON TABLE public.user_roles IS 'Assigns roles to users.';

-- 2. Populate Initial Roles and Permissions

-- Define Roles
INSERT INTO public.roles (name, description) VALUES
('admin', 'Administrator with full access'),
('member', 'Standard user with permissions based on ownership and defined grants');

-- Define Permissions (Expand this list based on application needs)
INSERT INTO public.permissions (resource, action, description) VALUES
-- People
('person', 'create', 'Create a new person'),
('person', 'read_any', 'Read any person'),
('person', 'update_any', 'Update any person'),
('person', 'delete_any', 'Delete any person'),
-- Organizations
('organization', 'create', 'Create a new organization'),
('organization', 'read_any', 'Read any organization'),
('organization', 'update_any', 'Update any organization'),
('organization', 'delete_any', 'Delete any organization'),
-- Deals
('deal', 'create', 'Create a new deal (assigned to self)'),
('deal', 'read_own', 'Read deals owned by self'),
('deal', 'read_any', 'Read any deal'),
('deal', 'update_own', 'Update deals owned by self'),
('deal', 'update_any', 'Update any deal'),
('deal', 'delete_own', 'Delete deals owned by self'),
('deal', 'delete_any', 'Delete any deal'),
('deal', 'assign', 'Assign a deal to a user'), -- New permission for assigning deals
('deal', 'read_assigned', 'Read deals assigned to self'), -- New permission for reading assigned deals
-- Pipelines
('pipeline', 'create', 'Create a new pipeline'),
('pipeline', 'read_any', 'Read any pipeline'),
('pipeline', 'update_any', 'Update any pipeline'),
('pipeline', 'delete_any', 'Delete any pipeline'),
-- Stages
('stage', 'create', 'Create a new stage'),
('stage', 'read_any', 'Read any stage'),
('stage', 'update_any', 'Update any stage'),
('stage', 'delete_any', 'Delete any stage'),
-- Activities
('activity', 'create', 'Create a new activity (assigned to self)'),
('activity', 'read_own', 'Read activities owned by self'),
('activity', 'read_any', 'Read any activity'),
('activity', 'update_own', 'Update activities owned by self'),
('activity', 'update_any', 'Update any activity'),
('activity', 'delete_own', 'Delete activities owned by self'),
('activity', 'delete_any', 'Delete any activity');

-- 3. Assign Permissions to Roles

-- Get Role IDs
CREATE TEMP TABLE temp_roles AS SELECT id, name FROM public.roles;
CREATE TEMP TABLE temp_permissions AS SELECT id, resource, action FROM public.permissions;

-- Assign all permissions to 'admin' role
-- This will automatically include the new 'deal:assign' and 'deal:read_assigned' permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM temp_roles r
CROSS JOIN temp_permissions p
WHERE r.name = 'admin';

-- Assign specific permissions to 'member' role
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM temp_roles r
JOIN temp_permissions p ON TRUE -- Join based on specific permissions needed
WHERE r.name = 'member' AND (
    -- People/Org: Read/Create/Update (Can be modified later)
    (p.resource = 'person' AND p.action IN ('create', 'read_any', 'update_any')) OR 
    (p.resource = 'organization' AND p.action IN ('create', 'read_any', 'update_any')) OR
    -- Deals: Create, Read/Update/Delete Own, Read Assigned
    (p.resource = 'deal' AND p.action IN ('create', 'read_own', 'update_own', 'delete_own', 'read_assigned')) OR -- Added 'read_assigned'
    -- Pipelines/Stages: Read Only
    (p.resource = 'pipeline' AND p.action = 'read_any') OR
    (p.resource = 'stage' AND p.action = 'read_any') OR
    -- Activities: Create, Read/Update/Delete Own
    (p.resource = 'activity' AND p.action IN ('create', 'read_own', 'update_own', 'delete_own'))
);

DROP TABLE temp_roles;
DROP TABLE temp_permissions;

-- 4. Create Helper Function to Check Permissions

CREATE OR REPLACE FUNCTION public.check_permission(
    p_user_id uuid,
    p_action text,
    p_resource text
) RETURNS boolean
    LANGUAGE plpgsql
    SECURITY DEFINER -- Essential for checking permissions tables
    -- Set a secure search_path: Prevents search path hijacking
    SET search_path = public
    AS $$
DECLARE
    has_permission boolean := false;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.role_permissions rp ON ur.role_id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = p_user_id
          AND p.action = p_action
          AND p.resource = p_resource
    )
    INTO has_permission;

    RETURN has_permission;
END;
$$;

-- Revoke execute permission from public implicitly granted by SECURITY DEFINER
-- Then grant execute specifically to authenticated users
REVOKE EXECUTE ON FUNCTION public.check_permission(uuid, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.check_permission(uuid, text, text) TO authenticated;

-- 5. Update RLS Policies

-- Ensure RLS is enabled (should be already, but good practice)
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners (important for security)
ALTER TABLE public.people FORCE ROW LEVEL SECURITY;
ALTER TABLE public.organizations FORCE ROW LEVEL SECURITY;
ALTER TABLE public.deals FORCE ROW LEVEL SECURITY;
ALTER TABLE public.pipelines FORCE ROW LEVEL SECURITY;
ALTER TABLE public.stages FORCE ROW LEVEL SECURITY;
ALTER TABLE public.activities FORCE ROW LEVEL SECURITY;

-- Drop existing policies (using names from previous migrations)
-- People
DROP POLICY IF EXISTS "Allow individual user SELECT access on people" ON public.people;
DROP POLICY IF EXISTS "Allow individual user INSERT access on people" ON public.people;
DROP POLICY IF EXISTS "Allow individual user UPDATE access on people" ON public.people;
DROP POLICY IF EXISTS "Allow individual user DELETE access on people" ON public.people;
-- Organizations
DROP POLICY IF EXISTS "Allow individual user SELECT access on organizations" ON public.organizations;
DROP POLICY IF EXISTS "Allow individual user INSERT access on organizations" ON public.organizations;
DROP POLICY IF EXISTS "Allow individual user UPDATE access on organizations" ON public.organizations;
DROP POLICY IF EXISTS "Allow individual user DELETE access on organizations" ON public.organizations;
-- Deals
DROP POLICY IF EXISTS "Allow individual user SELECT access on deals" ON public.deals;
DROP POLICY IF EXISTS "Allow individual user INSERT access on deals" ON public.deals;
DROP POLICY IF EXISTS "Allow individual user UPDATE access on deals" ON public.deals;
DROP POLICY IF EXISTS "Allow individual user DELETE access on deals" ON public.deals;
-- Pipelines
DROP POLICY IF EXISTS "Users can manage their own pipelines" ON public.pipelines;
-- Stages
DROP POLICY IF EXISTS "Users can manage stages for pipelines they own" ON public.stages;
-- Activities
DROP POLICY IF EXISTS "Users can manage their own activities" ON public.activities;

-- Create New RBAC Policies

-- People Policies
CREATE POLICY "Allow access based on RBAC permissions for people" ON public.people
    FOR ALL -- Use permissive action, let check_permission handle specifics
    USING ( check_permission(auth.uid(), 'read_any', 'person') )
    WITH CHECK ( check_permission(auth.uid(), 'create', 'person') OR -- For INSERT
                  check_permission(auth.uid(), 'update_any', 'person') OR -- For UPDATE
                  check_permission(auth.uid(), 'delete_any', 'person') ); -- For DELETE

-- Organizations Policies
CREATE POLICY "Allow access based on RBAC permissions for organizations" ON public.organizations
    FOR ALL
    USING ( check_permission(auth.uid(), 'read_any', 'organization') )
    WITH CHECK ( check_permission(auth.uid(), 'create', 'organization') OR 
                  check_permission(auth.uid(), 'update_any', 'organization') OR 
                  check_permission(auth.uid(), 'delete_any', 'organization') );

-- Deals Policies
CREATE POLICY "Allow access based on RBAC permissions for deals" ON public.deals
    FOR ALL
    USING (
        (check_permission(auth.uid(), 'read_own', 'deal') AND auth.uid() = user_id) OR
        (check_permission(auth.uid(), 'read_assigned', 'deal') AND auth.uid() = assigned_to_user_id) OR -- Added for assigned deals
        (check_permission(auth.uid(), 'read_any', 'deal'))
    )
    WITH CHECK (
        -- INSERT check: requires 'create' permission AND user_id must match authenticated user
        (check_permission(auth.uid(), 'create', 'deal') AND auth.uid() = user_id) OR 
        -- UPDATE check: requires 'update_own' and ownership OR 'update_any' OR ('assign' and the deal is being assigned)
        ( (check_permission(auth.uid(), 'update_own', 'deal') AND auth.uid() = user_id) OR 
          check_permission(auth.uid(), 'update_any', 'deal') OR
          check_permission(auth.uid(), 'assign', 'deal') -- Added for assigning deals
        ) OR
        -- DELETE check: requires 'delete_own' and ownership OR 'delete_any'
        ( (check_permission(auth.uid(), 'delete_own', 'deal') AND auth.uid() = user_id) OR check_permission(auth.uid(), 'delete_any', 'deal') )
    );

-- Pipelines Policies
CREATE POLICY "Allow access based on RBAC permissions for pipelines" ON public.pipelines
    FOR ALL
    USING ( check_permission(auth.uid(), 'read_any', 'pipeline') )
    WITH CHECK ( check_permission(auth.uid(), 'create', 'pipeline') OR 
                  check_permission(auth.uid(), 'update_any', 'pipeline') OR 
                  check_permission(auth.uid(), 'delete_any', 'pipeline') );

-- Stages Policies
CREATE POLICY "Allow access based on RBAC permissions for stages" ON public.stages
    FOR ALL
    USING ( check_permission(auth.uid(), 'read_any', 'stage') )
    WITH CHECK ( check_permission(auth.uid(), 'create', 'stage') OR 
                  check_permission(auth.uid(), 'update_any', 'stage') OR 
                  check_permission(auth.uid(), 'delete_any', 'stage') );

-- Activities Policies
CREATE POLICY "Allow access based on RBAC permissions for activities" ON public.activities
    FOR ALL
    USING (
        (check_permission(auth.uid(), 'read_own', 'activity') AND auth.uid() = user_id) OR
        (check_permission(auth.uid(), 'read_any', 'activity'))
    )
    WITH CHECK (
        -- INSERT check: requires 'create' permission AND user_id must match authenticated user
        (check_permission(auth.uid(), 'create', 'activity') AND auth.uid() = user_id) OR 
        -- UPDATE check: requires 'update_own' and ownership OR 'update_any'
        ( (check_permission(auth.uid(), 'update_own', 'activity') AND auth.uid() = user_id) OR check_permission(auth.uid(), 'update_any', 'activity') ) OR
        -- DELETE check: requires 'delete_own' and ownership OR 'delete_any'
        ( (check_permission(auth.uid(), 'delete_own', 'activity') AND auth.uid() = user_id) OR check_permission(auth.uid(), 'delete_any', 'activity') )
    );


COMMIT;
