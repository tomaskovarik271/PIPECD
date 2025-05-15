-- Add weighted_amount column to deals table
ALTER TABLE deals
ADD COLUMN weighted_amount DECIMAL(10, 2);

-- Note: Consider if this column should have a DEFAULT value
-- or be NOT NULL depending on business logic.
-- For now, it will be NULLABLE.

-- Also consider if existing rows should be updated with a calculated
-- weighted_amount based on their current amount and deal_specific_probability
-- if that column already exists and is populated.
-- This migration only adds the column. 