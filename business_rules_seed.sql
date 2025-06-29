-- BUSINESS RULES SEEDING SCRIPT
-- ===============================
-- This script creates sample business rules for testing and demonstration
-- Run this in the Supabase SQL editor to populate your business rules system

-- First, let's get or create a test user for rule ownership
DO $$
DECLARE
    admin_user_id UUID;
    test_org_id UUID;
    test_deal_id UUID;
    high_value_actions JSONB;
    enterprise_actions JSONB;
BEGIN
    -- Get the first admin user (or any user)
    SELECT id INTO admin_user_id 
    FROM auth.users 
    LIMIT 1;
    
    -- If no users exist, create a placeholder (this shouldn't happen in production)
    IF admin_user_id IS NULL THEN
        RAISE NOTICE 'No users found. Please ensure you have at least one user in your system.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Using user ID: %', admin_user_id;
    
    -- Prepare actions with dynamic user ID
    high_value_actions := jsonb_build_array(
        jsonb_build_object(
            'type', 'NOTIFY_USER',
            'target', admin_user_id,
            'message', '💰 High value deal detected: {{deal_name}} - Amount: ${{deal_amount}}. Requires management attention.',
            'priority', 2,
            'template', 'high_value_alert'
        )
    );
    
    enterprise_actions := jsonb_build_array(
        jsonb_build_object(
            'type', 'NOTIFY_USER',
            'target', admin_user_id,
            'message', '🏢 Enterprise opportunity detected: {{deal_name}}. Consider escalating to senior sales team.',
            'priority', 3,
            'template', 'enterprise_alert'
        )
    );
    
    -- Create sample business rules
    
    -- RULE 1: Deal Assignment Notification
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
        created_by,
        created_at,
        updated_at
    ) VALUES (
        'Deal Assignment Notification',
        'Notify users when they are assigned to a deal',
        'DEAL',
        'FIELD_CHANGE',
        ARRAY['DEAL_UPDATED'],
        ARRAY['assigned_to_user_id'],
        '[{"field": "assigned_to_user_id", "operator": "IS_NOT_NULL", "value": "", "logicalOperator": "AND"}]'::jsonb,
        '[{"type": "NOTIFY_OWNER", "target": null, "message": "🎯 You have been assigned to deal: {{deal_name}} with amount {{deal_amount}}. Please review and take action.", "priority": 1, "template": "deal_assignment"}]'::jsonb,
        'ACTIVE',
        admin_user_id,
        NOW(),
        NOW()
    );
    
    -- RULE 2: High Value Deal Alert
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
        created_by,
        created_at,
        updated_at
    ) VALUES (
        'High Value Deal Alert',
        'Alert when deal amount exceeds $50,000',
        'DEAL',
        'FIELD_CHANGE',
        ARRAY['DEAL_CREATED', 'DEAL_UPDATED'],
        ARRAY['amount'],
        '[{"field": "amount", "operator": "GREATER_EQUAL", "value": "50000", "logicalOperator": "AND"}]'::jsonb,
        high_value_actions,
        'ACTIVE',
        admin_user_id,
        NOW(),
        NOW()
    );
    
    -- RULE 3: Enterprise Deal Detection
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
        created_by,
        created_at,
        updated_at
    ) VALUES (
        'Enterprise Deal Detection',
        'Alert when deal name contains "Enterprise" or "Corp"',
        'DEAL',
        'EVENT_BASED',
        ARRAY['DEAL_CREATED', 'DEAL_UPDATED'],
        ARRAY[]::text[],
        '[{"field": "name", "operator": "CONTAINS", "value": "Enterprise", "logicalOperator": "OR"}, {"field": "name", "operator": "CONTAINS", "value": "Corp", "logicalOperator": "OR"}]'::jsonb,
        enterprise_actions,
        'ACTIVE',
        admin_user_id,
        NOW(),
        NOW()
    );
    
    -- RULE 4: Deal Amount Change Tracker
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
        created_by,
        created_at,
        updated_at
    ) VALUES (
        'Deal Amount Change Tracker',
        'Track when deal amounts change significantly',
        'DEAL',
        'FIELD_CHANGE',
        ARRAY['DEAL_UPDATED'],
        ARRAY['amount'],
        '[{"field": "amount", "operator": "GREATER_THAN", "value": "1000", "logicalOperator": "AND"}]'::jsonb,
        '[{"type": "NOTIFY_OWNER", "target": null, "message": "📈 Deal amount updated for {{deal_name}}. New amount: ${{deal_amount}}", "priority": 1, "template": "amount_change"}]'::jsonb,
        'ACTIVE',
        admin_user_id,
        NOW(),
        NOW()
    );
    
    -- RULE 5: Lead Assignment Notification
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
        created_by,
        created_at,
        updated_at
    ) VALUES (
        'Lead Assignment Notification',
        'Notify users when they are assigned to a lead',
        'LEAD',
        'FIELD_CHANGE',
        ARRAY['LEAD_UPDATED'],
        ARRAY['assigned_to_user_id'],
        '[{"field": "assigned_to_user_id", "operator": "IS_NOT_NULL", "value": "", "logicalOperator": "AND"}]'::jsonb,
        '[{"type": "NOTIFY_OWNER", "target": null, "message": "🎯 You have been assigned to lead: {{lead_name}}. Please follow up promptly.", "priority": 1, "template": "lead_assignment"}]'::jsonb,
        'ACTIVE',
        admin_user_id,
        NOW(),
        NOW()
    );
    
    -- Create a test organization for testing
    INSERT INTO public.organizations (
        name,
        address,
        notes,
        user_id,
        created_at,
        updated_at
    ) VALUES (
        'Test Enterprise Corp',
        '123 Technology Drive, San Francisco, CA 94105',
        'Test organization for business rules demonstration - Technology company',
        admin_user_id,
        NOW(),
        NOW()
    ) RETURNING id INTO test_org_id;
    
    -- Create a test deal to trigger the rules
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
        'Test Enterprise Deal - High Value',
        75000,
        'USD',
        admin_user_id,
        test_org_id,
        admin_user_id,
        NOW(),
        NOW()
    ) RETURNING id INTO test_deal_id;
    
    RAISE NOTICE '✅ Business Rules Seeding Complete!';
    RAISE NOTICE '📊 Created 5 business rules:';
    RAISE NOTICE '   1. Deal Assignment Notification';
    RAISE NOTICE '   2. High Value Deal Alert ($50K+)';
    RAISE NOTICE '   3. Enterprise Deal Detection';
    RAISE NOTICE '   4. Deal Amount Change Tracker';
    RAISE NOTICE '   5. Lead Assignment Notification';
    RAISE NOTICE '';
    RAISE NOTICE '🏢 Created test organization: % (ID: %)', 'Test Enterprise Corp', test_org_id;
    RAISE NOTICE '💼 Created test deal: % (ID: %)', 'Test Enterprise Deal - High Value', test_deal_id;
    RAISE NOTICE '';
    RAISE NOTICE '🧪 To test the rules:';
    RAISE NOTICE '   1. Update the test deal amount or assignment';
    RAISE NOTICE '   2. Create deals with "Enterprise" in the name';
    RAISE NOTICE '   3. Check business_rule_notifications table for results';
    RAISE NOTICE '';
    RAISE NOTICE '📋 View created rules:';
    RAISE NOTICE '   SELECT name, status, entity_type FROM business_rules ORDER BY created_at;';
    
END $$;

-- Show the created business rules
SELECT 
    name,
    entity_type,
    trigger_type,
    status,
    execution_count,
    created_at
FROM public.business_rules 
ORDER BY created_at DESC;

-- Show rule conditions and actions (formatted)
SELECT 
    name,
    jsonb_pretty(conditions) as conditions,
    jsonb_pretty(actions) as actions
FROM public.business_rules 
ORDER BY created_at DESC; 