import type { 
  BusinessRule, 
  WorkflowPattern, 
  WorkflowStep, 
  WorkflowCondition 
} from '../types/system.js';

export class PipeCDRulesEngine {
  private rules: Map<string, BusinessRule[]> = new Map();
  private lastUpdated: Map<string, Date> = new Map();
  private workflowPatterns: Map<string, WorkflowPattern> = new Map();
  private maxAge = 3600; // 1 hour default cache
  
  constructor() {
    this.initializeCoreRules();
    this.initializeWorkflowPatterns();
  }

  async getRules(category: string, maxAge: number = this.maxAge): Promise<BusinessRule[]> {
    if (this.isStale(category, maxAge)) {
      await this.refreshRules(category);
    }
    return this.rules.get(category) || [];
  }

  async getAllRules(maxAge: number = this.maxAge): Promise<BusinessRule[]> {
    const categories = ['data_handling', 'workflow', 'business_logic', 'user_experience', 'security'];
    const allRules: BusinessRule[] = [];
    
    for (const category of categories) {
      const categoryRules = await this.getRules(category, maxAge);
      allRules.push(...categoryRules);
    }
    
    return allRules;
  }

  async getRelevantRules(context: any): Promise<BusinessRule[]> {
    const allRules = await this.getAllRules();
    
    // Filter rules based on context
    return allRules.filter(rule => {
      // Always include critical and high priority rules
      if (rule.priority === 'critical' || rule.priority === 'high') {
        return true;
      }
      
      // Context-based filtering could be added here
      // For now, include all rules
      return true;
    }).sort((a, b) => {
      // Sort by priority
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  async getWorkflowPattern(workflowType: string): Promise<WorkflowPattern | undefined> {
    return this.workflowPatterns.get(workflowType);
  }

  async addRule(rule: BusinessRule): Promise<void> {
    const categoryRules = this.rules.get(rule.category) || [];
    
    // Remove existing rule with same ID if it exists
    const filteredRules = categoryRules.filter(r => r.id !== rule.id);
    filteredRules.push(rule);
    
    this.rules.set(rule.category, filteredRules);
    this.lastUpdated.set(rule.category, new Date());
  }

  async removeRule(category: string, ruleId: string): Promise<boolean> {
    const categoryRules = this.rules.get(category) || [];
    const filteredRules = categoryRules.filter(r => r.id !== ruleId);
    
    if (filteredRules.length < categoryRules.length) {
      this.rules.set(category, filteredRules);
      this.lastUpdated.set(category, new Date());
      return true;
    }
    
    return false;
  }

  private isStale(category: string, maxAge: number): boolean {
    const lastUpdate = this.lastUpdated.get(category);
    if (!lastUpdate) return true;
    
    const ageInSeconds = (Date.now() - lastUpdate.getTime()) / 1000;
    return ageInSeconds > maxAge;
  }

  private async refreshRules(category: string): Promise<void> {
    // In a production system, this would fetch from various sources
    // For now, we'll just refresh the timestamp
    this.lastUpdated.set(category, new Date());
  }

  private initializeCoreRules(): void {
    // Data Handling Rules
    const dataHandlingRules: BusinessRule[] = [
      {
        id: 'search-before-create',
        category: 'data_handling',
        priority: 'critical',
        rule: 'Always search for existing entities before creating new ones',
        examples: [
          'search_organizations before create_organization',
          'search_people before create_person',
          'Use get_dropdown_data to check existing options'
        ],
        last_updated: new Date(),
        source: 'code_analysis'
      },
      {
        id: 'uuid-handling',
        category: 'data_handling',
        priority: 'high',
        rule: 'UUIDs are regenerated on database reset - never hardcode IDs',
        examples: [
          'Always fetch current UUIDs dynamically',
          'Use search results to get actual IDs',
          'Never assume ID values from previous sessions'
        ],
        last_updated: new Date(),
        source: 'admin_config'
      },
      {
        id: 'structured-data-preservation',
        category: 'data_handling',
        priority: 'high',
        rule: 'Preserve structured data throughout tool execution workflow',
        examples: [
          'Maintain object references between tool calls',
          'Store complex results in workflow context',
          'Avoid converting structured data to strings unnecessarily'
        ],
        last_updated: new Date(),
        source: 'user_feedback'
      },
      {
        id: 'duplicate-prevention',
        category: 'data_handling',
        priority: 'critical',
        rule: 'Use Claude thinking when search returns zero results for entity creation',
        examples: [
          'Think through whether entity truly doesn\'t exist',
          'Consider alternative search terms',
          'Verify search parameters before creating duplicates'
        ],
        last_updated: new Date(),
        source: 'ml_learning'
      }
    ];

    // Workflow Rules
    const workflowRules: BusinessRule[] = [
      {
        id: 'think-first-methodology',
        category: 'workflow',
        priority: 'critical',
        rule: 'Use Think-First methodology for complex operations',
        examples: [
          'think() → analyze → plan → execute → confirm',
          'Always think before multi-step workflows',
          'Use structured reasoning for decision making'
        ],
        last_updated: new Date(),
        source: 'admin_config'
      },
      {
        id: 'dropdown-first-pattern',
        category: 'workflow',
        priority: 'high',
        rule: 'Get dropdown data before creating entities that require relationships',
        examples: [
          'get_dropdown_data() before create_deal',
          'Load project types, statuses, and defaults first',
          'Use default values when user doesn\'t specify'
        ],
        last_updated: new Date(),
        source: 'code_analysis'
      },
      {
        id: 'sequential-execution',
        category: 'workflow',
        priority: 'medium',
        rule: 'Execute workflow steps sequentially with context preservation',
        examples: [
          'Wait for tool results before proceeding',
          'Maintain context between steps',
          'Handle errors gracefully with recovery options'
        ],
        last_updated: new Date(),
        source: 'user_feedback'
      },
      {
        id: 'graphql-first',
        category: 'workflow',
        priority: 'high',
        rule: 'Use GraphQL operations identical to frontend for consistency',
        examples: [
          'Same queries/mutations as frontend',
          'Identical fragments and field selections',
          'Automatic feature propagation when frontend evolves'
        ],
        last_updated: new Date(),
        source: 'admin_config'
      }
    ];

    // Business Logic Rules
    const businessLogicRules: BusinessRule[] = [
      {
        id: 'deal-project-type-requirement',
        category: 'business_logic',
        priority: 'critical',
        rule: 'Every deal must have a WFM project type (default: Sales Deal)',
        examples: [
          'Auto-select "Sales Deal" if not specified',
          'get_dropdown_data provides default_project_type_id',
          'Never create deals without project type'
        ],
        last_updated: new Date(),
        source: 'business_rule'
      },
      {
        id: 'currency-defaults',
        category: 'business_logic',
        priority: 'medium',
        rule: 'Currency defaults to USD unless explicitly specified',
        examples: [
          'Use USD for deals without currency',
          'Support multi-currency when specified',
          'Maintain currency consistency in calculations'
        ],
        last_updated: new Date(),
        source: 'business_rule'
      },
      {
        id: 'permission-awareness',
        category: 'business_logic',
        priority: 'high',
        rule: 'Respect user permissions for all operations',
        examples: [
          'Check read_all vs read_own permissions',
          'Filter data based on user access',
          'Gracefully handle permission denials'
        ],
        last_updated: new Date(),
        source: 'security'
      }
    ];

    // User Experience Rules
    const userExperienceRules: BusinessRule[] = [
      {
        id: 'progress-transparency',
        category: 'user_experience',
        priority: 'high',
        rule: 'Provide clear progress updates during multi-step operations',
        examples: [
          'Show what was accomplished',
          'Indicate next steps clearly',
          'Explain any delays or issues'
        ],
        last_updated: new Date(),
        source: 'user_feedback'
      },
      {
        id: 'success-confirmation',
        category: 'user_experience',
        priority: 'medium',
        rule: 'Always confirm successful completion with specific details',
        examples: [
          'Show created entity ID and key fields',
          'Provide actionable next steps',
          'Include relevant follow-up suggestions'
        ],
        last_updated: new Date(),
        source: 'user_feedback'
      },
      {
        id: 'intelligent-questioning',
        category: 'user_experience',
        priority: 'medium',
        rule: 'Ask intelligent clarifying questions when needed',
        examples: [
          'Suggest reasonable defaults',
          'Provide context for decisions',
          'Offer multiple options when appropriate'
        ],
        last_updated: new Date(),
        source: 'ml_learning'
      }
    ];

    // Security Rules
    const securityRules: BusinessRule[] = [
      {
        id: 'data-privacy',
        category: 'security',
        priority: 'critical',
        rule: 'Never expose sensitive data in logs or responses',
        examples: [
          'Mask email addresses when appropriate',
          'Avoid logging authentication tokens',
          'Respect data visibility permissions'
        ],
        last_updated: new Date(),
        source: 'security'
      },
      {
        id: 'permission-verification',
        category: 'security',
        priority: 'critical',
        rule: 'Verify permissions before executing any operation',
        examples: [
          'Check user permissions in context',
          'Validate access to requested entities',
          'Fail gracefully on permission denial'
        ],
        last_updated: new Date(),
        source: 'security'
      }
    ];

    // Store all rule categories
    this.rules.set('data_handling', dataHandlingRules);
    this.rules.set('workflow', workflowRules);
    this.rules.set('business_logic', businessLogicRules);
    this.rules.set('user_experience', userExperienceRules);
    this.rules.set('security', securityRules);

    // Set initial timestamps
    const now = new Date();
    this.lastUpdated.set('data_handling', now);
    this.lastUpdated.set('workflow', now);
    this.lastUpdated.set('business_logic', now);
    this.lastUpdated.set('user_experience', now);
    this.lastUpdated.set('security', now);
  }

  private initializeWorkflowPatterns(): void {
    // Deal Creation Workflow
    const dealCreationPattern: WorkflowPattern = {
      name: 'deal_creation',
      steps: [
        {
          id: 'think',
          name: 'Analyze Request',
          tool: 'think',
          parameters: {
            reasoning_type: 'planning',
            thought: 'Analyzing deal creation request and planning workflow'
          },
          required: true
        },
        {
          id: 'get_dropdown_data',
          name: 'Load System Data',
          tool: 'get_dropdown_data',
          parameters: {},
          required: true
        },
        {
          id: 'search_organizations',
          name: 'Find Organization',
          tool: 'search_organizations',
          parameters: {
            query: '${organization_name}'
          },
          required: true,
          depends_on: ['think']
        },
        {
          id: 'create_deal',
          name: 'Create Deal',
          tool: 'create_deal',
          parameters: {
            name: '${deal_name}',
            organization_id: '${organization_id}',
            value: '${value}',
            currency: '${currency}',
            wfmProjectTypeId: '${default_project_type_id}'
          },
          required: true,
          depends_on: ['get_dropdown_data', 'search_organizations']
        }
      ],
      conditions: [
        {
          field: 'organization_id',
          operator: 'exists',
          value: true,
          action: 'required'
        }
      ],
      fallback_strategies: [
        'If organization not found, ask user to confirm creation',
        'If deal creation fails, provide specific error details',
        'If permissions insufficient, explain required permissions'
      ]
    };

    // Entity Search Workflow
    const entitySearchPattern: WorkflowPattern = {
      name: 'entity_search',
      steps: [
        {
          id: 'think',
          name: 'Analyze Search Request',
          tool: 'think',
          parameters: {
            reasoning_type: 'analysis',
            thought: 'Analyzing search parameters and determining best approach'
          },
          required: true
        },
        {
          id: 'search_entities',
          name: 'Search Entities',
          tool: '${search_tool}',
          parameters: {
            query: '${search_query}',
            limit: '${limit}'
          },
          required: true,
          depends_on: ['think']
        }
      ],
      conditions: [
        {
          field: 'search_query',
          operator: 'exists',
          value: true,
          action: 'required'
        }
      ],
      fallback_strategies: [
        'If no results found, suggest alternative search terms',
        'If too many results, recommend more specific criteria',
        'If search fails, fall back to manual entry'
      ]
    };

    this.workflowPatterns.set('deal_creation', dealCreationPattern);
    this.workflowPatterns.set('entity_search', entitySearchPattern);
  }

  // Rule management methods
  async getRulesByPriority(priority: 'critical' | 'high' | 'medium' | 'low'): Promise<BusinessRule[]> {
    const allRules = await this.getAllRules();
    return allRules.filter(rule => rule.priority === priority);
  }

  async getRulesBySource(source: 'admin_config' | 'code_analysis' | 'user_feedback' | 'ml_learning'): Promise<BusinessRule[]> {
    const allRules = await this.getAllRules();
    return allRules.filter(rule => rule.source === source);
  }

  async updateRule(ruleId: string, updates: Partial<BusinessRule>): Promise<boolean> {
    for (const [category, rules] of this.rules.entries()) {
      const ruleIndex = rules.findIndex(r => r.id === ruleId);
      if (ruleIndex !== -1) {
        rules[ruleIndex] = { ...rules[ruleIndex], ...updates, last_updated: new Date() };
        this.lastUpdated.set(category, new Date());
        return true;
      }
    }
    return false;
  }

  // Workflow pattern methods
  getAllWorkflowPatterns(): Map<string, WorkflowPattern> {
    return new Map(this.workflowPatterns);
  }

  addWorkflowPattern(name: string, pattern: WorkflowPattern): void {
    this.workflowPatterns.set(name, pattern);
  }

  removeWorkflowPattern(name: string): boolean {
    return this.workflowPatterns.delete(name);
  }

  // Utility methods
  getRuleCount(): number {
    let count = 0;
    for (const rules of this.rules.values()) {
      count += rules.length;
    }
    return count;
  }

  getWorkflowPatternCount(): number {
    return this.workflowPatterns.size;
  }

  // Export rules for external use
  exportRules(): Record<string, BusinessRule[]> {
    const exported: Record<string, BusinessRule[]> = {};
    for (const [category, rules] of this.rules.entries()) {
      exported[category] = [...rules];
    }
    return exported;
  }

  // Import rules from external source
  importRules(rules: Record<string, BusinessRule[]>): void {
    for (const [category, categoryRules] of Object.entries(rules)) {
      this.rules.set(category, categoryRules);
      this.lastUpdated.set(category, new Date());
    }
  }

  // Clear all caches
  clearCache(): void {
    this.lastUpdated.clear();
  }
} 