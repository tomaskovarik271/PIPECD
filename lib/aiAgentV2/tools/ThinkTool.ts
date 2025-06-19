/**
 * Think Tool for AI Agent V2
 * Enables Claude Sonnet 4 to perform structured reasoning and reflection
 */

import { ToolExecutionContext } from './ToolRegistry';

export interface ThinkInput {
  acknowledgment?: string;
  reasoning: string;
  strategy: string;
  concerns?: string;
  next_steps: string;
}

export interface ThinkResult {
  id: string;
  type: 'thinking';
  acknowledgment?: string;
  reasoning: string;
  strategy: string;
  concerns?: string;
  nextSteps: string;
  timestamp: string;
  metadata: {
    thinkingDepth: 'shallow' | 'moderate' | 'deep';
    strategicValue: number; // 1-10 scale
    confidenceLevel: number; // 0-1 scale
  };
}

export class ThinkTool {
  static definition = {
    name: "think",
    description: "Think through complex problems step by step. Use when you need to reason about multiple options, reflect on previous actions, or plan next steps. This tool helps you structure your reasoning process and capture strategic insights.",
    input_schema: {
      type: "object" as const,
      properties: {
        acknowledgment: { 
          type: "string" as const, 
          description: "Your acknowledgment of what the user is asking, written from your perspective (e.g., 'The user is asking about...', 'The user wants to understand...', 'The user is seeking guidance on...')" 
        },
        reasoning: { 
          type: "string" as const, 
          description: "Your detailed reasoning about the current situation, including analysis of context, data, and user intent" 
        },
        strategy: { 
          type: "string" as const, 
          description: "Your strategic approach for proceeding, including prioritization and methodology" 
        },
        concerns: { 
          type: "string" as const, 
          description: "Any concerns, potential issues, or risks you've identified that should be considered" 
        },
        next_steps: { 
          type: "string" as const, 
          description: "Specific, actionable next steps you plan to take, prioritized and sequenced" 
        }
      },
      required: ["reasoning", "strategy", "next_steps"] as const
    }
  };

  constructor(private supabaseClient: any, private conversationId: string) {}

  async execute(input: ThinkInput, context?: ToolExecutionContext): Promise<ThinkResult> {
    try {
      console.log('🔧 ThinkTool received input:', JSON.stringify(input, null, 2));
      
      // Validate input
      if (!input) {
        console.log('❌ ThinkTool: No input provided');
        throw new Error('ThinkInput is required');
      }
      
      // Ensure required fields are present with defaults
      const safeInput: ThinkInput = {
        acknowledgment: input.acknowledgment,
        reasoning: input.reasoning || 'No reasoning provided',
        strategy: input.strategy || 'No strategy provided', 
        concerns: input.concerns,
        next_steps: input.next_steps || 'No next steps provided'
      };

      console.log('🔧 ThinkTool processed input:', JSON.stringify(safeInput, null, 2));

      // Analyze thinking depth based on reasoning complexity
      const thinkingDepth = this.analyzeThinkingDepth(safeInput.reasoning);
      
      // Calculate strategic value based on strategy complexity
      const strategicValue = this.calculateStrategicValue(safeInput.strategy);
      
      // Determine confidence level based on concerns and completeness
      const confidenceLevel = this.calculateConfidenceLevel(safeInput);

      // Create structured thinking result
      const thinkResult: ThinkResult = {
        id: `think_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'thinking',
        acknowledgment: safeInput.acknowledgment,
        reasoning: safeInput.reasoning,
        strategy: safeInput.strategy,
        concerns: safeInput.concerns,
        nextSteps: safeInput.next_steps,
        timestamp: new Date().toISOString(),
        metadata: {
          thinkingDepth,
          strategicValue,
          confidenceLevel
        }
      };

      // Save thinking to agent_thoughts table
      await this.saveThinkingToDatabase(thinkResult);

      return thinkResult;

    } catch (error) {
      console.error('Error in ThinkTool execution:', error);
      throw new Error(`Think tool failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private analyzeThinkingDepth(reasoning: string): 'shallow' | 'moderate' | 'deep' {
    // Handle null/undefined reasoning
    if (!reasoning || typeof reasoning !== 'string') {
      return 'shallow';
    }

    const length = reasoning.length;
    const complexityIndicators = [
      'however', 'therefore', 'consequently', 'alternatively', 'furthermore',
      'on the other hand', 'in contrast', 'specifically', 'particularly',
      'given that', 'considering', 'taking into account'
    ];
    
    const complexityScore = complexityIndicators.reduce((score, indicator) => {
      return score + (reasoning.toLowerCase().includes(indicator) ? 1 : 0);
    }, 0);

    if (length > 500 && complexityScore >= 3) return 'deep';
    if (length > 200 && complexityScore >= 1) return 'moderate';
    return 'shallow';
  }

  private calculateStrategicValue(strategy: string): number {
    // Handle null/undefined strategy
    if (!strategy || typeof strategy !== 'string') {
      return 3; // Default strategic value
    }

    const strategicIndicators = [
      'prioritize', 'optimize', 'leverage', 'mitigate', 'enhance',
      'streamline', 'maximize', 'minimize', 'focus', 'target',
      'approach', 'methodology', 'framework', 'process', 'workflow'
    ];

    const strategicScore = strategicIndicators.reduce((score, indicator) => {
      return score + (strategy.toLowerCase().includes(indicator) ? 1 : 0);
    }, 0);

    // Normalize to 1-10 scale
    return Math.min(10, Math.max(1, strategicScore + 3));
  }

  private calculateConfidenceLevel(input: ThinkInput): number {
    let confidence = 0.8; // Base confidence

    // Handle null/undefined input values
    if (!input) {
      return 0.5; // Default confidence for invalid input
    }

    // Reduce confidence if concerns are identified
    if (input.concerns && typeof input.concerns === 'string' && input.concerns.length > 50) {
      confidence -= 0.2;
    }

    // Increase confidence for detailed reasoning
    if (input.reasoning && typeof input.reasoning === 'string' && input.reasoning.length > 300) {
      confidence += 0.1;
    }

    // Increase confidence for specific next steps
    if (input.next_steps && typeof input.next_steps === 'string' && 
        (input.next_steps.includes('1.') || input.next_steps.includes('2.'))) {
      confidence += 0.1;
    }

    return Math.min(1.0, Math.max(0.1, confidence));
  }

  private async saveThinkingToDatabase(thinkResult: ThinkResult): Promise<void> {
    try {
      const { error } = await this.supabaseClient
        .from('agent_thoughts')
        .insert({
          conversation_id: this.conversationId,
          type: 'reasoning',
          content: thinkResult.reasoning,
          metadata: {
            acknowledgment: thinkResult.acknowledgment,
            strategy: thinkResult.strategy,
            concerns: thinkResult.concerns,
            nextSteps: thinkResult.nextSteps,
            thinkingDepth: thinkResult.metadata.thinkingDepth,
            strategicValue: thinkResult.metadata.strategicValue,
            confidenceLevel: thinkResult.metadata.confidenceLevel,
            toolType: 'think'
          },
          reasoning: thinkResult.reasoning,
          strategy: thinkResult.strategy,
          concerns: thinkResult.concerns,
          next_steps: thinkResult.nextSteps,
          thinking_budget: null, // Think tool doesn't use thinking budget
          reflection_data: {
            thinkingDepth: thinkResult.metadata.thinkingDepth,
            strategicValue: thinkResult.metadata.strategicValue,
            confidenceLevel: thinkResult.metadata.confidenceLevel
          }
        });

      if (error) {
        console.error('Error saving thinking to database:', error);
        throw new Error('Failed to save thinking to database');
      }

    } catch (error) {
      console.error('Database save error in ThinkTool:', error);
      throw error;
    }
  }
} 