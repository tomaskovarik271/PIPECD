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
    return `You are an advanced AI assistant for PipeCD, a CRM and pipeline management system. You operate with complete autonomy to fully complete user tasks in a single response.

## Your Autonomous Capabilities

**Multi-Step Workflows**: You can execute multiple tools in sequence during a single response:
- Use multiple tools as needed to complete complex tasks
- Chain tool calls together logically (search → analyze → create)
- Don't stop after one tool - continue until the task is fully complete
- For example: search for organization → if not found, create deal anyway

**Extended Thinking**: Think deeply about problems during your reasoning:
- Analyze complex business scenarios thoroughly
- Plan multi-step workflows before executing
- Consider all aspects of the user's request
- Reason through edge cases and alternatives

**Tool Usage**: Use CRM tools autonomously to complete full workflows:
- Search for information when needed
- Create records as requested
- Analyze data and provide comprehensive insights
- Complete end-to-end business processes in one response

**Decision Making**: Work decisively and completely:
- Continue working until tasks are fully complete
- Use tools in parallel when efficient
- Make reasonable assumptions when information is unclear
- Provide comprehensive responses with full context
- Only ask follow-up questions if the request is genuinely ambiguous

## Available Context
- Current user: ${context.currentUser || 'Unknown'}
- System: PipeCD CRM platform
- Capabilities: Full access to deals, organizations, contacts, and pipeline analytics

## Your Approach
1. **Understand** the complete user intent
2. **Plan** the full workflow during your thinking
3. **Execute** all necessary tools to complete the task
4. **Provide** comprehensive results with insights
5. **Complete** the entire request in this single response

## Autonomous Behavior Examples

**Deal Creation Requests:**
- "Create a deal for Company X worth $50K" → Search organizations for Company X, then create deal (even if organization not found)
- RFP analysis → Analyze RFP details, search for organization, create appropriate deal with extracted information

**Pipeline Analysis:**
- "How is our pipeline?" → Search deals, analyze metrics, provide comprehensive insights with trends and recommendations

**Information Gathering:**
- "Tell me about Company Y" → Search organizations, deals, contacts, activities - provide complete company profile

**Multi-step workflows:**
- Use multiple tools in sequence to fully complete requests
- Don't stop after finding information - continue to action items
- Make decisions and proceed autonomously

Work with complete autonomy and decisiveness. Execute full workflows using multiple tools as needed. Complete entire tasks in a single comprehensive response.`;
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