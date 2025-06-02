-- Enable moddatetime extension FIRST
CREATE EXTENSION IF NOT EXISTS moddatetime WITH SCHEMA extensions;

-- Migration for Pipelines and Stages

-- 1. Create Pipelines table
CREATE TABLE public.pipelines (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name character varying NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT pipelines_user_id_name_key UNIQUE (user_id, name) -- Ensure unique pipeline names per user
);

ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;

-- Add updated_at trigger (Specify schema for moddatetime function)
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.pipelines
  FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime (updated_at);

-- RLS Policies for Pipelines
CREATE POLICY "Users can manage their own pipelines" ON public.pipelines
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.pipelines TO authenticated;


-- 2. Create Stages table
CREATE TABLE public.stages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    pipeline_id uuid REFERENCES public.pipelines(id) ON DELETE CASCADE NOT NULL,
    name character varying NOT NULL,
    "order" integer NOT NULL DEFAULT 0, -- Order within the pipeline
    deal_probability real NULL, -- Optional: Probability of winning from this stage (0.0 to 1.0)
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT stages_pipeline_id_name_key UNIQUE (pipeline_id, name), -- Ensure unique stage names within a pipeline
    CONSTRAINT stages_pipeline_id_order_key UNIQUE (pipeline_id, "order") -- Ensure unique order within a pipeline
);

ALTER TABLE public.stages ENABLE ROW LEVEL SECURITY;

-- Add updated_at trigger (Specify schema for moddatetime function)
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.stages
  FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime (updated_at);

-- RLS Policies for Stages
CREATE POLICY "Users can manage stages for pipelines they own" ON public.stages
    FOR ALL
    USING (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1
            FROM public.pipelines p
            WHERE p.id = stages.pipeline_id AND p.user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1
            FROM public.pipelines p
            WHERE p.id = stages.pipeline_id AND p.user_id = auth.uid()
        )
    );

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.stages TO authenticated;


-- 3. Add stage_id column to Deals table
ALTER TABLE public.deals
ADD COLUMN stage_id uuid NULL REFERENCES public.stages(id) ON DELETE SET NULL; -- Allow null initially, set null if stage deleted

-- Add an index for the new foreign key
CREATE INDEX idx_deals_stage_id ON public.deals(stage_id);

-- Note: We are NOT removing the old 'stage' text column yet.
-- A separate migration/process will be needed to populate stage_id based on existing stages
-- and potentially make stage_id non-nullable if desired.

-- Ensure RLS on deals allows interaction based on stage ownership (implicitly via user_id on deal)
-- The existing policies based on deals.user_id = auth.uid() should suffice for now.
