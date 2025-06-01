/**
 * AI Service - Claude Integration for PipeCD Agent
 * Handles communication with Anthropic's Claude API for intelligent responses
 */

import Anthropic from '@anthropic-ai/sdk';
import type { AgentMessage, AgentConfig, PlanningContext, ThinkingStep, MCPTool } from './types';

export interface AIServiceConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIResponse {
  content: string;
  thoughts: ThinkingStep[];
  toolCalls?: Array<{
    toolName: string;
    parameters: Record<string, any>;
    reasoning: string;
  }>;
  needsClarification?: string[];
  confidence: number;
}

export class AIService {
  private anthropic: Anthropic;
  private config: Required<AIServiceConfig>;

  constructor(config: AIServiceConfig) {
    this.anthropic = new Anthropic({
      apiKey: config.apiKey,
    });
    
    this.config = {
      apiKey: config.apiKey,
      model: config.model || 'claude-sonnet-4-20250514',
      maxTokens: config.maxTokens || 4096,
      temperature: config.temperature || 0.7,
    };
  }

  /**
   * Generate an intelligent response to a user message
   */
  async generateResponse(
    userMessage: string,
    conversationHistory: AgentMessage[],
    agentConfig: AgentConfig,
    availableTools: MCPTool[] = [],
    context: Record<string, any> = {}
  ): Promise<AIResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt(agentConfig, availableTools, context);
      const messages = this.buildConversationMessages(conversationHistory, userMessage);
      const tools = this.convertMCPToolsToAnthropicTools(availableTools);

      const response = await this.anthropic.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        system: systemPrompt,
        messages,
        tools: tools.length > 0 ? tools : undefined,
      });

      if (!response.content || response.content.length === 0) {
        throw new Error('No content in response from Claude');
      }

      return this.parseAnthropicResponse(response);

    } catch (error) {
      console.error('AI service error:', error);
      throw new Error(`AI service failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert MCP tools to Anthropic tool format
   */
  private convertMCPToolsToAnthropicTools(mcpTools: MCPTool[]): Anthropic.Tool[] {
    return mcpTools.map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: {
        type: 'object',
        properties: tool.parameters?.properties || {},
        required: tool.parameters?.required || [],
      },
    }));
  }

  /**
   * Parse Anthropic's native response format
   */
  private parseAnthropicResponse(response: Anthropic.Message): AIResponse {
    const thoughts: ThinkingStep[] = [];
    const toolCalls: Array<{
      toolName: string;
      parameters: Record<string, any>;
      reasoning: string;
    }> = [];
    let content = '';

    // Process each content block
    for (const block of response.content) {
      if (block.type === 'text') {
        content += block.text;
        
        // Extract thinking from text if present
        const thinkingMatch = block.text.match(/\*\*Thinking:\*\*(.*?)(?=\*\*|$)/s);
        if (thinkingMatch && thinkingMatch[1]) {
          thoughts.push({
            id: `thinking-${Date.now()}`,
            type: 'reasoning',
            content: thinkingMatch[1].trim(),
            confidence: 0.8,
            reasoning: 'AI reasoning process',
          });
        }
      } else if (block.type === 'tool_use') {
        toolCalls.push({
          toolName: block.name,
          parameters: block.input as Record<string, any>,
          reasoning: `Using ${block.name} tool`,
        });
      }
    }

    // Clean up content (remove thinking sections if they were extracted)
    content = content.replace(/\*\*Thinking:\*\*.*?(?=\*\*|$)/gs, '').trim();

    return {
      content: content || 'I can help you with that.',
      thoughts,
      toolCalls,
      needsClarification: [],
      confidence: 0.8,
    };
  }

  /**
   * Build system prompt based on agent configuration and context
   */
  private buildSystemPrompt(
    agentConfig: AgentConfig,
    availableTools: MCPTool[],
    context: Record<string, any>
  ): string {
    return `You are an autonomous AI assistant for PipeCD, a CRM and pipeline management system. You help users manage deals, contacts, activities, and workflows by completing tasks autonomously.

## Your Capabilities:
- Analyze user requests and provide helpful responses
- Help with deal management, contact organization, and activity tracking  
- Plan and execute multi-step workflows using available tools
- Provide insights and recommendations
- Complete tasks autonomously when you have sufficient information

## Available Tools:
${availableTools.map(tool => `- ${tool.name}: ${tool.description}`).join('\n') || 'No tools currently available'}

## Autonomous Behavior Guidelines:
1. **Complete tasks when possible**: If you can fulfill the user's request with available information, do it autonomously
2. **Chain tool calls**: Use multiple tools in sequence to complete complex tasks (e.g., search for organizations, then create deals)
3. **Make reasonable assumptions**: When minor details are missing, use sensible defaults rather than asking for every detail
4. **Inform users of actions**: Clearly communicate what you're doing and the results
5. **Ask only for essential missing information**: Only request clarification for critical missing data

## Multi-step Task Execution:
When a user requests a task that requires multiple steps:
1. **Analyze**: Determine all required steps
2. **Execute**: Use tools to gather information and complete actions
3. **Continue**: Don't stop after the first tool call - complete the full workflow
4. **Report**: Summarize what was accomplished

## Example Workflows:
- **Creating deals with organizations**: Search organizations → Select best match → Create deal with found organization_id
- **Finding and analyzing data**: Search deals → Get details → Provide analysis
- **Setting up relationships**: Search contacts → Search organizations → Link them appropriately

## Configuration:
- Thinking Budget: ${agentConfig.thinkingBudget}
- Max Thinking Steps: ${agentConfig.maxThinkingSteps}
- Extended Thinking: ${agentConfig.enableExtendedThinking ? 'Enabled' : 'Disabled'}
- Auto Execute: ${agentConfig.autoExecute ? 'Enabled' : 'Disabled'}

## Context:
${JSON.stringify(context, null, 2)}

Be proactive, autonomous, and helpful. Complete tasks efficiently rather than requiring multiple back-and-forth interactions for simple requests.`;
  }

  /**
   * Build conversation messages for Claude API
   */
  private buildConversationMessages(
    history: AgentMessage[],
    currentMessage: string
  ): Anthropic.MessageParam[] {
    const messages: Anthropic.MessageParam[] = [];

    // Add conversation history (excluding system messages)
    history
      .filter(msg => msg.role !== 'system')
      .forEach(msg => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        });
      });

    // Add current user message
    messages.push({
      role: 'user',
      content: currentMessage,
    });

    return messages;
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
Available Tools: ${context.availableTools.map(t => t.name).join(', ')}
Constraints: ${context.constraints.join(', ')}

Provide a single planning step as JSON:
{
  "type": "planning",
  "content": "what should be done",
  "confidence": 0.0-1.0,
  "reasoning": "why this step makes sense",
  "nextActions": ["next possible actions"]
}`;

      const response = await this.anthropic.messages.create({
        model: this.config.model,
        max_tokens: 1024,
        temperature: 0.3,
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