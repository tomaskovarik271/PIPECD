BEGIN;

-- Add missing permissions for relationship intelligence features

INSERT INTO public.permissions (resource, action, description) VALUES
-- Person Organizational Roles
('person_organizational_role', 'create', 'Create a new person organizational role'),
('person_organizational_role', 'read_any', 'Read any person organizational role'),
('person_organizational_role', 'update_own', 'Update person organizational roles created by self'),
('person_organizational_role', 'update_any', 'Update any person organizational role'),
('person_organizational_role', 'delete_own', 'Delete person organizational roles created by self'),
('person_organizational_role', 'delete_any', 'Delete any person organizational role'),

-- Person Relationships
('person_relationship', 'create', 'Create a new person relationship'),
('person_relationship', 'read_any', 'Read any person relationship'),
('person_relationship', 'update_own', 'Update person relationships created by self'),
('person_relationship', 'update_any', 'Update any person relationship'),
('person_relationship', 'delete_own', 'Delete person relationships created by self'),
('person_relationship', 'delete_any', 'Delete any person relationship'),

-- Organization Relationships
('organization_relationship', 'create', 'Create a new organization relationship'),
('organization_relationship', 'read_any', 'Read any organization relationship'),
('organization_relationship', 'update_own', 'Update organization relationships created by self'),
('organization_relationship', 'update_any', 'Update any organization relationship'),
('organization_relationship', 'delete_own', 'Delete organization relationships created by self'),
('organization_relationship', 'delete_any', 'Delete any organization relationship'),

-- Stakeholder Analysis
('stakeholder_analysis', 'create', 'Create a new stakeholder analysis'),
('stakeholder_analysis', 'read_any', 'Read any stakeholder analysis'),
('stakeholder_analysis', 'update_own', 'Update stakeholder analysis created by self'),
('stakeholder_analysis', 'update_any', 'Update any stakeholder analysis'),
('stakeholder_analysis', 'delete_own', 'Delete stakeholder analysis created by self'),
('stakeholder_analysis', 'delete_any', 'Delete any stakeholder analysis'),

-- Territory Management
('territory', 'create', 'Create a new territory'),
('territory', 'read_any', 'Read any territory'),
('territory', 'update_any', 'Update any territory'),
('territory', 'delete_any', 'Delete any territory'),

-- Relationship Insights
('relationship_insight', 'read_any', 'Read any relationship insight'),
('relationship_insight', 'update_any', 'Update any relationship insight'),
('relationship_insight', 'delete_any', 'Delete any relationship insight')

ON CONFLICT (resource, action) DO NOTHING;

-- Assign new permissions to roles

-- Get Role IDs
CREATE TEMP TABLE temp_roles AS SELECT id, name FROM public.roles;
CREATE TEMP TABLE temp_permissions AS SELECT id, resource, action FROM public.permissions;

-- Assign all new permissions to 'admin' role
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM temp_roles r
JOIN temp_permissions p ON TRUE
WHERE r.name = 'admin' AND p.resource IN (
    'person_organizational_role', 'person_relationship', 'organization_relationship',
    'stakeholder_analysis', 'territory', 'relationship_insight'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign specific permissions to 'member' role for relationship intelligence
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM temp_roles r
JOIN temp_permissions p ON TRUE
WHERE r.name = 'member' AND (
    -- Person Organizational Roles: Create, Read, Update/Delete Own
    (p.resource = 'person_organizational_role' AND p.action IN ('create', 'read_any', 'update_own', 'delete_own')) OR
    -- Person Relationships: Create, Read, Update/Delete Own
    (p.resource = 'person_relationship' AND p.action IN ('create', 'read_any', 'update_own', 'delete_own')) OR
    -- Organization Relationships: Create, Read, Update/Delete Own
    (p.resource = 'organization_relationship' AND p.action IN ('create', 'read_any', 'update_own', 'delete_own')) OR
    -- Stakeholder Analysis: Create, Read, Update/Delete Own
    (p.resource = 'stakeholder_analysis' AND p.action IN ('create', 'read_any', 'update_own', 'delete_own')) OR
    -- Territory: Read Only for members
    (p.resource = 'territory' AND p.action = 'read_any') OR
    -- Relationship Insights: Read Only for members
    (p.resource = 'relationship_insight' AND p.action = 'read_any')
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

DROP TABLE temp_roles;
DROP TABLE temp_permissions;

COMMIT; 