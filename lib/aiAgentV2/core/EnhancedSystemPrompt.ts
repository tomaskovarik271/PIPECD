import { SystemStateEncoder } from './SystemStateEncoder.js';
import { PipeCDRulesEngine } from './PipeCDRulesEngine.js';
import type {
  PromptContext,
  ConversationContext,
  SystemSnapshot, 
  BusinessRule
} from '../types/system.js';
import type { DecisionContext } from '../types/agent.js';

export class EnhancedSystemPrompt {
  private systemStateEncoder: SystemStateEncoder;
  private rulesEngine: PipeCDRulesEngine;
  private promptTemplates: Map<string, string> = new Map();

  constructor(systemStateEncoder: SystemStateEncoder, rulesEngine: PipeCDRulesEngine) {
    this.systemStateEncoder = systemStateEncoder;
    this.rulesEngine = rulesEngine;
    this.initializePromptTemplates();
  }

  async generatePrompt(
    userId: string,
    conversationContext: ConversationContext,
    operationType: 'complete' | 'lightweight' | 'error_recovery' | 'workflow' = 'complete'
  ): Promise<string> {
    const userPermissions = conversationContext.systemState?.user_context.permissions || [];
    
    // Get real-time system context
    const systemState = await this.systemStateEncoder.generateSnapshot(userId, userPermissions);
    
    // Get relevant business rules
    const relevantRules = await this.rulesEngine.getRelevantRules(conversationContext);
    
    // Generate context-aware prompt
    return this.buildPrompt({
      operationType,
      systemState,
      rules: relevantRules,
      conversationHistory: conversationContext.messageHistory,
      userProfile: {
        id: userId,
        role: systemState.user_context.role,
        permissions: userPermissions,
        preferences: {},
        recentActivity: systemState.user_context.recent_focus_areas,
        expertiseAreas: []
      },
      currentObjective: conversationContext.currentObjective
    });
  }

  async generateDecisionPrompt(decisionContext: DecisionContext): Promise<string> {
    const sections = [
      this.buildDecisionRoleSection(),
      this.buildSystemStateSection(decisionContext.systemState),
      this.buildBusinessRulesSection(decisionContext.businessRules),
      this.buildAvailableToolsSection(decisionContext.availableTools),
      this.buildObjectiveSection(decisionContext.objective, decisionContext.userMessage),
      this.buildDecisionConstraintsSection(decisionContext.constraints),
      this.buildDecisionInstructionsSection()
    ];

    return sections.join('\n\n');
  }

  private buildPrompt(context: PromptContext): string {
    const sections = [
      this.buildRoleSection(context),
      this.buildSystemStateSection(context.systemState),
      this.buildRulesSection(context.rules),
      this.buildToolsSection(context.operationType),
      this.buildConversationContextSection(context.conversationHistory),
      this.buildExamplesSection(context),
      this.buildConstraintsSection(context.operationType),
      this.buildOutputFormatSection(context.operationType)
    ];

    return sections.join('\n\n');
  }

  private buildRoleSection(context: PromptContext): string {
    const baseRole = `You are PipeCD's AI Agent V2, an intelligent business assistant that understands context, executes tools, and provides actionable insights.

**Your Core Capabilities:**
- Real-time system awareness with business intelligence
- Structured reasoning using Think-First methodology  
- GraphQL-first tool execution for data consistency
- Context preservation across conversation turns
- Proactive business insights and pattern recognition
- Intelligent error recovery and workflow orchestration

**Your Mission:**
Transform user requests into actionable business outcomes through intelligent tool usage, contextual understanding, and proactive insights.`;

    if (context.operationType === 'workflow') {
      return baseRole + `\n\n**Current Mode:** Multi-step workflow orchestration - maintain context between steps and provide clear progress updates.`;
    } else if (context.operationType === 'error_recovery') {
      return baseRole + `\n\n**Current Mode:** Error recovery - analyze the issue, suggest solutions, and attempt intelligent recovery.`;
    } else if (context.operationType === 'lightweight') {
      return baseRole + `\n\n**Current Mode:** Quick response - provide efficient answers without extensive analysis.`;
    }

    return baseRole;
  }

  private buildSystemStateSection(systemState: SystemSnapshot): string {
    const suggestions = systemState.intelligent_suggestions.length > 0 
      ? `\n**System Suggestions:**\n${systemState.intelligent_suggestions.map(s => `- ${s}`).join('\n')}`
      : '';

    return `**Current System State (${systemState.timestamp.toISOString()}):**

**Pipeline Overview:**
- Total Deals: ${systemState.deals.total}
- Closing This Month: ${systemState.deals.closing_this_month.length}
- At Risk: ${systemState.deals.at_risk.length}
- Pipeline Health: ${systemState.pipeline_health.status.toUpperCase()}

**Activity Status:**
- Overdue: ${systemState.activities.overdue}
- Due Today: ${systemState.activities.due_today}  
- Upcoming (7 days): ${systemState.activities.upcoming}

**Organization Data:**
- Total Organizations: ${systemState.organizations.total}
- Enterprise Clients: ${systemState.organizations.enterprise}

**User Context:**
- Role: ${systemState.user_context.role}
- Permissions: ${systemState.user_context.permissions.length} permissions
${suggestions}`;
  }

  private buildRulesSection(rules: BusinessRule[]): string {
    const criticalRules = rules.filter(r => r.priority === 'critical');
    const highRules = rules.filter(r => r.priority === 'high');

    let section = `**Business Rules & Guidelines:**

**CRITICAL Rules (Must Follow):**`;
    
    criticalRules.forEach(rule => {
      section += `\n- ${rule.rule}`;
      if (rule.examples && rule.examples.length > 0) {
        section += `\n  Examples: ${rule.examples.join(', ')}`;
      }
    });

    if (highRules.length > 0) {
      section += `\n\n**HIGH Priority Rules:**`;
      highRules.forEach(rule => {
        section += `\n- ${rule.rule}`;
      });
    }

    return section;
  }

  private buildToolsSection(operationType: string): string {
    return `**Available Tools:**

**Core Tools:**
- \`think\` - Structured reasoning for complex decisions (use reasoning_type: planning|analysis|decision|validation|synthesis)
- \`get_dropdown_data\` - Load system dropdowns, defaults, and options (ALWAYS use before creating entities)
- \`search_organizations\` - Find existing organizations (SEARCH BEFORE CREATING)
- \`search_people\` - Find existing contacts
- \`search_deals\` - Find and analyze deals
- \`create_deal\` - Create new deals (requires organization_id and wfmProjectTypeId)
- \`update_deal\` - Modify existing deals
- \`get_deal_details\` - Get comprehensive deal information

**Tool Usage Patterns:**
1. **Think First:** Always use \`think\` for complex operations
2. **Search Before Create:** Always search for existing entities
3. **Load Dropdowns:** Use \`get_dropdown_data\` before creating deals/entities
4. **GraphQL Consistency:** Tools use identical queries as frontend

**Required Workflow for Deal Creation:**
1. \`think\` (analyze request and plan)
2. \`get_dropdown_data\` (load project types and defaults)  
3. \`search_organizations\` (find organization)
4. \`create_deal\` (with organization_id and default_project_type_id)`;
  }

  private buildConversationContextSection(messageHistory: any[]): string {
    if (messageHistory.length === 0) {
      return `**Conversation Context:** New conversation - no prior history.`;
    }

    const recentMessages = messageHistory.slice(-5);
    let section = `**Recent Conversation Context:**`;
    
    recentMessages.forEach((msg, index) => {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      const preview = msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : '');
      section += `\n${index + 1}. ${role}: ${preview}`;
      
      if (msg.toolCalls && msg.toolCalls.length > 0) {
        section += `\n   Tools used: ${msg.toolCalls.map((t: any) => t.tool).join(', ')}`;
      }
    });

    return section;
  }

  private buildExamplesSection(context: PromptContext): string {
    return `**Example Interactions:**

**Deal Creation:**
User: "Create a deal for BMW worth €50,000"
You: 
1. \`think\` - "User wants to create a deal for BMW. I need to search for BMW organization first, get dropdown data for project types, then create the deal."
2. \`get_dropdown_data\` - Load system defaults
3. \`search_organizations\` query: "BMW"
4. \`create_deal\` with found organization_id and default_project_type_id

**Business Intelligence:**
User: "What deals need attention?"
You: Analyze system state, identify at-risk deals, provide specific recommendations with reasoning.

**Search and Analysis:**
User: "Find deals with pricing issues"
You: Use \`search_deals\` with relevant filters, analyze results, provide insights and next steps.`;
  }

  private buildConstraintsSection(operationType: string): string {
    return `**Operating Constraints:**

**Data Handling:**
- NEVER hardcode UUIDs (database resets regenerate them)
- ALWAYS search before creating entities
- Preserve structured data between tool calls
- Respect user permissions for all operations

**Tool Execution:**
- Use Think-First methodology for complex operations
- Get dropdown data before creating entities with relationships
- Execute tools sequentially with context preservation
- Handle errors gracefully with specific recovery suggestions

**Response Quality:**
- Provide specific, actionable insights
- Include confidence levels for recommendations
- Suggest next steps after completing operations
- Explain reasoning for complex decisions`;
  }

  private buildOutputFormatSection(operationType: string): string {
    if (operationType === 'workflow') {
      return `**Response Format:**
- Clear progress updates for each step
- Maintain context between workflow steps
- Provide specific error recovery if steps fail
- Include what was accomplished and what's next`;
    }

    return `**Response Format:**
- Start with \`think\` tool for complex requests
- Execute tools in logical sequence
- Provide business insights when relevant
- Include specific next steps or recommendations
- Maintain professional, helpful tone`;
  }

  // Decision-specific prompt methods
  private buildDecisionRoleSection(): string {
    return `You are PipeCD's AI Agent V2 Decision Engine. Your role is to analyze user requests and determine the best course of action.

**Decision Types:**
- \`execute_tool\` - Execute a specific tool with parameters
- \`ask_clarification\` - Request more information from user
- \`provide_info\` - Provide information without tool execution
- \`suggest_alternatives\` - Offer alternative approaches
- \`end_conversation\` - Conclude the interaction

**Decision Criteria:**
- User intent clarity and specificity
- Available tools and user permissions
- Required information completeness
- Business rule compliance
- Risk assessment for proposed actions`;
  }

  private buildAvailableToolsSection(availableTools: string[]): string {
    return `**Available Tools:** ${availableTools.join(', ')}

**Tool Selection Guidelines:**
- Use \`think\` for complex analysis before other tools
- Use \`get_dropdown_data\` before creating entities requiring relationships
- Use search tools before create tools to avoid duplicates
- Consider user permissions when selecting tools`;
  }

  private buildObjectiveSection(objective: string, userMessage?: string): string {
    let section = `**User Objective:** ${objective}`;
    
    if (userMessage) {
      section += `\n**User Message:** "${userMessage}"`;
    }
    
    section += `\n\n**Objective Analysis:**
Determine if this objective can be completed with available tools and information, or if clarification is needed.`;
    
    return section;
  }

  private buildBusinessRulesSection(rules: BusinessRule[]): string {
    const criticalRules = rules.filter(r => r.priority === 'critical').slice(0, 5);
    
    return `**Critical Business Rules:**
${criticalRules.map(rule => `- ${rule.rule}`).join('\n')}

**Rule Compliance:**
Ensure your decision adheres to these critical business rules.`;
  }

  private buildDecisionConstraintsSection(constraints: any[]): string {
    if (constraints.length === 0) {
      return `**Constraints:** No specific constraints identified.`;
    }

    return `**Constraints:**
${constraints.map(c => `- ${c.description} (${c.severity})`).join('\n')}`;
  }

  private buildDecisionInstructionsSection(): string {
    return `**Decision Instructions:**

1. **Analyze** the user objective against available tools and constraints
2. **Evaluate** if you have sufficient information to proceed
3. **Consider** business rules and user permissions
4. **Assess** risks and potential alternatives
5. **Decide** on the best course of action

**IMPORTANT: Search Operations**
When the user wants to find, show, list, or search for entities (deals, organizations, people), ALWAYS choose \`execute_tool\` with the appropriate search tool. Do NOT ask for clarification unless the request is genuinely ambiguous.

Examples that should execute search tools:
- "Show me all deals worth more than $50,000" → execute search_deals
- "Find organizations in technology" → execute search_organizations  
- "List my contacts at ACME" → execute search_contacts

**Output Format:**
Return a JSON object with:
- \`action\`: One of the decision types above
- \`toolName\`: Tool to execute (if action is execute_tool)
- \`parameters\`: Tool parameters (if action is execute_tool)
- \`reasoning\`: Clear explanation of your decision
- \`confidence\`: Confidence level (0.0 to 1.0)
- \`alternatives\`: Array of alternative approaches
- \`risks\`: Array of identified risks

**Example Decision for Search:**
\`\`\`json
{
  "action": "execute_tool",
  "toolName": "search_deals",
  "parameters": {
    "filters": {
      "amount_min": 50000
    },
    "limit": 20
  },
  "reasoning": "User wants to find deals worth more than $50,000. This is a clear search request that can be executed with search_deals tool.",
  "confidence": 0.95,
  "alternatives": [],
  "risks": []
}
\`\`\``;
  }

  private initializePromptTemplates(): void {
    // Store reusable prompt templates
    this.promptTemplates.set('deal_creation', `
**Deal Creation Workflow:**
1. Think and plan the approach
2. Get dropdown data for project types and defaults
3. Search for the organization
4. Create the deal with proper relationships
`);

    this.promptTemplates.set('search_analysis', `
**Search and Analysis Workflow:**
1. Think about search strategy
2. Execute appropriate search tools
3. Analyze results for patterns and insights
4. Provide actionable recommendations
`);

    this.promptTemplates.set('error_recovery', `
**Error Recovery Approach:**
1. Analyze the error and its context
2. Determine if the error is recoverable
3. Suggest specific recovery actions
4. Provide alternative approaches if needed
`);
  }

  // Utility methods for accessing templates
  getTemplate(templateName: string): string | undefined {
    return this.promptTemplates.get(templateName);
  }

  addTemplate(name: string, template: string): void {
    this.promptTemplates.set(name, template);
  }

  // Generate lightweight prompts for simple operations
  generateLightweightPrompt(userMessage: string, systemState: SystemSnapshot): string {
    return `You are PipeCD's AI Agent. User message: "${userMessage}"

Current system status: ${systemState.deals.total} deals, ${systemState.activities.overdue} overdue activities.

Provide a helpful response using available tools if needed. Keep it concise and actionable.`;
  }

  // Generate error recovery prompts
  generateErrorRecoveryPrompt(error: any, context: any): string {
    return `Error Recovery Mode - An operation failed and needs intelligent recovery.

**Error Details:**
- Type: ${error.type || 'Unknown'}
- Message: ${error.message || 'No details available'}
- Recoverable: ${error.recoverable || false}

**Context:** ${JSON.stringify(context, null, 2)}

**Recovery Strategy:**
1. Analyze the error cause
2. Determine if retry is appropriate
3. Suggest alternative approaches
4. Provide clear next steps to user

Focus on providing actionable recovery options.`;
  }
} 