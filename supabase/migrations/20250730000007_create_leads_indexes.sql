-- 20250730000007_create_leads_indexes.sql
-- PipeCD Leads Management: Performance Indexes
-- Comprehensive indexing strategy for optimal query performance

-- ================================
-- 1. Core Performance Indexes
-- ================================

-- Primary user-based indexes
CREATE INDEX IF NOT EXISTS idx_leads_user_id 
ON public.leads(user_id);

CREATE INDEX IF NOT EXISTS idx_leads_assigned_to_user_id 
ON public.leads(assigned_to_user_id);

CREATE INDEX IF NOT EXISTS idx_leads_created_by_user_id 
ON public.leads(created_by_user_id);

-- Lead source tracking
CREATE INDEX IF NOT EXISTS idx_leads_source 
ON public.leads(source) WHERE source IS NOT NULL;

-- Lead scoring and qualification
CREATE INDEX IF NOT EXISTS idx_leads_lead_score 
ON public.leads(lead_score DESC);

CREATE INDEX IF NOT EXISTS idx_leads_is_qualified 
ON public.leads(is_qualified);

CREATE INDEX IF NOT EXISTS idx_leads_qualified_at 
ON public.leads(qualified_at DESC) WHERE qualified_at IS NOT NULL;

-- WFM integration
CREATE INDEX IF NOT EXISTS idx_leads_wfm_project_id 
ON public.leads(wfm_project_id) WHERE wfm_project_id IS NOT NULL;

-- Contact information for search
CREATE INDEX IF NOT EXISTS idx_leads_contact_email 
ON public.leads(contact_email) WHERE contact_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_leads_company_name 
ON public.leads(company_name) WHERE company_name IS NOT NULL;

-- Conversion tracking
CREATE INDEX IF NOT EXISTS idx_leads_converted_at 
ON public.leads(converted_at DESC) WHERE converted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_leads_converted_to_deal_id 
ON public.leads(converted_to_deal_id) WHERE converted_to_deal_id IS NOT NULL;

-- Activity and engagement tracking
CREATE INDEX IF NOT EXISTS idx_leads_last_activity_at 
ON public.leads(last_activity_at DESC);

-- Date-based queries
CREATE INDEX IF NOT EXISTS idx_leads_created_at 
ON public.leads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_leads_updated_at 
ON public.leads(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_leads_estimated_close_date 
ON public.leads(estimated_close_date) WHERE estimated_close_date IS NOT NULL;

-- ================================
-- 2. Composite Indexes for Common Queries
-- ================================

-- User + qualification status + score for dashboard queries
CREATE INDEX IF NOT EXISTS idx_leads_user_qualified_score 
ON public.leads(user_id, is_qualified, lead_score DESC);

-- Source + score for source effectiveness analysis
CREATE INDEX IF NOT EXISTS idx_leads_source_score_qualified 
ON public.leads(source, lead_score DESC, is_qualified) WHERE source IS NOT NULL;

-- Assigned user + active leads (not converted)
CREATE INDEX IF NOT EXISTS idx_leads_assigned_active 
ON public.leads(assigned_to_user_id, last_activity_at DESC) 
WHERE converted_at IS NULL AND assigned_to_user_id IS NOT NULL;

-- User + created date for chronological views
CREATE INDEX IF NOT EXISTS idx_leads_user_created 
ON public.leads(user_id, created_at DESC);

-- Qualification workflow tracking
CREATE INDEX IF NOT EXISTS idx_leads_qualified_by_date 
ON public.leads(qualified_by_user_id, qualified_at DESC) 
WHERE qualified_at IS NOT NULL;

-- Estimated value for revenue pipeline analysis
CREATE INDEX IF NOT EXISTS idx_leads_user_value_qualified 
ON public.leads(user_id, estimated_value DESC, is_qualified) 
WHERE estimated_value IS NOT NULL;

-- ================================
-- 3. JSONB Indexes for Custom Fields and AI Data
-- ================================

-- Custom fields search and filtering
CREATE INDEX IF NOT EXISTS idx_leads_custom_fields_gin 
ON public.leads USING GIN (custom_field_values);

-- AI insights for intelligent recommendations
CREATE INDEX IF NOT EXISTS idx_leads_ai_insights_gin 
ON public.leads USING GIN (ai_insights);

-- Lead scoring factors for analysis
CREATE INDEX IF NOT EXISTS idx_leads_score_factors_gin 
ON public.leads USING GIN (lead_score_factors);

-- Automation scoring factors
CREATE INDEX IF NOT EXISTS idx_leads_automation_factors_gin 
ON public.leads USING GIN (automation_score_factors);

-- ================================
-- 4. Text Search Indexes
-- ================================

-- Full-text search on lead name and description
CREATE INDEX IF NOT EXISTS idx_leads_name_fts 
ON public.leads USING GIN (to_tsvector('english', name));

CREATE INDEX IF NOT EXISTS idx_leads_description_fts 
ON public.leads USING GIN (to_tsvector('english', description)) 
WHERE description IS NOT NULL;

-- Contact name search
CREATE INDEX IF NOT EXISTS idx_leads_contact_name_fts 
ON public.leads USING GIN (to_tsvector('english', contact_name)) 
WHERE contact_name IS NOT NULL;

-- Company name search
CREATE INDEX IF NOT EXISTS idx_leads_company_name_fts 
ON public.leads USING GIN (to_tsvector('english', company_name)) 
WHERE company_name IS NOT NULL;

-- Combined text search for global lead search
CREATE INDEX IF NOT EXISTS idx_leads_combined_search 
ON public.leads USING GIN (
  to_tsvector('english', 
    COALESCE(name, '') || ' ' || 
    COALESCE(contact_name, '') || ' ' || 
    COALESCE(contact_email, '') || ' ' || 
    COALESCE(company_name, '') || ' ' || 
    COALESCE(description, '')
  )
);

-- ================================
-- 5. Lead History Table Indexes
-- ================================

-- Lead history lookup by lead
CREATE INDEX IF NOT EXISTS idx_lead_history_lead_id 
ON public.lead_history(lead_id);

-- History by user for audit trails
CREATE INDEX IF NOT EXISTS idx_lead_history_user_id 
ON public.lead_history(user_id) WHERE user_id IS NOT NULL;

-- Event type filtering
CREATE INDEX IF NOT EXISTS idx_lead_history_event_type 
ON public.lead_history(event_type);

-- Chronological history
CREATE INDEX IF NOT EXISTS idx_lead_history_created_at 
ON public.lead_history(created_at DESC);

-- Composite index for lead + chronological history
CREATE INDEX IF NOT EXISTS idx_lead_history_lead_date 
ON public.lead_history(lead_id, created_at DESC);

-- Field-specific history tracking
CREATE INDEX IF NOT EXISTS idx_lead_history_field_name 
ON public.lead_history(field_name) WHERE field_name IS NOT NULL;

-- ================================
-- 6. Activities Table Indexes for Leads
-- ================================

-- Lead activities lookup
CREATE INDEX IF NOT EXISTS idx_activities_lead_id 
ON public.activities(lead_id) WHERE lead_id IS NOT NULL;

-- Lead + date for activity timeline
CREATE INDEX IF NOT EXISTS idx_activities_lead_date 
ON public.activities(lead_id, created_at DESC) WHERE lead_id IS NOT NULL;

-- Lead + activity type
CREATE INDEX IF NOT EXISTS idx_activities_lead_type 
ON public.activities(lead_id, type) WHERE lead_id IS NOT NULL;

-- ================================
-- 7. Performance Analysis Comments
-- ================================

-- Add comments explaining index purposes
COMMENT ON INDEX idx_leads_user_qualified_score IS 'Optimizes dashboard queries for user leads by qualification and score';
COMMENT ON INDEX idx_leads_source_score_qualified IS 'Optimizes source effectiveness analysis queries';
COMMENT ON INDEX idx_leads_assigned_active IS 'Optimizes active leads queries for assigned users';
COMMENT ON INDEX idx_leads_custom_fields_gin IS 'Enables efficient custom field searches and filtering';
COMMENT ON INDEX idx_leads_combined_search IS 'Enables full-text search across all lead text fields';
COMMENT ON INDEX idx_lead_history_lead_date IS 'Optimizes lead history timeline queries';

-- ================================
-- 8. Index Usage Monitoring
-- ================================

-- Create view for monitoring index usage (helpful for optimization)
CREATE OR REPLACE VIEW lead_index_usage AS
SELECT 
  schemaname,
  relname as tablename,
  indexrelname as indexname,
  idx_tup_read,
  idx_tup_fetch,
  idx_scan
FROM pg_stat_user_indexes 
WHERE relname IN ('leads', 'lead_history')
ORDER BY idx_scan DESC;

COMMENT ON VIEW lead_index_usage IS 'Monitors index usage for leads-related tables to optimize performance'; 