# PipeCD Leads Management System - Design & Implementation Plan

## 🎯 Executive Summary

This document outlines the design and implementation plan for a **best-in-class leads management system** for PipeCD that will surpass competitor offerings through intelligent automation, seamless workflow integration, and AI-powered lead qualification.

## 🏗️ Architecture Overview

### Core Principles
1. **Leads ≠ Early-Stage Deals**: Leads are distinct entities representing unqualified prospects
2. **WFM-Powered Workflows**: Dedicated lead workflow separate from sales pipeline
3. **AI-First Approach**: Claude 4 Sonnet integration for intelligent lead processing
4. **Conversion-Centric**: Seamless lead-to-deal conversion with data preservation
5. **Activity-Rich**: Comprehensive activity tracking and automation leveraging ADR-008
6. **Contact/Person Strategy**: Leads store contact info as text fields, **persons are created only upon conversion**
7. **RBAC Integration**: Full role-based access control with custom lead permissions

### System Integration
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Lead Entity   │────│  Lead Workflow  │────│   AI Agent      │
│   (Database)    │    │   (WFM-Based)   │    │  (Claude 4)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Activities &  │    │   Kanban UI     │    │  Lead Scoring   │
│   Automation    │    │   Table View    │    │  & Automation   │
│   (ADR-008)     │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Contact/Person Strategy

### Lead Contact Information
Leads store contact information as **text fields only** until conversion:
- `contact_name` (TEXT) - "John Smith"
- `contact_email` (TEXT) - Raw email address
- `contact_phone` (TEXT) - Raw phone number  
- `company_name` (TEXT) - Company name as text

### Person Creation Upon Conversion
**Persons are created ONLY when a lead is converted to a deal**, preserving data integrity:

```sql
-- During conversion, IF createPerson = true
INSERT INTO people (first_name, last_name, email, phone, organization_id, user_id)
SELECT 
  SPLIT_PART(l.contact_name, ' ', 1), -- Smart name parsing
  SPLIT_PART(l.contact_name, ' ', 2),
  l.contact_email,
  l.contact_phone,
  org.id, -- If organization was created
  l.user_id
FROM leads l WHERE l.id = $1;
```

### Benefits of This Approach
1. **No Premature Data Creation**: Avoids cluttering CRM with unqualified contacts
2. **Flexible Lead Capture**: Can capture partial/incomplete contact info initially
3. **Clean Conversion Process**: Only qualified leads become proper CRM entities
4. **Data Integrity**: Ensures all persons in the system are qualified prospects

## 🔐 RBAC & Permissions Integration

### Lead-Specific Permissions
Following the existing RBAC pattern, leads get dedicated permissions:

```sql
-- Lead management permissions
INSERT INTO public.permissions (resource, action, description) VALUES
('lead', 'create', 'Create new leads'),
('lead', 'read_own', 'Read leads created by or assigned to self'),
('lead', 'read_any', 'Read any lead'),
('lead', 'update_own', 'Update leads created by or assigned to self'),
('lead', 'update_any', 'Update any lead'),
('lead', 'delete_own', 'Delete leads created by or assigned to self'),
('lead', 'delete_any', 'Delete any lead'),
('lead', 'qualify', 'Mark leads as qualified/unqualified'),
('lead', 'convert', 'Convert qualified leads to deals'),
('lead', 'assign_own', 'Assign leads to self'),
('lead', 'assign_any', 'Assign leads to any user');
```

### Role Assignments
```sql
-- Admin gets all lead permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'admin' AND p.resource = 'lead';

-- Member gets limited lead permissions
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'member' AND p.resource = 'lead' 
AND p.action IN ('create', 'read_own', 'update_own', 'qualify', 'convert', 'assign_own');
```

### RLS Policies
```sql
-- Lead SELECT policy
CREATE POLICY "Allow SELECT based on RBAC permissions for leads" ON public.leads
FOR SELECT USING (
  (check_permission(auth.uid(), 'read_own', 'lead') AND 
   (auth.uid() = user_id OR auth.uid() = assigned_to_user_id)) OR
  (check_permission(auth.uid(), 'read_any', 'lead'))
);

-- Similar patterns for INSERT, UPDATE, DELETE
```

## 🤖 ADR-008 Automation Integration

### Leveraging Activities as Foundation
Following ADR-008, leads management will extensively use the existing automation infrastructure:

#### 1. Lead Lifecycle Automation
```typescript
// Inngest functions for lead automation
const LEAD_AUTOMATION_EVENTS = {
  'crm/lead.created': 'createLeadWelcomeTask',
  'crm/lead.qualified': 'createLeadConversionTask', 
  'crm/lead.assigned': 'createLeadReviewTask',
  'crm/lead.contacted': 'scheduleLeadFollowUp',
  'crm/lead.stale': 'createLeadNurtureTask'
};
```

#### 2. System-Generated Lead Activities
Leveraging the existing `is_system_activity` and `assigned_to_user_id` fields:

```typescript
interface SystemLeadActivity {
  type: 'LEAD_WELCOME' | 'LEAD_FOLLOW_UP' | 'LEAD_QUALIFICATION' | 'LEAD_NURTURE';
  subject: string;
  assigned_to_user_id: string; // Lead owner
  is_system_activity: true;
  due_date: Date;
  lead_id: string; // Links to lead instead of deal
}
```

#### 3. Lead Automation Examples
Building on the foundation in ADR-008:

1. **Lead Assignment Task**: When lead assigned → create "Review new lead" activity
2. **Qualification Follow-up**: When lead contacted → create "Follow up on lead response" in 2 days
3. **Stale Lead Alert**: When no activity for 7 days → create "Re-engage stale lead" task
4. **Conversion Reminder**: When lead qualified → create "Convert qualified lead" task
5. **Score Update Trigger**: When lead score changes → create activity based on score threshold

#### 4. Enhanced Scoring Automation
```typescript
// Auto-scoring based on activities (leveraging ADR-008 event system)
const LEAD_SCORING_TRIGGERS = {
  'activity.created': 'updateLeadEngagementScore',
  'activity.completed': 'updateLeadResponseScore', 
  'lead.email_opened': 'incrementLeadInterestScore',
  'lead.website_visited': 'incrementLeadIntentScore'
};
```

## 📊 Database Schema Design

### 1. Core Leads Table (Updated)
```sql
-- Create leads table with RBAC and automation support
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Lead Identification
  title TEXT NOT NULL, -- "Enterprise CRM Implementation - Acme Corp"
  source TEXT, -- "Website", "LinkedIn", "Referral", "Trade Show", etc.
  
  -- Contact Information (stored as text, persons created only on conversion)
  contact_name TEXT, -- "John Smith" (will be parsed to first/last on conversion)
  contact_email TEXT,
  contact_phone TEXT,
  company_name TEXT, -- "Acme Corporation" (may become organization on conversion)
  
  -- Lead Details
  description TEXT, -- Detailed lead information
  estimated_value DECIMAL(12, 2), -- Potential deal value
  estimated_close_date DATE, -- When they might buy
  lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  
  -- Qualification Status
  is_qualified BOOLEAN DEFAULT FALSE,
  qualification_notes TEXT,
  qualified_at TIMESTAMPTZ, -- When qualification occurred
  qualified_by_user_id UUID REFERENCES auth.users(id), -- Who qualified it
  
  -- Assignment (following deal pattern)
  assigned_to_user_id UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ, -- When assignment occurred
  
  -- Conversion Tracking
  converted_at TIMESTAMPTZ,
  converted_to_deal_id UUID REFERENCES deals(id),
  converted_to_person_id UUID REFERENCES people(id),
  converted_to_organization_id UUID REFERENCES organizations(id),
  converted_by_user_id UUID REFERENCES auth.users(id), -- Who performed conversion
  
  -- WFM Integration (following existing pattern)
  wfm_project_id UUID REFERENCES wfm_projects(id),
  
  -- Custom Fields (following existing pattern)
  custom_field_values JSONB,
  
  -- Automation Support (ADR-008)
  last_activity_at TIMESTAMPTZ DEFAULT NOW(), -- For stale lead detection
  automation_score_factors JSONB, -- Store scoring metadata for AI
  
  -- Audit Fields
  created_by_user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- Indexes for performance and filtering
CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_assigned_to_user_id ON leads(assigned_to_user_id);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_is_qualified ON leads(is_qualified);
CREATE INDEX idx_leads_lead_score ON leads(lead_score);
CREATE INDEX idx_leads_converted_at ON leads(converted_at);
CREATE INDEX idx_leads_wfm_project_id ON leads(wfm_project_id);
CREATE INDEX idx_leads_last_activity_at ON leads(last_activity_at); -- For automation
CREATE INDEX idx_leads_qualified_at ON leads(qualified_at);

-- Triggers
CREATE TRIGGER set_leads_timestamp
BEFORE UPDATE ON leads
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads FORCE ROW LEVEL SECURITY;
```

### 2. Custom Fields Extension
```sql
-- Extend entity_type enum to include LEAD
ALTER TYPE public.entity_type ADD VALUE 'LEAD';

-- Lead-specific custom field definitions will be created via admin UI
-- Following existing custom fields pattern exactly
```

### 3. Activities Integration
```sql
-- Activities table already supports multiple entity types
-- Add lead_id foreign key to activities table
ALTER TABLE public.activities ADD COLUMN lead_id UUID REFERENCES leads(id) ON DELETE CASCADE;
CREATE INDEX idx_activities_lead_id ON activities(lead_id);

-- Update activities RLS to include lead access
-- (Will be handled in implementation phase)
```

## 🔄 WFM Workflow Design (Updated)

### Lead Management Workflow
```sql
-- Lead-specific statuses with automation metadata
INSERT INTO public.statuses (name, color, description) VALUES
('New Lead', '#3B82F6', 'Newly captured lead requiring initial review'),
('Contacted', '#F59E0B', 'Initial contact made, awaiting response'),
('Engaged', '#8B5CF6', 'Lead is engaged and showing interest'),
('Qualified', '#10B981', 'Lead meets qualification criteria'),
('Nurturing', '#6B7280', 'Lead requires further nurturing'),
('Converted', '#059669', 'Lead successfully converted to deal'),
('Disqualified', '#EF4444', 'Lead does not meet criteria');

-- Lead workflow with automation triggers
INSERT INTO public.workflows (name, description) VALUES
('Standard Lead Process', 'Standard workflow for managing leads from capture to conversion with automation');

-- Workflow steps with automation metadata (following ADR-008)
DO $$
DECLARE
    lead_workflow_id UUID;
BEGIN
    SELECT id INTO lead_workflow_id FROM workflows WHERE name = 'Standard Lead Process';
    
    INSERT INTO workflow_steps (workflow_id, status_id, step_order, is_initial_step, is_final_step, metadata) VALUES
    (lead_workflow_id, (SELECT id FROM statuses WHERE name = 'New Lead'), 1, TRUE, FALSE, 
     '{"auto_assign": true, "sla_hours": 24, "auto_tasks": ["LEAD_WELCOME"]}'),
    (lead_workflow_id, (SELECT id FROM statuses WHERE name = 'Contacted'), 2, FALSE, FALSE, 
     '{"follow_up_days": 3, "required_activities": ["CALL", "EMAIL"], "auto_tasks": ["LEAD_FOLLOW_UP"]}'),
    (lead_workflow_id, (SELECT id FROM statuses WHERE name = 'Engaged'), 3, FALSE, FALSE, 
     '{"qualification_required": true, "score_threshold": 60, "auto_tasks": ["LEAD_QUALIFICATION"]}'),
    (lead_workflow_id, (SELECT id FROM statuses WHERE name = 'Qualified'), 4, FALSE, FALSE, 
     '{"conversion_ready": true, "priority": "high", "auto_tasks": ["LEAD_CONVERSION"]}'),
    (lead_workflow_id, (SELECT id FROM statuses WHERE name = 'Nurturing'), 5, FALSE, FALSE, 
     '{"nurture_sequence": true, "follow_up_interval": 14, "auto_tasks": ["LEAD_NURTURE"]}'),
    (lead_workflow_id, (SELECT id FROM statuses WHERE name = 'Converted'), 6, FALSE, TRUE, 
     '{"outcome_type": "CONVERTED", "success": true}'),
    (lead_workflow_id, (SELECT id FROM statuses WHERE name = 'Disqualified'), 7, FALSE, TRUE, 
     '{"outcome_type": "DISQUALIFIED", "success": false}');
END $$;

-- Lead project type
INSERT INTO public.project_types (name, description, default_workflow_id, icon_name) 
SELECT 'Lead Management', 'Lead qualification and conversion process', id, 'user-plus'
FROM workflows WHERE name = 'Standard Lead Process';
```

## 🤖 AI Agent Integration (Enhanced)

### 1. Lead-Specific AI Tools
```typescript
// Enhanced AI agent tools leveraging automation
const LEAD_TOOLS = [
  'search_leads',           // Find leads by criteria
  'get_lead_details',       // Complete lead information with activities
  'create_lead',           // Create new lead (triggers automation)
  'update_lead',           // Update lead information  
  'qualify_lead',          // Mark lead as qualified (triggers conversion tasks)
  'score_lead',            // Update lead score (triggers score-based automation)
  'convert_lead_to_deal',  // Convert qualified lead (creates person/org)
  'get_lead_activities',   // Lead-specific activities
  'create_lead_activity',  // Create lead follow-up (manual or automated)
  'assign_lead',           // Assign lead to user (triggers assignment tasks)
  'nurture_lead',          // Start nurturing sequence (creates nurture activities)
];
```

### 2. AI-Powered Lead Scoring with Automation
```typescript
interface AutomatedLeadScoringParams {
  leadId: string;
  triggers: {
    scoreThresholds: {
      hot: 80;      // Triggers immediate conversion task
      warm: 60;     // Triggers qualification review task  
      cold: 30;     // Triggers nurturing sequence
    };
    activityBased: boolean; // Auto-score based on activity completion
    engagementBased: boolean; // Auto-score based on email/website engagement
  };
}
```

### 3. Automated Lead Lifecycle Management
```typescript
// AI analyzes lead progression and triggers appropriate automation
interface LeadLifecycleAutomation {
  leadId: string;
  triggers: {
    staleDetection: number;    // Days without activity → nurture task
    responseTime: number;      // Hours to respond → follow-up task  
    qualificationReady: boolean; // Score + engagement → qualification task
    conversionReady: boolean;   // Qualified + engaged → conversion task
  };
}
```

## 🔄 Lead Conversion Process (Updated)

### 1. Smart Conversion Workflow
```typescript
interface LeadConversionParams {
  leadId: string;
  // Person creation (only if needed and qualified)
  createPerson: boolean;
  personData?: {
    parseNameFromContactName: boolean; // Smart name parsing
    additionalInfo?: Partial<PersonInput>;
  };
  // Organization creation (only if needed)
  createOrganization: boolean;
  organizationData?: {
    useCompanyNameFromLead: boolean;
    additionalInfo?: Partial<OrganizationInput>;
  };
  // Deal creation (required)
  dealDetails: {
    name: string; // Default: lead.title
    amount?: number; // Default: lead.estimated_value
    expectedCloseDate?: Date; // Default: lead.estimated_close_date
    preserveCustomFields: boolean; // Transfer custom fields
  };
  // Activity and history preservation
  preserveActivities: boolean; // Transfer all lead activities to deal
  preserveHistory: boolean; // Maintain conversion audit trail
}
```

### 2. Conversion Process with Automation
```typescript
// Conversion triggers automation (following ADR-008)
const conversionProcess = {
  1: 'validateLeadQualified', // Ensure lead is qualified
  2: 'createPersonIfRequested', // Smart name parsing: "John Smith" → first_name: "John", last_name: "Smith"  
  3: 'createOrganizationIfRequested', // Use company_name from lead
  4: 'createDealWithMapping', // Map lead data to deal
  5: 'transferActivities', // Move all lead activities to deal
  6: 'transferCustomFields', // Migrate custom field values
  7: 'updateLeadStatus', // Mark as converted with timestamp
  8: 'triggerConversionAutomation', // Create welcome tasks for deal owner
  9: 'recordConversionHistory' // Audit trail
};
```

### 3. Data Mapping with Smart Parsing
```typescript
// Smart contact name parsing during conversion
const parseContactName = (contactName: string) => {
  const parts = contactName.trim().split(' ');
  return {
    first_name: parts[0] || '',
    last_name: parts.slice(1).join(' ') || ''
  };
};

// Conversion data mapping
const LEAD_TO_DEAL_MAPPING = {
  title: 'name',
  estimated_value: 'amount', 
  estimated_close_date: 'expected_close_date',
  description: 'notes',
  custom_field_values: 'custom_field_values', // Direct transfer
  assigned_to_user_id: 'assigned_to_user_id'
};
```

## 📈 Advanced Features (Enhanced)

### 1. ADR-008 Powered Automation Examples
```typescript
// Comprehensive lead automation leveraging existing infrastructure
const LEAD_AUTOMATION_RULES = [
  {
    trigger: 'lead.created',
    condition: 'always',
    action: 'create_system_activity',
    params: { type: 'LEAD_WELCOME', due_hours: 24 }
  },
  {
    trigger: 'lead.assigned', 
    condition: 'always',
    action: 'create_system_activity',
    params: { type: 'LEAD_REVIEW', due_hours: 4 }
  },
  {
    trigger: 'lead.qualified',
    condition: 'is_qualified = true',
    action: 'create_system_activity', 
    params: { type: 'LEAD_CONVERSION', due_hours: 8 }
  },
  {
    trigger: 'lead.score_updated',
    condition: 'score >= 80',
    action: 'create_system_activity',
    params: { type: 'LEAD_HOT_FOLLOW_UP', due_hours: 2 }
  },
  {
    trigger: 'scheduled.daily',
    condition: 'last_activity > 7 days ago',
    action: 'create_system_activity',
    params: { type: 'LEAD_NURTURE', due_hours: 24 }
  }
];
```

### 2. Lead Scoring with Activity Integration
```typescript
interface AutomatedLeadScoring {
  activityFactors: {
    callCompleted: 15;        // Points for completed calls
    emailResponded: 10;       // Points for email responses
    meetingScheduled: 20;     // Points for scheduled meetings
    demoCompleted: 25;        // Points for completed demos
  };
  engagementFactors: {
    responseSpeed: number;    // Faster response = higher score
    activityFrequency: number; // More activities = higher score
    initiatedContact: boolean; // Lead contacted us = bonus points
  };
  automationTriggers: {
    scoreIncrease: 'update_lead_priority';
    thresholdReached: 'create_qualification_task';
    scoreDecrease: 'create_nurture_task';
  };
}
```

### 3. Smart Lead Nurturing Sequences
```typescript
// Automated nurturing leveraging ADR-008 system tasks
interface LeadNurturingSequence {
  leadId: string;
  sequence: [
    { day: 0, action: 'welcome_email', auto_task: 'SEND_WELCOME' },
    { day: 3, action: 'industry_insights', auto_task: 'SEND_INSIGHTS' },
    { day: 7, action: 'case_study', auto_task: 'SEND_CASE_STUDY' },
    { day: 14, action: 'discovery_call', auto_task: 'SCHEDULE_CALL' },
    { day: 21, action: 'demo_offer', auto_task: 'OFFER_DEMO' }
  ];
  conditions: {
    stopOnResponse: boolean;
    stopOnQualification: boolean;
    stopOnConversion: boolean;
  };
}
```

## 🎯 Key Differentiators (Updated)

### 1. AI-First with Automation
- **Intelligent Scoring**: Claude 4 + automated activity-based scoring
- **Smart Qualification**: AI suggests qualification + automated tasks created
- **Automated Nurturing**: AI-powered sequences with system-generated activities

### 2. Contact/Person Strategy Excellence  
- **Clean Data Model**: No premature person creation, text-based lead capture
- **Smart Conversion**: Intelligent name parsing and data mapping
- **Qualified-Only CRM**: Only qualified leads become CRM contacts

### 3. ADR-008 Automation Foundation
- **System Activities**: Automated task creation for lead lifecycle
- **Event-Driven**: Inngest-powered automation triggers
- **Activity-Centric**: All lead automation built on proven activity foundation

### 4. Enterprise RBAC
- **Granular Permissions**: Lead-specific permissions following existing patterns
- **Secure RLS**: Row-level security for multi-tenant isolation
- **Role-Based Access**: Configurable permissions for different user types

---

This enhanced design leverages PipeCD's existing automation infrastructure (ADR-008), follows the established contact/person creation pattern, integrates seamlessly with the custom fields and RBAC systems, and provides a foundation for truly best-in-class leads management that will differentiate PipeCD from all competitors. 