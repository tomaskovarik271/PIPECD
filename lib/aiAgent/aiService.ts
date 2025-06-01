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
  metadata?: {
    model: string;
    tokensUsed: number;
    responseTime: number;
  };
}

export class AIService {
  private anthropic: Anthropic;
  private config: Required<AIServiceConfig>;

  constructor(config: AIServiceConfig) {
    this.config = {
      model: 'claude-3-5-sonnet-20241022', // Using the actual available model
      maxTokens: 4096,
      temperature: 0.7,
      ...config,
    };

    this.anthropic = new Anthropic({
      apiKey: config.apiKey,
    });
  }

  /**
   * Generate an intelligent response to a user message
   */
  async generateResponse(
    userMessage: string,
    conversationHistory: AgentMessage[] = [],
    agentConfig: AgentConfig,
    availableTools: MCPTool[] = [],
    context: any = {}
  ): Promise<AIResponse> {
    try {
      // Convert conversation history to Anthropic format
      const messages = this.formatMessagesForAnthropic(conversationHistory, userMessage);

      // Convert tools to Anthropic format
      const tools = this.formatToolsForAnthropic(availableTools);

      // Build system prompt for PipeCD AI Agent
      const systemPrompt = this.buildSystemPrompt(agentConfig, availableTools);

      // Call Claude with native tool support
      const response = await this.anthropic.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        system: systemPrompt,
        messages,
        tools: tools.length > 0 ? tools : undefined,
      });

      // Extract response content and tool calls
      let content = '';
      const toolCalls: Array<{
        toolName: string;
        parameters: Record<string, any>;
        reasoning: string;
      }> = [];
      const thoughts: ThinkingStep[] = [];

      for (const contentBlock of response.content) {
        if (contentBlock.type === 'text') {
          content += contentBlock.text;
        } else if (contentBlock.type === 'tool_use') {
          toolCalls.push({
            toolName: contentBlock.name,
            parameters: contentBlock.input || {},
            reasoning: `Claude decided to use ${contentBlock.name} tool`,
          });
        }
      }

      // Add a thinking step about the response
      thoughts.push({
        id: `thinking-${Date.now()}`,
        type: 'reasoning',
        content: `Generated response with ${toolCalls.length} tool calls`,
        confidence: 0.9,
        reasoning: 'Processed user request and determined appropriate response strategy',
        nextActions: toolCalls.length > 0 ? [`Execute ${toolCalls.length} tools`] : ['Provide final response'],
      });

      return {
        content: content.trim(),
        thoughts,
        toolCalls,
        confidence: 0.85,
        metadata: {
          model: this.config.model,
          tokensUsed: response.usage?.output_tokens || 0,
          responseTime: Date.now(),
        },
      };
    } catch (error) {
      console.error('AI service error:', error);
      throw new Error(`Failed to generate AI response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private formatMessagesForAnthropic(
    conversationHistory: AgentMessage[],
    currentUserMessage: string
  ): Anthropic.MessageParam[] {
    const messages: Anthropic.MessageParam[] = [];

    // Add conversation history
    for (const message of conversationHistory) {
      if (message.role === 'user' || message.role === 'assistant') {
        messages.push({
          role: message.role,
          content: message.content,
        });
      }
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: currentUserMessage,
    });

    return messages;
  }

  private formatToolsForAnthropic(availableTools: MCPTool[]): Anthropic.Tool[] {
    return availableTools.map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: {
        type: 'object',
        properties: tool.parameters?.properties || {},
        required: tool.parameters?.required || [],
        ...tool.parameters,
      },
    }));
  }

  /**
   * Build system prompt based on agent configuration and context
   */
  private buildSystemPrompt(agentConfig: AgentConfig, availableTools: MCPTool[]): string {
    const toolsDescription = availableTools.length > 0 
      ? `\n\nYou have access to the following tools for CRM operations:\n${availableTools.map(tool => 
          `- ${tool.name}: ${tool.description}`
        ).join('\n')}`
      : '';

    return `You are an intelligent AI assistant for PipeCD, a comprehensive CRM and pipeline management system. You specialize in helping users manage deals, contacts, organizations, and sales activities.

Your capabilities include:
- 🔍 **Search and Analysis**: Find deals, contacts, and organizations with detailed filtering
- 📊 **Pipeline Analysis**: Analyze sales performance, trends, and metrics  
- 💼 **Deal Management**: Create and manage deals throughout the sales process
- 🏢 **Organization Management**: Track companies and their relationships
- 👥 **Contact Management**: Manage people and their business relationships
- 📈 **Activity Tracking**: Monitor tasks, meetings, calls, and other sales activities

## Autonomous Behavior Guidelines:

You are Claude 4 with advanced reasoning capabilities. When users request actions:

1. **Think through the request** - Understand what the user wants to accomplish
2. **Plan your approach** - Determine what tools and steps are needed
3. **Execute systematically** - Use tools in logical sequence
4. **Analyze results** - Evaluate tool outputs and decide if additional actions are needed
5. **Continue autonomously** - If initial results suggest follow-up actions, proceed without asking
6. **Ask clarifying questions** only when genuinely unclear about intent

## Multi-Step Workflow Examples:

**"Create a deal for Orbis Solutions worth $350,000":**
- Search for Orbis Solutions organization
- If not found, create the deal anyway (organizations are optional)
- Use appropriate deal amount and name
- Proceed without confirmation

**"How are we doing this quarter?":**
- Analyze pipeline for current period
- Check recent deal closures
- Review activity trends
- Provide comprehensive assessment

**"Find deals similar to the Tesla project":**
- Search for Tesla-related deals
- Analyze deal characteristics
- Find similar patterns in other deals
- Present comparison

## Tool Usage Philosophy:

- **Be proactive**: Don't ask permission to use relevant tools
- **Chain operations**: Use tool results to inform next actions
- **Scale by complexity**: Simple queries need 1-2 tools, complex analysis needs 5+ tools
- **Provide value**: Always aim to give actionable insights, not just raw data

## Response Style:

- Be conversational but professional
- Lead with insights, support with data
- Explain your reasoning when making recommendations
- Use emojis sparingly for visual organization
- Focus on business outcomes and actionable next steps

${toolsDescription}

Remember: You're an autonomous AI agent. When you see an opportunity to provide more value through additional analysis or actions, take initiative and do it. Users prefer comprehensive, intelligent assistance over back-and-forth questioning.`;
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