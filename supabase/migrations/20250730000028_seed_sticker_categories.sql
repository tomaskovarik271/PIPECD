-- Seed Smart Sticker Categories
-- Creates default categories for smart stickers

INSERT INTO sticker_categories (
  id,
  name,
  color,
  icon,
  description,
  is_system,
  display_order,
  created_at,
  updated_at
) VALUES
  (
    gen_random_uuid(),
    'Important',
    '#FF6B6B',
    'star',
    'High priority items that need immediate attention',
    true,
    1,
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'Follow Up',
    '#4ECDC4',
    'clock',
    'Items that require follow-up action',
    true,
    2,
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'Decision',
    '#45B7D1',
    'checkCircle',
    'Decision points and approvals needed',
    true,
    3,
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'Risk',
    '#FFA726',
    'warning',
    'Potential risks and concerns',
    true,
    4,
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'Opportunity',
    '#66BB6A',
    'trendingUp',
    'Growth opportunities and positive developments',
    true,
    5,
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'Research',
    '#9C27B0',
    'users',
    'Research findings and insights',
    true,
    6,
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'Technical',
    '#FF9800',
    'settings',
    'Technical requirements and specifications',
    true,
    7,
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'Budget',
    '#4CAF50',
    'dollarSign',
    'Financial and budget-related items',
    true,
    8,
    now(),
    now()
  ); 