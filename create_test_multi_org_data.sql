-- Test Data for Multi-Organization Contacts System
-- Creates Eva C, ARVIL organization, and demonstrates the system

BEGIN;

-- Get the current user (replace this with actual user ID when running)
DO $$
DECLARE
    test_user_id UUID;
    arvil_org_id UUID;
    ervil_org_id UUID;
    orvil_org_id UUID;
    eva_person_id UUID;
    jan_person_id UUID;
    tomas_person_id UUID;
BEGIN
    -- Get first available user or create a default one
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NULL THEN
        RAISE NOTICE 'No users found in auth.users. Please create a user account first.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Using user ID: %', test_user_id;
    
    -- Create test organizations (only if they don't exist)
    INSERT INTO organizations (id, name, address, notes, user_id)
    SELECT gen_random_uuid(), 'ARVIL', '123 Manufacturing St, Prague', 'Manufacturing company', test_user_id
    WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'ARVIL')
    UNION ALL
    SELECT gen_random_uuid(), 'ERVIL', '456 Tech Ave, Brno', 'Technology company', test_user_id
    WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'ERVIL')
    UNION ALL
    SELECT gen_random_uuid(), 'ORVIL', '789 Business Blvd, Ostrava', 'Business consulting', test_user_id
    WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'ORVIL');
    
    -- Get organization IDs
    SELECT id INTO arvil_org_id FROM organizations WHERE name = 'ARVIL';
    SELECT id INTO ervil_org_id FROM organizations WHERE name = 'ERVIL';
    SELECT id INTO orvil_org_id FROM organizations WHERE name = 'ORVIL';
    
    RAISE NOTICE 'Created organizations: ARVIL=%, ERVIL=%, ORVIL=%', arvil_org_id, ervil_org_id, orvil_org_id;
    
    -- Create test people with legacy organization_id (will be migrated)
    INSERT INTO people (id, first_name, last_name, email, phone, organization_id, user_id)
    VALUES 
        (gen_random_uuid(), 'Eva', 'C', 'eva@c.cz', '+420123456789', arvil_org_id, test_user_id),
        (gen_random_uuid(), 'Jan', 'B', 'jan.b@ar.cz', '+420987654321', ervil_org_id, test_user_id),
        (gen_random_uuid(), 'Tomáš', 'Kovařík', 'tokovarik@gmail.com', '+420605510240', orvil_org_id, test_user_id)
    ON CONFLICT (email) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = EXCLUDED.phone,
        organization_id = EXCLUDED.organization_id;
    
    -- Get person IDs
    SELECT id INTO eva_person_id FROM people WHERE email = 'eva@c.cz';
    SELECT id INTO jan_person_id FROM people WHERE email = 'jan.b@ar.cz';
    SELECT id INTO tomas_person_id FROM people WHERE email = 'tokovarik@gmail.com';
    
    RAISE NOTICE 'Created people: Eva=%, Jan=%, Tomás=%', eva_person_id, jan_person_id, tomas_person_id;
    
    -- Add additional organization roles (multi-organization contacts)
    INSERT INTO person_organization_roles (
        person_id, organization_id, role_title, department, is_primary, status, 
        start_date, notes, created_by_user_id
    ) VALUES 
        -- Eva C works at multiple organizations
        (eva_person_id, arvil_org_id, 'Contact', 'Sales', true, 'active', CURRENT_DATE - INTERVAL '1 year', 'Primary contact at ARVIL', test_user_id),
        (eva_person_id, ervil_org_id, 'Consultant', 'Strategy', false, 'active', CURRENT_DATE - INTERVAL '6 months', 'Part-time consulting role', test_user_id),
        
        -- Jan B has roles at different organizations
        (jan_person_id, ervil_org_id, 'Contact', 'Engineering', true, 'active', CURRENT_DATE - INTERVAL '2 years', 'Primary contact at ERVIL', test_user_id),
        (jan_person_id, arvil_org_id, 'Former Employee', 'Development', false, 'former', CURRENT_DATE - INTERVAL '3 years', 'Previous role before moving to ERVIL', test_user_id),
        
        -- Tomáš has current and former roles
        (tomas_person_id, orvil_org_id, 'Contact', 'Management', true, 'active', CURRENT_DATE - INTERVAL '1 year', 'Primary contact at ORVIL', test_user_id),
        (tomas_person_id, arvil_org_id, 'Board Member', 'Board', false, 'active', CURRENT_DATE - INTERVAL '2 years', 'Board member role at ARVIL', test_user_id)
    ON CONFLICT (person_id, organization_id, role_title) DO UPDATE SET
        department = EXCLUDED.department,
        is_primary = EXCLUDED.is_primary,
        status = EXCLUDED.status,
        notes = EXCLUDED.notes;
    
    RAISE NOTICE 'Created % organization roles', (SELECT COUNT(*) FROM person_organization_roles);
    
    RAISE NOTICE '✅ Test data created successfully!';
    RAISE NOTICE 'Organizations: ARVIL, ERVIL, ORVIL';
    RAISE NOTICE 'People: Eva C (ARVIL + ERVIL), Jan B (ERVIL + former ARVIL), Tomáš (ORVIL + board ARVIL)';
    RAISE NOTICE 'Multi-organization roles: %', (SELECT COUNT(*) FROM person_organization_roles);
    
END $$;

COMMIT; 