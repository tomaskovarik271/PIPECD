/**
 * Enhanced Tool Registry for PipeCD AI Agent
 * 
 * Follows MCP (Model Context Protocol) best practices:
 * - Rich tool descriptions with examples and usage patterns
 * - Proper annotations for tool behavior hints
 * - Self-documenting tools to reduce prompt complexity
 * - Workflow guidance embedded in tool metadata
 */

import type { MCPTool } from '../types';
import type { ToolCategory } from '../types/tools';

export interface EnhancedMCPTool extends MCPTool {
  annotations?: {
    title?: string;
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    idempotentHint?: boolean;
    openWorldHint?: boolean;
    examples?: string[];
    usagePatterns?: string[];
    relatedTools?: string[];
    workflowStage?: 'discovery' | 'creation' | 'update' | 'analysis' | 'cleanup';
  };
}

export interface ToolRegistryConfig {
  enabledCategories?: ToolCategory[];
  enabledTools?: string[];
  disabledTools?: string[];
}

export class EnhancedToolRegistry {
  private tools: Map<string, EnhancedMCPTool> = new Map();
  private categories: Map<ToolCategory, string[]> = new Map();
  private config: ToolRegistryConfig;

  constructor(config: ToolRegistryConfig = {}) {
    this.config = config;
    this.initializeEnhancedTools();
  }

  /**
   * Initialize all tools with rich MCP-compliant documentation
   */
  private initializeEnhancedTools(): void {
    this.registerEnhancedDealTools();
    this.registerEnhancedLeadTools();
    this.registerEnhancedOrganizationTools();
    this.registerEnhancedContactTools();
    this.registerEnhancedActivityTools();
    this.registerEnhancedCustomFieldTools();
  }

  /**
   * Register deal tools with rich documentation following MCP best practices
   */
  private registerEnhancedDealTools(): void {
    const dealTools: EnhancedMCPTool[] = [
      {
        name: 'search_deals',
        description: 'Search and filter deals in the CRM system. Use this when users ask about finding deals, checking deal status, analyzing deal pipelines, or getting deal overviews. Supports filtering by amount, assignee, stage, and text search.',
        parameters: {
          type: 'object',
          properties: {
            search_term: { 
              type: 'string', 
              description: 'Search term to filter deals by name or description. Supports partial matching. Leave empty to get all deals.'
            },
            assigned_to: { 
              type: 'string', 
              description: 'User ID or name to filter deals assigned to specific person. Use when user asks about "my deals" or "John\'s deals".'
            },
            min_amount: { 
              type: 'number', 
              description: 'Minimum deal value in USD. Use for queries like "deals over $10k" or "high-value opportunities".'
            },
            max_amount: { 
              type: 'number', 
              description: 'Maximum deal value in USD. Use for queries like "small deals under $5k".'
            },
            stage: {
              type: 'string',
              description: 'Deal stage to filter by. Common stages: "Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost".'
            },
            limit: { 
              type: 'number', 
              description: 'Maximum number of deals to return. Default is 20. Use higher values for comprehensive analysis.',
              default: 20
            }
          }
        },
        annotations: {
          title: 'Search Deals',
          readOnlyHint: true,
          openWorldHint: false,
          workflowStage: 'discovery',
          examples: [
            'Show me all deals over $50,000',
            'Find deals assigned to Sarah Johnson',
            'What deals are in the proposal stage?',
            'Show me deals for Acme Corporation',
            'List all deals closing this quarter'
          ],
          usagePatterns: [
            'Start with search_deals to understand the current deal landscape',
            'Use filters to narrow down to specific criteria mentioned by user',
            'Follow up with get_deal_details for specific deals that need analysis',
            'Combine with search_organizations when deals relate to specific companies'
          ],
          relatedTools: ['get_deal_details', 'search_organizations', 'search_activities']
        }
      },
      {
        name: 'get_deal_details',
        description: 'Get comprehensive details for a specific deal including all related data, activities, contacts, and analysis. Use this after search_deals when user wants detailed information about a particular deal, or when they mention a specific deal by name/ID.',
        parameters: {
          type: 'object',
          properties: {
            deal_id: { 
              type: 'string', 
              description: 'Unique identifier of the deal. Get this from search_deals results or when user provides a specific deal ID.',
              examples: ['deal_123', 'uuid-format-id']
            }
          },
          required: ['deal_id']
        },
        annotations: {
          title: 'Get Deal Details',
          readOnlyHint: true,
          openWorldHint: false,
          workflowStage: 'analysis',
          examples: [
            'Tell me more about the Acme Corp deal',
            'What\'s the status of deal #123?',
            'Show me all details for this deal',
            'Analyze the Microsoft partnership deal'
          ],
          usagePatterns: [
            'Use after search_deals to get detailed information',
            'Essential for deal analysis and reporting',
            'Provides context for update_deal operations',
            'Use when user asks about specific deal progress or details'
          ],
          relatedTools: ['search_deals', 'update_deal', 'search_activities']
        }
      },
      {
        name: 'create_deal',
        description: 'Create a new deal in the CRM system. Use this when users want to add a new sales opportunity, convert a lead to a deal, or record a new business opportunity. Always search for existing organizations first to avoid duplicates.',
        parameters: {
          type: 'object',
          properties: {
            name: { 
              type: 'string', 
              description: 'Deal name/title. Should be descriptive and include company name if applicable.',
              examples: ['Acme Corp - Software License Deal', 'Q2 2024 Enterprise Package', 'Microsoft Partnership Agreement']
            },
            organization_id: { 
              type: 'string', 
              description: 'ID of the organization/company for this deal. IMPORTANT: Always search_organizations first to find existing organization or create_organization if needed.',
              examples: ['org_123', 'uuid-format-org-id']
            },
            primary_contact_id: { 
              type: 'string', 
              description: 'ID of the main contact person for this deal. Search contacts first or create if needed.',
              examples: ['contact_456', 'uuid-format-contact-id']
            },
            value: { 
              type: 'number', 
              description: 'Deal value/amount in USD. Use the total expected revenue from this deal.',
              examples: [5000, 25000, 100000]
            },
            stage: { 
              type: 'string', 
              description: 'Initial deal stage. Common values: "Prospecting", "Qualification", "Proposal", "Negotiation". Default is usually "Prospecting".',
              examples: ['Prospecting', 'Qualification', 'Proposal']
            },
            priority: { 
              type: 'string', 
              description: 'Deal priority level: HIGH, MEDIUM, or LOW. Use HIGH for urgent/large deals.',
              examples: ['HIGH', 'MEDIUM', 'LOW']
            },
            description: { 
              type: 'string', 
              description: 'Detailed description of the deal, requirements, or opportunity details.',
              examples: ['Enterprise software license renewal', 'New customer onboarding package', 'Custom integration project']
            },
            source: { 
              type: 'string', 
              description: 'How this deal was acquired. Common sources: Website, Referral, Cold Call, LinkedIn, Trade Show.',
              examples: ['Website', 'Referral', 'Cold Call', 'LinkedIn', 'Trade Show']
            },
            close_date: { 
              type: 'string', 
              description: 'Expected close date in YYYY-MM-DD format. Use realistic timeline based on deal complexity.',
              examples: ['2024-03-15', '2024-06-30', '2024-12-31']
            },
            custom_fields: { 
              type: 'array', 
              description: 'Array of custom field values with definitionId and value. Use for RFP data, special requirements, etc.',
              examples: [
                [{"definitionId": "field_123", "value": "Enterprise"}],
                [{"definitionId": "budget_field", "value": "50000"}]
              ]
            }
          },
          required: ['name']
        },
        annotations: {
          title: 'Create Deal',
          readOnlyHint: false,
          destructiveHint: false,
          openWorldHint: false,
          workflowStage: 'creation',
          examples: [
            'Create a new deal for Acme Corp worth $50,000',
            'Add a software license deal for Microsoft',
            'Record this RFP as a new opportunity',
            'Convert this lead into a deal'
          ],
          usagePatterns: [
            'ALWAYS search_organizations first to find or create the company',
            'Search for existing contacts or create_contact if needed',
            'Use custom_fields for RFP-specific data or special requirements',
            'Set realistic close_date based on deal complexity',
            'Follow up with create_activity to add initial notes or next steps'
          ],
          relatedTools: ['search_organizations', 'create_organization', 'search_contacts', 'create_contact', 'create_activity']
        }
      },
      {
        name: 'update_deal',
        description: 'Update existing deal information including amount, stage, dates, assignments, and other details. Use this when users want to modify deal data, change deal stage, update amounts, or reassign deals.',
        parameters: {
          type: 'object',
          properties: {
            deal_id: { 
              type: 'string', 
              description: 'ID of the deal to update. Get this from search_deals or get_deal_details.',
              examples: ['deal_123', 'uuid-format-deal-id']
            },
            name: { 
              type: 'string', 
              description: 'New deal name/title if changing.',
              examples: ['Updated Deal Name', 'Acme Corp - Expanded Package']
            },
            amount: { 
              type: 'number', 
              description: 'New deal amount/value in USD.',
              examples: [75000, 125000, 250000]
            },
            stage: {
              type: 'string',
              description: 'New deal stage. Common progressions: Prospecting → Qualification → Proposal → Negotiation → Closed Won/Lost.',
              examples: ['Qualification', 'Proposal', 'Negotiation', 'Closed Won']
            },
            expected_close_date: { 
              type: 'string', 
              description: 'New expected close date in YYYY-MM-DD format.',
              examples: ['2024-04-15', '2024-07-30']
            },
            assigned_to_user_id: { 
              type: 'string', 
              description: 'ID of user to reassign deal to.',
              examples: ['user_456', 'uuid-format-user-id']
            },
            priority: {
              type: 'string',
              description: 'Updated priority: HIGH, MEDIUM, or LOW.',
              examples: ['HIGH', 'MEDIUM', 'LOW']
            }
          },
          required: ['deal_id']
        },
        annotations: {
          title: 'Update Deal',
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: false,
          workflowStage: 'update',
          examples: [
            'Update the deal amount to $75,000',
            'Move this deal to the proposal stage',
            'Change the close date to next month',
            'Reassign this deal to Sarah',
            'Mark this deal as high priority'
          ],
          usagePatterns: [
            'Use get_deal_details first to understand current state',
            'Update stage progressively (don\'t skip stages without reason)',
            'When updating amount, consider if close_date should also change',
            'Follow up with create_activity to log the reason for changes'
          ],
          relatedTools: ['get_deal_details', 'search_deals', 'create_activity']
        }
      },
      {
        name: 'delete_deal',
        description: 'Permanently delete a deal from the system. Use this only when explicitly requested by user and when deal was created in error or is no longer valid. This action cannot be undone.',
        parameters: {
          type: 'object',
          properties: {
            deal_id: { 
              type: 'string', 
              description: 'ID of the deal to delete permanently.',
              examples: ['deal_123', 'uuid-format-deal-id']
            }
          },
          required: ['deal_id']
        },
        annotations: {
          title: 'Delete Deal',
          readOnlyHint: false,
          destructiveHint: true,
          idempotentHint: true,
          openWorldHint: false,
          workflowStage: 'cleanup',
          examples: [
            'Delete this duplicate deal',
            'Remove the test deal we created',
            'This deal was created by mistake, please delete it'
          ],
          usagePatterns: [
            'ALWAYS confirm with user before deleting',
            'Use get_deal_details first to show what will be deleted',
            'Consider update_deal to mark as "Closed Lost" instead of deleting',
            'Only delete when explicitly requested and confirmed'
          ],
          relatedTools: ['get_deal_details', 'update_deal']
        }
      }
    ];

    this.registerToolsForCategory('deals', dealTools);
  }

  /**
   * Register enhanced lead tools with comprehensive documentation
   */
  private registerEnhancedLeadTools(): void {
    const leadTools: EnhancedMCPTool[] = [
      {
        name: 'search_leads',
        description: 'Search and filter leads by various criteria including source, qualification status, score, and assignment. Use this to find prospects, analyze lead quality, or review lead pipeline.',
        parameters: {
          type: 'object',
          properties: {
            search_term: { 
              type: 'string', 
              description: 'Search term to filter by lead name, contact info, or company. Supports partial matching.'
            },
            source: { 
              type: 'string', 
              description: 'Lead source to filter by. Common sources: Website, LinkedIn, Referral, Cold Call, Trade Show, Advertisement.'
            },
            is_qualified: { 
              type: 'boolean', 
              description: 'Filter by qualification status. true = qualified leads, false = unqualified, omit = all leads.'
            },
            assigned_to_user_id: { 
              type: 'string', 
              description: 'Filter leads assigned to specific user. Use for "my leads" or "John\'s leads" queries.',
              examples: ['user_123', 'uuid-format-user-id']
            },
            min_score: { 
              type: 'number', 
              description: 'Minimum lead score (0-100). Use for finding high-quality leads.',
              examples: [70, 80, 90]
            },
            max_score: { 
              type: 'number', 
              description: 'Maximum lead score (0-100). Use for finding leads needing attention.',
              examples: [30, 50, 70]
            },
            limit: { 
              type: 'number', 
              description: 'Maximum number of leads to return. Default is 20.',
              default: 20
            }
          }
        },
        annotations: {
          title: 'Search Leads',
          readOnlyHint: true,
          openWorldHint: false,
          workflowStage: 'discovery',
          examples: [
            'Show me all qualified leads',
            'Find leads from LinkedIn with high scores',
            'What leads are assigned to me?',
            'Show unqualified leads that need attention'
          ],
          usagePatterns: [
            'Start with broad search, then narrow with filters',
            'Use is_qualified=false to find leads needing qualification',
            'Follow up with get_lead_details for specific leads'
          ],
          relatedTools: ['get_lead_details', 'qualify_lead', 'convert_lead']
        }
      },
      {
        name: 'create_lead',
        description: 'Create a new lead with comprehensive data including contact information, company details, estimated value, and custom fields. Use this when capturing new prospects from various sources like RFPs, inquiries, or referrals.',
        parameters: {
          type: 'object',
          properties: {
            name: { 
              type: 'string', 
              description: 'Lead name/title. Should be descriptive and include company if known.',
              examples: ['Acme Corp - Enterprise Software Inquiry', 'John Smith - CRM Implementation', 'Q2 Partnership Opportunity']
            },
            source: { 
              type: 'string', 
              description: 'How this lead was acquired. Be specific about the source.',
              examples: ['Website Contact Form', 'LinkedIn InMail', 'Trade Show - TechConf 2024', 'Referral from Jane Doe']
            },
            contact_name: { 
              type: 'string', 
              description: 'Full name of the contact person.',
              examples: ['John Smith', 'Sarah Johnson', 'Michael Chen']
            },
            contact_email: { 
              type: 'string', 
              description: 'Email address of the contact person.',
              examples: ['john.smith@acme.com', 'sarah@company.org']
            },
            contact_phone: { 
              type: 'string', 
              description: 'Phone number of the contact person.',
              examples: ['+1-555-123-4567', '(555) 987-6543']
            },
            company_name: { 
              type: 'string', 
              description: 'Name of the company/organization.',
              examples: ['Acme Corporation', 'TechStart Inc', 'Global Solutions Ltd']
            },
            estimated_value: { 
              type: 'number', 
              description: 'Estimated potential deal value in USD.',
              examples: [10000, 50000, 250000]
            },
            estimated_close_date: { 
              type: 'string', 
              description: 'Estimated close date in YYYY-MM-DD format.',
              examples: ['2024-06-30', '2024-09-15', '2024-12-31']
            },
            description: { 
              type: 'string', 
              description: 'Detailed description of the lead, requirements, or opportunity.',
              examples: ['Enterprise CRM implementation for 500+ users', 'Custom software development project', 'Annual software license renewal']
            },
            custom_fields: { 
              type: 'object', 
              description: 'Custom field values as key-value pairs for RFP data or special requirements.',
              examples: [
                {"budget_range": "50k-100k", "timeline": "Q2 2024", "decision_maker": "CTO"}
              ]
            }
          },
          required: ['name']
        },
        annotations: {
          title: 'Create Lead',
          readOnlyHint: false,
          destructiveHint: false,
          openWorldHint: false,
          workflowStage: 'creation',
          examples: [
            'Create a lead for the RFP we received',
            'Add John Smith from Acme Corp as a new lead',
            'Record this trade show contact as a lead',
            'Convert this inquiry into a lead'
          ],
          usagePatterns: [
            'Capture all available information during creation',
            'Use custom_fields for RFP-specific data',
            'Set realistic estimated_value and close_date',
            'Follow up with create_activity for initial notes',
            'Consider immediate qualification if enough info available'
          ],
          relatedTools: ['qualify_lead', 'create_activity', 'search_organizations']
        }
      }
    ];

    this.registerToolsForCategory('leads', leadTools);
  }

  /**
   * Register enhanced organization tools
   */
  private registerEnhancedOrganizationTools(): void {
    const orgTools: EnhancedMCPTool[] = [
      {
        name: 'search_organizations',
        description: 'Search for companies/organizations in the CRM system. CRITICAL: Always use this before creating deals or contacts to avoid duplicates. Search by company name, domain, or industry.',
        parameters: {
          type: 'object',
          properties: {
            search_term: { 
              type: 'string', 
              description: 'Company name or domain to search for. Supports partial matching.'
            },
            industry: { 
              type: 'string', 
              description: 'Industry to filter by.'
            },
            limit: { 
              type: 'number', 
              description: 'Maximum number of organizations to return.',
              default: 20
            }
          }
        },
        annotations: {
          title: 'Search Organizations',
          readOnlyHint: true,
          openWorldHint: false,
          workflowStage: 'discovery',
          examples: [
            'Find Acme Corporation',
            'Search for technology companies',
            'Look up microsoft.com'
          ],
          usagePatterns: [
            'ALWAYS search before creating deals or contacts',
            'Use partial company names to find variations',
            'Essential first step in deal/contact creation workflows'
          ],
          relatedTools: ['create_organization', 'create_deal', 'create_contact']
        }
      },
      {
        name: 'create_organization',
        description: 'Create a new company/organization in the CRM system. Use this only after search_organizations confirms the company doesn\'t already exist.',
        parameters: {
          type: 'object',
          properties: {
            name: { 
              type: 'string', 
              description: 'Official company name.',
              examples: ['Acme Corporation', 'TechStart Inc', 'Global Solutions Ltd']
            },
            domain: { 
              type: 'string', 
              description: 'Company website domain.',
              examples: ['acme.com', 'techstart.io', 'globalsolutions.org']
            },
            industry: { 
              type: 'string', 
              description: 'Company industry/sector.',
              examples: ['Technology', 'Healthcare', 'Finance', 'Manufacturing']
            },
            description: { 
              type: 'string', 
              description: 'Company description or notes.',
              examples: ['Leading software company', 'Healthcare technology startup', 'Global consulting firm']
            }
          },
          required: ['name']
        },
        annotations: {
          title: 'Create Organization',
          readOnlyHint: false,
          destructiveHint: false,
          openWorldHint: false,
          workflowStage: 'creation',
          examples: [
            'Create Acme Corporation as a new company',
            'Add TechStart Inc to our CRM',
            'Register this new client company'
          ],
          usagePatterns: [
            'ONLY use after search_organizations confirms company doesn\'t exist',
            'Include domain to prevent future duplicates',
            'Set appropriate industry for better categorization',
            'Follow up with create_contact for company contacts'
          ],
          relatedTools: ['search_organizations', 'create_contact', 'create_deal']
        }
      }
    ];

    this.registerToolsForCategory('organizations', orgTools);
  }

  /**
   * Register enhanced contact tools
   */
  private registerEnhancedContactTools(): void {
    const contactTools: EnhancedMCPTool[] = [
      {
        name: 'search_contacts',
        description: 'Search for people/contacts in the CRM system by name, email, phone, or company. Use this to find existing contacts before creating new ones.',
        parameters: {
          type: 'object',
          properties: {
            search_term: { 
              type: 'string', 
              description: 'Name, email, or phone to search for.'
            },
            organization_id: { 
              type: 'string', 
              description: 'Filter contacts by organization/company.'
            },
            limit: { 
              type: 'number', 
              description: 'Maximum number of contacts to return.',
              default: 20
            }
          }
        },
        annotations: {
          title: 'Search Contacts',
          readOnlyHint: true,
          openWorldHint: false,
          workflowStage: 'discovery',
          examples: [
            'Find John Smith',
            'Search for contacts at Acme Corp',
            'Look up john@company.com'
          ],
          usagePatterns: [
            'Search before creating new contacts to avoid duplicates',
            'Use email search for most accurate results',
            'Essential for deal and activity creation workflows'
          ],
          relatedTools: ['create_contact', 'create_deal', 'create_activity']
        }
      }
    ];

    this.registerToolsForCategory('contacts', contactTools);
  }

  /**
   * Register enhanced activity tools
   */
  private registerEnhancedActivityTools(): void {
    const activityTools: EnhancedMCPTool[] = [
      {
        name: 'create_activity',
        description: 'Create a new activity (task, call, meeting, email, note) in the CRM system. Use this to log interactions, schedule follow-ups, or create reminders.',
        parameters: {
          type: 'object',
          properties: {
            subject: { 
              type: 'string', 
              description: 'Activity title/subject. Be descriptive about what needs to be done.'
            },
            type: { 
              type: 'string', 
              description: 'Activity type: CALL, EMAIL, MEETING, TASK, NOTE.'
            },
            due_date: { 
              type: 'string', 
              description: 'Due date in YYYY-MM-DD format. Use for tasks and scheduled activities.'
            },
            description: { 
              type: 'string', 
              description: 'Detailed description of the activity or notes.'
            },
            deal_id: { 
              type: 'string', 
              description: 'Associate activity with a specific deal.'
            },
            contact_id: { 
              type: 'string', 
              description: 'Associate activity with a specific contact.'
            }
          },
          required: ['subject', 'type']
        },
        annotations: {
          title: 'Create Activity',
          readOnlyHint: false,
          destructiveHint: false,
          openWorldHint: false,
          workflowStage: 'creation',
          examples: [
            'Schedule a follow-up call for next week',
            'Create a task to send the proposal',
            'Log this meeting with notes'
          ],
          usagePatterns: [
            'Always associate with deal_id or contact_id when relevant',
            'Use appropriate activity type for better organization',
            'Create activities after deal/contact creation for next steps'
          ],
          relatedTools: ['search_deals', 'search_contacts', 'create_deal']
        }
      }
    ];

    this.registerToolsForCategory('activities', activityTools);
  }

  /**
   * Register enhanced custom field tools
   */
  private registerEnhancedCustomFieldTools(): void {
    const customFieldTools: EnhancedMCPTool[] = [
      {
        name: 'create_custom_field_definition',
        description: 'Create a new custom field definition for deals, leads, contacts, or organizations. Use this when you need to capture specific data that doesn\'t fit standard fields.',
        parameters: {
          type: 'object',
          properties: {
            entity_type: { 
              type: 'string', 
              description: 'Entity type: DEAL, LEAD, CONTACT, ORGANIZATION.'
            },
            field_name: { 
              type: 'string', 
              description: 'Field name (internal identifier). Use snake_case.'
            },
            display_name: { 
              type: 'string', 
              description: 'Human-readable field name shown in UI.'
            },
            field_type: { 
              type: 'string', 
              description: 'Field data type: TEXT, NUMBER, DATE, BOOLEAN, DROPDOWN, MULTI_SELECT.'
            },
            options: { 
              type: 'array', 
              description: 'Options for DROPDOWN or MULTI_SELECT fields.'
            },
            is_required: { 
              type: 'boolean', 
              description: 'Whether this field is required.'
            }
          },
          required: ['entity_type', 'field_name', 'display_name', 'field_type']
        },
        annotations: {
          title: 'Create Custom Field Definition',
          readOnlyHint: false,
          destructiveHint: false,
          openWorldHint: false,
          workflowStage: 'creation',
          examples: [
            'Create a budget range field for deals',
            'Add a decision timeline field for leads',
            'Create a compliance requirements field'
          ],
          usagePatterns: [
            'Create fields before using them in create_deal or create_lead',
            'Use DROPDOWN for predefined options',
            'Use descriptive field_name for easy identification'
          ],
          relatedTools: ['create_deal', 'create_lead', 'search_custom_field_definitions']
        }
      }
    ];

    this.registerToolsForCategory('custom_fields', customFieldTools);
  }

  /**
   * Register tools for a specific category
   */
  private registerToolsForCategory(category: ToolCategory, tools: EnhancedMCPTool[]): void {
    if (!this.categories.has(category)) {
      this.categories.set(category, []);
    }

    const categoryTools = this.categories.get(category)!;

    for (const tool of tools) {
      if (this.shouldEnableTool(tool.name, category)) {
        this.tools.set(tool.name, tool);
        categoryTools.push(tool.name);
      }
    }
  }

  /**
   * Check if a tool should be enabled based on configuration
   */
  private shouldEnableTool(toolName: string, category: ToolCategory): boolean {
    if (this.config.disabledTools?.includes(toolName)) {
      return false;
    }

    if (this.config.enabledTools?.includes(toolName)) {
      return true;
    }

    if (this.config.enabledCategories && !this.config.enabledCategories.includes(category)) {
      return false;
    }

    return true;
  }

  /**
   * Get all enabled tools
   */
  getAllTools(): EnhancedMCPTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(category: ToolCategory): EnhancedMCPTool[] {
    const toolNames = this.categories.get(category) || [];
    return toolNames.map(name => this.tools.get(name)!).filter(Boolean);
  }

  /**
   * Get a specific tool
   */
  getTool(name: string): EnhancedMCPTool | undefined {
    return this.tools.get(name);
  }

  /**
   * Get tools by workflow stage
   */
  getToolsByWorkflowStage(stage: 'discovery' | 'creation' | 'update' | 'analysis' | 'cleanup'): EnhancedMCPTool[] {
    return Array.from(this.tools.values()).filter(tool => 
      tool.annotations?.workflowStage === stage
    );
  }

  /**
   * Get related tools for a given tool
   */
  getRelatedTools(toolName: string): EnhancedMCPTool[] {
    const tool = this.tools.get(toolName);
    if (!tool?.annotations?.relatedTools) {
      return [];
    }

    return tool.annotations.relatedTools
      .map(name => this.tools.get(name))
      .filter(Boolean) as EnhancedMCPTool[];
  }

  /**
   * Generate tool usage guidance for Claude
   */
  generateToolGuidance(): string {
    const guidance = [
      "# Tool Usage Guidance",
      "",
      "## Workflow Patterns",
      "",
      "### Deal Creation Workflow:",
      "1. search_organizations (find existing company)",
      "2. create_organization (if company doesn't exist)",
      "3. search_contacts (find existing contact)",
      "4. create_contact (if contact doesn't exist)", 
      "5. create_deal (with organization_id and contact_id)",
      "6. create_activity (for next steps)",
      "",
      "### Lead Qualification Workflow:",
      "1. search_leads (find leads needing attention)",
      "2. get_lead_details (analyze specific lead)",
      "3. qualify_lead (mark as qualified/unqualified)",
      "4. convert_lead (if qualified, convert to deal)",
      "",
      "### Discovery Workflow:",
      "1. Start with search_* tools to understand current state",
      "2. Use get_*_details for comprehensive analysis",
      "3. Create or update based on findings",
      "",
      "## Tool Selection Guidelines",
      "",
      "- **Always search before creating** to avoid duplicates",
      "- **Use read-only tools first** to gather context",
      "- **Follow workflow stages**: discovery → creation → update → analysis",
      "- **Check related tools** for comprehensive workflows",
      "- **Use examples** in tool descriptions as guidance"
    ];

    return guidance.join('\n');
  }
} 