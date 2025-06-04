/**
 * Domain Registry for PipeCD AI Agent
 * 
 * Central registry for all domain modules that handles:
 * - Domain module initialization and lifecycle
 * - Tool routing to appropriate domains
 * - Domain-specific configuration and dependencies
 */

import type { ToolResult, ToolExecutionContext } from '../../types/tools';
import { GraphQLClient } from '../../utils/GraphQLClient';

// Import all domain modules
import { DealsModule } from './DealsModule';
import { LeadsModule } from './LeadsModule';
import { OrganizationsModule } from './OrganizationsModule';
import { ContactsModule } from './ContactsModule';
import { ActivitiesModule } from './ActivitiesModule';

export interface DomainModule {
  [key: string]: (params: any, context: ToolExecutionContext) => Promise<ToolResult>;
}

export class DomainRegistry {
  private graphqlClient: GraphQLClient;
  private domains: Map<string, DomainModule> = new Map();
  
  // Domain module instances
  private dealsModule: DealsModule;
  private leadsModule: LeadsModule;
  private organizationsModule: OrganizationsModule;
  private contactsModule: ContactsModule;
  private activitiesModule: ActivitiesModule;

  constructor(graphqlClient: GraphQLClient) {
    this.graphqlClient = graphqlClient;
    
    // Initialize domain modules
    this.dealsModule = new DealsModule(graphqlClient);
    this.leadsModule = new LeadsModule(graphqlClient);
    this.organizationsModule = new OrganizationsModule();
    this.contactsModule = new ContactsModule();
    this.activitiesModule = new ActivitiesModule();
    
    // Register domain mappings
    this.registerDomains();
  }

  /**
   * Register all domain tool mappings
   */
  private registerDomains(): void {
    // Deals domain
    this.domains.set('deals', {
      search_deals: this.dealsModule.searchDeals.bind(this.dealsModule),
      get_deal_details: this.dealsModule.getDealDetails.bind(this.dealsModule),
      create_deal: this.dealsModule.createDeal.bind(this.dealsModule),
      update_deal: this.dealsModule.updateDeal.bind(this.dealsModule),
      delete_deal: this.dealsModule.deleteDeal.bind(this.dealsModule),
    });

    // Leads domain
    this.domains.set('leads', {
      search_leads: this.leadsModule.searchLeads.bind(this.leadsModule),
      get_lead_details: this.leadsModule.getLeadDetails.bind(this.leadsModule),
      create_lead: this.leadsModule.createLead.bind(this.leadsModule),
      qualify_lead: this.leadsModule.qualifyLead.bind(this.leadsModule),
      convert_lead: this.leadsModule.convertLead.bind(this.leadsModule),
      update_lead_score: this.leadsModule.updateLeadScore.bind(this.leadsModule),
    });

    // Organizations domain
    this.domains.set('organizations', {
      search_organizations: this.organizationsModule.searchOrganizations.bind(this.organizationsModule),
      get_organization_details: this.organizationsModule.getOrganizationDetails.bind(this.organizationsModule),
      create_organization: this.organizationsModule.createOrganization.bind(this.organizationsModule),
      update_organization: this.organizationsModule.updateOrganization.bind(this.organizationsModule),
    });

    // Contacts domain
    this.domains.set('contacts', {
      search_contacts: this.contactsModule.searchContacts.bind(this.contactsModule),
      get_contact_details: this.contactsModule.getContactDetails.bind(this.contactsModule),
      create_contact: this.contactsModule.createContact.bind(this.contactsModule),
      update_contact: this.contactsModule.updateContact.bind(this.contactsModule),
    });

    // Activities domain
    this.domains.set('activities', {
      search_activities: this.activitiesModule.searchActivities.bind(this.activitiesModule),
      get_activity_details: this.activitiesModule.getActivityDetails.bind(this.activitiesModule),
      create_activity: this.activitiesModule.createActivity.bind(this.activitiesModule),
      update_activity: this.activitiesModule.updateActivity.bind(this.activitiesModule),
      complete_activity: this.activitiesModule.completeActivity.bind(this.activitiesModule),
    });
  }

  /**
   * Get the domain name for a specific tool
   */
  private getDomainForTool(toolName: string): string | null {
    // Deal tools
    if (['search_deals', 'get_deal_details', 'create_deal', 'update_deal', 'delete_deal'].includes(toolName)) {
      return 'deals';
    }
    
    // Lead tools
    if (['search_leads', 'get_lead_details', 'create_lead', 'qualify_lead', 'convert_lead', 'update_lead_score'].includes(toolName)) {
      return 'leads';
    }
    
    // Organization tools
    if (['search_organizations', 'get_organization_details', 'create_organization', 'update_organization'].includes(toolName)) {
      return 'organizations';
    }
    
    // Contact tools
    if (['search_contacts', 'get_contact_details', 'create_contact', 'update_contact'].includes(toolName)) {
      return 'contacts';
    }
    
    // Activity tools
    if (['search_activities', 'get_activity_details', 'create_activity', 'update_activity', 'complete_activity'].includes(toolName)) {
      return 'activities';
    }

    return null;
  }

  /**
   * Execute a tool using the appropriate domain module
   */
  async executeTool(toolName: string, parameters: any, context: ToolExecutionContext): Promise<ToolResult> {
    const domainName = this.getDomainForTool(toolName);
    
    if (!domainName) {
      return {
        success: false,
        message: `Unknown tool: ${toolName}. This tool is not registered in any domain.`,
        metadata: {
          toolName,
          parameters,
          timestamp: new Date().toISOString(),
          executionTime: 0,
        },
      };
    }

    const domain = this.domains.get(domainName);
    if (!domain) {
      return {
        success: false,
        message: `Domain '${domainName}' not found for tool '${toolName}'`,
        metadata: {
          toolName,
          parameters,
          timestamp: new Date().toISOString(),
          executionTime: 0,
        },
      };
    }

    const toolFunction = domain[toolName];
    if (!toolFunction) {
      return {
        success: false,
        message: `Tool '${toolName}' not implemented in domain '${domainName}'`,
        metadata: {
          toolName,
          parameters,
          timestamp: new Date().toISOString(),
          executionTime: 0,
        },
      };
    }

    try {
      const startTime = Date.now();
      const result = await toolFunction(parameters, context);
      const executionTime = Date.now() - startTime;
      
      // Update execution time in metadata
      if (result.metadata) {
        result.metadata.executionTime = executionTime;
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        message: `Error executing tool '${toolName}' in domain '${domainName}': ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: {
          toolName,
          parameters,
          timestamp: new Date().toISOString(),
          executionTime: 0,
        },
      };
    }
  }

  /**
   * Get all available tools across all domains
   */
  getAllTools(): string[] {
    const allTools: string[] = [];
    
    Array.from(this.domains.entries()).forEach(([domainName, domain]) => {
      allTools.push(...Object.keys(domain));
    });
    
    return allTools.sort();
  }

  /**
   * Get tools for a specific domain
   */
  getToolsForDomain(domainName: string): string[] {
    const domain = this.domains.get(domainName);
    return domain ? Object.keys(domain).sort() : [];
  }

  /**
   * Get all domain names
   */
  getDomains(): string[] {
    return Array.from(this.domains.keys()).sort();
  }

  /**
   * Check if a tool exists
   */
  hasToolCalled(toolName: string): boolean {
    return this.getDomainForTool(toolName) !== null;
  }
} 