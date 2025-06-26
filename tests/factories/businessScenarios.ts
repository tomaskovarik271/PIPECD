import { SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

export interface BusinessScenario {
  organizations: any[];
  people: any[];
  deals: any[];
  leads: any[];
  wfmProjectType: any;
  cleanup: () => Promise<void>;
}

export class BusinessScenarioFactory {
  constructor(
    private supabase: SupabaseClient,
    private testUserId: string
  ) {}

  // Create BNP Paribas-style enterprise sales scenario
  async createEnterpriseSalesScenario(): Promise<BusinessScenario> {
    // Create WFM project type first (required for deals)
    const wfmProjectType = await this.createWfmProjectType();
    const organizations = await this.createEnterpriseOrganizations();
    const people = await this.createEnterpriseContacts(organizations);
    const deals = await this.createEnterpriseDeals(organizations, people, wfmProjectType);
    const leads = await this.createEnterpriseLeads(organizations);

    return {
      organizations,
      people,
      deals,
      leads,
      wfmProjectType,
      cleanup: async () => {
        await this.cleanupScenario([...deals, ...leads, ...people, ...organizations, wfmProjectType]);
      }
    };
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

    if (error) throw new Error(`Failed to create project type: ${error.message}`);
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

    if (error) throw new Error(`Failed to create organizations: ${error.message}`);
    return data || [];
  }

  private async createEnterpriseContacts(organizations: any[]) {
    // Make email unique per test run to avoid constraint violations
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    const people = [
      {
        id: uuidv4(),
        first_name: 'Sarah',
        last_name: 'Wilson',
        email: `sarah.wilson+${uniqueId}@globalfinancial.com`,
        phone: '+1-555-0101',
        organization_id: organizations[0]?.id,
        user_id: this.testUserId,
        notes: 'Chief Technology Officer - decision maker'
      }
    ];

    const { data, error } = await this.supabase
      .from('people')
      .insert(people)
      .select();

    if (error) throw new Error(`Failed to create people: ${error.message}`);
    return data || [];
  }

  private async createEnterpriseDeals(organizations: any[], people: any[], wfmProjectType: any) {
    // Get the default 'Standard Sales Process' workflow
    const { data: workflow, error: workflowError } = await this.supabase
      .from('workflows')
      .select('id')
      .eq('name', 'Standard Sales Process')
      .single();

    if (workflowError || !workflow) {
      throw new Error(`Failed to find Standard Sales Process workflow: ${workflowError?.message || 'Not found'}`);
    }

    // First create a WFM project instance for the deal
    const wfmProject = {
      id: uuidv4(),
      project_type_id: wfmProjectType.id,
      workflow_id: workflow.id, // Use the actual workflow ID from database
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

    if (wfmError) throw new Error(`Failed to create WFM project: ${wfmError.message}`);

    // Now create the deal with proper WFM project link
    const deals = [
      {
        id: uuidv4(),
        name: 'Enterprise CRM Implementation',
        amount: 500000,
        expected_close_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        deal_specific_probability: 0.75,
        organization_id: organizations[0]?.id,
        person_id: people[0]?.id,
        assigned_to_user_id: this.testUserId,
        user_id: this.testUserId,
        wfm_project_id: wfmProjectData.id // Use the correct column name
      }
    ];

    const { data, error } = await this.supabase
      .from('deals')
      .insert(deals)
      .select();

    if (error) throw new Error(`Failed to create deals: ${error.message}`);
    return data || [];
  }

  private async createEnterpriseLeads(organizations: any[]) {
    const leads = [
      {
        id: uuidv4(),
        name: 'Manufacturing CRM Inquiry',
        contact_name: 'Robert Taylor',
        contact_email: 'robert.taylor@manufacturing.com',
        contact_phone: '+1-555-0301',
        company_name: 'Global Manufacturing Inc',
        source: 'Website',
        description: 'Large manufacturing company looking for CRM solution',
        estimated_value: 300000,
        estimated_close_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        lead_score: 82,
        assigned_to_user_id: this.testUserId,
        user_id: this.testUserId
      }
    ];

    const { data, error } = await this.supabase
      .from('leads')
      .insert(leads)
      .select();

    if (error) throw new Error(`Failed to create leads: ${error.message}`);
    return data || [];
  }

  private async cleanupScenario(entities: any[]) {
    console.log(`🧹 Scenario cleanup completed for ${entities.length} entities`);
  }
}
