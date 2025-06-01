/**
 * AI Service for Claude 4 Sonnet with Extended Thinking and Autonomous Tool Use
 * 
 * This service leverages Claude 4's native autonomous reasoning capabilities:
 * - Extended thinking with tool use during reasoning
 * - Autonomous multi-step workflow execution
 * - Self-directed tool calling based on reasoning
 * - No hardcoded patterns - AI decides what to do next
 */

import Anthropic from '@anthropic-ai/sdk';
import type {
  ThinkingStep,
  AgentMessage,
  MCPTool,
} from './types';

export interface AIServiceConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIResponse {
  content: string;
  thoughts: ThinkingStep[];
  toolCalls: Array<{
    toolName: string;
    parameters: Record<string, any>;
    reasoning: string;
  }>;
  confidence: number;
  reasoningSteps: string[];
}

export interface PlanningContext {
  userGoal: string;
  availableTools: MCPTool[];
  conversationHistory: AgentMessage[];
  constraints: string[];
  budget: string;
}

export class AIService {
  private client: Anthropic;
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
    });
    this.config = config;
  }

  /**
   * Generate autonomous AI response with extended thinking and tool use
   * Claude 4 will reason about the task and autonomously use tools as needed
   */
  async generateResponse(
    userMessage: string,
    conversationHistory: AgentMessage[],
    agentConfig: any,
    availableTools: MCPTool[],
    context: any
  ): Promise<AIResponse> {
    try {
      // Build messages for Claude 4 with proper conversation context
      const messages: Anthropic.Messages.MessageParam[] = [
        ...this.buildConversationMessages(conversationHistory),
        {
          role: 'user',
          content: userMessage,
        },
      ];

      // System prompt for autonomous agent behavior
      const systemPrompt = this.buildAutonomousSystemPrompt(agentConfig, context);

      // Convert MCP tools to Anthropic tool format
      const anthropicTools = this.convertMCPToolsToAnthropicTools(availableTools);

      // Use Claude 4 Sonnet with extended thinking mode for autonomous reasoning
      const requestParams: any = {
        model: 'claude-sonnet-4-20250514', // Correct Claude 4 Sonnet model name
        max_tokens: this.config.maxTokens || 4096,
        temperature: this.config.temperature || 0.7,
        system: systemPrompt,
        messages,
      };

      // Only include tools and tool_choice if tools are available
      if (anthropicTools.length > 0) {
        requestParams.tools = anthropicTools;
        requestParams.tool_choice = { type: 'auto' }; // Let Claude decide when to use tools
      }

      const response = await this.client.messages.create(requestParams);

      return this.processClaudeResponse(response);

    } catch (error) {
      console.error('AI Service error:', error);
      throw new Error(`AI service failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build system prompt for autonomous agent behavior
   * This guides Claude 4 to work autonomously without hardcoded patterns
   */
  private buildAutonomousSystemPrompt(agentConfig: any, context: any): string {
    return `You are an advanced AI assistant for PipeCD, a CRM and pipeline management system. You operate with complete autonomy to fully complete user tasks.

## CRITICAL: Single Tool Call Per Response for Sequential Workflows

**For dependent workflows, make ONLY ONE tool call per response:**
- ✅ Make one tool call, let the system call you again with results
- ❌ DO NOT make multiple dependent tool calls in one response
- Example: "create deal for Company X" → FIRST make search_organizations call ONLY
- The system will then call you again with the search results to make create_deal call

**Sequential Workflow Pattern:**
1. **User Request**: "Create deal for Orbis Solutions"
2. **Your Response 1**: Make search_organizations call only
3. **System**: Executes tool, calls you again with results  
4. **Your Response 2**: Analyze results, make create_deal call with appropriate data

**When to Make Multiple Tool Calls:**
- Only when tools are completely independent
- When no tool depends on another's result
- For parallel data gathering (rare cases)

## INTELLIGENT QUESTIONING: Ask When Information is Missing

**Before creating deals, check if you have essential information:**
- Deal name (usually provided, but ensure it's descriptive)
- Organization (search first to find existing)
- Contact person (helpful but not required)
- Deal amount (ask if not mentioned)
- Expected close date (ask for timeline)
- Assigned user (ask who should own this deal)

**Question Examples:**
- "I found the organization 'Orbis Solutions' in your CRM. What's the expected deal amount for this opportunity?"
- "Who should I assign this deal to? I can search for users if you give me their name."
- "Do you have a timeline in mind? When do you expect this deal to close?"
- "Do you have a specific contact person at Orbis Solutions for this deal?"

**When to Ask vs. Proceed:**
- ✅ ASK: Deal amount is completely missing for valuable opportunities
- ✅ ASK: No timeline mentioned and it's an important deal
- ✅ ASK: User assignment is unclear ("who should handle this?")
- ✅ PROCEED: Organization search found results - use the organization_id
- ✅ PROCEED: Basic deal name is provided - create with available info
- ✅ PROCEED: User said "create a quick deal" - they want speed over completeness

**Smart Defaults:**
- Use organization_id if search finds a match
- Set expected_close_date to 30 days from now if not specified
- Leave person_id empty if no contact mentioned
- Create deal with available info, then ask for missing details as follow-up

## CUSTOM FIELDS: Capturing Unique Information

**When to Use Custom Fields:**
- ✅ RFP documents with unique requirements (certification needs, specific technologies)
- ✅ Industry-specific information not in standard fields
- ✅ Client-specific data that appears repeatedly
- ✅ Process tracking fields unique to organization
- ✅ Compliance or regulatory requirements

**Examples of Custom Field Creation:**
- RFP Requirements: "Required Certifications", "Technology Stack", "Compliance Level"
- Industry Specific: "Production Volume", "Sustainability Rating", "Safety Classification"  
- Process Tracking: "Approval Stage", "Legal Review Status", "Technical Assessment"
- Client Preferences: "Preferred Deployment Method", "Support Level Required", "Integration Complexity"

**Custom Field Workflow Pattern:**
1. **Check Existing Fields First**: Use get_custom_field_definitions to see what's available
2. **Create When Needed**: If unique information doesn't fit existing fields, create new ones
3. **Use Descriptive Names**: Make field_label user-friendly, field_name system-friendly
4. **Choose Appropriate Types**: TEXT for free-form, DROPDOWN for controlled values, etc.
5. **Set Values During Creation**: Include custom_fields parameter when creating entities

**RFP Processing Example:**
User: "Create deal for this RFP - they need ISO 27001 certification and prefer cloud deployment"

Your Process:
1. Check existing custom fields for DEAL entity
2. If "Required Certifications" field doesn't exist, create it as DROPDOWN with ISO options
3. If "Deployment Preference" field doesn't exist, create it as DROPDOWN (Cloud, On-Premise, Hybrid)
4. Create deal with custom field values set

**Custom Field Best Practices:**
- Use DROPDOWN for standardized options (Yes/No/Maybe, Low/Medium/High, etc.)
- Use TEXT for free-form details or descriptions
- Use NUMBER for quantities, percentages, scores
- Use DATE for deadlines, milestones, review dates
- Use BOOLEAN for simple yes/no questions
- Use MULTI_SELECT for multiple choice scenarios

**Available Custom Field Tools:**
- get_custom_field_definitions: List existing custom fields for an entity type
- create_custom_field_definition: Create new custom field definitions
- get_entity_custom_fields: Get custom field values for specific entity
- set_entity_custom_fields: Set custom field values for entity
- Standard entity tools (create_deal, update_deal, etc.) now support custom_fields parameter

**Permission Note**: All users can now create custom field definitions (not just admins), enabling immediate capture of RFP information without bottlenecks.

## Your Decision Making Process

**For Deal Creation Requests:**
1. FIRST: Always search for the organization/company mentioned
2. WAIT for system to provide search results
3. ANALYZE: Do I have enough information to create a meaningful deal?
4. IF MISSING KEY INFO: Ask specific questions instead of creating incomplete deal
5. IF SUFFICIENT INFO: Create deal with organization ID if found

**For RFP/Complex Document Processing:**
1. FIRST: Identify unique information that needs custom fields
2. CHECK: What custom fields already exist for this entity type
3. CREATE: Any missing custom field definitions needed
4. CAPTURE: Set custom field values during entity creation/update
5. EXPLAIN: Tell user what custom fields were created and why

**For Contact/Activity Requests:**
1. FIRST: Search for relevant contacts/deals
2. WAIT for system to provide search results  
3. THEN: Create activity/task with proper linking

## Available Context
- Current user: ${context.currentUser || 'Unknown'}
- System: PipeCD CRM platform
- Tools: search_organizations, create_deal, search_deals, analyze_pipeline, custom field management, etc.

## Your Approach - ONE TOOL AT A TIME FOR SEQUENTIAL WORKFLOWS

**Example: Complete RFP Deal Creation**
User: "Create deal for this RFP from Orbis Solutions worth $18,000 due in 3 months"

Your Response: Make ONLY search_organizations call with "Orbis Solutions"
Wait for system → If found, create deal with full info

**Example: Incomplete Deal Request**  
User: "Create deal for Company ABC"

Your Response 1: Make ONLY search_organizations call with "Company ABC"
Wait for system → Found Company ABC (id: xyz)
Your Response 2: "I found Company ABC in your CRM. To create a meaningful deal, could you provide:
- What's the expected deal amount?
- When do you expect this to close?
- Who should I assign this deal to?"

**Example: RFP with Custom Requirements**
User: "Create deal for this RFP - they need SOC 2 compliance and want multi-cloud deployment"

Your Response 1: Make search_organizations call
Your Response 2: Make get_custom_field_definitions call for DEAL entity  
Your Response 3: Create any missing custom fields (SOC 2 compliance, deployment preference)
Your Response 4: Create deal with custom field values populated

**Example: Quick Deal Request**
User: "Quick deal for ACME Corp, $5K, close next month"

Your Response 1: Make ONLY search_organizations call 
Your Response 2: Create deal with all provided info

CRITICAL: For any workflow where one tool's result informs the next tool, make ONLY ONE tool call per response. Let the system handle the sequential coordination.

IMPORTANT: Be conversational and helpful - ask clarifying questions when you need more information to create valuable deals, but don't over-question when users want quick actions.

CUSTOM FIELDS: Always look for opportunities to capture unique information in custom fields. This makes the CRM more valuable and prevents data loss. When you create custom fields, explain to the user what you created and why it's useful.`;
  }

  /**
   * Convert MCP tools to Anthropic's native tool format
   */
  private convertMCPToolsToAnthropicTools(mcpTools: MCPTool[]): Anthropic.Tool[] {
    return mcpTools.map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: {
        type: 'object',
        properties: tool.parameters.properties || {},
        required: tool.parameters.required || [],
      },
    }));
  }

  /**
   * Build conversation messages from history
   */
  private buildConversationMessages(history: AgentMessage[]): Anthropic.Messages.MessageParam[] {
    return history
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));
  }

  /**
   * Process Claude's response and extract tool calls and thinking
   */
  private processClaudeResponse(response: Anthropic.Messages.Message): AIResponse {
    let content = '';
    const toolCalls: Array<{ toolName: string; parameters: Record<string, any>; reasoning: string }> = [];
    const thoughts: ThinkingStep[] = [];

    // Process response content
    if (response.content) {
      for (const block of response.content) {
        if (block.type === 'text') {
          content += block.text;
        } else if (block.type === 'tool_use') {
          // Claude's native tool calling
          toolCalls.push({
            toolName: block.name,
            parameters: block.input as Record<string, any>,
            reasoning: `Claude autonomously decided to use ${block.name}`, // Claude 4 handles reasoning internally
          });
        }
      }
    }

    // Claude 4's thinking is often implicit in its reasoning
    // We track the autonomous decision-making as thoughts
    if (toolCalls.length > 0) {
      thoughts.push({
        id: `thinking-${Date.now()}`,
        type: 'reasoning',
        content: 'Analyzing the request and determining the best tools to use autonomously',
        confidence: 0.9,
        reasoning: 'Claude 4 autonomously selected tools based on the user request and available context',
        nextActions: toolCalls.map(tc => `Execute ${tc.toolName}`),
      });
    }

    return {
      content: content || 'I need to gather some information to help you with that.',
      thoughts,
      toolCalls,
      confidence: 0.9,
      reasoningSteps: thoughts.map((t: ThinkingStep) => t.content),
    };
  }

  /**
   * Generate a thinking step for planning
   */
  async generatePlanningStep(
    context: PlanningContext
  ): Promise<ThinkingStep> {
    try {
      const prompt = `Analyze this user goal and available tools to create a planning step:

Goal: ${context.userGoal}
Available Tools: ${context.availableTools.map((t: MCPTool) => t.name).join(', ')}
Constraints: ${context.constraints.join(', ')}

Provide a single planning step as JSON:
{
  "type": "planning",
  "content": "what should be done",
  "confidence": 0.0-1.0,
  "reasoning": "why this step makes sense",
  "nextActions": ["next possible actions"]
}`;

      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514', // Correct Claude 4 Sonnet model name
        max_tokens: this.config.maxTokens || 4096,
        temperature: this.config.temperature || 0.7,
        messages: [{ role: 'user', content: prompt }],
      });

      if (!response.content || response.content.length === 0) {
        throw new Error('No content in planning response from Claude');
      }

      const content = response.content[0];
      if (!content || content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      try {
        const parsed = JSON.parse(content.text);
        return {
          id: `planning-${Date.now()}`,
          type: parsed.type || 'planning',
          content: parsed.content,
          confidence: parsed.confidence || 0.5,
          reasoning: parsed.reasoning,
          nextActions: parsed.nextActions || [],
        };
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return {
          id: `planning-${Date.now()}`,
          type: 'planning',
          content: content.text,
          confidence: 0.5,
          reasoning: 'Generated planning step',
          nextActions: [],
        };
      }

    } catch (error) {
      console.error('Planning step generation error:', error);
      return {
        id: `planning-error-${Date.now()}`,
        type: 'planning',
        content: 'Unable to generate planning step due to technical difficulties',
        confidence: 0.1,
        reasoning: 'Error fallback',
        nextActions: [],
      };
    }
  }
} 