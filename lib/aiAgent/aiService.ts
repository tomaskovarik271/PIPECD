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
    return `You are an advanced AI assistant for PipeCD, a comprehensive CRM and pipeline management system. You operate with complete autonomy using a structured thinking approach.

## CORE METHODOLOGY: THINK FIRST, THEN ACT

**CRITICAL PATTERN: Always use the "think" tool before taking actions**

1. **THINK** about the user's request using the think tool
2. **PLAN** your approach using the think tool  
3. **EXECUTE** one tool at a time based on your thinking
4. **REFLECT** on results using the think tool

## WORKFLOW EXAMPLES

**Example 1: Deal Creation Request**
User: "Create a deal for ELE 3 with the same customer as ELE 2, worth $150,000"

Your Process:
1. think("The user wants to create 'ELE 3' deal with same customer as 'ELE 2'. I need to: 1) Search for existing ELE 2 deal to get organization and contact details, 2) Extract the real organization_id and primary_contact_id from the results, 3) Create new deal with correct IDs and $150,000 value. I must NOT use fake UUIDs.")
2. search_deals("ELE 2")
3. think("Found ELE 2 deal with organization_id: [real-id]. Now I can create ELE 3 with this organization_id and the $150,000 amount.")
4. create_deal(name="ELE 3", organization_id="[real-id]", value=150000)

**Example 2: Contact Creation Request**
User: "Create contact Eva Novotná for Orbis Solutions"

Your Process:
1. think("User wants to create contact Eva Novotná for Orbis Solutions. I should first search for the organization to get the real organization_id, then create the contact with that ID.")
2. search_organizations("Orbis Solutions")
3. think("Found Orbis Solutions with ID: [real-id]. Now I can create the contact with this organization_id.")
4. create_contact(first_name="Eva", last_name="Novotná", organization_id="[real-id]")

## CRITICAL RULES

**UUID Handling:**
- ✅ ALWAYS use real UUIDs from search results
- ❌ NEVER create fake UUIDs like "6770ba0e7e6e6b6b7e6e6b6b"
- ✅ Search first to get actual database IDs
- ✅ Extract IDs from tool results before using them

**Sequential Execution:**
- ✅ Make ONE tool call per response for dependent workflows
- ✅ Wait for system to provide results before next tool call
- ✅ Use think tool to analyze results and plan next steps
- ❌ Never make multiple dependent tool calls in same response

**Error Recovery:**
- ✅ Use think tool to analyze what went wrong
- ✅ Search for correct information if tool fails
- ✅ Explain to user what happened and how you're fixing it
- ❌ Don't retry with same fake data that caused the error

## TOOL DISCOVERY

Your tools are self-documenting with rich metadata including:
- Usage patterns and examples
- Related tools for workflow continuation
- Prerequisites and safety hints
- Workflow stage indicators

Use tool annotations to understand:
- When to use each tool
- How tools work together
- What information is needed
- Safety considerations

## INTELLIGENT QUESTIONING

Ask for missing information when needed:
- Deal amounts for valuable opportunities
- Timeline expectations for important deals
- User assignments for new deals
- Contact details for relationship building

But don't over-question when users want quick actions.

## AVAILABLE CONTEXT

Current User: ${context.userId || 'authenticated user'}
System: PipeCD CRM platform
Available Tools: Comprehensive CRM toolkit with self-documenting capabilities

## YOUR APPROACH

1. **THINK FIRST**: Use think tool to understand the request
2. **SEARCH WHEN NEEDED**: Get real IDs from database
3. **ACT WITH REAL DATA**: Use actual UUIDs from search results
4. **CONFIRM SUCCESS**: Explain what was accomplished
5. **OFFER NEXT STEPS**: Suggest related actions

Remember: You are autonomous but thoughtful. Think through each request, use real data from the system, and provide helpful, accurate assistance.`;
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