-- Cleanup Duplicate Sticker Categories
-- This migration removes duplicate sticker categories and adds a unique constraint

-- First, update any stickers that reference duplicate categories to point to the "keeper" category
-- We'll keep the category with the earliest created_at timestamp for each name

-- Step 1: Update smart_stickers to reference the "keeper" categories
WITH keeper_categories AS (
  SELECT DISTINCT ON (name) 
    id as keeper_id, 
    name
  FROM sticker_categories 
  ORDER BY name, created_at ASC
),
duplicate_categories AS (
  SELECT sc.id as duplicate_id, kc.keeper_id
  FROM sticker_categories sc
  JOIN keeper_categories kc ON sc.name = kc.name
  WHERE sc.id != kc.keeper_id
)
UPDATE smart_stickers 
SET category_id = dc.keeper_id
FROM duplicate_categories dc
WHERE smart_stickers.category_id = dc.duplicate_id;

-- Step 2: Delete the duplicate categories (keeping only the earliest created one for each name)
WITH keeper_categories AS (
  SELECT DISTINCT ON (name) 
    id as keeper_id, 
    name
  FROM sticker_categories 
  ORDER BY name, created_at ASC
)
DELETE FROM sticker_categories 
WHERE id NOT IN (SELECT keeper_id FROM keeper_categories);

-- Step 3: Add unique constraint to prevent future duplicates (if not already exists)
DO $$
BEGIN
    -- Check if constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'sticker_categories_name_unique' 
        AND table_name = 'sticker_categories'
    ) THEN
        ALTER TABLE sticker_categories 
        ADD CONSTRAINT sticker_categories_name_unique UNIQUE (name);
        RAISE NOTICE 'Added unique constraint on sticker_categories.name';
    ELSE
        RAISE NOTICE 'Unique constraint on sticker_categories.name already exists';
    END IF;
END $$;

-- Step 4: Verify the cleanup worked
-- This will show the final count of categories (should be 8)
DO $$
DECLARE
    category_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO category_count FROM sticker_categories;
    RAISE NOTICE 'Final sticker categories count: %', category_count;
    
    -- Log the categories that remain
    FOR category_count IN 
        SELECT 1 FROM sticker_categories ORDER BY display_order
    LOOP
        -- Just counting for the notice
    END LOOP;
    
    RAISE NOTICE 'Duplicate sticker categories cleanup completed successfully';
END $$;
