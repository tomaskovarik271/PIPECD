-- 20250730000052_create_conversion_system_tables.sql
-- Bi-Directional Lead-Deal Conversion System Database Schema

BEGIN;

-- 1. Create conversion_history table for audit trail
CREATE TABLE public.conversion_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversion_type VARCHAR(50) NOT NULL CHECK (conversion_type IN ('LEAD_TO_DEAL', 'DEAL_TO_LEAD')),
  source_entity_type VARCHAR(20) NOT NULL CHECK (source_entity_type IN ('lead', 'deal')),
  source_entity_id UUID NOT NULL,
  target_entity_type VARCHAR(20) NOT NULL CHECK (target_entity_type IN ('deal', 'lead')),
  target_entity_id UUID NOT NULL,
  conversion_reason VARCHAR(100), -- For backwards: 'COOLING', 'TIMELINE_CHANGE', etc.
  conversion_data JSONB DEFAULT '{}', -- Additional conversion metadata
  wfm_transition_plan JSONB DEFAULT '{}', -- WFM workflow transition details
  converted_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  converted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create reactivation_plans table for backwards conversion planning
CREATE TABLE public.reactivation_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  original_deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  reactivation_strategy VARCHAR(50) CHECK (reactivation_strategy IN ('NURTURING', 'DIRECT_OUTREACH', 'CONTENT_MARKETING', 'RELATIONSHIP_BUILDING', 'COMPETITIVE_ANALYSIS', 'BUDGET_FOLLOW_UP')),
  target_reactivation_date DATE,
  follow_up_activities JSONB DEFAULT '[]', -- Array of planned activities
  assigned_to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED', 'PAUSED')),
  notes TEXT,
  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add backwards conversion tracking columns to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS original_deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS conversion_reason VARCHAR(100),
ADD COLUMN IF NOT EXISTS reactivation_target_date DATE;

-- 4. Add conversion tracking columns to deals table
ALTER TABLE public.deals 
ADD COLUMN IF NOT EXISTS converted_to_lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS conversion_reason VARCHAR(100);

-- 5. Create indexes for performance
CREATE INDEX idx_conversion_history_source ON public.conversion_history(source_entity_type, source_entity_id);
CREATE INDEX idx_conversion_history_target ON public.conversion_history(target_entity_type, target_entity_id);
CREATE INDEX idx_conversion_history_type ON public.conversion_history(conversion_type);
CREATE INDEX idx_conversion_history_converted_by ON public.conversion_history(converted_by_user_id);
CREATE INDEX idx_conversion_history_converted_at ON public.conversion_history(converted_at);

CREATE INDEX idx_reactivation_plans_lead ON public.reactivation_plans(lead_id);
CREATE INDEX idx_reactivation_plans_original_deal ON public.reactivation_plans(original_deal_id);
CREATE INDEX idx_reactivation_plans_status ON public.reactivation_plans(status);
CREATE INDEX idx_reactivation_plans_assigned_to ON public.reactivation_plans(assigned_to_user_id);
CREATE INDEX idx_reactivation_plans_target_date ON public.reactivation_plans(target_reactivation_date);

CREATE INDEX idx_leads_original_deal ON public.leads(original_deal_id) WHERE original_deal_id IS NOT NULL;
CREATE INDEX idx_deals_converted_to_lead ON public.deals(converted_to_lead_id) WHERE converted_to_lead_id IS NOT NULL;

-- 6. Add table comments for documentation
COMMENT ON TABLE public.conversion_history IS 'Tracks all lead-deal conversions (both directions) with audit trail';
COMMENT ON TABLE public.reactivation_plans IS 'Manages reactivation plans for deals converted back to leads';

COMMENT ON COLUMN public.conversion_history.conversion_type IS 'Type of conversion: LEAD_TO_DEAL or DEAL_TO_LEAD';
COMMENT ON COLUMN public.conversion_history.conversion_reason IS 'Reason for conversion (especially important for DEAL_TO_LEAD)';
COMMENT ON COLUMN public.conversion_history.conversion_data IS 'Additional metadata about the conversion process';
COMMENT ON COLUMN public.conversion_history.wfm_transition_plan IS 'WFM workflow transition details and mapping';

COMMENT ON COLUMN public.reactivation_plans.reactivation_strategy IS 'Strategy for reactivating the converted lead';
COMMENT ON COLUMN public.reactivation_plans.follow_up_activities IS 'Planned activities for lead reactivation';
COMMENT ON COLUMN public.reactivation_plans.target_reactivation_date IS 'Target date for attempting reactivation';

COMMENT ON COLUMN public.leads.original_deal_id IS 'Reference to original deal if this lead was converted from a deal';
COMMENT ON COLUMN public.leads.conversion_reason IS 'Reason why deal was converted back to lead';
COMMENT ON COLUMN public.leads.reactivation_target_date IS 'Target date for reactivating this lead';

COMMENT ON COLUMN public.deals.converted_to_lead_id IS 'Reference to lead if this deal was converted to a lead';
COMMENT ON COLUMN public.deals.conversion_reason IS 'Reason why deal was converted to lead';

-- 7. Enable RLS (Row Level Security) on new tables
ALTER TABLE public.conversion_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactivation_plans ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for conversion_history
CREATE POLICY "Users can view conversion history for their entities" ON public.conversion_history
  FOR SELECT
  USING (
    -- User can see conversions they performed
    converted_by_user_id = auth.uid()
    OR
    -- User can see conversions involving their leads/deals
    EXISTS (
      SELECT 1 FROM public.leads l 
      WHERE l.id = source_entity_id 
      AND source_entity_type = 'lead'
      AND (l.user_id = auth.uid() OR l.assigned_to_user_id = auth.uid())
    )
    OR
    EXISTS (
      SELECT 1 FROM public.deals d 
      WHERE d.id = source_entity_id 
      AND source_entity_type = 'deal'
      AND (d.user_id = auth.uid() OR d.assigned_to_user_id = auth.uid())
    )
    OR
    EXISTS (
      SELECT 1 FROM public.leads l 
      WHERE l.id = target_entity_id 
      AND target_entity_type = 'lead'
      AND (l.user_id = auth.uid() OR l.assigned_to_user_id = auth.uid())
    )
    OR
    EXISTS (
      SELECT 1 FROM public.deals d 
      WHERE d.id = target_entity_id 
      AND target_entity_type = 'deal'
      AND (d.user_id = auth.uid() OR d.assigned_to_user_id = auth.uid())
    )
  );

CREATE POLICY "Users can create conversion history" ON public.conversion_history
  FOR INSERT
  WITH CHECK (converted_by_user_id = auth.uid());

-- 9. Create RLS policies for reactivation_plans
CREATE POLICY "Users can view reactivation plans for their leads" ON public.reactivation_plans
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.leads l 
      WHERE l.id = lead_id 
      AND (l.user_id = auth.uid() OR l.assigned_to_user_id = auth.uid())
    )
    OR assigned_to_user_id = auth.uid()
    OR created_by_user_id = auth.uid()
  );

CREATE POLICY "Users can create reactivation plans" ON public.reactivation_plans
  FOR INSERT
  WITH CHECK (created_by_user_id = auth.uid());

CREATE POLICY "Users can update their reactivation plans" ON public.reactivation_plans
  FOR UPDATE
  USING (
    created_by_user_id = auth.uid() 
    OR assigned_to_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.leads l 
      WHERE l.id = lead_id 
      AND (l.user_id = auth.uid() OR l.assigned_to_user_id = auth.uid())
    )
  );

-- 10. Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversion_history_updated_at 
  BEFORE UPDATE ON public.conversion_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reactivation_plans_updated_at 
  BEFORE UPDATE ON public.reactivation_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT; 