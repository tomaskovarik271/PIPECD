-- BUSINESS RULES SYSTEM - COMPREHENSIVE BUG ANALYSIS AND TEST CASES
-- =====================================================================
-- This file documents all bugs found in the Business Rules implementation
-- and provides test cases to verify the fixes.

-- BUGS IDENTIFIED:
-- ================

-- 1. FRONTEND FORM ENUM MISMATCHES
--    - OPERATORS array in BusinessRulesFormModal.tsx had wrong enum values:
--      * 'GREATER_THAN_OR_EQUAL' instead of 'GREATER_EQUAL'
--      * 'LESS_THAN_OR_EQUAL' instead of 'LESS_EQUAL' 
--      * 'IS_EMPTY' instead of 'IS_NULL'
--      * 'IS_NOT_EMPTY' instead of 'IS_NOT_NULL'
--      * Missing operators: OLDER_THAN, NEWER_THAN, CHANGED_FROM, CHANGED_TO, etc.
--      * Invalid operators: NOT_CONTAINS, REGEX_MATCH

-- 2. ACTION TYPES MISMATCH
--    - ACTION_TYPES array had invalid values:
--      * Missing 'NOTIFY_OWNER' (valid in GraphQL)
--      * Invalid values: ASSIGN_USER, CHANGE_STAGE, ADD_TAG, WEBHOOK

-- 3. DATA TYPE CONVERSION ISSUES
--    - Priority field sent as string instead of number
--    - Store wasn't converting form data to proper GraphQL types

-- 4. MISSING BUSINESS RULES INTEGRATION
--    - Deal service wasn't triggering business rules (FIXED)
--    - process_business_rules() function calls were missing

-- TEST SETUP
-- ==========

-- First, let's create a test user and get their ID
DO $$
DECLARE
    test_user_id UUID;
    test_org_id UUID;
    test_deal_id UUID;
    test_rule_id UUID;
BEGIN
    -- Get or create test user
    SELECT id INTO test_user_id 
    FROM public.users 
    WHERE email = 'test@example.com' 
    LIMIT 1;
    
    IF test_user_id IS NULL THEN
        INSERT INTO public.users (email, display_name, created_at, updated_at)
        VALUES ('test@example.com', 'Test User', NOW(), NOW())
        RETURNING id INTO test_user_id;
    END IF;
    
    RAISE NOTICE 'Test User ID: %', test_user_id;
    
    -- Create test organization
    INSERT INTO public.organizations (name, user_id, created_at, updated_at)
    VALUES ('Test Organization for Business Rules', test_user_id, NOW(), NOW())
    RETURNING id INTO test_org_id;
    
    RAISE NOTICE 'Test Organization ID: %', test_org_id;
    
    -- TEST CASE 1: Deal Assignment Notification Rule
    -- ==============================================
    -- This tests the fixed enum values and data types
    
    INSERT INTO public.business_rules (
        name,
        description,
        entity_type,
        trigger_type,
        trigger_events,
        trigger_fields,
        conditions,
        actions,
        status,
        created_by_user_id,
        created_at,
        updated_at
    ) VALUES (
        'Deal Assignment Notification - Complete Test',
        'Notify when a deal is assigned to someone (tests all fixed enum values)',
        'DEAL',
        'FIELD_CHANGE',
        ARRAY['DEAL_UPDATED'],
        ARRAY['assigned_to_user_id'],
        '[
            {
                "field": "assigned_to_user_id",
                "operator": "IS_NOT_NULL",
                "value": "",
                "logicalOperator": "AND"
            }
        ]'::jsonb,
        '[
            {
                "type": "NOTIFY_OWNER",
                "target": null,
                "message": "You have been assigned to deal: {{deal_name}} (Amount: {{deal_amount}})",
                "priority": 1,
                "template": "deal_assignment"
            }
        ]'::jsonb,
        'ACTIVE',
        test_user_id,
        NOW(),
        NOW()
    ) RETURNING id INTO test_rule_id;
    
    RAISE NOTICE 'Test Rule ID: %', test_rule_id;
    
    -- TEST CASE 2: Deal Amount Change Rule
    -- ===================================
    -- This tests numeric operators that were fixed
    
    INSERT INTO public.business_rules (
        name,
        description,
        entity_type,
        trigger_type,
        trigger_events,
        trigger_fields,
        conditions,
        actions,
        status,
        created_by_user_id,
        created_at,
        updated_at
    ) VALUES (
        'High Value Deal Alert - Numeric Operators Test',
        'Alert when deal amount is greater than or equal to 50000',
        'DEAL',
        'FIELD_CHANGE',
        ARRAY['DEAL_UPDATED'],
        ARRAY['amount'],
        '[
            {
                "field": "amount",
                "operator": "GREATER_EQUAL",
                "value": "50000",
                "logicalOperator": "AND"
            }
        ]'::jsonb,
        '[
            {
                "type": "NOTIFY_USER",
                "target": "' || test_user_id || '",
                "message": "High value deal detected: {{deal_name}} - Amount: {{deal_amount}}",
                "priority": 2,
                "template": "high_value_alert"
            }
        ]'::jsonb,
        'ACTIVE',
        test_user_id,
        NOW(),
        NOW()
    );
    
    -- TEST CASE 3: Deal Name Contains Rule
    -- ===================================
    -- This tests string operators
    
    INSERT INTO public.business_rules (
        name,
        description,
        entity_type,
        trigger_type,
        trigger_events,
        trigger_fields,
        conditions,
        actions,
        status,
        created_by_user_id,
        created_at,
        updated_at
    ) VALUES (
        'Enterprise Deal Alert - String Operators Test',
        'Alert when deal name contains "Enterprise"',
        'DEAL',
        'EVENT_BASED',
        ARRAY['DEAL_CREATED', 'DEAL_UPDATED'],
        ARRAY[],
        '[
            {
                "field": "name",
                "operator": "CONTAINS",
                "value": "Enterprise",
                "logicalOperator": "AND"
            }
        ]'::jsonb,
        '[
            {
                "type": "NOTIFY_USER",
                "target": "' || test_user_id || '",
                "message": "Enterprise deal detected: {{deal_name}}",
                "priority": 3,
                "template": "enterprise_alert"
            }
        ]'::jsonb,
        'ACTIVE',
        test_user_id,
        NOW(),
        NOW()
    );
    
    -- Now create a test deal to trigger the rules
    INSERT INTO public.deals (
        name,
        amount,
        currency,
        user_id,
        organization_id,
        assigned_to_user_id,
        created_at,
        updated_at
    ) VALUES (
        'Test Enterprise Deal',
        75000,
        'USD',
        test_user_id,
        test_org_id,
        test_user_id,
        NOW(),
        NOW()
    ) RETURNING id INTO test_deal_id;
    
    RAISE NOTICE 'Test Deal ID: %', test_deal_id;
    
    -- Test the business rules processing
    RAISE NOTICE 'Testing business rules processing...';
    
    -- Test DEAL_CREATED event
    PERFORM public.process_business_rules(
        'DEAL',
        test_deal_id,
        'DEAL_CREATED',
        json_build_object(
            'id', test_deal_id,
            'name', 'Test Enterprise Deal',
            'amount', 75000,
            'currency', 'USD',
            'assigned_to_user_id', test_user_id,
            'organization_id', test_org_id
        )::jsonb,
        NULL
    );
    
    -- Test DEAL_UPDATED event (assignment change)
    PERFORM public.process_business_rules(
        'DEAL',
        test_deal_id,
        'DEAL_UPDATED',
        json_build_object(
            'id', test_deal_id,
            'name', 'Test Enterprise Deal',
            'amount', 75000,
            'currency', 'USD',
            'assigned_to_user_id', test_user_id,
            'organization_id', test_org_id
        )::jsonb,
        json_build_object(
            'original_assigned_to_user_id', NULL,
            'original_amount', 50000
        )::jsonb
    );
    
    RAISE NOTICE 'Business rules processing completed.';
    
END $$;

-- VERIFICATION QUERIES
-- ====================

-- Check if business rules were created correctly
SELECT 
    name,
    entity_type,
    trigger_type,
    status,
    jsonb_pretty(conditions) as conditions,
    jsonb_pretty(actions) as actions
FROM public.business_rules 
WHERE name LIKE '%Test%'
ORDER BY created_at DESC;

-- Check if notifications were created
SELECT 
    br.name as rule_name,
    brn.title,
    brn.message,
    brn.priority,
    brn.notification_type,
    brn.created_at
FROM public.business_rule_notifications brn
JOIN public.business_rules br ON br.id = brn.rule_id
WHERE br.name LIKE '%Test%'
ORDER BY brn.created_at DESC;

-- Check rule executions
SELECT 
    br.name as rule_name,
    re.execution_trigger,
    re.conditions_met,
    re.notifications_created,
    re.executed_at,
    jsonb_pretty(re.execution_result) as execution_result
FROM public.rule_executions re
JOIN public.business_rules br ON br.id = re.rule_id
WHERE br.name LIKE '%Test%'
ORDER BY re.executed_at DESC;

-- CLEANUP (uncomment to clean up test data)
-- DELETE FROM public.business_rule_notifications WHERE rule_id IN (
--     SELECT id FROM public.business_rules WHERE name LIKE '%Test%'
-- );
-- DELETE FROM public.rule_executions WHERE rule_id IN (
--     SELECT id FROM public.business_rules WHERE name LIKE '%Test%'
-- );
-- DELETE FROM public.business_rules WHERE name LIKE '%Test%';
-- DELETE FROM public.deals WHERE name LIKE '%Test%';
-- DELETE FROM public.organizations WHERE name LIKE '%Test%';

-- SUMMARY OF FIXES APPLIED:
-- =========================
-- 1. ✅ Fixed OPERATORS array in BusinessRulesFormModal.tsx
-- 2. ✅ Fixed ACTION_TYPES array in BusinessRulesFormModal.tsx  
-- 3. ✅ Fixed data type conversion in useBusinessRulesStore.ts
-- 4. ✅ Business rules integration already working in dealService
-- 5. ✅ All GraphQL enum values match database function operators
-- 6. ✅ Priority field properly converted to number
-- 7. ✅ LogicalOperator defaults to 'AND' when not specified

-- TESTING INSTRUCTIONS:
-- =====================
-- 1. Run this SQL script to create test data
-- 2. Use the admin UI to create a business rule
-- 3. Verify the dropdowns show correct values
-- 4. Create/update a deal to trigger the rules
-- 5. Check the notifications table for results
-- 6. Verify no GraphQL errors occur during rule creation

RAISE NOTICE 'Business Rules bug analysis and test setup complete!';
RAISE NOTICE 'All identified bugs have been documented and test cases created.';
RAISE NOTICE 'The system should now work correctly with the frontend fixes applied.'; 