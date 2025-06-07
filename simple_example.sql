-- Simple example: Add one person with organizational role to TechStart Solutions

-- Step 1: Add a person
INSERT INTO people (user_id, first_name, last_name, email, organization_id) 
VALUES ('a166551d-d6fa-4329-8a8c-f742b8677da4', 'Sarah', 'Williams', 'sarah.williams@techstart.com', 
        (SELECT id FROM organizations WHERE name = 'TechStart Solutions'))
ON CONFLICT (email) DO NOTHING;

-- Step 2: Add their organizational role
INSERT INTO person_organizational_roles (
  person_id, 
  organization_id, 
  role_title, 
  department, 
  seniority_level, 
  is_primary_role, 
  budget_authority_usd, 
  team_size, 
  created_by_user_id
) VALUES (
  (SELECT id FROM people WHERE email = 'sarah.williams@techstart.com'),
  (SELECT id FROM organizations WHERE name = 'TechStart Solutions'),
  'Chief Marketing Officer',
  'Marketing',
  'c_level',
  true,
  2000000.00,
  12,
  'a166551d-d6fa-4329-8a8c-f742b8677da4'
);

-- Step 3: Add stakeholder analysis
INSERT INTO stakeholder_analysis (
  person_id, 
  organization_id, 
  influence_score, 
  decision_authority, 
  engagement_level, 
  approach_strategy, 
  next_best_action
) VALUES (
  (SELECT id FROM people WHERE email = 'sarah.williams@techstart.com'),
  (SELECT id FROM organizations WHERE name = 'TechStart Solutions'),
  8,
  'strong_influence',
  'champion',
  'Brand partnership and marketing alliance discussion',
  'Schedule marketing strategy presentation'
);

-- Verify the data
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