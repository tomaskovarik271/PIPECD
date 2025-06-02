# PipeCD Leads Management - Implementation Plan

## 🎯 Overview

This plan implements a **best-in-class leads management system** that surpasses competitors through:
- **AI-powered lead qualification** with Claude 4 Sonnet
- **WFM-driven workflows** for consistent process management  
- **Seamless conversion** from leads to deals with data preservation
- **Advanced automation** leveraging ADR-008 activities foundation
- **Enterprise RBAC** with granular lead permissions
- **Smart contact strategy** - persons created only upon conversion

## 📋 Phase 1: Database Foundation (Days 1-3)

### 1.1 Core Schema Migration
```bash
# Create migration file
supabase migration new create_leads_management_schema
```

**Migration Content - Enhanced Schema:**
```sql
-- Extend entity_type enum for custom fields
ALTER TYPE public.entity_type ADD VALUE 'LEAD';

-- Create leads table with full RBAC and automation support
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Lead Identification
  title TEXT NOT NULL,
  source TEXT,
  
  -- Contact Information (stored as text, persons created only on conversion)
  contact_name TEXT, -- "John Smith" (parsed to first/last on conversion)
  contact_email TEXT,
  contact_phone TEXT,
  company_name TEXT, -- "Acme Corp" (may become organization on conversion)
  
  -- Lead Details  
  description TEXT,
  estimated_value DECIMAL(12, 2),
  estimated_close_date DATE,
  lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  
  -- Qualification (following RBAC pattern)
  is_qualified BOOLEAN DEFAULT FALSE,
  qualification_notes TEXT,
  qualified_at TIMESTAMPTZ,
  qualified_by_user_id UUID REFERENCES auth.users(id),
  
  -- Assignment (following deal pattern)
  assigned_to_user_id UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ,
  
  -- Conversion Tracking
  converted_at TIMESTAMPTZ,
  converted_to_deal_id UUID REFERENCES deals(id),
  converted_to_person_id UUID REFERENCES people(id),
  converted_to_organization_id UUID REFERENCES organizations(id),
  converted_by_user_id UUID REFERENCES auth.users(id),
  
  -- WFM Integration
  wfm_project_id UUID REFERENCES wfm_projects(id),
  
  -- Custom Fields (following existing pattern)
  custom_field_values JSONB,
  
  -- Automation Support (ADR-008)
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  automation_score_factors JSONB,
  
  -- Audit
  created_by_user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- Performance indexes including automation
CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_assigned_to_user_id ON leads(assigned_to_user_id);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_is_qualified ON leads(is_qualified);
CREATE INDEX idx_leads_lead_score ON leads(lead_score);
CREATE INDEX idx_leads_wfm_project_id ON leads(wfm_project_id);
CREATE INDEX idx_leads_last_activity_at ON leads(last_activity_at); -- For automation
CREATE INDEX idx_leads_qualified_at ON leads(qualified_at);

-- Triggers
CREATE TRIGGER set_leads_timestamp
BEFORE UPDATE ON leads FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Activities integration (ADR-008)
ALTER TABLE public.activities ADD COLUMN lead_id UUID REFERENCES leads(id) ON DELETE CASCADE;
CREATE INDEX idx_activities_lead_id ON activities(lead_id);
```

### 1.2 RBAC Permissions Setup
```sql
-- Lead-specific permissions following existing pattern
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

-- Role assignments
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

### 1.3 RLS Policies (Following Existing Pattern)
```sql
-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads FORCE ROW LEVEL SECURITY;

-- Lead SELECT policy (following deal pattern)
CREATE POLICY "Allow SELECT based on RBAC permissions for leads" ON public.leads
FOR SELECT USING (
  (check_permission(auth.uid(), 'read_own', 'lead') AND 
   (auth.uid() = user_id OR auth.uid() = assigned_to_user_id)) OR
  (check_permission(auth.uid(), 'read_any', 'lead'))
);

-- Lead INSERT policy
CREATE POLICY "Allow INSERT based on RBAC permissions for leads" ON public.leads
FOR INSERT WITH CHECK (
  check_permission(auth.uid(), 'create', 'lead') AND 
  auth.uid() = user_id
);

-- Lead UPDATE policy
CREATE POLICY "Allow UPDATE based on RBAC permissions for leads" ON public.leads
FOR UPDATE USING (
  (check_permission(auth.uid(), 'read_own', 'lead') AND 
   (auth.uid() = user_id OR auth.uid() = assigned_to_user_id)) OR
  (check_permission(auth.uid(), 'read_any', 'lead'))
) WITH CHECK (
  check_permission(auth.uid(), 'update_any', 'lead') OR
  check_permission(auth.uid(), 'update_own', 'lead')
);

-- Lead DELETE policy
CREATE POLICY "Allow DELETE based on RBAC permissions for leads" ON public.leads
FOR DELETE USING (
  (check_permission(auth.uid(), 'delete_own', 'lead') AND 
   (auth.uid() = user_id OR auth.uid() = assigned_to_user_id)) OR
  check_permission(auth.uid(), 'delete_any', 'lead')
);

-- Update activities RLS to include lead access
CREATE POLICY "Allow lead activities access" ON public.activities
FOR ALL USING (
  -- Existing activity policies OR lead-based access
  (lead_id IS NOT NULL AND (
    (check_permission(auth.uid(), 'read_own', 'lead') AND EXISTS (
      SELECT 1 FROM leads WHERE id = activities.lead_id 
      AND (user_id = auth.uid() OR assigned_to_user_id = auth.uid())
    )) OR
    check_permission(auth.uid(), 'read_any', 'lead')
  ))
);
```

### 1.4 WFM Workflow Setup with Automation
```sql
-- Lead workflow with automation metadata (ADR-008)
INSERT INTO public.statuses (name, color, description) VALUES
('New Lead', '#3B82F6', 'Newly captured lead requiring initial review'),
('Contacted', '#F59E0B', 'Initial contact made, awaiting response'),
('Engaged', '#8B5CF6', 'Lead is engaged and showing interest'),
('Qualified', '#10B981', 'Lead meets qualification criteria'),
('Nurturing', '#6B7280', 'Lead requires further nurturing'),
('Converted', '#059669', 'Lead successfully converted to deal'),
('Disqualified', '#EF4444', 'Lead does not meet criteria');

INSERT INTO public.workflows (name, description) VALUES
('Standard Lead Process', 'Standard workflow for managing leads with automation');

-- Workflow steps with automation triggers
DO $$
DECLARE lead_workflow_id UUID;
BEGIN
    SELECT id INTO lead_workflow_id FROM workflows WHERE name = 'Standard Lead Process';
    
    INSERT INTO workflow_steps (workflow_id, status_id, step_order, is_initial_step, is_final_step, metadata) VALUES
    (lead_workflow_id, (SELECT id FROM statuses WHERE name = 'New Lead'), 1, TRUE, FALSE, 
     '{"auto_assign": true, "sla_hours": 24, "auto_tasks": ["LEAD_WELCOME"]}'),
    (lead_workflow_id, (SELECT id FROM statuses WHERE name = 'Contacted'), 2, FALSE, FALSE, 
     '{"follow_up_days": 3, "auto_tasks": ["LEAD_FOLLOW_UP"]}'),
    (lead_workflow_id, (SELECT id FROM statuses WHERE name = 'Engaged'), 3, FALSE, FALSE, 
     '{"qualification_required": true, "score_threshold": 60, "auto_tasks": ["LEAD_QUALIFICATION"]}'),
    (lead_workflow_id, (SELECT id FROM statuses WHERE name = 'Qualified'), 4, FALSE, FALSE, 
     '{"conversion_ready": true, "auto_tasks": ["LEAD_CONVERSION"]}'),
    (lead_workflow_id, (SELECT id FROM statuses WHERE name = 'Nurturing'), 5, FALSE, FALSE, 
     '{"nurture_sequence": true, "auto_tasks": ["LEAD_NURTURE"]}'),
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

## 📋 Phase 2: Backend Services (Days 4-8)

### 2.1 Lead Service Layer (`lib/leadService.ts`)
```typescript
// Following existing service patterns with RBAC integration
export const leadService = {
  // Core CRUD with RBAC
  createLead(input: LeadInput, userId: string, accessToken: string): Promise<Lead>
  getLeads(userId: string, filters?: LeadFilters, accessToken: string): Promise<Lead[]>
  getLeadById(id: string, userId: string, accessToken: string): Promise<Lead | null>
  updateLead(id: string, input: LeadUpdateInput, userId: string, accessToken: string): Promise<Lead>
  deleteLead(id: string, userId: string, accessToken: string): Promise<boolean>
  
  // Lead-specific operations
  scoreLead(id: string, factors: ScoringFactors, userId: string, accessToken: string): Promise<number>
  qualifyLead(id: string, qualified: boolean, notes?: string, userId: string, accessToken: string): Promise<Lead>
  assignLead(id: string, assigneeId: string, userId: string, accessToken: string): Promise<Lead>
  
  // Conversion (creates person/org only if requested)
  convertLeadToDeal(id: string, params: ConversionParams, userId: string, accessToken: string): Promise<ConversionResult>
  
  // WFM integration
  updateLeadWFMProgress(id: string, targetStepId: string, userId: string, accessToken: string): Promise<Lead>
  
  // Activity integration (ADR-008)
  getLeadActivities(id: string, userId: string, accessToken: string): Promise<Activity[]>
  createLeadActivity(leadId: string, activity: ActivityInput, userId: string, accessToken: string): Promise<Activity>
}
```

### 2.2 GraphQL Schema Extension (`netlify/functions/graphql/schema/lead.graphql`)
```graphql
type Lead {
  id: ID!
  title: String!
  source: String
  
  # Contact info (text fields, persons created only on conversion)
  contact_name: String
  contact_email: String  
  contact_phone: String
  company_name: String
  
  description: String
  estimated_value: Float
  estimated_close_date: DateTime
  lead_score: Int!
  
  # Qualification tracking
  is_qualified: Boolean!
  qualification_notes: String
  qualified_at: DateTime
  qualifiedByUser: User
  
  # Assignment tracking
  assignedToUser: User
  assigned_at: DateTime
  
  # Relationships
  activities: [Activity!]!
  customFieldValues: [CustomFieldValue!]!
  
  # WFM Integration
  wfmProject: WFMProject
  currentWfmStep: WFMWorkflowStep
  currentWfmStatus: WFMStatus
  
  # Conversion tracking
  converted_at: DateTime
  convertedToDeal: Deal
  convertedToPerson: Person  # Only set if person was created during conversion
  convertedToOrganization: Organization  # Only set if org was created
  convertedByUser: User
  
  # Automation fields (ADR-008)
  last_activity_at: DateTime
  automation_score_factors: JSON
  
  # Audit
  created_at: DateTime!
  updated_at: DateTime!
  createdBy: User!
}

input LeadInput {
  title: String!
  source: String
  contact_name: String
  contact_email: String
  contact_phone: String
  company_name: String
  description: String
  estimated_value: Float
  estimated_close_date: DateTime
  assignedToUserId: ID
  customFields: [CustomFieldValueInput!]
  wfmProjectTypeId: ID! # Lead Management project type
}

# Conversion with smart person/org creation
input LeadConversionInput {
  # Person creation (only if needed)
  createPerson: Boolean!
  parseNameFromContactName: Boolean # Smart "John Smith" → first/last parsing
  
  # Organization creation (only if needed)  
  createOrganization: Boolean!
  useCompanyNameFromLead: Boolean
  
  # Deal creation (required)
  dealName: String # Default: lead.title
  dealAmount: Float # Default: lead.estimated_value
  dealCloseDate: DateTime # Default: lead.estimated_close_date
  
  # Data preservation
  preserveActivities: Boolean!
  preserveCustomFields: Boolean!
}

type LeadConversionResult {
  success: Boolean!
  deal: Deal!
  person: Person # Only if created
  organization: Organization # Only if created
  transferredActivities: [Activity!]!
  message: String!
}

extend type Query {
  leads(filter: LeadFilterInput): [Lead!]!
  lead(id: ID!): Lead
  # Lead analytics
  leadAnalytics: LeadAnalytics!
}

extend type Mutation {
  createLead(input: LeadInput!): Lead!
  updateLead(id: ID!, input: LeadUpdateInput!): Lead!
  deleteLead(id: ID!): ID!
  
  # Lead lifecycle
  updateLeadWFMProgress(leadId: ID!, targetWfmWorkflowStepId: ID!): Lead!
  qualifyLead(id: ID!, qualified: Boolean!, notes: String): Lead!
  assignLead(id: ID!, assigneeId: ID!): Lead!
  
  # Conversion (creates person/org only if requested)
  convertLeadToDeal(id: ID!, input: LeadConversionInput!): LeadConversionResult!
  
  # Activity integration (ADR-008)
  createLeadActivity(leadId: ID!, input: ActivityInput!): Activity!
}
```

### 2.3 Lead Resolvers with RBAC
```typescript
// Lead resolvers with proper permission checking
export const leadResolvers = {
  Query: {
    leads: async (_parent, args, context) => {
      requireAuthentication(context);
      // RBAC handled by RLS policies
      const accessToken = getAccessToken(context)!;
      return leadService.getLeads(context.currentUser!.id, args.filter, accessToken);
    },
    lead: async (_parent, args, context) => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      return leadService.getLeadById(args.id, context.currentUser!.id, accessToken);
    }
  },
  
  Mutation: {
    createLead: async (_parent, args, context) => {
      requireAuthentication(context);
      // Permission check handled by RLS
      const accessToken = getAccessToken(context)!;
      return leadService.createLead(args.input, context.currentUser!.id, accessToken);
    },
    
    qualifyLead: async (_parent, args, context) => {
      requireAuthentication(context);
      requirePermission(context, 'lead:qualify');
      const accessToken = getAccessToken(context)!;
      return leadService.qualifyLead(args.id, args.qualified, args.notes, context.currentUser!.id, accessToken);
    },
    
    convertLeadToDeal: async (_parent, args, context) => {
      requireAuthentication(context);
      requirePermission(context, 'lead:convert');
      const accessToken = getAccessToken(context)!;
      return leadService.convertLeadToDeal(args.id, args.input, context.currentUser!.id, accessToken);
    }
  },
  
  // Field resolvers for relationships
  Lead: {
    activities: async (parent, _args, context) => {
      requireAuthentication(context);
      const accessToken = getAccessToken(context)!;
      return leadService.getLeadActivities(parent.id, context.currentUser!.id, accessToken);
    },
    
    customFieldValues: async (parent, _args, context) => {
      // Use existing custom field resolution pattern
      return resolveCustomFieldValues(parent, 'LEAD', context);
    }
  }
};
```

## 📋 Phase 3: ADR-008 Automation Integration (Days 9-12)

### 3.1 Lead Automation Events (Inngest)
```typescript
// Lead automation events following ADR-008 pattern
export const leadAutomationEvents = {
  'crm/lead.created': 'createLeadWelcomeTask',
  'crm/lead.assigned': 'createLeadReviewTask',
  'crm/lead.qualified': 'createLeadConversionTask',
  'crm/lead.score_updated': 'handleLeadScoreChange',
  'crm/lead.contacted': 'scheduleLeadFollowUp',
  'crm/lead.stale': 'createLeadNurtureTask'
};

// Inngest functions for lead automation
export const createLeadWelcomeTask = inngest.createFunction(
  { id: "create-lead-welcome-task" },
  { event: "crm/lead.created" },
  async ({ event, step }) => {
    const { leadId, assignedToUserId } = event.data;
    
    // Create system activity using existing ADR-008 infrastructure
    return await step.run("create-welcome-task", async () => {
      return createSystemActivity({
        type: 'LEAD_WELCOME',
        subject: 'Review new lead and make initial contact',
        assigned_to_user_id: assignedToUserId,
        lead_id: leadId,
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        is_system_activity: true,
        user_id: getSystemUserId()
      });
    });
  }
);

export const createLeadQualificationTask = inngest.createFunction(
  { id: "create-lead-qualification-task" },
  { event: "crm/lead.qualified" },
  async ({ event, step }) => {
    const { leadId, qualifiedByUserId } = event.data;
    
    return await step.run("create-conversion-task", async () => {
      return createSystemActivity({
        type: 'LEAD_CONVERSION',
        subject: 'Convert qualified lead to deal',
        assigned_to_user_id: qualifiedByUserId,
        lead_id: leadId,
        due_date: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
        is_system_activity: true,
        user_id: getSystemUserId()
      });
    });
  }
);
```

### 3.2 Automated Lead Scoring
```typescript
// Lead scoring with activity integration (ADR-008)
export const leadScoringAutomation = {
  // Activity-based scoring
  activityCompleted: async (activity: Activity) => {
    if (activity.lead_id) {
      const scoreIncrease = ACTIVITY_SCORE_MAP[activity.type] || 0;
      await updateLeadScore(activity.lead_id, scoreIncrease);
      
      // Trigger score-based automation
      const lead = await getLeadById(activity.lead_id);
      if (lead.lead_score >= 80) {
        await inngest.send({
          name: 'crm/lead.score_updated',
          data: { leadId: lead.id, newScore: lead.lead_score, threshold: 'hot' }
        });
      }
    }
  },
  
  // Engagement-based scoring
  responseReceived: async (leadId: string, responseTime: number) => {
    const timeBonus = calculateResponseTimeBonus(responseTime);
    await updateLeadScore(leadId, timeBonus);
  }
};

const ACTIVITY_SCORE_MAP = {
  'CALL': 15,
  'EMAIL': 10, 
  'MEETING': 20,
  'DEMO': 25,
  'PROPOSAL': 30
};
```

### 3.3 Stale Lead Detection
```typescript
// Scheduled automation for stale leads (ADR-008)
export const staleLeadDetection = inngest.createFunction(
  { id: "detect-stale-leads" },
  { cron: "0 9 * * *" }, // Daily at 9 AM
  async ({ step }) => {
    return await step.run("find-stale-leads", async () => {
      const staleLeads = await findStaleLeads(7); // 7 days without activity
      
      for (const lead of staleLeads) {
        await inngest.send({
          name: 'crm/lead.stale',
          data: { leadId: lead.id, daysSinceActivity: lead.daysSinceActivity }
        });
      }
    });
  }
);
```

## 📋 Phase 4: AI Agent Integration (Days 13-16)

### 4.1 Lead-Specific AI Tools
```typescript
// Enhanced AI agent tools leveraging automation
export class LeadsModule {
  async searchLeads(params: LeadSearchParams): Promise<ToolResult> {
    // RBAC-aware lead search
    const leads = await leadService.getLeads(params.userId, params.filters, params.accessToken);
    return {
      success: true,
      data: leads,
      message: `Found ${leads.length} leads matching criteria`
    };
  }
  
  async createLead(params: LeadCreateParams): Promise<ToolResult> {
    // Create lead (triggers automation via Inngest)
    const lead = await leadService.createLead(params.input, params.userId, params.accessToken);
    
    // Trigger automation
    await inngest.send({
      name: 'crm/lead.created',
      data: { leadId: lead.id, assignedToUserId: lead.assigned_to_user_id }
    });
    
    return {
      success: true,
      data: lead,
      message: `Lead created successfully with automatic welcome task`
    };
  }
  
  async qualifyLead(params: LeadQualificationParams): Promise<ToolResult> {
    const lead = await leadService.qualifyLead(
      params.leadId, 
      params.qualified, 
      params.notes,
      params.userId, 
      params.accessToken
    );
    
    // Trigger qualification automation
    if (params.qualified) {
      await inngest.send({
        name: 'crm/lead.qualified',
        data: { leadId: lead.id, qualifiedByUserId: params.userId }
      });
    }
    
    return {
      success: true,
      data: lead,
      message: `Lead ${params.qualified ? 'qualified' : 'disqualified'} with automatic follow-up tasks`
    };
  }
  
  async convertLeadToDeal(params: ConversionParams): Promise<ToolResult> {
    // Smart conversion with person/org creation only if requested
    const result = await leadService.convertLeadToDeal(
      params.leadId, 
      params.conversionInput,
      params.userId,
      params.accessToken
    );
    
    return {
      success: true,
      data: result,
      message: `Lead converted to deal${result.person ? ' with new person' : ''}${result.organization ? ' and organization' : ''}`
    };
  }
}
```

### 4.2 AI Lead Scoring Integration
```typescript
// AI-powered lead scoring with automation triggers
export const aiLeadScoring = {
  async scoreLeadWithAI(leadId: string, factors: LeadScoringFactors): Promise<number> {
    const aiScore = await claudeAnalyzeLeadQuality(factors);
    const activityScore = await calculateActivityScore(leadId);
    const finalScore = Math.min(100, Math.round((aiScore + activityScore) / 2));
    
    await leadService.updateLeadScore(leadId, finalScore);
    
    // Trigger score-based automation
    if (finalScore >= 80) {
      await inngest.send({
        name: 'crm/lead.score_updated',
        data: { leadId, newScore: finalScore, threshold: 'hot' }
      });
    }
    
    return finalScore;
  }
};
```

## 📋 Phase 5: Frontend Implementation (Days 17-22)

### 5.1 Lead Store with RBAC
```typescript
// Lead store with permission-aware operations
interface LeadsState {
  leads: Lead[];
  leadsLoading: boolean;
  leadsError: string | null;
  userPermissions: string[];
  
  // Permission helpers
  canCreateLead: boolean;
  canQualifyLeads: boolean;
  canConvertLeads: boolean;
  canAssignLeads: boolean;
  
  // Actions with permission checks
  createLead: (input: LeadInput) => Promise<Lead | null>;
  qualifyLead: (id: string, qualified: boolean, notes?: string) => Promise<Lead | null>;
  convertLeadToDeal: (id: string, params: ConversionParams) => Promise<ConversionResult>;
  assignLead: (id: string, assigneeId: string) => Promise<Lead | null>;
}

// Permission-based UI state
const useLeadPermissions = () => {
  const userPermissions = useAppStore(state => state.userPermissions);
  
  return {
    canCreateLead: userPermissions?.includes('lead:create'),
    canQualifyLeads: userPermissions?.includes('lead:qualify'), 
    canConvertLeads: userPermissions?.includes('lead:convert'),
    canAssignLeads: userPermissions?.includes('lead:assign_any') || userPermissions?.includes('lead:assign_own'),
    canDeleteLeads: userPermissions?.includes('lead:delete_any') || userPermissions?.includes('lead:delete_own')
  };
};
```

### 5.2 Lead Components with Smart Conversion
```typescript
// Lead conversion modal with smart person/org creation
const LeadConversionModal = ({ lead, isOpen, onClose, onSuccess }) => {
  const [createPerson, setCreatePerson] = useState(!!lead.contact_name);
  const [createOrganization, setCreateOrganization] = useState(!!lead.company_name);
  const [parseNameFromLead, setParseNameFromLead] = useState(true);
  
  const handleConvert = async (formData) => {
    const conversionParams = {
      leadId: lead.id,
      createPerson,
      parseNameFromContactName: parseNameFromLead,
      createOrganization,
      useCompanyNameFromLead: true,
      dealName: formData.dealName || lead.title,
      dealAmount: formData.dealAmount || lead.estimated_value,
      preserveActivities: true,
      preserveCustomFields: true
    };
    
    const result = await convertLeadToDeal(conversionParams);
    if (result) {
      onSuccess(result);
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>Convert Lead to Deal</ModalHeader>
      <ModalBody>
        {/* Deal creation form */}
        
        {/* Smart person creation */}
        {lead.contact_name && (
          <FormControl>
            <Checkbox 
              isChecked={createPerson}
              onChange={(e) => setCreatePerson(e.target.checked)}
            >
              Create person from contact: {lead.contact_name}
            </Checkbox>
            {createPerson && (
              <Checkbox
                isChecked={parseNameFromLead}
                onChange={(e) => setParseNameFromLead(e.target.checked)}
                ml={6}
              >
                Parse name automatically ("John Smith" → first: "John", last: "Smith")
              </Checkbox>
            )}
          </FormControl>
        )}
        
        {/* Smart organization creation */}
        {lead.company_name && (
          <FormControl>
            <Checkbox
              isChecked={createOrganization}
              onChange={(e) => setCreateOrganization(e.target.checked)}
            >
              Create organization: {lead.company_name}
            </Checkbox>
          </FormControl>
        )}
      </ModalBody>
    </Modal>
  );
};
```

### 5.3 Activity Integration (ADR-008)
```typescript
// Lead activity panel showing both manual and automated activities
const LeadActivityPanel = ({ leadId }) => {
  const { activities, createActivity } = useLeadActivities(leadId);
  
  return (
    <Box>
      <Heading size="md">Activities</Heading>
      
      {/* Show system-generated activities with special styling */}
      {activities.map(activity => (
        <ActivityCard 
          key={activity.id}
          activity={activity}
          isSystemGenerated={activity.is_system_activity}
          onComplete={handleActivityComplete}
        />
      ))}
      
      {/* Manual activity creation */}
      <CreateActivityForm 
        leadId={leadId}
        onSubmit={createActivity}
      />
    </Box>
  );
};

const ActivityCard = ({ activity, isSystemGenerated, onComplete }) => {
  return (
    <Card>
      <CardBody>
        <HStack justify="space-between">
          <VStack align="start">
            <Text fontWeight="semibold">{activity.subject}</Text>
            <Text fontSize="sm" color="gray.600">{activity.type}</Text>
            {isSystemGenerated && (
              <Badge colorScheme="blue">System Generated</Badge>
            )}
          </VStack>
          
          {!activity.is_done && (
            <Button size="sm" onClick={() => onComplete(activity.id)}>
              Complete
            </Button>
          )}
        </HStack>
      </CardBody>
    </Card>
  );
};
```

## 📋 Phase 6: Testing & Analytics (Days 23-25)

### 6.1 Comprehensive Testing
```typescript
// Unit tests with RBAC scenarios
describe('Lead Service with RBAC', () => {
  test('user can only see own leads with read_own permission', async () => {
    // Test RLS policies
  });
  
  test('admin can see all leads with read_any permission', async () => {
    // Test admin access
  });
  
  test('conversion creates person only when requested', async () => {
    // Test smart conversion logic
  });
  
  test('automation triggers on lead lifecycle events', async () => {
    // Test ADR-008 automation
  });
});

// Integration tests for conversion workflow
describe('Lead Conversion', () => {
  test('converts lead with person creation and name parsing', async () => {
    const lead = createTestLead({ contact_name: 'John Smith' });
    const result = await convertLeadToDeal(lead.id, {
      createPerson: true,
      parseNameFromContactName: true
    });
    
    expect(result.person.first_name).toBe('John');
    expect(result.person.last_name).toBe('Smith');
  });
});
```

### 6.2 Lead Analytics
```typescript
// Analytics leveraging RBAC for data access
export const leadAnalytics = {
  getConversionMetrics: async (userId: string, accessToken: string) => {
    // Respect RLS policies for analytics
    const leads = await leadService.getLeads(userId, {}, accessToken);
    
    return {
      totalLeads: leads.length,
      qualifiedLeads: leads.filter(l => l.is_qualified).length,
      convertedLeads: leads.filter(l => l.converted_at).length,
      conversionRate: calculateConversionRate(leads),
      averageTimeToQualification: calculateAverageTime(leads, 'qualified_at'),
      sourcePerformance: calculateSourceMetrics(leads)
    };
  }
};
```

## 🎯 Key Implementation Benefits

### 1. ADR-008 Automation Foundation
- **Proven Infrastructure**: Leverages existing Inngest automation system
- **System Activities**: Automatic task creation for lead lifecycle management
- **Event-Driven**: Scalable automation triggers for lead progression

### 2. Smart Contact/Person Strategy
- **Clean Data Model**: No premature CRM entity creation
- **Intelligent Conversion**: Smart name parsing and optional person/org creation
- **Data Integrity**: Only qualified leads become CRM contacts

### 3. Enterprise RBAC Integration
- **Granular Permissions**: Following established permission patterns
- **Secure Access**: RLS policies ensure proper data isolation
- **Role-Based Features**: UI adapts based on user permissions

### 4. Custom Fields Seamless Integration
- **Existing Infrastructure**: Leverages current custom fields system
- **Lead Entity Support**: Extends enum to include LEAD type
- **Data Preservation**: Custom fields transfer during conversion

---

This implementation plan delivers a comprehensive, enterprise-grade leads management system that seamlessly integrates with PipeCD's existing architecture while providing best-in-class automation and user experience. 