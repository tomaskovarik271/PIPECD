-- 01_business_rules.sql
-- BUSINESS RULES SEEDING SCRIPT
-- ===============================
-- Creates sample business rules for testing and demonstration
-- These are moved from the main seed.sql for better organization

DO $$
DECLARE
    high_value_actions JSONB;
    enterprise_actions JSONB;
BEGIN
    RAISE NOTICE 'Creating business rules with NULL created_by (will be updated when users exist)';
    
    -- Prepare actions that will work with any user (using NOTIFY_OWNER instead of specific user)
    high_value_actions := jsonb_build_array(
        jsonb_build_object(
            'type', 'NOTIFY_OWNER',
            'target', null,
            'message', '💰 High value deal detected: {{deal_name}} - Amount: ${{deal_amount}}. Requires management attention.',
            'priority', 2,
            'template', 'high_value_alert'
        )
    );
    
    enterprise_actions := jsonb_build_array(
        jsonb_build_object(
            'type', 'NOTIFY_OWNER',
            'target', null,
            'message', '🏢 Enterprise opportunity detected: {{deal_name}}. Consider escalating to senior sales team.',
            'priority', 3,
            'template', 'enterprise_alert'
        )
    );
    
    -- Create sample business rules with NULL created_by (will be updated when users exist)
    
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
        NULL,
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
        NULL,
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
        NULL,
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
        NULL,
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
        NULL,
        NOW(),
        NOW()
    );

    RAISE NOTICE 'Business rules seeding completed successfully! Created 5 business rules.';
END $$; 