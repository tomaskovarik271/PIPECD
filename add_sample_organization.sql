-- Sample script to add a new organization with stakeholders
-- Run this to see the relationship intelligence system in action

-- Step 1: Add a new organization
INSERT INTO organizations (
  user_id,
  name,
  industry,
  website,
  description
) VALUES (
  'a166551d-d6fa-4329-8a8c-f742b8677da4',
  'TechStart Solutions',
  'Software Development',
  'https://techstart.example.com',
  'AI-powered software development company'
) ON CONFLICT DO NOTHING;

-- Get the organization ID for use in subsequent queries
-- (Replace with actual ID after running above)

-- Step 2: Add key people
INSERT INTO people (
  user_id,
  first_name,
  last_name,
  email,
  phone,
  organization_id
) VALUES 
  ('a166551d-d6fa-4329-8a8c-f742b8677da4', 'Emma', 'Thompson', 'emma.thompson@techstart.com', '+1-555-0101', (SELECT id FROM organizations WHERE name = 'TechStart Solutions')),
  ('a166551d-d6fa-4329-8a8c-f742b8677da4', 'Robert', 'Chen', 'robert.chen@techstart.com', '+1-555-0102', (SELECT id FROM organizations WHERE name = 'TechStart Solutions')),
  ('a166551d-d6fa-4329-8a8c-f742b8677da4', 'Maria', 'Rodriguez', 'maria.rodriguez@techstart.com', '+1-555-0103', (SELECT id FROM organizations WHERE name = 'TechStart Solutions')),
  ('a166551d-d6fa-4329-8a8c-f742b8677da4', 'Alex', 'Johnson', 'alex.johnson@techstart.com', '+1-555-0104', (SELECT id FROM organizations WHERE name = 'TechStart Solutions'))
ON CONFLICT (email) DO NOTHING;

-- Step 3: Add organizational roles
INSERT INTO person_organizational_roles (
  person_id,
  organization_id,
  role_title,
  department,
  seniority_level,
  is_primary_role,
  start_date,
  budget_authority_usd,
  team_size,
  created_by_user_id
) VALUES 
  -- Emma Thompson - CEO
  (
    (SELECT id FROM people WHERE email = 'emma.thompson@techstart.com'),
    (SELECT id FROM organizations WHERE name = 'TechStart Solutions'),
    'Chief Executive Officer',
    'Executive',
    'c_level',
    true,
    '2022-01-01',
    25000000.00,  -- $25M budget
    120,
    'a166551d-d6fa-4329-8a8c-f742b8677da4'
  ),
  -- Robert Chen - CTO  
  (
    (SELECT id FROM people WHERE email = 'robert.chen@techstart.com'),
    (SELECT id FROM organizations WHERE name = 'TechStart Solutions'),
    'Chief Technology Officer',
    'Engineering',
    'c_level',
    true,
    '2022-02-15',
    8000000.00,  -- $8M budget
    45,
    'a166551d-d6fa-4329-8a8c-f742b8677da4'
  ),
  -- Maria Rodriguez - VP Sales
  (
    (SELECT id FROM people WHERE email = 'maria.rodriguez@techstart.com'),
    (SELECT id FROM organizations WHERE name = 'TechStart Solutions'),
    'VP of Sales',
    'Sales',
    'vp',
    true,
    '2022-03-01',
    3000000.00,  -- $3M budget
    15,
    'a166551d-d6fa-4329-8a8c-f742b8677da4'
  ),
  -- Alex Johnson - Director of Product
  (
    (SELECT id FROM people WHERE email = 'alex.johnson@techstart.com'),
    (SELECT id FROM organizations WHERE name = 'TechStart Solutions'),
    'Director of Product',
    'Product',
    'director',
    true,
    '2022-04-01',
    1500000.00,  -- $1.5M budget
    8,
    'a166551d-d6fa-4329-8a8c-f742b8677da4'
  )
ON CONFLICT DO NOTHING;

-- Step 4: Add stakeholder analysis for network intelligence
INSERT INTO stakeholder_analysis (
  person_id,
  organization_id,
  influence_score,
  decision_authority,
  engagement_level,
  approach_strategy,
  next_best_action,
  ai_personality_profile,
  ai_communication_style
) VALUES 
  -- Emma Thompson - CEO
  (
    (SELECT id FROM people WHERE email = 'emma.thompson@techstart.com'),
    (SELECT id FROM organizations WHERE name = 'TechStart Solutions'),
    10,  -- Maximum influence
    'final_decision',
    'supporter',
    'Strategic executive briefing focusing on business transformation and ROI',
    'Schedule C-level presentation with board metrics and competitive analysis',
    'Visionary leader focused on growth and market positioning. Values strategic partnerships.',
    'Prefers high-level strategic discussions with clear business impact metrics'
  ),
  -- Robert Chen - CTO
  (
    (SELECT id FROM people WHERE email = 'robert.chen@techstart.com'),
    (SELECT id FROM organizations WHERE name = 'TechStart Solutions'),
    9,  -- High technical influence
    'strong_influence',
    'champion',
    'Technical deep-dive with hands-on architecture review and proof of concept',
    'Arrange technical workshop and pilot project discussion',
    'Highly technical, innovation-focused, values cutting-edge solutions and scalability',
    'Enjoys detailed technical discussions, code reviews, and architecture diagrams'
  ),
  -- Maria Rodriguez - VP Sales
  (
    (SELECT id FROM people WHERE email = 'maria.rodriguez@techstart.com'),
    (SELECT id FROM organizations WHERE name = 'TechStart Solutions'),
    7,  -- Good influence on commercial decisions
    'strong_influence',
    'neutral',
    'ROI-focused presentation with competitive analysis and implementation timeline',
    'Present customer success stories and revenue impact analysis',
    'Results-driven, quota-focused, values solutions that drive revenue growth',
    'Prefers data-driven conversations with clear metrics and customer testimonials'
  ),
  -- Alex Johnson - Director of Product
  (
    (SELECT id FROM people WHERE email = 'alex.johnson@techstart.com'),
    (SELECT id FROM organizations WHERE name = 'TechStart Solutions'),
    6,  -- Moderate influence on product decisions
    'recommender',
    'supporter',
    'Product roadmap alignment and user experience demonstration',
    'Schedule product demo focusing on user workflow and integration capabilities',
    'User-centric, detail-oriented, values solutions that enhance user experience',
    'Appreciates user journey discussions, UX/UI reviews, and integration examples'
  )
ON CONFLICT DO NOTHING;

-- Step 5: Add some relationships between stakeholders
INSERT INTO person_relationships (
  from_person_id,
  to_person_id,
  relationship_type,
  relationship_strength,
  is_bidirectional,
  interaction_frequency,
  relationship_context,
  created_by_user_id
) VALUES 
  -- Emma (CEO) manages Robert (CTO)
  (
    (SELECT id FROM people WHERE email = 'emma.thompson@techstart.com'),
    (SELECT id FROM people WHERE email = 'robert.chen@techstart.com'),
    'manages',
    8,
    false,
    'weekly',
    'Direct report relationship - strategic technology decisions',
    'a166551d-d6fa-4329-8a8c-f742b8677da4'
  ),
  -- Emma (CEO) manages Maria (VP Sales)
  (
    (SELECT id FROM people WHERE email = 'emma.thompson@techstart.com'),
    (SELECT id FROM people WHERE email = 'maria.rodriguez@techstart.com'),
    'manages',
    8,
    false,
    'weekly',
    'Direct report relationship - revenue and growth strategy',
    'a166551d-d6fa-4329-8a8c-f742b8677da4'
  ),
  -- Robert (CTO) collaborates with Alex (Product Director)
  (
    (SELECT id FROM people WHERE email = 'robert.chen@techstart.com'),
    (SELECT id FROM people WHERE email = 'alex.johnson@techstart.com'),
    'collaborates_with',
    9,
    true,
    'daily',
    'Close collaboration on product technical requirements and architecture',
    'a166551d-d6fa-4329-8a8c-f742b8677da4'
  ),
  -- Maria (VP Sales) influences Alex (Product Director)  
  (
    (SELECT id FROM people WHERE email = 'maria.rodriguez@techstart.com'),
    (SELECT id FROM people WHERE email = 'alex.johnson@techstart.com'),
    'influences',
    6,
    false,
    'monthly',
    'Sales feedback influences product roadmap and feature prioritization',
    'a166551d-d6fa-4329-8a8c-f742b8677da4'
  )
ON CONFLICT DO NOTHING;

-- Query to verify the data was inserted
SELECT 
  o.name as organization,
  p.first_name || ' ' || p.last_name as person_name,
  por.role_title,
  por.seniority_level,
  sa.influence_score,
  sa.decision_authority,
  sa.engagement_level
FROM organizations o
JOIN people p ON p.organization_id = o.id
JOIN person_organizational_roles por ON por.person_id = p.id AND por.organization_id = o.id
LEFT JOIN stakeholder_analysis sa ON sa.person_id = p.id AND sa.organization_id = o.id
WHERE o.name = 'TechStart Solutions'
ORDER BY sa.influence_score DESC NULLS LAST; 