import { SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

export interface BusinessScenario {
  organizations: any[];
  people: any[];
  deals: any[];
  leads: any[];
  wfmProjectType: any;
  personOrgRoles: any[];
  tasks: any[];
  cleanup: () => Promise<void>;
}

export class BusinessScenarioFactory {
  constructor(
    private supabase: SupabaseClient,
    private testUserId: string
  ) {}

  // Create BNP Paribas-style enterprise sales scenario
  async createEnterpriseSalesScenario(): Promise<BusinessScenario> {
    try {
      // Create WFM project type first (required for deals)
      const wfmProjectType = await this.createWfmProjectType();
      
      // Create organizations
      const organizations = await this.createEnterpriseOrganizations();
      
      // Create people (without organization_id)
      const people = await this.createEnterprisePeople();
      
      // Create person-organization relationships using the modern role-based system
      const personOrgRoles = await this.createPersonOrganizationRoles(people, organizations);
      
      // Create deals with proper relationships
      const deals = await this.createEnterpriseDeals(organizations, people, wfmProjectType);
      
      // Create leads with entity references
      const leads = await this.createEnterpriseLeads(organizations, people);
      
      // Create tasks linked to deals
      const tasks = await this.createDealTasks(deals, people);

      return {
        organizations,
        people,
        deals,
        leads,
        wfmProjectType,
        personOrgRoles,
        tasks,
        cleanup: async () => {
          await this.cleanupScenario({ 
            tasks, 
            deals, 
            leads, 
            personOrgRoles, 
            people, 
            organizations, 
            wfmProjectType 
          });
        }
      };
    } catch (error) {
      console.error('❌ Failed to create enterprise sales scenario:', error);
      throw error;
    }
  }

  private async createWfmProjectType() {
    // Make project type name unique per test to avoid conflicts
    const uniqueName = `Sales Deal ${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const projectType = {
      id: uuidv4(),
      name: uniqueName,
      description: 'Standard sales deal project type for testing',
      icon_name: 'briefcase',
      created_by_user_id: this.testUserId
    };

    const { data, error } = await this.supabase
      .from('project_types')
      .insert(projectType)
      .select()
      .single();

    if (error) {
      console.error('Failed to create project type:', error);
      throw new Error(`Failed to create project type: ${error.message}`);
    }
    
    console.log('✅ Created WFM project type:', data.name);
    return data;
  }

  private async createEnterpriseOrganizations() {
    const orgs = [
      {
        id: uuidv4(),
        name: 'Global Financial Corp',
        address: 'Wall Street, New York',
        notes: 'Major financial services company - enterprise prospect',
        user_id: this.testUserId
      }
    ];

    const { data, error } = await this.supabase
      .from('organizations')
      .insert(orgs)
      .select();

    if (error) {
      console.error('Failed to create organizations:', error);
      throw new Error(`Failed to create organizations: ${error.message}`);
    }
    
    console.log('✅ Created organizations:', data?.length || 0);
    return data || [];
  }

  private async createEnterprisePeople() {
    // Make email unique per test run to avoid constraint violations
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    const peopleData = [
      {
        id: uuidv4(),
        first_name: 'Sarah',
        last_name: 'Wilson',
        email: `sarah.wilson+${uniqueId}@globalfinancial.com`,
        phone: '+1-555-0101',
        user_id: this.testUserId,
        notes: 'Chief Technology Officer - decision maker'
      },
      {
        id: uuidv4(),
        first_name: 'John',
        last_name: 'Smith',
        email: `john.smith+${uniqueId}@globalfinancial.com`,
        phone: '+1-555-0102',
        user_id: this.testUserId,
        notes: 'VP of Engineering - technical influencer'
      }
    ];

    // Insert people WITHOUT organization_id (column was removed)
    const { data, error } = await this.supabase
      .from('people')
      .insert(peopleData)
      .select();

    if (error) {
      console.error('Failed to create people:', error);
      throw new Error(`Failed to create people: ${error.message}`);
    }
    
    console.log('✅ Created people:', data?.length || 0);
    return data || [];
  }

  private async createPersonOrganizationRoles(people: any[], organizations: any[]) {
    if (!people.length || !organizations.length) {
      return [];
    }

    const roles = people.map((person, index) => ({
      id: uuidv4(),
      person_id: person.id,
      organization_id: organizations[0].id, // Link all to first org
      role_title: index === 0 ? 'CTO' : 'VP Engineering',
      department: 'Technology',
      is_primary: true,
      status: 'active',
      created_by_user_id: this.testUserId
    }));

    const { data, error } = await this.supabase
      .from('person_organization_roles')
      .insert(roles)
      .select();

    if (error) {
      console.error('Failed to create person organization roles:', error);
      throw new Error(`Failed to create person organization roles: ${error.message}`);
    }
    
    console.log('✅ Created person-organization roles:', data?.length || 0);
    return data || [];
  }

  private async createEnterpriseDeals(organizations: any[], people: any[], wfmProjectType: any) {
    if (!organizations.length || !people.length) {
      throw new Error('Organizations and people must be created before deals');
    }

    // Get the default 'Standard Sales Process' workflow
    const { data: workflow, error: workflowError } = await this.supabase
      .from('workflows')
      .select('id')
      .eq('name', 'Standard Sales Process')
      .single();

    if (workflowError || !workflow) {
      console.warn('Standard Sales Process workflow not found, using mock workflow ID');
      // For tests, we'll create a minimal workflow if it doesn't exist
      const mockWorkflow = await this.createMockWorkflow();
      if (!mockWorkflow) {
        throw new Error('Failed to create or find workflow for deals');
      }
    }

    const workflowId = workflow?.id || (await this.createMockWorkflow())?.id;

    // First create a WFM project instance for the deal
    const wfmProject = {
      id: uuidv4(),
      project_type_id: wfmProjectType.id,
      workflow_id: workflowId,
      name: `Sales Process for ${organizations[0]?.name || 'Enterprise Client'}`,
      description: 'WFM project managing the sales process for this deal',
      created_by_user_id: this.testUserId,
      updated_by_user_id: this.testUserId
    };

    const { data: wfmProjectData, error: wfmError } = await this.supabase
      .from('wfm_projects')
      .insert(wfmProject)
      .select()
      .single();

    if (wfmError) {
      console.error('Failed to create WFM project:', wfmError);
      throw new Error(`Failed to create WFM project: ${wfmError.message}`);
    }

    // Now create the deal with proper WFM project link
    const deals = [
      {
        id: uuidv4(),
        name: 'Enterprise CRM Implementation',
        amount: 500000,
        expected_close_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        deal_specific_probability: 0.75,
        organization_id: organizations[0].id,
        person_id: people[0].id, // Primary contact
        assigned_to_user_id: this.testUserId,
        user_id: this.testUserId,
        wfm_project_id: wfmProjectData.id,
        currency: 'USD'
      }
    ];

    const { data, error } = await this.supabase
      .from('deals')
      .insert(deals)
      .select();

    if (error) {
      console.error('Failed to create deals:', error);
      throw new Error(`Failed to create deals: ${error.message}`);
    }
    
    console.log('✅ Created deals:', data?.length || 0);
    return data || [];
  }

  private async createMockWorkflow() {
    try {
      const workflow = {
        id: uuidv4(),
        name: `Test Workflow ${Date.now()}`,
        description: 'Test workflow for scenarios',
        created_by_user_id: this.testUserId
      };

      const { data, error } = await this.supabase
        .from('workflows')
        .insert(workflow)
        .select()
        .single();

      if (error) {
        console.warn('Failed to create mock workflow:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Error creating mock workflow:', error);
      return null;
    }
  }

  private async createEnterpriseLeads(organizations: any[], people: any[]) {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    const leads = [
      {
        id: uuidv4(),
        name: 'Manufacturing CRM Inquiry',
        contact_name: 'Robert Taylor',
        contact_email: `robert.taylor+${uniqueId}@manufacturing.com`,
        contact_phone: '+1-555-0301',
        company_name: 'Global Manufacturing Inc',
        source: 'Website',
        description: 'Large manufacturing company looking for CRM solution',
        estimated_value: 300000,
        estimated_close_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        lead_score: 82,
        assigned_to_user_id: this.testUserId,
        user_id: this.testUserId,
        currency: 'USD',
        // Link to existing entities when possible
        person_id: people.length > 1 ? people[1].id : null,
        organization_id: organizations.length > 0 ? organizations[0].id : null
      }
    ];

    const { data, error } = await this.supabase
      .from('leads')
      .insert(leads)
      .select();

    if (error) {
      console.error('Failed to create leads:', error);
      throw new Error(`Failed to create leads: ${error.message}`);
    }
    
    console.log('✅ Created leads:', data?.length || 0);
    return data || [];
  }

  private async createDealTasks(deals: any[], people: any[]) {
    if (!deals.length) {
      return [];
    }

    const tasks = [
      {
        id: uuidv4(),
        title: 'Follow up on enterprise demo',
        description: 'Schedule follow-up meeting after initial demo presentation',
        status: 'TODO',
        priority: 'HIGH',
        task_type: 'DEMO_PREPARATION',  // Valid enum value
        entity_type: 'DEAL',
        entity_id: deals[0].id,
        deal_id: deals[0].id,
        assigned_to_user_id: this.testUserId,
        created_by_user_id: this.testUserId,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        estimated_hours: 2
      },
      {
        id: uuidv4(),
        title: 'Prepare technical proposal',
        description: 'Create detailed technical proposal for enterprise requirements',
        status: 'TODO',
        priority: 'MEDIUM',
        task_type: 'PROPOSAL_CREATION',  // Valid enum value
        entity_type: 'DEAL',
        entity_id: deals[0].id,
        deal_id: deals[0].id,
        assigned_to_user_id: this.testUserId,
        created_by_user_id: this.testUserId,
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        estimated_hours: 8
      }
    ];

    const { data, error } = await this.supabase
      .from('tasks')
      .insert(tasks)
      .select();

    if (error) {
      console.error('Failed to create tasks:', error);
      // Don't throw error for tasks as they're not critical for basic scenarios
      console.warn('Continuing without tasks...');
      return [];
    }
    
    console.log('✅ Created tasks:', data?.length || 0);
    return data || [];
  }

  private async cleanupScenario(entities: { 
    tasks?: any[], 
    deals?: any[], 
    leads?: any[], 
    personOrgRoles?: any[], 
    people?: any[], 
    organizations?: any[], 
    wfmProjectType?: any 
  }) {
    try {
      // Clean up in reverse dependency order
      const cleanupSteps = [
        { name: 'tasks', data: entities.tasks },
        { name: 'deals', data: entities.deals },
        { name: 'leads', data: entities.leads },
        { name: 'person_organization_roles', data: entities.personOrgRoles },
        { name: 'people', data: entities.people },
        { name: 'organizations', data: entities.organizations },
        // Clean up WFM projects first before project types
        { name: 'wfm_projects', data: [] }, // Will be handled separately by querying
      ];

      let totalCleaned = 0;

      for (const step of cleanupSteps) {
        if (step.data && step.data.length > 0) {
          const ids = step.data.map(item => item.id);
          const { error } = await this.supabase
            .from(step.name)
            .delete()
            .in('id', ids);

          if (error) {
            console.warn(`⚠️ Failed to cleanup ${step.name}:`, error.message);
          } else {
            totalCleaned += step.data.length;
            console.log(`🧹 Cleaned up ${step.data.length} ${step.name}`);
          }
        }
      }

      // Clean up WFM projects before project types to avoid foreign key constraint
      if (entities.wfmProjectType) {
        const { error: wfmProjectsError } = await this.supabase
          .from('wfm_projects')
          .delete()
          .eq('project_type_id', entities.wfmProjectType.id);

        if (wfmProjectsError) {
          console.warn('⚠️ Failed to cleanup WFM projects:', wfmProjectsError.message);
        } else {
          console.log('🧹 Cleaned up WFM projects for project type');
        }

        // Now clean up the project type
        const { error: projectTypeError } = await this.supabase
          .from('project_types')
          .delete()
          .eq('id', entities.wfmProjectType.id);

        if (projectTypeError) {
          console.warn('⚠️ Failed to cleanup project type:', projectTypeError.message);
        } else {
          totalCleaned += 1;
          console.log('🧹 Cleaned up 1 project_types');
        }
      }

      console.log(`✅ Scenario cleanup completed: ${totalCleaned} entities cleaned`);
    } catch (error) {
      console.error('❌ Error during scenario cleanup:', error);
    }
  }
}
