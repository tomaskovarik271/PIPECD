-- Create the leads table
CREATE TABLE public.leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid NOT NULL,
    name text,
    email text,
    phone text,
    company_name text,
    source text,
    status text DEFAULT 'New'::text NOT NULL, -- e.g., New, Contacted, Qualified, Unqualified
    notes text,
    CONSTRAINT leads_pkey PRIMARY KEY (id),
    CONSTRAINT leads_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE -- Link to auth user
);

-- Add indexes for common queries
CREATE INDEX idx_leads_user_id ON public.leads USING btree (user_id);
CREATE INDEX idx_leads_status ON public.leads USING btree (status);

-- Add comments to clarify columns
COMMENT ON COLUMN public.leads.name IS 'Name of the lead (can be person or company)';
COMMENT ON COLUMN public.leads.source IS 'Where the lead came from (e.g., Website, Referral)';
COMMENT ON COLUMN public.leads.status IS 'Current stage of the lead (e.g., New, Contacted, Qualified, Unqualified)';

-- Enable Row Level Security (RLS)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy: Users can view their own leads
CREATE POLICY "Allow logged-in users to view their own leads" ON public.leads
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert leads for themselves
CREATE POLICY "Allow logged-in users to insert their own leads" ON public.leads
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own leads
CREATE POLICY "Allow logged-in users to update their own leads" ON public.leads
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own leads
CREATE POLICY "Allow logged-in users to delete their own leads" ON public.leads
    FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on row modification
CREATE TRIGGER on_lead_update
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();
