ALTER TABLE public.stages
ADD COLUMN stage_type TEXT NOT NULL DEFAULT 'OPEN'
CONSTRAINT stage_type_check CHECK (stage_type IN ('OPEN', 'WON', 'LOST'));

COMMENT ON COLUMN public.stages.stage_type IS 'Defines the category of the stage, e.g., OPEN for regular stages, WON for success stages, LOST for failure stages. Critical for Kanban and deal lifecycle management.';

-- Optional: If you want to ensure existing stages get a default value (though DEFAULT 'OPEN' should handle new rows, existing rows might need an update if they were NULLABLE initially - but we made it NOT NULL DEFAULT)
-- UPDATE public.stages SET stage_type = 'OPEN' WHERE stage_type IS NULL; 
-- This line is likely not needed because we added NOT NULL DEFAULT 'OPEN' directly.
