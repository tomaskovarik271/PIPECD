import Anthropic from '@anthropic-ai/sdk';
import type {
  DecisionContext,
  DecisionResult,
  DecisionAlternative,
  DecisionRisk
} from '../types/agent.js';

export class AIService {
  private anthropic: Anthropic;
  private defaultModel = 'claude-sonnet-4-20250514';
  private rateLimiter: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({
      apiKey: apiKey
    });
  }

  async makeDecision(prompt: string, context: DecisionContext): Promise<DecisionResult> {
    try {
      // Prepare the request payload
      const requestPayload = {
        model: this.defaultModel,
        max_tokens: 2000,
        temperature: 0.1,
        messages: [
          {
            role: 'user' as const,
            content: prompt
          }
        ]
      };

      // Log the complete request payload in BLUE
      console.log('\x1b[34m%s\x1b[0m', '[CLAUDE API REQUEST] ═══════════════════════════════════════');
      console.log('\x1b[34m%s\x1b[0m', JSON.stringify(requestPayload, null, 2));
      console.log('\x1b[34m%s\x1b[0m', '═══════════════════════════════════════════════════════════');

      const response = await this.anthropic.messages.create(requestPayload);

      // Log the complete response payload in ORANGE
      console.log('\x1b[33m%s\x1b[0m', '[CLAUDE API RESPONSE] ══════════════════════════════════════');
      console.log('\x1b[33m%s\x1b[0m', JSON.stringify(response, null, 2));
      console.log('\x1b[33m%s\x1b[0m', '════════════════════════════════════════════════════════════');

      // Parse the response to extract decision
      const content = response.content[0];
      if (content && content.type === 'text') {
        const decision = this.parseDecisionResponse((content as any).text, context);
        
        console.log('[AIService] Claude decision result:', {
          action: decision.action,
          toolName: decision.toolName,
          confidence: decision.confidence,
          hasParameters: !!decision.parameters && Object.keys(decision.parameters).length > 0,
          reasoningLength: decision.reasoning?.length || 0
        });
        
        return decision;
      }

      throw new Error('Unexpected response format from Claude');
    } catch (error: any) {
      console.error('Error making AI decision:', error);
      return this.createFallbackDecision(context, error);
    }
  }

  async generateResponse(
    prompt: string, 
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): Promise<string> {
    try {
      const model = options.model || this.defaultModel;
      
      // Prepare the request payload
      const requestPayload = {
        model,
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.1,
        messages: [
          {
            role: 'user' as const,
            content: prompt
          }
        ]
      };

      // Log the complete request payload in BLUE
      console.log('\x1b[34m%s\x1b[0m', '[CLAUDE API REQUEST - GENERATE] ══════════════════════════');
      console.log('\x1b[34m%s\x1b[0m', JSON.stringify(requestPayload, null, 2));
      console.log('\x1b[34m%s\x1b[0m', '══════════════════════════════════════════════════════════');

      const response = await this.anthropic.messages.create(requestPayload);

      // Log the complete response payload in ORANGE
      console.log('\x1b[33m%s\x1b[0m', '[CLAUDE API RESPONSE - GENERATE] ═════════════════════════');
      console.log('\x1b[33m%s\x1b[0m', JSON.stringify(response, null, 2));
      console.log('\x1b[33m%s\x1b[0m', '═════════════════════════════════════════════════════════');

      const content = response.content[0];
      if (content && content.type === 'text') {
        const responseText = (content as any).text;
        
        console.log('[AIService] Claude response generated:', {
          responseLength: responseText.length,
          responsePreview: responseText.substring(0, 200) + (responseText.length > 200 ? '...' : '')
        });
        
        return responseText;
      }

      throw new Error('Unexpected response format from Claude');
    } catch (error: any) {
      console.error('Error generating AI response:', error);
      throw new Error(`AI service error: ${error?.message || 'Unknown error'}`);
    }
  }

  async analyzeConversation(
    conversationHistory: any[],
    currentMessage: string,
    systemContext: any
  ): Promise<{
    intent: string;
    entities: any[];
    confidence: number;
    suggestedActions: string[];
  }> {
    const analysisPrompt = this.buildAnalysisPrompt(conversationHistory, currentMessage, systemContext);
    
    try {
      const response = await this.generateResponse(analysisPrompt, { temperature: 0.0 });
      return this.parseAnalysisResponse(response);
    } catch (error) {
      console.error('Error analyzing conversation:', error);
      return {
        intent: 'general_inquiry',
        entities: [],
        confidence: 0.5,
        suggestedActions: ['ask_clarification']
      };
    }
  }

  async generateThinking(
    thought: string,
    reasoningType: 'planning' | 'analysis' | 'decision' | 'validation' | 'synthesis',
    context: any
  ): Promise<{
    structuredThought: string;
    nextActions: string[];
    confidence: number;
    reasoning: string[];
  }> {
    const thinkingPrompt = `You are engaged in structured reasoning. 

**Type:** ${reasoningType}
**Thought:** ${thought}
**Context:** ${JSON.stringify(context, null, 2)}

Provide structured analysis:
1. Break down the thought into key components
2. Identify assumptions and requirements
3. Consider alternatives and risks
4. Recommend next actions
5. Assess confidence level

Respond in JSON format:
{
  "structuredThought": "Clear, structured version of the thought",
  "nextActions": ["specific next steps"],
  "confidence": 0.95,
  "reasoning": ["step by step reasoning"]
}`;

    try {
      const response = await this.generateResponse(thinkingPrompt, { temperature: 0.1 });
      return JSON.parse(this.extractJsonFromResponse(response));
    } catch (error) {
      console.error('Error generating thinking:', error);
      return {
        structuredThought: thought,
        nextActions: ['continue_analysis'],
        confidence: 0.5,
        reasoning: [thought]
      };
    }
  }

  private parseDecisionResponse(response: string, context: DecisionContext): DecisionResult {
    try {
      // Try to extract JSON from response
      const jsonStr = this.extractJsonFromResponse(response);
      const parsed = JSON.parse(jsonStr);

      // Validate required fields
      if (!parsed.action || !parsed.reasoning) {
        throw new Error('Missing required decision fields');
      }

      // Ensure alternatives and risks are arrays
      const alternatives: DecisionAlternative[] = Array.isArray(parsed.alternatives) 
        ? parsed.alternatives.map(this.validateAlternative)
        : [];

      const risks: DecisionRisk[] = Array.isArray(parsed.risks)
        ? parsed.risks.map(this.validateRisk)
        : [];

      return {
        action: this.validateAction(parsed.action),
        toolName: parsed.toolName,
        parameters: parsed.parameters || {},
        reasoning: parsed.reasoning,
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
        alternatives,
        risks
      };
    } catch (error) {
      console.error('Error parsing decision response:', error);
      return this.createFallbackDecision(context, error);
    }
  }

  private extractJsonFromResponse(response: string): string {
    // Look for JSON blocks in markdown
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return jsonMatch[1];
    }

    // Look for JSON objects
    const objectMatch = response.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return objectMatch[0];
    }

    throw new Error('No JSON found in response');
  }

  private validateAction(action: string): DecisionResult['action'] {
    const validActions = ['execute_tool', 'ask_clarification', 'provide_info', 'suggest_alternatives', 'end_conversation'];
    if (validActions.includes(action)) {
      return action as DecisionResult['action'];
    }
    return 'ask_clarification';
  }

  private validateAlternative(alt: any): DecisionAlternative {
    return {
      action: alt.action || 'unknown',
      reasoning: alt.reasoning || 'No reasoning provided',
      confidence: Math.max(0, Math.min(1, alt.confidence || 0.5)),
      pros: Array.isArray(alt.pros) ? alt.pros : [],
      cons: Array.isArray(alt.cons) ? alt.cons : []
    };
  }

  private validateRisk(risk: any): DecisionRisk {
    const validTypes = ['data_loss', 'permission_violation', 'business_rule_violation', 'performance', 'user_experience'];
    return {
      type: validTypes.includes(risk.type) ? risk.type : 'user_experience',
      description: risk.description || 'Unknown risk',
      likelihood: Math.max(0, Math.min(1, risk.likelihood || 0.5)),
      impact: Math.max(0, Math.min(1, risk.impact || 0.5)),
      mitigation: risk.mitigation
    };
  }

  private createFallbackDecision(context: DecisionContext, error: any): DecisionResult {
    // Create a safe fallback decision
    return {
      action: 'ask_clarification',
      reasoning: `I need more information to help you with that. ${error?.message ? `(Error: ${error.message})` : ''}`,
      confidence: 0.3,
      alternatives: [
        {
          action: 'provide_general_help',
          reasoning: 'Offer general assistance',
          confidence: 0.5,
          pros: ['Safe fallback option'],
          cons: ['May not address specific need']
        }
      ],
      risks: [
        {
          type: 'user_experience',
          description: 'User may not get the help they need',
          likelihood: 0.7,
          impact: 0.5,
          mitigation: 'Ask specific clarifying questions'
        }
      ]
    };
  }

  private buildAnalysisPrompt(conversationHistory: any[], currentMessage: string, systemContext: any): string {
    return `Analyze this user message in the context of a CRM system conversation.

**Current Message:** "${currentMessage}"

**Recent Conversation:**
${conversationHistory.slice(-3).map(msg => `${msg.role}: ${msg.content.substring(0, 200)}`).join('\n')}

**System Context:**
- Total Deals: ${systemContext?.deals?.total || 0}
- Organizations: ${systemContext?.organizations?.total || 0}
- User Role: ${systemContext?.user_context?.role || 'unknown'}

**Analysis Required:**
1. Intent classification (create_deal, search_entities, update_entity, general_inquiry, etc.)
2. Entity extraction (organization names, deal amounts, dates, etc.)
3. Confidence level in understanding
4. Suggested actions to fulfill the request

Respond in JSON format:
{
  "intent": "intent_name",
  "entities": [{"type": "organization", "value": "BMW"}],
  "confidence": 0.95,
  "suggestedActions": ["search_organizations", "create_deal"]
}`;
  }

  private parseAnalysisResponse(response: string): any {
    try {
      const jsonStr = this.extractJsonFromResponse(response);
      const parsed = JSON.parse(jsonStr);
      
      return {
        intent: parsed.intent || 'general_inquiry',
        entities: Array.isArray(parsed.entities) ? parsed.entities : [],
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
        suggestedActions: Array.isArray(parsed.suggestedActions) ? parsed.suggestedActions : []
      };
    } catch (error) {
      console.error('Error parsing analysis response:', error);
      return {
        intent: 'general_inquiry',
        entities: [],
        confidence: 0.3,
        suggestedActions: ['ask_clarification']
      };
    }
  }

  // Rate limiting methods
  private checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const userLimit = this.rateLimiter.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      this.rateLimiter.set(userId, { count: 1, resetTime: now + 60000 }); // 1 minute window
      return true;
    }

    if (userLimit.count >= 30) { // 30 requests per minute
      return false;
    }

    userLimit.count++;
    return true;
  }

  // Utility methods
  async validateResponse(response: string, expectedFormat: 'json' | 'text' = 'text'): Promise<boolean> {
    if (expectedFormat === 'json') {
      try {
        JSON.parse(this.extractJsonFromResponse(response));
        return true;
      } catch {
        return false;
      }
    }
    return response.length > 0;
  }

  getModel(): string {
    return this.defaultModel;
  }

  setModel(model: string): void {
    this.defaultModel = model;
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.anthropic.messages.create({
        model: this.defaultModel,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }]
      });
      return response.content.length > 0;
    } catch {
      return false;
    }
  }

  // Clean up rate limiter
  cleanup(): void {
    this.rateLimiter.clear();
  }
} 